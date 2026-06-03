"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Form, NotSavedForm } from "@/lib/types";
import { FormBuilder } from "@/components/form-builder";
import { isPast } from "date-fns";

export default function NewFormPageClient({ formId }: { formId?: string }) {
  const router = useRouter();

  const [form, setForm] = useState<Form | NotSavedForm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!formId) {
      setLoading(false);
      return;
    }
    async function loadForm() {
      try {
        const res = await fetch(`/api/forms/${formId}`);
        if (!res.ok) {
          router.push("/admin");
          return;
        }
        const { id, created_at, updated_at, ...rest }: Form = await res.json();
        const formData: NotSavedForm = {
          ...rest,
          expires_at:
            rest.expires_at && !isPast(new Date(rest.expires_at))
              ? rest.expires_at
              : null,
        };
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

  if (!form && formId) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Створити нову форму</h1>
        <p className="text-muted-foreground">
          Створіть свою форму з різними полями
        </p>
      </div>
      <FormBuilder initialForm={form ?? undefined} onSave={handleSave} />
    </div>
  );
}
