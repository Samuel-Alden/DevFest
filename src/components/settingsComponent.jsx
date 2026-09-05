import { useEffect, useState, useRef } from "react";
import { useTranslation } from "../lib/i18n";
import { useTheme } from "../lib/theme";
import { supabase } from "../lib/supabase";
import { SettingsIcon, SunIcon, MoonIcon, LogoutIcon } from "./icons";

export function SettingsComponent({
  className = "",
  triggerClassName = "border-line text-ink-soft hover:bg-paper-dim",
  showSignOut = false,
}) {
  const { t, lang, toggleLang } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function handleEscape(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t("settings_title")}
        aria-expanded={isOpen}
        className={`p-2 rounded-lg border transition-colors ${triggerClassName}`}
      >
        <SettingsIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-line bg-paper shadow-lg divide-y divide-line overflow-hidden z-20 animate-fade-in">
          <div className="flex items-center justify-between p-3">
            <div>
              <p className="text-sm font-medium text-ink">{t("language_label")}</p>
              <p className="text-xs text-ink-soft mt-0.5">{lang === "en" ? "English" : "Bahasa Indonesia"}</p>
            </div>
            <button
              onClick={toggleLang}
              className="text-xs font-semibold px-2.5 py-1 rounded-md border border-line text-ink-soft transition-colors hover:bg-paper-dim"
            >
              {lang === "en" ? "ID" : "EN"}
            </button>
          </div>

          <div className="flex items-center justify-between p-3">
            <div>
              <p className="text-sm font-medium text-ink">{t("appearance_label")}</p>
              <p className="text-xs text-ink-soft mt-0.5">{theme === "dark" ? t("dark_mode") : t("light_mode")}</p>
            </div>
            <button
              onClick={toggleTheme}
              aria-label={t("appearance_label")}
              className="p-2 rounded-lg border border-line text-ink-soft transition-colors hover:bg-paper-dim"
            >
              {theme === "dark" ? <MoonIcon className="h-4 w-4" /> : <SunIcon className="h-4 w-4" />}
            </button>
          </div>

          {showSignOut && (
            <div className="p-3">
              <button
                onClick={() => supabase.auth.signOut()}
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg bg-tag-red text-white transition-colors hover:opacity-90"
              >
                <LogoutIcon className="h-4 w-4" /> {t("sign_out")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}