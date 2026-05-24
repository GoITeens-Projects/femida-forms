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
import { Plus, Trash2, GripVertical, Save } from "lucide-react";

interface FormBuilderProps {
  initialForm?: Form;
  onSave: (
    form: Omit<Form, "id" | "created_at" | "updated_at">,
  ) => Promise<void>;
}

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "TEXT", label: "Short Text" },
  { value: "TEXTAREA", label: "Long Text" },
  { value: "SELECT", label: "Dropdown" },
  { value: "CHECKBOX", label: "Checkbox" },
  { value: "FILE", label: "File Upload" },
];

export function FormBuilder({ initialForm, onSave }: FormBuilderProps) {
  const [title, setTitle] = useState(initialForm?.title || "");
  const [description, setDescription] = useState(
    initialForm?.description || "",
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
      await onSave({ title, description, fields: cleanedFields });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Form Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Form Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter form title..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter form description..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Form Fields</CardTitle>
          <Button onClick={addField} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Field
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No fields yet. Click &quot;Add Field&quot; to get started.
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
                          <Label>Field Label</Label>
                          <Input
                            value={field.label}
                            onChange={(e) =>
                              updateField(field.id, { label: e.target.value })
                            }
                            placeholder="Enter field label..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Field Type</Label>
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
                          <Label>Options (one per line)</Label>
                          <Textarea
                            value={field.options?.join("\n") || ""}
                            // onChange={(e) =>
                            //   updateField(field.id, {
                            //     options: e.target.value
                            //       .split("\n")
                            //       .filter((o) => o.trim()),
                            //   })
                            // }
                            onChange={(e) => {
                              const raw = e.target.value;
                              updateField(field.id, {
                                options: raw === "" ? [] : raw.split("\n"),
                              });
                            }}
                            placeholder="Option 1&#10;Option 2&#10;Option 3"
                            rows={3}
                          />
                        </div>
                      )}

                      {(field.type === "TEXT" || field.type === "TEXTAREA") && (
                        <div className="space-y-2">
                          <Label>Placeholder (optional)</Label>
                          <Input
                            value={field.placeholder || ""}
                            onChange={(e) =>
                              updateField(field.id, {
                                placeholder: e.target.value,
                              })
                            }
                            placeholder="Enter placeholder text..."
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
                          Required field
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
          {saving ? "Saving..." : initialForm ? "Update Form" : "Create Form"}
        </Button>
      </div>
    </div>
  );
}
