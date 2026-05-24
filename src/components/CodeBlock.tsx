import { CopyButton } from "./CopyButton";
import { cn } from "@/lib/utils";

export function CodeBlock({
  code,
  language,
  className,
  maxHeight = "400px",
}: {
  code: string;
  language?: string;
  className?: string;
  maxHeight?: string;
}) {
  return (
    <div className={cn("relative group rounded-lg border bg-muted/40 overflow-hidden", className)}>
      <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/60">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {language ?? "text"}
        </span>
        <CopyButton value={code} />
      </div>
      <pre
        className="px-4 py-3 text-xs leading-relaxed font-mono overflow-auto"
        style={{ maxHeight }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
