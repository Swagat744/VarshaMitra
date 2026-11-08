"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/LanguageContext";
import { cn } from "@/lib/utils";

type Size = "md" | "lg" | "xl";
const STORAGE_KEY = "hyperlocal:text-size";

/** A−/A/A+ control (a familiar public-service convention) that scales the whole interface. */
export default function TextSizeControl() {
  const { t } = useTranslation();
  const [size, setSize] = useState<Size>("md");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "md" || stored === "lg" || stored === "xl") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
      setSize(stored);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (size === "md") delete document.documentElement.dataset.textSize;
    else document.documentElement.dataset.textSize = size;
  }, [size, mounted]);

  function choose(next: Size) {
    setSize(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  const btn = (value: Size, label: string, aria: string, cls: string) => {
    const isSelected = mounted ? size === value : value === "md";
    return (
      <button
        suppressHydrationWarning
        type="button"
        onClick={() => choose(value)}
        aria-pressed={isSelected}
        aria-label={aria}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-[5px] font-semibold text-white/90 transition-colors hover:bg-white/12",
          isSelected && "bg-white text-forest-dark hover:bg-white",
          cls
        )}
      >
        {label}
      </button>
    );
  };

  return (
    <div
      suppressHydrationWarning
      role="group"
      aria-label={t("shell.textSize")}
      className="inline-flex items-center rounded-md border border-white/30 p-0.5"
    >
      {btn("md", "A", t("shell.textNormal"), "text-xs")}
      {btn("lg", "A", t("shell.textLarge"), "text-sm")}
      {btn("xl", "A", t("shell.textLarger"), "text-base")}
    </div>
  );
}
