# Backend Library Structure

- `db`: Database client setup and connection lifecycle (MongoDB).
- `models`: Data models and schema definitions.
- `repositories`: Database query/access layer per domain.
- `services`: Business logic layer orchestrating repositories.
- `validators`: Request/body validation schemas and helpers.
- `types`: Shared backend/domain TypeScript types.
- `utils`: Reusable backend utilities (responses, ids, pagination, etc.).

## MongoDB Setup

1. Create a `.env.local` file in the project root (you can copy `.env.local.example`).
2. Add your connection string:

```env
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster-host>/?retryWrites=true&w=majority&appName=club-management-dev"
```

3. Install dependency later when ready:

```bash
npm install mongodb
```

## Usage

Use the helper in server-side code only:

```ts
import { getDb } from "@/lib/db/mongodb";

export async function listMembers() {
  const db = await getDb("club-management-dev");
  return db.collection("members").find({}).toArray();
}
```

