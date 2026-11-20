"use client";

import type { ComponentProps } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/** Light / dark / system theme, stored per browser and applied as a class on <html>. */
export function ThemeProvider(props: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props} />;
}
