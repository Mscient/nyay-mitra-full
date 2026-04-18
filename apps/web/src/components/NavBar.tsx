"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Menu, X, Moon, Sun, LogOut, LayoutDashboard, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";
import { getUser, isAuthenticated, logout } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";

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
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      setAuthUser(getUser());
    }
  }, []);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
  };

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

          {/* Auth: User menu (when logged in) */}
          {authUser ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-secondary/10 transition-colors"
                aria-label="User menu"
                aria-expanded={userMenuOpen}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "linear-gradient(135deg, #C9920A, #F5DFA0)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 13, color: "#1A2E1A", flexShrink: 0,
                }}>
                  {authUser.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <span className="hidden md:block text-primary-foreground/90 text-sm font-medium max-w-[120px] truncate">
                  {authUser.name?.split(" ")[0]}
                </span>
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div
                  className="absolute right-0 top-12 w-52 bg-primary border border-primary/20 rounded-xl shadow-xl overflow-hidden z-50"
                  onBlur={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-primary/20">
                    <div className="text-primary-foreground text-sm font-semibold truncate">{authUser.name}</div>
                    <div className="text-primary-foreground/60 text-xs truncate">{authUser.email}</div>
                    <div className="mt-1">
                      <Badge className="bg-secondary/15 text-secondary border-none text-[9px] tracking-wider uppercase">
                        {authUser.userType}
                      </Badge>
                    </div>
                  </div>
                  <nav className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-primary-foreground/80 hover:bg-secondary/10 hover:text-primary-foreground text-sm transition-colors"
                    >
                      <LayoutDashboard size={15} /> Dashboard
                    </Link>
                    {authUser.userType === "ADVOCATE" && (
                      <Link
                        href="/vakil-sahayak"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-primary-foreground/80 hover:bg-secondary/10 hover:text-primary-foreground text-sm transition-colors"
                      >
                        <User size={15} /> Vakil Sahayak CRM
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 text-sm transition-colors"
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </nav>
                </div>
              )}
            </div>
          ) : (
            /* Auth: Login/Register links (when not logged in) */
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-secondary hover:bg-secondary/10 text-xs">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-xs">
                  Register
                </Button>
              </Link>
            </div>
          )}

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
            {!authUser && (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="w-full text-left px-6 py-3.5 text-secondary text-sm font-medium transition-colors border-t border-primary/10 mt-1">
                  Sign In
                </Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="w-full text-left px-6 py-3.5 text-secondary text-sm font-semibold">
                  Register
                </Link>
              </>
            )}
            {authUser && (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="w-full text-left px-6 py-3.5 text-primary-foreground/80 text-sm font-medium border-t border-primary/10 mt-1">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="w-full text-left px-6 py-3.5 text-red-400 text-sm font-medium">
                  Sign Out
                </button>
              </>
            )}
          </nav>
        </div>
      )}

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} aria-hidden="true" />
      )}
    </>
  );
}
