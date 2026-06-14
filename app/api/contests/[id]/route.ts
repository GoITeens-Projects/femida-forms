import { deleteContest, getContestById, updateContest } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { isAdmin, getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const contest = await getContestById(id);

  if (!contest) {
    return NextResponse.json({ error: "Contest not found" });
  }
  return NextResponse.json(contest);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();

  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const form = await updateContest(id, body);

    if (!form) {
      return NextResponse.json(
        { error: "Failed to update contest" },
        { status: 500 },
      );
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error("Update contest error:", error);
    return NextResponse.json(
      { error: "Failed to update contest" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();

  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const success = await deleteContest(id);

  if (!success) {
    return NextResponse.json(
      { error: "Failed to delete contest" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
