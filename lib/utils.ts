import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { parseISO, isAfter } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isFormExpired(formExpiresAt: string | null) {
  return formExpiresAt ? isAfter(new Date(), parseISO(formExpiresAt)) : false;
}
