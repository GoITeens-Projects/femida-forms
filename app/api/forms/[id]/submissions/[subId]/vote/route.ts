import { NextRequest, NextResponse } from "next/server";
import { isAdmin, getSession } from "@/lib/auth";
import {
  createVote,
  getContestByFormId,
  getVoteByUserAndContest,
  getSubmissionById,
} from "@/lib/db";
import { collectBackendFingerprint } from "@/lib/collectBackendFingerprint";
import { ClientFingerprint } from "@/lib/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; subId: string }> },
) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, subId } = await params;
  const { fingerprint } = (await request.json()) as {
    fingerprint: ClientFingerprint;
  };
  // console.log("fp", fingerprint);

  try {
    const contest = await getContestByFormId(id);
    if (!contest) {
      return NextResponse.json({
        error: "Contest not found",
      });
    }

    const now = new Date();
    if (new Date(contest.starts_at) > now) {
      return NextResponse.json(
        { error: "Голосування ще не почалось" },
        { status: 403 },
      );
    }
    if (new Date(contest.ends_at) < now) {
      return NextResponse.json(
        { error: "Голосування вже закінчилось" },
        { status: 403 },
      );
    }

    const existing = await getVoteByUserAndContest(session.id, contest.id);

    if (!contest.allow_multiple_votes && existing?.length !== 0) {
      return NextResponse.json({ error: "Already voted" }, { status: 409 });
    }
    if (existing?.some((elem) => elem.submission_id === subId)) {
      return NextResponse.json(
        { error: "Already voted for this submission" },
        { status: 409 },
      );
    }

    const submission = await getSubmissionById(subId);
    if (!submission) {
      return NextResponse.json({
        error: "Submission not found",
      });
    }

    const backendFingerprint = await collectBackendFingerprint(request);
    console.log("ip", backendFingerprint.asn.ip);
    console.log("geo", backendFingerprint.geo);
    const success = await createVote({
      user_id: session.id,
      contest_id: contest.id,
      submission_id: submission.id,
      client_fingerprint: fingerprint,
      backend_fingerprint: backendFingerprint,
    });

    return NextResponse.json({ success: !!success });
  } catch (error) {
    console.error("Create vote error:", error);
    return NextResponse.json(
      { error: "Failed to create vote" },
      { status: 500 },
    );
  }
}
