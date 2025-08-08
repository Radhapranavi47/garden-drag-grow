import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "garden_guest_name";

export function NamePromptDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) setOpen(true);
  }, []);

  const save = () => {
    const trimmed = name.trim();
    if (trimmed.length > 0) {
      localStorage.setItem(STORAGE_KEY, trimmed);
      window.dispatchEvent(new Event("guest-name-updated"));
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>What’s your name?</DialogTitle>
          <DialogDescription>
            Add your name so others can recognize who’s planting. You can skip if you prefer.
          </DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          placeholder="e.g. Alex"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Your name"
        />
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="secondary" onClick={() => { setOpen(false); window.dispatchEvent(new Event("guest-name-updated")); }}>Skip</Button>
          <Button onClick={save}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
