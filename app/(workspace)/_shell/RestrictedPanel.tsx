import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

/** In-shell notice for signed-in users who open a page they cannot use. */
export default function RestrictedPanel({ message }: { message: string }) {
  return (
    <div className="mx-auto mt-10 flex w-full max-w-md flex-col items-center gap-3 rounded-xl border bg-card p-8 text-center shadow-xs">
      <span className="flex size-11 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
        <Lock className="size-5" />
      </span>
      <div className="text-lg font-semibold">Restricted access</div>
      <div className="text-sm text-muted-foreground">{message}</div>
      <div className="text-xs text-muted-foreground">Need access? Contact HRPC for authorisation.</div>
      <Button asChild variant="outline" size="sm" className="mt-2">
        <Link href="/">
          <ArrowLeft /> Return home
        </Link>
      </Button>
    </div>
  );
}
