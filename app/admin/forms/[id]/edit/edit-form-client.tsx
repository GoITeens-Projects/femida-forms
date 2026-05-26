"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormBuilder } from "@/components/form-builder";
import type { Form } from "@/lib/types";
import { toast } from "sonner";
import { usePageTitle } from "@/hooks/use-page-title";

export default function EditFormPageClient({ formId }: { formId: string }) {
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadForm() {
      try {
        const res = await fetch(`/api/forms/${formId}`);
        if (!res.ok) {
          router.push("/admin");
          return;
        }
        const formData = await res.json();
        setForm(formData);
      } catch (error) {
        console.error("Error loading form:", error);
        router.push("/admin");
      } finally {
        setLoading(false);
      }
    }

    loadForm();
  }, [formId, router]);

  usePageTitle(form ? "Редагування " + form?.title : undefined);

  const handleSave = async (formData: {
    title: string;
    description: string | null;
    fields: unknown[];
  }) => {
    try {
      const res = await fetch(`/api/forms/${formId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Не вдалося оновити форму");
      }

      toast.success("Форма успішно оновлена!");
      router.push("/admin");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Не вдалося оновити форму",
      );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-8 space-y-4">
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!form) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Редагувати форму</h1>
        <p className="text-muted-foreground">
          Оновіть поля та налаштування форми
        </p>
      </div>
      <FormBuilder initialForm={form} onSave={handleSave} />
    </div>
  );
}
