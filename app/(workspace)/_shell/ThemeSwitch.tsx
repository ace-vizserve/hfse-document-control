"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "system", label: "System theme", icon: Monitor },
  { value: "light", label: "Light theme", icon: Sun },
  { value: "dark", label: "Dark theme", icon: Moon },
] as const;

// True only in the browser: the saved theme is unknown during server rendering.
const useMounted = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

/**
 * System / Light / Dark switch for the sidebar footer.
 * Shows three buttons when the sidebar is open, and one cycling button when it is collapsed to icons.
 */
export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const current = mounted ? (theme ?? "system") : "system";
  const index = OPTIONS.findIndex((o) => o.value === current);
  const next = OPTIONS[(index + 1) % OPTIONS.length];
  const CurrentIcon = OPTIONS[Math.max(index, 0)].icon;

  return (
    <>
      <div
        role="radiogroup"
        aria-label="Colour theme"
        className="flex w-fit items-center gap-0.5 rounded-full border border-sidebar-border bg-sidebar-accent/40 p-0.5 group-data-[collapsible=icon]:hidden"
      >
        {OPTIONS.map(({ value, label, icon: Icon }) => {
          const selected = mounted && current === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={label}
              title={label}
              onClick={() => setTheme(value)}
              className={cn(
                "flex size-7 items-center justify-center rounded-full text-sidebar-foreground/60 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none",
                selected && "bg-sidebar text-white shadow-sm ring-1 ring-sidebar-border",
              )}
            >
              <Icon className="size-3.5" />
            </button>
          );
        })}
      </div>

      {/* Collapsed sidebar: one button that cycles System → Light → Dark. */}
      <button
        type="button"
        onClick={() => setTheme(next.value)}
        aria-label={`Switch to ${next.label.toLowerCase()}`}
        title={`Switch to ${next.label.toLowerCase()}`}
        className="mx-auto hidden size-8 items-center justify-center rounded-md text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white group-data-[collapsible=icon]:flex"
      >
        <CurrentIcon className="size-4" />
      </button>
    </>
  );
}
