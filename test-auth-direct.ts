import { authenticateUser } from "./lib/services/userService";

async function main() {
  const memberId = process.argv[2] || "HYKE-003";
  const password = process.argv[3] || "password";
  console.log(`Authenticating: ${memberId} / ${password}`);
  const result = await authenticateUser(memberId, password);
  console.log("Result:", result);
  process.exit(0);
}

main().catch(console.error);
