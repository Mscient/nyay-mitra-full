"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Menu, X, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";

interface NavBarProps {
  title: string;
  badge?: string;
  backHref?: string;
  onBack?: () => void;
  showThemeToggle?: boolean;
  rightContent?: React.ReactNode;
  mobileLinks?: Array<{ label: string; href: string }>;
}

export function NavBar({
  title, badge, backHref = "/", onBack, showThemeToggle = true,
  rightContent, mobileLinks,
}: NavBarProps) {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
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
              variant="ghost" size="icon" onClick={() => toggleTheme?.()}
              className="text-secondary hover:bg-secondary/10"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          )}
          {mobileLinks && mobileLinks.length > 0 && (
            <Button
              variant="ghost" size="icon"
              className="md:hidden text-secondary hover:bg-secondary/10"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen(o => !o)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          )}
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileLinks && menuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-primary border-b border-primary/20 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col py-2">
            {mobileLinks.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="w-full text-left px-6 py-3.5 text-primary-foreground/80 hover:bg-primary-foreground/5 hover:text-primary-foreground text-sm font-medium transition-colors">
                  {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
