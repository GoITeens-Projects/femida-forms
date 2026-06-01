"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CopyPlus } from "lucide-react";

export function DuplicateFormButton({ formId }: { formId: string }) {
  const router = useRouter();

  const handleDuplicate = () => {
    const params = new URLSearchParams({
      duplicateFrom: formId,
    });
    router.push(`/admin/forms/new?${params.toString()}`);
  };

  return (
    <Button variant="ghost" size="icon-sm" onClick={handleDuplicate}>
      <CopyPlus className="h-4 w-4" />
    </Button>
  );
}
