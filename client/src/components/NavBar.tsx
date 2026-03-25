import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";

interface NavBarProps {
  /** Page title shown in nav */
  title: string;
  /** Optional badge text e.g. "Live Feed", "Beta" */
  badge?: string;
  /** href to navigate back to — defaults to "/" */
  backHref?: string;
  /** Optional callback for custom back button behavior */
  onBack?: () => void;
  /** Show the light/dark theme toggle button */
  showThemeToggle?: boolean;
  /** Any extra content to render on the right side of the nav */
  rightContent?: React.ReactNode;
}

/**
 * Shared navigation bar used across all inner pages.
 * Provides consistent back-navigation, page title, badge, and optional theme toggle.
 * Follows the primary/secondary design token theme.
 */
export function NavBar({ title, badge, backHref = "/", onBack, showThemeToggle = true, rightContent }: NavBarProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 bg-primary border-b border-primary/20 px-4 md:px-8 h-16 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        {onBack ? (
          <Button variant="ghost" size="icon" className="text-secondary hover:bg-secondary/10" aria-label="Go back" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : (
          <Link href={backHref}>
            <Button variant="ghost" size="icon" className="text-secondary hover:bg-secondary/10" aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        )}
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-semibold text-primary-foreground">{title}</span>
          {badge && (
            <Badge className="hidden sm:inline-flex bg-secondary/15 text-secondary border-none text-[10px] tracking-wider uppercase">
              {badge}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {rightContent}
        {showThemeToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-secondary hover:bg-secondary/10"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        )}
      </div>
    </nav>
  );
}
