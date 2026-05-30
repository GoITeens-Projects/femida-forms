import { createClient } from "@/lib/supabase/server";
import type { User, Form, Submission } from "./types";

// User operations
export async function getUserByDiscordId(
  discordId: string,
): Promise<User | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("discord_id", discordId)
    .single();

  if (error || !data) return null;
  return data as User;
}

export async function createUser(
  user: Omit<User, "id" | "created_at">,
): Promise<User | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .insert(user)
    .select()
    .single();

  if (error || !data) return null;
  return data as User;
}

export async function upsertUser(
  user: Omit<User, "id" | "created_at">,
): Promise<User | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .upsert(user, { onConflict: "discord_id" })
    .select()
    .single();

  if (error) {
    console.error(
      "[v0] upsertUser error:",
      error.message,
      error.details,
      error.hint,
    );
    return null;
  }
  if (!data) {
    console.error("[v0] upsertUser: no data returned");
    return null;
  }
  return data as User;
}

export async function getUserById(id: string): Promise<User | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as User;
}

// Form operations
export async function getAllForms(): Promise<Form[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as Form[];
}

export async function getUnsubmittedValidForms(userId: string) {
  const supabase = await createClient();

  const { data: submissions } = await supabase
    .from("submissions")
    .select("form_id")
    .eq("user_id", userId);

  const submittedFormIds = submissions?.map((s) => s.form_id) ?? [];

  const query = supabase
    .from("forms")
    .select("*")
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order("created_at", { ascending: false });

  if (submittedFormIds.length > 0) {
    query.not("id", "in", `(${submittedFormIds.join(",")})`);
  }

  const { data, error } = await query;

  if (error || !data) return [];
  return data as Form[];
}

export async function getFormById(id: string): Promise<Form | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forms")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Form;
}

export async function createForm(
  form: Omit<Form, "id" | "created_at" | "updated_at">,
): Promise<Form | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forms")
    .insert(form)
    .select()
    .single();

  if (error || !data) return null;
  return data as Form;
}

export async function updateForm(
  id: string,
  form: Partial<Omit<Form, "id" | "created_at">>,
): Promise<Form | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forms")
    .update({ ...form, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return null;
  return data as Form;
}

export async function deleteForm(id: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.from("forms").delete().eq("id", id);
  if (error) {
    console.error("Error while deleting form " + error);
  }
  return !error;
}

// Submission operations
export async function getSubmissionsByFormId(
  formId: string,
): Promise<(Submission & { user: User })[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("*, user:users(*)")
    .eq("form_id", formId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as (Submission & { user: User })[];
}

export async function createSubmission(
  submission: Omit<Submission, "id" | "created_at">,
): Promise<Submission | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .insert(submission)
    .select()
    .single();

  if (error || !data) return null;
  return data as Submission;
}

export async function getSubmissionByUserAndForm(
  userId: string,
  formId: string,
): Promise<Submission | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("user_id", userId)
    .eq("form_id", formId)
    .single();

  if (error || !data) return null;
  return data as Submission;
}

export async function getAllSubmissions(): Promise<
  (Submission & { user: User; form: Form })[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("*, user:users(*), form:forms(*)")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as (Submission & { user: User; form: Form })[];
}

export async function getFormsByUserSubmissions(
  userId: string,
): Promise<Form[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("form:forms(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((submission) => submission.form as unknown as Form);
}
