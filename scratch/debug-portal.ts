import { getDb } from "./lib/db/mongodb";
import { DB_NAME as MEMBER_DB } from "./lib/models/member";
import { USERS_COLLECTION } from "./lib/models/user";
import { MEMBERS_COLLECTION } from "./lib/models/member";

async function debugData() {
  const db = await getDb(MEMBER_DB);
  
  console.log("--- USERS ---");
  const users = await db.collection(USERS_COLLECTION).find({ role: "MEMBER" }).toArray();
  users.forEach(u => {
    console.log(`User: ${u.email}, MemberId: ${u.memberId}, Role: ${u.role}`);
  });

  console.log("\n--- MEMBERS ---");
  const members = await db.collection(MEMBERS_COLLECTION).find({ status: "active" }).toArray();
  members.forEach(m => {
    console.log(`Member: ${m.email}, MemberId: ${m.memberId}, Status: ${m.status}`);
  });
}

debugData().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
