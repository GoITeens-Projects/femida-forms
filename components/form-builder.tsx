"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Form, FormField, FieldType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  CalendarIcon,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateTimePicker } from "./datetime-picker";

interface FormBuilderProps {
  initialForm?: Form;
  onSave: (
    form: Omit<Form, "id" | "created_at" | "updated_at">,
  ) => Promise<void>;
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "TEXT", label: "Короткий текст" },
  { value: "TEXTAREA", label: "Довгий текст" },
  { value: "SELECT", label: "Варіанти" },
  { value: "CHECKBOX", label: "Прапорець" },
  { value: "LINK", label: "Посилання" },
  { value: "FILE", label: "Файл" },
];

export function FormBuilder({ initialForm, onSave }: FormBuilderProps) {
  const [title, setTitle] = useState(initialForm?.title || "");
  const [description, setDescription] = useState(
    initialForm?.description || "",
  );
  const [expiresAt, setExpiresAt] = useState<Date | null>(
    initialForm?.expires_at ? new Date(initialForm.expires_at) : null,
  );
  const [fields, setFields] = useState<FormField[]>(initialForm?.fields || []);
  const [saving, setSaving] = useState(false);

  const addField = () => {
    setFields([
      ...fields,
      {
        id: uuidv4(),
        label: "",
        type: "TEXT",
        required: false,
        placeholder: "",
      },
    ]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a form title");
      return;
    }

    if (fields.length === 0) {
      alert("Please add at least one field");
      return;
    }

    if (fields.some((f) => !f.label.trim())) {
      alert("All fields must have a label");
      return;
    }

    const cleanedFields = fields.map((f) => ({
      ...f,
      options: f.options?.filter((o) => o.trim()) ?? [],
    }));

    setSaving(true);
    try {
      await onSave({
        title,
        description,
        fields: cleanedFields,
        expires_at: expiresAt ? expiresAt.toISOString() : null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Основна інформація про форму</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Назва форми</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введіть назву форми..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Опис (не обов’язково)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Введіть опис форми..."
              rows={3}
            />
          </div>
          {/* expiration date selection */}
          <div className="space-y-2">
            <Label>Форма діє до (Київський час)</Label>
            <div className="flex gap-2 items-start">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-fit justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiresAt
                      ? format(
                          toZonedTime(expiresAt, "Europe/Kyiv"),
                          "PPP HH:mm",
                          { locale: uk },
                        )
                      : "Без обмеження часу"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <DateTimePicker value={expiresAt} onChange={setExpiresAt} />
                </PopoverContent>
              </Popover>
              {expiresAt && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setExpiresAt(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          {/* expiration date selection end */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Поля форми</CardTitle>
          <Button onClick={addField} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Додати поле
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Поки що немає полів. Натисніть &quot;Додати поле&quot; щоб
              розпочати
            </p>
          ) : (
            fields.map((field, index) => (
              <Card key={field.id} className="border-dashed">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 pt-2 text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Назва поля</Label>
                          <Input
                            value={field.label}
                            onChange={(e) =>
                              updateField(field.id, { label: e.target.value })
                            }
                            placeholder="Введіть назву поля..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Тип поля</Label>
                          <Select
                            value={field.type}
                            onValueChange={(value: FieldType) =>
                              updateField(field.id, { type: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FIELD_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {field.type === "SELECT" && (
                        <div className="space-y-2">
                          <Label>Варіанти (по одному в рядку)</Label>
                          <Textarea
                            value={field.options?.join("\n") || ""}
                            onChange={(e) => {
                              const raw = e.target.value;
                              updateField(field.id, {
                                options: raw === "" ? [] : raw.split("\n"),
                              });
                            }}
                            placeholder={`Варіант 1\nВаріант 2\nВаріант 3`}
                            rows={3}
                          />
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`multiple-${field.id}`}
                              checked={field.multiple || false}
                              onCheckedChange={(checked) =>
                                updateField(field.id, {
                                  multiple: checked === true,
                                })
                              }
                            />
                            <Label
                              htmlFor={`multiple-${field.id}`}
                              className="text-sm"
                            >
                              Дозволити вибір декількох варіантів
                            </Label>
                          </div>
                        </div>
                      )}

                      {field.type === "LINK" && (
                        <div className="space-y-2">
                          <Label>Текст-заповнювач (не обов'язково)</Label>
                          <Input
                            value={field.placeholder || ""}
                            onChange={(e) =>
                              updateField(field.id, {
                                placeholder: e.target.value,
                              })
                            }
                            placeholder="Введіть текст-заповнювач..."
                          />
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`multiple-${field.id}`}
                              checked={field.multiple || false}
                              onCheckedChange={(checked) =>
                                updateField(field.id, {
                                  multiple: checked === true,
                                })
                              }
                            />
                            <Label
                              htmlFor={`multiple-${field.id}`}
                              className="text-sm"
                            >
                              Дозволити декілька посилань
                            </Label>
                          </div>
                        </div>
                      )}

                      {(field.type === "TEXT" || field.type === "TEXTAREA") && (
                        <div className="space-y-2">
                          <Label>Текст-заповнювач (не обов'язково)</Label>
                          <Input
                            value={field.placeholder || ""}
                            onChange={(e) =>
                              updateField(field.id, {
                                placeholder: e.target.value,
                              })
                            }
                            placeholder="Введіть текст-заповнювач..."
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`required-${field.id}`}
                          checked={field.required}
                          onCheckedChange={(checked) =>
                            updateField(field.id, {
                              required: checked === true,
                            })
                          }
                        />
                        <Label
                          htmlFor={`required-${field.id}`}
                          className="text-sm"
                        >
                          Обов’язкове поле
                        </Label>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeField(field.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Збереження..." : initialForm ? "Оновити форму" : "Створити форму"}
        </Button>
      </div>
    </div>
  );
}
