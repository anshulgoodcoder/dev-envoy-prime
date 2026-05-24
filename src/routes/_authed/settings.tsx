import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authed/settings")({ component: SettingsPage });

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  return (
    <div className="p-6 lg:p-8 max-w-3xl space-y-6">
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Account</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Settings</h1>
      </div>

      <Card><CardContent className="p-5 space-y-3">
        <div className="text-sm font-semibold">Profile</div>
        <div className="text-sm text-muted-foreground">Signed in as</div>
        <div className="font-mono text-sm">{user?.email}</div>
        <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
      </CardContent></Card>

      <Card><CardContent className="p-5 space-y-3">
        <div className="text-sm font-semibold">Appearance</div>
        <div className="flex gap-2">
          <Button variant={theme === "light" ? "default" : "outline"} size="sm" onClick={() => setTheme("light")}>
            <Sun className="h-4 w-4 mr-1.5" /> Light
          </Button>
          <Button variant={theme === "dark" ? "default" : "outline"} size="sm" onClick={() => setTheme("dark")}>
            <Moon className="h-4 w-4 mr-1.5" /> Dark
          </Button>
        </div>
      </CardContent></Card>
    </div>
  );
}
