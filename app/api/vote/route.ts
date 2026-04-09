import { NextRequest, NextResponse } from "next/server";
import { getServerSupabaseClient } from "@/lib/supabase";

interface VoteCounts {
  A: number;
  B: number;
}

// ---------------------------------------------------------------------------
// In-memory store — used when Supabase env vars are not configured (demo mode).
// Data resets on server restart. Safe for local review.
// ---------------------------------------------------------------------------
const memStore = {
  votes: new Map<string, "A" | "B">(),
  getCounts(): VoteCounts {
    let A = 0,
      B = 0;
    for (const c of this.votes.values()) {
      c === "A" ? A++ : B++;
    }
    return { A, B };
  },
};

// ---------------------------------------------------------------------------
// GET /api/vote?session_id=XXXX
// Returns { voted: boolean, counts: VoteCounts }
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  const supabase = getServerSupabaseClient();

  if (!supabase) {
    const voted = memStore.votes.has(sessionId);
    const counts = memStore.getCounts();
    return NextResponse.json({ voted, counts });
  }

  const { data: voteRow } = await supabase
    .from("votes")
    .select("choice")
    .eq("session_id", sessionId)
    .maybeSingle();

  const voted = voteRow !== null;

  const { data: allVotes } = await supabase.from("votes").select("choice");
  const counts: VoteCounts = { A: 0, B: 0 };
  allVotes?.forEach((row) => {
    if (row.choice === "A") counts.A++;
    else if (row.choice === "B") counts.B++;
  });

  return NextResponse.json({ voted, counts });
}

// ---------------------------------------------------------------------------
// POST /api/vote
// Body: { choice: 'A' | 'B', session_id: string }
// Returns { success: true, counts } or { success: false, already_voted: true }
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  let body: { choice?: string; session_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { choice, session_id } = body;

  if (!choice || !session_id || (choice !== "A" && choice !== "B")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = getServerSupabaseClient();

  if (!supabase) {
    if (memStore.votes.has(session_id)) {
      return NextResponse.json({ success: false, already_voted: true });
    }
    memStore.votes.set(session_id, choice as "A" | "B");
    const counts = memStore.getCounts();
    return NextResponse.json({ success: true, counts });
  }

  const { error } = await supabase.from("votes").insert({ choice, session_id });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ success: false, already_voted: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: allVotes } = await supabase.from("votes").select("choice");
  const counts: VoteCounts = { A: 0, B: 0 };
  allVotes?.forEach((row) => {
    if (row.choice === "A") counts.A++;
    else if (row.choice === "B") counts.B++;
  });

  return NextResponse.json({ success: true, counts });
}
