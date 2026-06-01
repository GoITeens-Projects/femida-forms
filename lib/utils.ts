import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { parseISO, isAfter } from "date-fns";
import { Form, NotSavedForm } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isFormExpired(formExpiresAt: string | null) {
  return formExpiresAt ? isAfter(new Date(), parseISO(formExpiresAt)) : false;
}

export function toNotSavedForm(form: Form): NotSavedForm {
  const { id, created_at, updated_at, ...rest } = form;
  return rest;
}
