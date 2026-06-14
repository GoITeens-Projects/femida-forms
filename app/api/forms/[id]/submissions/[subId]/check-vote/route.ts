import { getSession } from "@/lib/auth";
import { getContestByFormId, getVoteByUserAndContest } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; subId: string }> },
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, subId } = await params;
  try {
    const contest = await getContestByFormId(id);
    if (!contest) {
      return NextResponse.json({
        error: "Contest not found",
      });
    }
    const existing = await getVoteByUserAndContest(session.id, contest.id);
    let submitted = false;

    if (!contest.allow_multiple_votes && existing?.length !== 0) {
      submitted = true;
    } else if (existing?.some((elem) => elem.submission_id === subId)) {
      submitted = true;
    }
    return NextResponse.json({ submitted });
  } catch (error) {}
}
