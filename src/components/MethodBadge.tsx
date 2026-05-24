import { cn } from "@/lib/utils";
import type { HttpMethod } from "@/apis/types";

const COLORS: Record<HttpMethod, string> = {
  get: "bg-[color:var(--color-method-get)]/10 text-[color:var(--color-method-get)] ring-[color:var(--color-method-get)]/30",
  post: "bg-[color:var(--color-method-post)]/10 text-[color:var(--color-method-post)] ring-[color:var(--color-method-post)]/30",
  put: "bg-[color:var(--color-method-put)]/10 text-[color:var(--color-method-put)] ring-[color:var(--color-method-put)]/30",
  patch: "bg-[color:var(--color-method-patch)]/10 text-[color:var(--color-method-patch)] ring-[color:var(--color-method-patch)]/30",
  delete: "bg-[color:var(--color-method-delete)]/10 text-[color:var(--color-method-delete)] ring-[color:var(--color-method-delete)]/30",
};

export function MethodBadge({ method, className }: { method: HttpMethod | string; className?: string }) {
  const m = method.toLowerCase() as HttpMethod;
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ring-1 ring-inset font-mono min-w-[52px]",
        COLORS[m] ?? "bg-muted text-muted-foreground ring-border",
        className,
      )}
    >
      {method.toUpperCase()}
    </span>
  );
}
