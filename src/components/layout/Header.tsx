import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Moon, Search, Sun, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/lib/theme";
import { useEnvironment, type Environment } from "@/lib/env-store";
import { useAuth } from "@/lib/auth";
import { CommandPalette } from "./CommandPalette";

export function Header() {
  const { theme, toggle } = useTheme();
  const { environment, setEnvironment } = useEnvironment();
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const initial = (user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 h-14 border-b glass flex items-center gap-3 px-4">
        <button
          onClick={() => setPaletteOpen(true)}
          className="flex-1 max-w-md flex items-center gap-2 rounded-md border bg-background/60 px-3 py-1.5 text-sm text-muted-foreground hover:bg-background transition-colors"
          aria-label="Open command palette"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search endpoints, docs, keys…</span>
          <kbd className="font-mono text-[10px] rounded border bg-muted px-1.5 py-0.5">⌘K</kbd>
        </button>

        <div className="ml-auto flex items-center gap-2">
          <Select value={environment} onValueChange={(v) => setEnvironment(v as Environment)}>
            <SelectTrigger className="h-8 w-[150px] text-xs" aria-label="Environment">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sandbox">🟢 Sandbox</SelectItem>
              <SelectItem value="staging">🟡 Staging</SelectItem>
              <SelectItem value="production">🔴 Production</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label="Toggle theme"
            className="h-8 w-8"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" aria-label="User menu">
                <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-brand text-white text-xs font-bold">
                  {initial}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="text-xs text-muted-foreground">Signed in as</div>
                <div className="truncate text-sm font-medium">{user?.email}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings"><UserIcon className="mr-2 h-4 w-4" />Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await signOut();
                  nav({ to: "/login" });
                }}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
}
