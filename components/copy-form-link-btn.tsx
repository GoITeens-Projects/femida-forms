"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

export function CopyFormLinkButton({ url }: { url: string }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Посилання на форму скопійовано");
    } catch {
      toast.error("Не вдалося скопіювати посилання");
    }
  };

  return (
    <Button variant="ghost" size="icon-sm" onClick={handleCopy}>
      <Share2 />
    </Button>
  );
}
