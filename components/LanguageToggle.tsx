"use client";

import { languages, useLanguage } from "@/context/LanguageContext";
import type { LanguageCode } from "@/lib/i18n";

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex justify-end">
      <div
        className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1"
        aria-label={t.language}
      >
        {languages.map((item) => {
          const active = item.code === language;

          return (
            <button
              key={item.code}
              type="button"
              onClick={() => setLanguage(item.code as LanguageCode)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                active
                  ? "bg-green-500 text-black"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              }`}
              aria-pressed={active}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
