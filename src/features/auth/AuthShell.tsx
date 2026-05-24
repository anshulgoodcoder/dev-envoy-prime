import type { ReactNode } from "react";
import { Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function AuthShell({ title, subtitle, children, footer }: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 bg-background overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40" aria-hidden />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, color-mix(in oklab, var(--primary) 25%, transparent), transparent 70%), radial-gradient(40% 40% at 90% 100%, color-mix(in oklab, var(--secondary) 25%, transparent), transparent 70%)",
        }}
        aria-hidden
      />
      <div className="relative w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-brand text-white shadow-md">
            <Zap className="h-4 w-4" />
          </div>
          <span className="font-semibold text-lg">Developer Portal</span>
        </Link>
        <div className="glass rounded-2xl border shadow-xl p-7">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-5 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}
