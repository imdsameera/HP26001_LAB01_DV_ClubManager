import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb } from "@/lib/db/mongodb";
import { DB_NAME } from "@/lib/models/member";
import { CLUBS_COLLECTION } from "@/lib/models/club";
import { USERS_COLLECTION } from "@/lib/models/user";

export async function GET() {
  try {
    const session = await auth();
    const adminClubId = (session?.user as any)?.clubId;
    const adminEmail = session?.user?.email;

    const db = await getDb(DB_NAME);
    const clubs = await db.collection(CLUBS_COLLECTION).find({}).toArray();
    
    const clubsSummary = clubs.map(c => ({
      id: c._id.toString(),
      name: c.name,
      slug: c.slug,
      isMatchesAdmin: c._id.toString() === adminClubId
    }));

    // Detailed member analysis
    const allMembers = await db.collection("members").find({}).toArray();
    
    const dataDistribution = allMembers.reduce((acc: any, m: any) => {
      const cid = m.clubId;
      const key = typeof cid === 'string' ? `string:${cid}` : `object:${cid.toString()}`;
      if (!acc[key]) acc[key] = { count: 0, active: 0, pending: 0, missingMemberId: 0, type: typeof cid };
      acc[key].count++;
      if (m.status === 'active') acc[key].active++;
      if (m.status === 'pending') acc[key].pending++;
      if (!m.memberId && m.status === 'active') acc[key].missingMemberId++;
      return acc;
    }, {});

    const adminMatches = Object.keys(dataDistribution).filter(k => k.includes(adminClubId || 'NONE'));

    return NextResponse.json({
      admin: {
        email: adminEmail,
        clubId: adminClubId,
        clubIdType: typeof adminClubId
      },
      clubs: clubsSummary,
      dataDistribution,
      summary: {
        totalMembers: allMembers.length,
        adminClubMatchesFound: adminMatches.length > 0,
        matchingMembersCount: adminMatches.reduce((sum, k) => sum + dataDistribution[k].count, 0)
      },
      superAdminEmail: process.env.SUPER_ADMIN_EMAIL
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
