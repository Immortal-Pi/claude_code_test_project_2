"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

type Theme = "light" | "dark" | "system";

const themes: Theme[] = ["system", "light", "dark"];

const icons: Record<Theme, React.ComponentType<{ className?: string }>> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

const labels: Record<Theme, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  function cycleTheme() {
    const idx = themes.indexOf(theme);
    const next = themes[(idx + 1) % themes.length];
    setTheme(next);
  }

  const Icon = icons[theme];
  const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length];

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={cycleTheme}
      aria-label={`Switch to ${labels[nextTheme]} mode`}
      title={`Theme: ${labels[theme]}`}
    >
      <Icon />
    </Button>
  );
}
