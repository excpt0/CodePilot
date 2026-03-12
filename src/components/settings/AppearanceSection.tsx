"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { codeToHtml, type BundledTheme } from "shiki";
import { useThemeFamily } from "@/lib/theme/context";
import {
  resolveShikiTheme,
  resolveShikiThemes,
} from "@/lib/theme/code-themes";
import { useAppearance } from "@/hooks/useAppearance";
import { useTranslation } from "@/hooks/useTranslation";
import { Sun, Moon, Desktop } from "@/components/ui/icon";
import {
  FONT_SIZES,
  type FontSizeKey,
} from "@/lib/appearance";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SettingsCard } from "@/components/patterns/SettingsCard";
import { FieldRow } from "@/components/patterns/FieldRow";
import type { TranslationKey } from "@/i18n";

// ── Theme Mode Pill Selector ────────────────────────────────────────

const MODE_OPTIONS = [
  { value: "light", icon: Sun, labelKey: "settings.modeLight" as const },
  { value: "dark", icon: Moon, labelKey: "settings.modeDark" as const },
  { value: "system", icon: Desktop, labelKey: "settings.modeSystem" as const },
] as const;

function ThemeModePills({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center rounded-lg border border-border/50 p-1 gap-1" role="radiogroup">
      {MODE_OPTIONS.map((opt) => {
        const selected = value === opt.value;
        return (
          <Button
            key={opt.value}
            variant="ghost"
            size="sm"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              "gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all h-auto",
              selected
                ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <opt.icon size={14} />
            {t(opt.labelKey)}
          </Button>
        );
      })}
    </div>
  );
}

// ── Shiki Code Preview ──────────────────────────────────────────────

const PREVIEW_CODE = `function greet(name: string) {
  const time = new Date().getHours();
  if (time < 12) return \`Good morning, \${name}\`;
  return \`Hello, \${name}\`;
}`;

function ShikiCodePreview({ isDark }: { isDark: boolean }) {
  const { family, families } = useThemeFamily();
  const shikiMapping = resolveShikiTheme(families, family);
  const { light, dark } = resolveShikiThemes(shikiMapping);
  const theme: BundledTheme = isDark ? dark : light;
  const [html, setHtml] = useState("");

  useEffect(() => {
    let cancelled = false;
    codeToHtml(PREVIEW_CODE, {
      lang: "typescript",
      theme,
    }).then((result) => {
      if (!cancelled) setHtml(result);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [theme]);

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 text-xs bg-muted text-muted-foreground">
        <span className="font-medium">preview.ts</span>
        <span className="rounded bg-accent px-1.5 py-0.5 text-accent-foreground">TypeScript</span>
      </div>
      {html ? (
        <div
          className="shiki-preview [&_pre]:!m-0 [&_pre]:!rounded-none [&_pre]:!text-xs [&_pre]:!leading-relaxed [&_pre]:!p-2 [&_code]:!text-xs"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div className="h-24 flex items-center justify-center text-xs text-muted-foreground">
          Loading…
        </div>
      )}
    </div>
  );
}

// ── UI Token Preview ────────────────────────────────────────────────

function UIPreview() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button size="sm" className="text-xs h-auto py-1">Primary</Button>
      <Button size="sm" variant="secondary" className="text-xs h-auto py-1">Secondary</Button>
      <Button size="sm" variant="destructive" className="text-xs h-auto py-1">Destructive</Button>
      <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-[0.625rem] font-medium text-accent-foreground">
        Badge
      </span>
      <span className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-0.5 text-[0.625rem] text-card-foreground">
        Card
      </span>
      <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[0.625rem] text-muted-foreground">
        Muted
      </span>
    </div>
  );
}

// ── Font Size Labels ────────────────────────────────────────────────

const FONT_SIZE_LABELS: Record<FontSizeKey, TranslationKey> = {
  small: "settings.fontSizeSmall",
  default: "settings.fontSizeDefault",
  large: "settings.fontSizeLarge",
  "extra-large": "settings.fontSizeXL",
};

// ── Main Appearance Section ─────────────────────────────────────────

export function AppearanceSection() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { family, setFamily, families } = useThemeFamily();
  const { fontSize, setFontSize } = useAppearance();
  const { t } = useTranslation();
  const isDark = resolvedTheme === "dark";

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!mounted) return null;

  const fontSizeKeys = Object.keys(FONT_SIZES) as FontSizeKey[];

  return (
    <div className="space-y-4">
      {/* Section header — outside card */}
      <div>
        <h2 className="text-sm font-medium">{t("settings.appearance")}</h2>
        <p className="text-xs text-muted-foreground">{t("settings.appearanceDesc")}</p>
      </div>

      <SettingsCard>
      {/* Mode */}
      <FieldRow
        label={t("settings.themeMode")}
        description={t("settings.themeModeDesc")}
      >
        <ThemeModePills value={theme || "system"} onChange={setTheme} />
      </FieldRow>

      {theme === "system" && resolvedTheme && (
        <p className="text-[0.6875rem] text-muted-foreground pl-1">
          {resolvedTheme === "dark" ? t("settings.modeDark") : t("settings.modeLight")}
        </p>
      )}

      {/* Family */}
      <FieldRow
        label={t("settings.themeFamily")}
        description={t("settings.themeFamilyDesc")}
        separator
      >
        <Select value={family} onValueChange={setFamily}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {families.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                <span className="flex items-center gap-2">
                  {f.previewColors && (
                    <span className="flex gap-0.5">
                      <span
                        className="inline-block h-3 w-3 rounded-full border border-border/30"
                        style={{ background: f.previewColors.primaryLight }}
                      />
                      <span
                        className="inline-block h-3 w-3 rounded-full border border-border/30"
                        style={{ background: f.previewColors.primaryDark }}
                      />
                    </span>
                  )}
                  <span className="text-xs">{f.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldRow>

      {/* Font Size */}
      <FieldRow
        label={t("settings.fontSize")}
        description={t("settings.fontSizeDesc")}
        separator
      >
        <div className="flex gap-2">
          {fontSizeKeys.map((key) => (
            <Button
              key={key}
              variant="ghost"
              size="sm"
              onClick={() => setFontSize(key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium h-auto",
                fontSize === key
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              {t(FONT_SIZE_LABELS[key])}
            </Button>
          ))}
        </div>
      </FieldRow>

      {/* Preview */}
      <div className="border-t border-border/30 pt-4 space-y-3">
        <h3 className="text-xs font-medium text-muted-foreground">Preview</h3>
        <UIPreview />
        <ShikiCodePreview isDark={isDark} />
      </div>
      </SettingsCard>
    </div>
  );
}
