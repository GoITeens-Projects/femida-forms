"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { FormBuilder } from "@/components/form-builder";
import { NotSavedForm } from "@/lib/types";
import { toast } from "sonner";
import { usePageTitle } from "@/hooks/use-page-title";
import { toNotSavedForm } from "@/lib/utils";

export default function NewFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const duplicateFrom = searchParams.get("duplicateFrom");

  usePageTitle("Створення нової форми");

  const [prefill, setPrefill] = useState<NotSavedForm | undefined>();

  useEffect(() => {
    if (!duplicateFrom) return;
    fetch(`/api/forms/${duplicateFrom}`)
      .then((res) => res.json())
      .then((form) => setPrefill(toNotSavedForm(form)))
      .catch(() => toast.error("Не вдалося завантажити форму"));
  }, [duplicateFrom]);

  const handleSave = async (formData: {
    title: string;
    description: string | null;
    fields: unknown[];
  }) => {
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Не вдалося створити форму");
      }

      toast.success("Форма успішно створена!");
      router.push("/admin");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Не вдалося створити форму",
      );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Створити нову форму</h1>
        <p className="text-muted-foreground">
          Створіть свою форму з різними полями
        </p>
      </div>
      <FormBuilder
        key={prefill ? "prefilled" : "empty"}
        initialForm={prefill}
        onSave={handleSave}
      />
    </div>
  );
}
