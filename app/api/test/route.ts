import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { DB_NAME, MEMBERS_COLLECTION } from "@/lib/models/member";

export async function GET() {
  try {
    const db = await getDb(DB_NAME);
    const doc = await db.collection(MEMBERS_COLLECTION).find({ status: "pending" }).sort({ appliedAt: -1 }).limit(1).toArray();
    return NextResponse.json({ doc });
  } catch(e) {
    return NextResponse.json({ error: String(e) });
  }
}
