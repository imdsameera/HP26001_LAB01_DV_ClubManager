import { findUserByIdentifier } from "./lib/repositories/userRepository";
import { getDb } from "./lib/db/mongodb";

async function main() {
  console.log("Checking for HYKE-003...");
  const user1 = await findUserByIdentifier("HYKE-003");
  console.log("User 1:", user1);

  const user2 = await findUserByIdentifier("HYKE-0003");
  console.log("User 2:", user2);

  const db = await getDb(process.env.MONGODB_DB_NAME || "hl26001_lab01_dv_club-manager");
  const allUsers = await db.collection("users").find({}).toArray();
  console.log("All users:", allUsers.map(u => u.memberId));
  process.exit();
}
main().catch(console.error);
