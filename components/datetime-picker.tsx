"use client";

import * as React from "react";
import { Clock2Icon } from "lucide-react";
import { startOfDay } from "date-fns";
import { uk } from "date-fns/locale"
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

interface DateTimePickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const kyivDate = value ? toZonedTime(value, "Europe/Kyiv") : null;

  const timeValue = kyivDate
    ? `${kyivDate.getHours().toString().padStart(2, "0")}:${kyivDate.getMinutes().toString().padStart(2, "0")}`
    : "23:59";

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const [hours, minutes] = timeValue.split(":").map(Number);
    const updated = fromZonedTime(
      new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hours,
        minutes,
        0,
      ),
      "Europe/Kyiv",
    );
    onChange(updated);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!kyivDate) return;
    const [hours, minutes] = e.target.value.split(":").map(Number);
    const updated = fromZonedTime(
      new Date(
        kyivDate.getFullYear(),
        kyivDate.getMonth(),
        kyivDate.getDate(),
        hours,
        minutes,
        0,
      ),
      "Europe/Kyiv",
    );
    onChange(updated);
  };

  return (
    <Card className="mx-auto w-fit">
      <CardContent>
        <Calendar
          mode="single"
          selected={kyivDate || undefined}
          locale={uk}
          onSelect={handleDateSelect}
          disabled={(date) => {
            const todayKyiv = startOfDay(
              toZonedTime(new Date(), "Europe/Kyiv"),
            );
            return date < todayKyiv;
          }}
          className="p-0"
        />
      </CardContent>
      <CardFooter className="border-t bg-card">
        <Field>
          <FieldLabel>Time (Kyiv)</FieldLabel>
          <div className="flex items-center gap-1">
            <InputGroup>
              <InputGroupInput
                type="number"
                min={0}
                max={23}
                value={
                  kyivDate
                    ? kyivDate.getHours().toString().padStart(2, "0")
                    : "23"
                }
                onChange={(e) => {
                  const hours = Math.min(
                    23,
                    Math.max(0, Number(e.target.value)),
                  );
                  if (!kyivDate) return;
                  onChange(
                    fromZonedTime(
                      new Date(
                        kyivDate.getFullYear(),
                        kyivDate.getMonth(),
                        kyivDate.getDate(),
                        hours,
                        kyivDate.getMinutes(),
                        0,
                      ),
                      "Europe/Kyiv",
                    ),
                  );
                }}
                className="w-16 text-center"
              />
              <InputGroupAddon>
                <Clock2Icon className="text-muted-foreground" />
              </InputGroupAddon>
            </InputGroup>
            <span className="text-muted-foreground font-medium">:</span>
            <InputGroup>
              <InputGroupInput
                type="number"
                min={0}
                max={59}
                value={
                  kyivDate
                    ? kyivDate.getMinutes().toString().padStart(2, "0")
                    : "59"
                }
                onChange={(e) => {
                  const minutes = Math.min(
                    59,
                    Math.max(0, Number(e.target.value)),
                  );
                  if (!kyivDate) return;
                  onChange(
                    fromZonedTime(
                      new Date(
                        kyivDate.getFullYear(),
                        kyivDate.getMonth(),
                        kyivDate.getDate(),
                        kyivDate.getHours(),
                        minutes,
                        0,
                      ),
                      "Europe/Kyiv",
                    ),
                  );
                }}
                className="w-16 text-center"
              />
            </InputGroup>
          </div>
        </Field>
      </CardFooter>
    </Card>
  );
}
