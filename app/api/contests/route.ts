import { NextRequest, NextResponse } from "next/server";
import { Contest } from "@/lib/types";
import { isAdmin, getSession } from "@/lib/auth";
import { createContest } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      form_id,
      hideParticipantsNames,
      allowMultipleVotes,
      starts_at,
      ends_at,
    } = body;

    if (
      !form_id ||
      hideParticipantsNames === null ||
      allowMultipleVotes === null
    ) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const contest = createContest({
      form_id,
      hideParticipantsNames,
      allowMultipleVotes,
      starts_at,
      ends_at,
    });

    if (!contest) {
      return NextResponse.json(
        { error: "Failed to create contest" },
        { status: 500 },
      );
    }

    return NextResponse.json(contest);
  } catch (error) {
    console.error("Create contest error:", error);
    return NextResponse.json(
      { error: "Failed to create contest" },
      { status: 500 },
    );
  }
}