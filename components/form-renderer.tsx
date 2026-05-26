"use client";

import { useState, useRef } from "react";
import type { Form, FormField } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, X, Send, Plus } from "lucide-react";

interface FormRendererProps {
  form: Form;
  onSubmit: (
    answers: Record<string, string | string[] | boolean>,
  ) => Promise<void>;
}

export function FormRenderer({ form, onSubmit }: FormRendererProps) {
  const [answers, setAnswers] = useState<
    Record<string, string | string[] | boolean>
  >({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const updateAnswer = (
    fieldId: string,
    value: string | string[] | boolean,
  ) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => ({ ...prev, [fieldId]: "" }));
  };

  const handleFileSelect = async (fieldId: string, file: File | null) => {
    if (!file) {
      setFiles((prev) => ({ ...prev, [fieldId]: null }));
      setAnswers((prev) => ({ ...prev, [fieldId]: "" }));
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        [fieldId]: "File too large. Max 10MB.",
      }));
      return;
    }

    setFiles((prev) => ({ ...prev, [fieldId]: file }));
    setUploading((prev) => ({ ...prev, [fieldId]: true }));

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const { url } = await res.json();
      setAnswers((prev) => ({ ...prev, [fieldId]: url }));
      setErrors((prev) => ({ ...prev, [fieldId]: "" }));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        [fieldId]: error instanceof Error ? error.message : "Upload failed",
      }));
      setFiles((prev) => ({ ...prev, [fieldId]: null }));
    } finally {
      setUploading((prev) => ({ ...prev, [fieldId]: false }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    form.fields.forEach((field) => {
      if (field.required) {
        const value = answers[field.id];
        if (value === undefined || value === "" || value === false) {
          newErrors[field.id] = "Це поле є обов’язковим";
        }
      }
      if (field.type === "LINK") {
        const value = answers[field.id];
        const links = Array.isArray(value) ? value : [value as string];
        const isValid = links.every((l) => {
          try {
            new URL(l);
            return true;
          } catch {
            return false;
          }
        });
        if (!isValid) newErrors[field.id] = "Введіть дійсну URL-адресу";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await onSubmit(answers);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case "TEXT":
        return (
          <Input
            value={(answers[field.id] as string) || ""}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
            placeholder={field.placeholder}
            aria-invalid={!!errors[field.id]}
          />
        );

      case "TEXTAREA":
        return (
          <Textarea
            value={(answers[field.id] as string) || ""}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            aria-invalid={!!errors[field.id]}
          />
        );

      case "SELECT":
        if (field.multiple) {
          const selected = (answers[field.id] as string[]) || [];
          return (
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center gap-2">
                  <Checkbox
                    id={`${field.id}-${option}`}
                    checked={selected.includes(option)}
                    onCheckedChange={(checked) => {
                      updateAnswer(
                        field.id,
                        checked
                          ? [...selected, option]
                          : selected.filter((o) => o !== option),
                      );
                    }}
                  />
                  <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </div>
          );
        }
        return (
          <Select
            value={(answers[field.id] as string) || ""}
            onValueChange={(value) => updateAnswer(field.id, value)}
          >
            <SelectTrigger aria-invalid={!!errors[field.id]}>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "CHECKBOX":
        return (
          <div className="flex items-center gap-2">
            <Checkbox
              id={`field-${field.id}`}
              checked={(answers[field.id] as boolean) || false}
              onCheckedChange={(checked) =>
                updateAnswer(field.id, checked === true)
              }
            />
            <Label
              htmlFor={`field-${field.id}`}
              className="text-sm font-normal"
            >
              {field.label}
            </Label>
          </div>
        );

      case "LINK":
        if (field.multiple) {
          const links = (answers[field.id] as string[]) || [""];
          return (
            <div className="space-y-2">
              {links.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={link}
                    onChange={(e) => {
                      const updated = [...links];
                      updated[index] = e.target.value;
                      updateAnswer(field.id, updated);
                    }}
                    placeholder={field.placeholder}
                    aria-invalid={!!errors[field.id]}
                  />
                  {links.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updateAnswer(
                          field.id,
                          links.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => updateAnswer(field.id, [...links, ""])}
              >
                <Plus className="mr-2 h-4 w-4" />
                Додати посилання
              </Button>
            </div>
          );
        }
        return (
          <Input
            value={(answers[field.id] as string) || ""}
            onChange={(e) => updateAnswer(field.id, e.target.value)}
            placeholder={field.placeholder}
            aria-invalid={!!errors[field.id]}
          />
        );

      case "FILE":
        return (
          <div className="space-y-2">
            <input
              ref={(el) => {
                fileInputRefs.current[field.id] = el;
              }}
              type="file"
              className="hidden"
              onChange={(e) =>
                handleFileSelect(field.id, e.target.files?.[0] || null)
              }
            />
            {files[field.id] ? (
              <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-3">
                <span className="flex-1 truncate text-sm">
                  {files[field.id]?.name}
                </span>
                {uploading[field.id] ? (
                  <span className="text-sm text-muted-foreground">
                    Завантаження...
                  </span>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      setFiles((prev) => ({ ...prev, [field.id]: null }));
                      setAnswers((prev) => ({ ...prev, [field.id]: "" }));
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRefs.current[field.id]?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Виберіть файл
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Максимальний розмір файлу: 10 МБ
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">{form.title}</CardTitle>
        {form.description && (
          <CardDescription>{form.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {form.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              {field.type !== "CHECKBOX" && (
                <Label htmlFor={`field-${field.id}`}>
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-destructive">*</span>
                  )}
                </Label>
              )}
              {renderField(field)}
              {errors[field.id] && (
                <p className="text-sm text-destructive">{errors[field.id]}</p>
              )}
            </div>
          ))}

          <Button type="submit" disabled={submitting} className="w-full">
            <Send className="mr-2 h-4 w-4" />
            {submitting ? "Відправка..." : "Відправити"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
