// User types
export interface User {
  id: string;
  discord_id: string;
  username: string;
  avatar: string | null;
  role: "ADMIN" | "USER";
  created_at: string;
}

// Form field types
export type FieldType =
  | "TEXT"
  | "TEXTAREA"
  | "SELECT"
  | "CHECKBOX"
  | "FILE"
  | "LINK";

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // For SELECT type
  placeholder?: string;
  multiple?: boolean;
}

// Form types
export interface Form {
  id: string;
  title: string;
  description: string | null;
  fields: FormField[];
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

// Submission types
export interface Submission {
  id: string;
  form_id: string;
  user_id: string;
  answers: Record<string, string | string[] | boolean>;
  created_at: string;
  user?: User;
  form?: Form;
}
