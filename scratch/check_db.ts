import { MongoClient } from "mongodb";
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
async function check() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("club-management-dev");
  const member = await db.collection("members").find({ status: "pending" }).sort({ appliedAt: -1 }).limit(1).toArray();
  console.log("Latest pending member:");
  if (member.length > 0) {
    console.log("Name:", member[0].firstName);
    console.log("Avatar length:", member[0].avatarUrl ? member[0].avatarUrl.length : "NO AVATAR");
  } else {
    console.log("No pending members");
  }
  await client.close();
}
check().catch(console.error);
