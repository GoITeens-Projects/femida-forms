"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import type {
  Form,
  FormField,
  FieldType,
  NotSavedForm,
  Contest,
  NotSavedContest,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "./ui/switch";
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
  initialForm?: Form | NotSavedForm;
  initialContest?: Contest | NotSavedContest;
  onSave: (form: NotSavedForm, contest?: NotSavedContest | null) => Promise<void>;
}

interface ContestState extends Omit<NotSavedContest, "starts_at" | "ends_at"> {
  enabled: boolean;

  starts_at: Date | null;
  ends_at: Date | null;
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "TEXT", label: "Короткий текст" },
  { value: "TEXTAREA", label: "Довгий текст" },
  { value: "SELECT", label: "Варіанти" },
  { value: "CHECKBOX", label: "Чекбокс" },
  { value: "LINK", label: "Посилання" },
  { value: "FILE", label: "Файл" },
];

export function FormBuilder({
  initialForm,
  initialContest,
  onSave,
}: FormBuilderProps) {
  const [title, setTitle] = useState(initialForm?.title || "");
  const [description, setDescription] = useState(
    initialForm?.description || "",
  );
  const [expiresAt, setExpiresAt] = useState<Date | null>(
    initialForm?.expires_at ? new Date(initialForm.expires_at) : null,
  );

  const [fields, setFields] = useState<FormField[]>(initialForm?.fields || []);
  const [contest, setContest] = useState<ContestState>({
    enabled: !!initialContest,
    hide_participants_names: initialContest?.hide_participants_names ?? true,
    allow_multiple_votes: initialContest?.allow_multiple_votes ?? true,
    starts_at: initialContest?.starts_at
      ? new Date(initialContest.starts_at)
      : null,
    ends_at: initialContest?.ends_at ? new Date(initialContest.ends_at) : null,
  });

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

    if (contest.enabled) {
      if (!contest.starts_at) {
        alert("Contest must have start date");
        return;
      }
      if (!contest.ends_at) {
        alert("Contest must have end date");
        return;
      }
    }

    setSaving(true);
    try {
      await onSave(
        {
          title,
          description,
          fields: cleanedFields,
          expires_at: expiresAt ? expiresAt.toISOString() : null,
        },
        contest.enabled
          ? {
              hide_participants_names: contest.hide_participants_names,
              allow_multiple_votes: contest.allow_multiple_votes,
              starts_at: contest.starts_at!.toISOString(),
              ends_at: contest.ends_at!.toISOString(),
            }
          : initialContest
            ? null
            : undefined,
      );
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
          <div className="flex items-center gap-2">
            <CardTitle>Голосування</CardTitle>
          </div>
          <Switch
            checked={contest.enabled}
            onCheckedChange={() =>
              setContest({ ...contest, enabled: !contest.enabled })
            }
            aria-label="Увімкнути голосування"
          />
        </CardHeader>

        {contest.enabled && (
          <CardContent className="space-y-5">
            {/* Voting period */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Початок голосування (Київський час)</Label>
                <div className="flex gap-2 items-start">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-fit justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {contest.starts_at
                          ? format(
                              toZonedTime(contest.starts_at, "Europe/Kyiv"),
                              "PPP HH:mm",
                              { locale: uk },
                            )
                          : "Вкажіть дату"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <DateTimePicker
                        value={contest.starts_at}
                        onChange={(newDate) =>
                          setContest({ ...contest, starts_at: newDate })
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  {contest.starts_at && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setContest({ ...contest, starts_at: null })
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Завершення голосування (Київський час)</Label>
                <div className="flex gap-2 items-start">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-fit justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {contest.ends_at
                          ? format(
                              toZonedTime(contest.ends_at, "Europe/Kyiv"),
                              "PPP HH:mm",
                              { locale: uk },
                            )
                          : "Вкажіть дату"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <DateTimePicker
                        value={contest.ends_at}
                        onChange={(newDate) =>
                          setContest({ ...contest, ends_at: newDate })
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  {contest.ends_at && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setContest({ ...contest, ends_at: null })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Switch
                  id="hide-names"
                  checked={contest.hide_participants_names}
                  onCheckedChange={() =>
                    setContest({
                      ...contest,
                      hide_participants_names: !contest.hide_participants_names,
                    })
                  }
                />
                <Label htmlFor="hide-names" className="cursor-pointer">
                  Приховати імена учасників
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="multiple-votes"
                  checked={contest.allow_multiple_votes}
                  onCheckedChange={() =>
                    setContest({
                      ...contest,
                      allow_multiple_votes: !contest.allow_multiple_votes,
                    })
                  }
                />
                <Label htmlFor="multiple-votes" className="cursor-pointer">
                  Дозволити кілька голосів від одного користувача
                </Label>
              </div>
            </div>
          </CardContent>
        )}
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
        <Button onClick={addField} size="lg" className="mr-2 aspect-square">
          <Plus className="h-5 w-5" />
        </Button>
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="mr-2 h-4 w-4" />
          {saving
            ? "Збереження..."
            : initialForm && "id" in initialForm
              ? "Оновити форму"
              : "Створити форму"}
        </Button>
      </div>
    </div>
  );
}
