import { access } from "../../../access";
import NewDocumentRequest from "../../../NewDocumentRequest";
import RestrictedPanel from "../../_shell/RestrictedPanel";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const { canControl } = await access();
  if (!canControl) return <RestrictedPanel message="Document requests are available only to authorised Document Control administrators." />;
  return <NewDocumentRequest />;
}
