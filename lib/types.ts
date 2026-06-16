// User types
export interface User {
  id: string;
  discord_id: string;
  username: string;
  avatar: string | null;
  role: "ADMIN" | "USER";
  created_at: string;
  registered_at_discord: string;
  joined_server_at: string;
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

export type NotSavedForm = Omit<Form, "id" | "created_at" | "updated_at">;

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

export interface Contest {
  id: string;
  form_id: string;
  hide_participants_names: boolean;
  allow_multiple_votes: boolean;
  starts_at: string;
  ends_at: string;
  form?: Form;
}

export type NotSavedContest = Omit<Contest, "id" | "form_id" | "form">;

export interface Vote {
  id: string;
  user_id: string;
  contest_id: string;
  submission_id: string;
  created_at: string;
  client_fingerprint?: Partial<ClientFingerprint>;
  backend_fingerprint: BackendFingerprint;

  user: User;
  contest: Contest;
  submission: Submission;
}

export interface ClientFingerprint {
  visitorId: string;
  canvas_hash: string;
  audio_hash: string;
  // fonts_hash: string;
  gpu: {
    vendor: string;
    renderer: string;
  };
  screen: string;
  timezone: string;
  languages: string;
}

export type Geo = {
  source: "cloudflare" | "geoip-lite" | "ip-api.com";
  country: string;
  region: string;
  city: string;
  // lat: string;
  // lon: string;
  timezone: string;
};

export interface ASNData {
  ip: string;
  asn: string; // "AS16161"
  asn_org: string; // "Google LLC"
  isp: string; // "Google Public DNS"
}

//? The same for browser and OS
interface FingerprintBasicInfo {
  name: string;
  version: string;
}

export type BackendFingerprint = {
  geo: Geo;
  asn: ASNData;
  browser: FingerprintBasicInfo;
  os: FingerprintBasicInfo;
  acceptLanguage: string | null;
};
