import { ArrowLeft, Lock, LogIn } from "lucide-react";
import { chalkFont } from "./fonts";
import { Button } from "@/components/ui/button";

/** Classroom-style notice shown when a page needs sign-in or extra access. */
export default function AccessNotice({
  kind,
  title,
  message,
}: {
  kind: "signin" | "restricted";
  title: string;
  message: string;
}) {
  return (
    <div className="bg-desk flex min-h-svh items-center justify-center p-4 font-sans text-foreground sm:p-6">
      <div className="w-full max-w-xl">
        {/* Small chalkboard in a wooden frame */}
        <div className="bg-wood rounded-md p-2.5 pb-0 shadow-[0_18px_40px_rgba(33,35,70,0.18)]">
          <div className="bg-chalkboard relative overflow-hidden rounded-[3px] px-6 pt-7 pb-9 text-white sm:px-9">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-md bg-brand-blue text-sm font-bold text-white shadow-[2px_2px_0_var(--color-brand-orange)]">H</div>
              <div className="text-[10px] tracking-[0.18em] text-white/60 uppercase">HFSE Document Control Centre</div>
            </div>

            <div className="mt-6 flex items-start gap-4">
              <span className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-xl border border-dashed border-white/45 text-[#ffd27a] [&_svg]:size-5">
                {kind === "signin" ? <LogIn /> : <Lock />}
              </span>
              <div className="min-w-0">
                <div className={`${chalkFont.className} chalk text-4xl leading-tight font-bold sm:text-5xl`}>{title}</div>
                <svg aria-hidden viewBox="0 0 300 16" preserveAspectRatio="none" className="mt-1 h-2.5 w-40" fill="none">
                  <path d="M3 10 C 60 3, 110 14, 160 7 S 260 4, 297 9" stroke="#ed7622" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
                </svg>
                <div className="mt-3 text-sm leading-relaxed text-white/75">{message}</div>
              </div>
            </div>
          </div>
          {/* Chalk tray */}
          <div className="relative -mx-2.5 h-4 rounded-b-md bg-gradient-to-b from-[#a8743f] to-[#5e3a18]">
            <div aria-hidden className="absolute right-6 bottom-[11px] flex items-end gap-2.5">
              <span className="block h-2 w-10 rounded-full bg-gradient-to-b from-white to-[#e9e9e9] shadow-[0_2px_2px_rgba(0,0,0,0.35)]" />
              <span className="block h-2 w-7 rounded-full bg-gradient-to-b from-white to-[#ffe9a6] shadow-[0_2px_2px_rgba(0,0,0,0.35)]" />
              <span className="block w-16 overflow-hidden rounded-[3px] shadow-[0_3px_3px_rgba(0,0,0,0.4)]">
                <span className="block h-3 bg-gradient-to-b from-[#c48a52] to-[#9c6634]" />
                <span className="block h-1.5 bg-gradient-to-b from-[#4a4a4a] to-[#2c2c2c]" />
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {kind === "signin" ? (
            <Button asChild>
              <a href="/">
                <LogIn /> Go to sign in
              </a>
            </Button>
          ) : (
            <Button asChild>
              <a href="/">
                <ArrowLeft /> Return home
              </a>
            </Button>
          )}
          {kind === "restricted" && <span className="text-xs text-muted-foreground">Need access? Contact HRPC for authorisation.</span>}
        </div>
      </div>
    </div>
  );
}
