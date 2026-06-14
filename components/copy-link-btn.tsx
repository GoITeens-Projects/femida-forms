"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

interface CopyLinkButtonProps {
  url: string;
  successMsg?: string;
  errorMsg?: string;
}

export function CopyLinkButton({
  url,
  successMsg = "Посилання на форму скопійовано",
  errorMsg = "Не вдалося скопіювати посилання",
}: CopyLinkButtonProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(successMsg);
    } catch {
      toast.error(errorMsg);
    }
  };

  return (
    <Button variant="ghost" size="icon-sm" onClick={handleCopy}>
      <Share2 />
    </Button>
  );
}
