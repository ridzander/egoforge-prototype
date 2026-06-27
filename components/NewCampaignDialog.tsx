"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/db";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function NewCampaignDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fidelityFloor, setFidelityFloor] = useState<"1" | "2" | "3">("2");
  const [license, setLicense] = useState("CC-BY-4.0");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const id = crypto.randomUUID();
      await db.campaigns.add({
        id,
        name: name.trim(),
        description: description.trim(),
        fidelityFloor: Number(fidelityFloor) as 1 | 2 | 3,
        allowedTiers: [1, 2, 3],
        targetEmbodiments: [],
        license: license.trim() || "CC-BY-4.0",
        createdAt: new Date().toISOString(),
      });
      setOpen(false);
      router.push(`/studio/${id}`);
    } finally {
      setSaving(false);
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setName("");
      setDescription("");
      setFidelityFloor("2");
      setLicense("CC-BY-4.0");
    }
    setOpen(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">New campaign</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New campaign</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs font-medium tracking-wide text-muted-foreground">Name</label>
            <Input
              required
              placeholder="e.g. Tabletop manipulation v2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-xs font-medium tracking-wide text-muted-foreground">Description</label>
            <Textarea
              rows={3}
              placeholder="What data does this campaign collect?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs font-medium tracking-wide text-muted-foreground">Fidelity floor</label>
              <Select
                value={fidelityFloor}
                onValueChange={(v) => setFidelityFloor(v as "1" | "2" | "3")}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Tier 1</SelectItem>
                  <SelectItem value="2">Tier 2</SelectItem>
                  <SelectItem value="3">Tier 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="font-mono text-xs font-medium tracking-wide text-muted-foreground">License</label>
              <Input
                placeholder="CC-BY-4.0"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving || !name.trim()}>
              {saving ? "Creating…" : "Create campaign"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
