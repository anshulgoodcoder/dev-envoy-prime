import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, KeyRound, Loader2, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/EmptyState";
import { ListSkeleton } from "@/components/Skeletons";
import { CopyButton } from "@/components/CopyButton";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/keys")({ component: KeysPage });

type Env = "sandbox" | "staging" | "production";
const schema = z.object({
  name: z.string().min(2, "Min 2 characters").max(64),
  environment: z.enum(["sandbox", "staging", "production"]),
});

function generateKey(env: Env) {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  const body = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  const prefix = `dp_${env.slice(0, 4)}_`;
  return { full: prefix + body, prefix };
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function KeysPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);

  const { data: keys, isLoading } = useQuery({
    queryKey: ["api-keys", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", environment: "sandbox" },
  });

  const createMut = useMutation({
    mutationFn: async (v: z.infer<typeof schema>) => {
      if (!user) throw new Error("Not authenticated");
      const { full, prefix } = generateKey(v.environment);
      const key_hash = await sha256(full);
      const { error } = await supabase.from("api_keys").insert({
        user_id: user.id,
        name: v.name,
        environment: v.environment,
        key_prefix: prefix + full.slice(prefix.length, prefix.length + 6),
        key_hash,
      });
      if (error) throw error;
      return full;
    },
    onSuccess: (full) => {
      qc.invalidateQueries({ queryKey: ["api-keys"] });
      setCreatedKey(full);
      form.reset();
      setOpen(false);
    },
    onError: (e) => toast.error("Could not create key", { description: (e as Error).message }),
  });

  const revokeMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("api_keys").update({ revoked_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("Key revoked");
      setRevokeId(null);
    },
  });

  return (
    <div className="p-6 lg:p-8 max-w-6xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Credentials</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">API Keys</h1>
          <p className="mt-1 text-sm text-muted-foreground">Programmatic credentials for accessing the portal's APIs.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-brand text-white border-0"><Plus className="h-4 w-4 mr-1.5" /> Create key</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create API key</DialogTitle>
              <DialogDescription>Generated once. Treat it like a password.</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit((v) => createMut.mutate(v))} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="e.g. CI deploy bot" {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Environment</Label>
                <Select
                  defaultValue="sandbox"
                  onValueChange={(v) => form.setValue("environment", v as Env)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMut.isPending} className="gradient-brand text-white border-0">
                  {createMut.isPending && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />} Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {createdKey && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4 text-warning" /> Save this key now
          </div>
          <p className="text-xs text-muted-foreground">
            For your security, we won't show this key again. Store it somewhere safe.
          </p>
          <div className="flex items-center gap-2 rounded-md border bg-card p-3">
            <code className="flex-1 font-mono text-xs break-all">{createdKey}</code>
            <CopyButton value={createdKey} />
          </div>
          <Button variant="ghost" size="sm" onClick={() => setCreatedKey(null)}>I've saved it</Button>
        </div>
      )}

      <div className="rounded-xl border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-4"><ListSkeleton /></div>
        ) : !keys?.length ? (
          <EmptyState
            icon={<KeyRound className="h-5 w-5" />}
            title="No keys yet"
            description="Create your first API key to start making authenticated calls."
            className="border-0 m-2"
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Key</th>
                <th className="text-left px-4 py-3 font-medium">Env</th>
                <th className="text-left px-4 py-3 font-medium">Created</th>
                <th className="text-left px-4 py-3 font-medium">Last used</th>
                <th className="text-right px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {keys.map((k) => (
                <tr key={k.id} className={cn("hover:bg-muted/20", k.revoked_at && "opacity-60")}>
                  <td className="px-4 py-3 font-medium">{k.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{k.key_prefix}…</td>
                  <td className="px-4 py-3"><span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono uppercase">{k.environment}</span></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDistanceToNow(new Date(k.created_at), { addSuffix: true })}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{k.last_used_at ? formatDistanceToNow(new Date(k.last_used_at), { addSuffix: true }) : "Never"}</td>
                  <td className="px-4 py-3 text-right">
                    {k.revoked_at ? (
                      <span className="text-xs text-destructive">Revoked</span>
                    ) : (
                      <span className="text-xs text-success">Active</span>
                    )}
                  </td>
                  <td className="px-2 py-3 text-right">
                    {!k.revoked_at && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setRevokeId(k.id)} aria-label="Revoke key">
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AlertDialog open={!!revokeId} onOpenChange={(o) => !o && setRevokeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Revoke this key?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Any service using this key will immediately lose access. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => revokeId && revokeMut.mutate(revokeId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
