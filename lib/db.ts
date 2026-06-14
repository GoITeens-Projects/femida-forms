import { createClient } from "@/lib/supabase/server";
import type { User, Form, Submission, Contest, Vote } from "./types";

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
      "upsertUser error:",
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
    console.error(
      "Error while deleting form ",
      error.message,
      error.details,
      error.hint,
    );
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

export async function getSubmissionById(
  id: string,
): Promise<(Submission & { user: User }) | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Submission & { user: User };
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

// Contest operations

export async function getContestById(id: string): Promise<Contest | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contests")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Contest;
}

export async function getContestByFormId(
  formId: string,
): Promise<Contest | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contests")
    .select("*, form:forms(*)")
    .eq("form_id", formId)
    .single();

  if (error || !data) return null;
  return data as Contest;
}

export async function getContestWithForm(
  id: string,
): Promise<(Contest & { form: Form }) | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contests")
    .select("*, form:forms(*)")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Contest & { form: Form };
}

export async function getAllContests(): Promise<(Contest & { form: Form })[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contests")
    .select("*, form:forms(*)")
    .order("starts_at", { ascending: false });

  if (error || !data) return [];
  return data as (Contest & { form: Form })[];
}

export async function getActiveContests(): Promise<
  (Contest & { form: Form })[]
> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("contests")
    .select("*, form:forms(*)")
    .lte("starts_at", now)
    .gte("ends_at", now)
    .order("ends_at", { ascending: true });

  if (error || !data) return [];
  return data as (Contest & { form: Form })[];
}

export async function createContest(
  contest: Omit<Contest, "id" | "form">,
): Promise<Contest | null> {
  const supabase = await createClient();

  // Enforce one contest per form
  const existing = await getContestByFormId(contest.form_id);
  if (existing) {
    console.error("createContest: a contest already exists for this form");
    return null;
  }

  const { data, error } = await supabase
    .from("contests")
    .insert(contest)
    .select()
    .single();

  if (error || !data) {
    console.error("createContest error:", error?.message, error?.details);
    return null;
  }
  return data as Contest;
}

export async function updateContest(
  id: string,
  contest: Partial<Omit<Contest, "id" | "form_id" | "form">>,
): Promise<Contest | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("contests")
    .update(contest)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    console.error("updateContest error:", error?.message, error?.details);
    return null;
  }
  return data as Contest;
}

export async function deleteContest(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.from("contests").delete().eq("id", id);
  if (error) {
    console.error("deleteContest error:", error.message, error.details);
  }
  return !error;
}

// Vote operations

export async function getVoteById(id: string): Promise<Vote | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("votes")
    .select("*, user:users(*), contest:contests(*)")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Vote;
}

export async function getVotesByContestId(
  contestId: string,
): Promise<(Vote & { user: User })[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("votes")
    .select("*, user:users(*)")
    .eq("contest_id", contestId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as (Vote & { user: User })[];
}

export async function getVotesByFormId(
  formId: string,
): Promise<(Vote & { user: User; submission: Submission })[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("votes")
    .select(
      "*, user:users(*), submission:submissions(*), contest:contests!inner(form_id)",
    )
    .eq("contests.form_id", formId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as (Vote & { user: User; submission: Submission })[];
}

export async function getVoteByUserAndContest(
  userId: string,
  contestId: string,
): Promise<Vote[] | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("votes")
    .select("*")
    .eq("user_id", userId)
    .eq("contest_id", contestId);

  if (error || !data) return null;
  return data as Vote[];
}

export async function getVotesByUserId(
  userId: string,
): Promise<(Vote & { contest: Contest })[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("votes")
    .select("*, contest:contests(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as (Vote & { contest: Contest })[];
}

export async function countVotesByContestId(
  contestId: string,
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("votes")
    .select("*", { count: "exact", head: true })
    .eq("contest_id", contestId);

  if (error) {
    console.error("countVotesByContestId error:", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function createVote(
  vote: Omit<Vote, "id" | "user" | "contest" | "submission" | "created_at">,
): Promise<Vote | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("votes")
    .insert(vote)
    .select()
    .single();

  if (error || !data) {
    console.error("createVote error:", error?.message, error?.details);
    return null;
  }
  return data as Vote;
}

export async function deleteVote(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.from("votes").delete().eq("id", id);
  if (error) {
    console.error("deleteVote error:", error.message, error.details);
  }
  return !error;
}

export async function deleteVotesByContestId(
  contestId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("votes")
    .delete()
    .eq("contest_id", contestId);
  if (error) {
    console.error(
      "deleteVotesByContestId error:",
      error.message,
      error.details,
    );
  }
  return !error;
}
