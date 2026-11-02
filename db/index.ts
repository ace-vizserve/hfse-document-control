import "server-only";
import { createClient } from "@supabase/supabase-js";

export const tables = {
  documents: "document_control_documents",
  history: "document_control_history",
  documentRequests: "document_control_document_requests",
  rcaCases: "document_control_rca_cases",
  meetingMinutes: "document_control_meeting_minutes",
} as const;

type Table = (typeof tables)[keyof typeof tables];

const ATTACHMENT_BUCKET = "document-control-attachments";
const PAGE_SIZE = 1000;

// Server-only: this client uses the secret key, which bypasses RLS.
export function getDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are not set.");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function must<T>(result: { data: T; error: unknown }): T {
  if (result.error) throw result.error;
  return result.data;
}

// Supabase caps each response at 1000 rows, so read in pages to get every row.
export async function selectAll(
  table: Table,
  orderBy: string = "id",
  ascending = true,
): Promise<any[]> {
  const db = getDb();
  const rows: any[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    let query = db.from(table).select("*").order(orderBy, { ascending });
    if (orderBy !== "id") query = query.order("id");
    const page = must(await query.range(from, from + PAGE_SIZE - 1)) as any[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

export async function findById(table: Table, id: string): Promise<any | null> {
  return must(await getDb().from(table).select("*").eq("id", id).maybeSingle());
}

// Saves only if nobody changed the record since it was read.
export async function updateIfUnchanged(
  table: Table,
  id: string,
  expectedUpdated: string,
  data: unknown,
  updated: string,
): Promise<boolean> {
  const changed = must(
    await getDb()
      .from(table)
      .update({ data, updated })
      .eq("id", id)
      .eq("updated", expectedUpdated)
      .select("id"),
  ) as unknown[];
  return changed.length > 0;
}

export async function createUploadUrl(key: string) {
  const result = await getDb().storage.from(ATTACHMENT_BUCKET).createSignedUploadUrl(key);
  return must(result)!.signedUrl;
}

// Real sizes from storage, so the app never relies on what the browser reported.
export async function listAttachments(requestId: string) {
  const files = must(
    await getDb().storage.from(ATTACHMENT_BUCKET).list(`requests/${requestId}`, { limit: 100 }),
  ) as { name: string; metadata: { size?: number } | null }[];
  return new Map(files.map((f) => [f.name, Number(f.metadata?.size ?? 0)]));
}

export async function downloadAttachment(key: string) {
  const { data } = await getDb().storage.from(ATTACHMENT_BUCKET).download(key);
  return data;
}

export async function removeAttachments(keys: string[]) {
  if (keys.length) await getDb().storage.from(ATTACHMENT_BUCKET).remove(keys);
}
