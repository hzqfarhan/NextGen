# Migrating BeU NextGen from NovaCloud PostgreSQL to Supabase

Supabase is built entirely on top of PostgreSQL. Since BeU NextGen is already using a standard relational PostgreSQL database (currently hosted on IPONESERVER — NovaCloud), migrating to Supabase is extremely straightforward. 

Depending on how deep you want the integration to be, you have two options:

---

## Option 1: The "Zero-Code" Migration (Easiest & Fastest)
Because Supabase **is** a Postgres database, it gives you a standard PostgreSQL connection string. You actually don't need to change a single line of your Next.js code!

### What Changes?
Absolutely nothing in your code. You only change your environment variables.

### Steps:
1. **Create a Supabase Project:** Go to supabase.com and create a new project.
2. **Get the Connection String:** In Supabase, go to Settings -> Database -> Connection string (URI).
3. **Update `.env.local`:**
   Change your existing database URL from the NovaCloud one to the Supabase one:
   ```env
   # Old
   # DATABASE_URL=postgresql://user:pass@iponeserver:5432/dbname
   
   # New (Supabase)
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
4. **Run the Database Schema:**
   Since you have a fresh database, you need to recreate your tables. Go to the **Supabase SQL Editor** on your dashboard and paste the SQL schema from `docs/system_architecture.md` (creating the `users`, `savings`, `transfers`, `bills`, `chat_logs`, and `user_sync` tables).

That's it! Your `pg` library in `src/app/api/.../route.ts` will connect to Supabase seamlessly and everything will work exactly as it does now.

---

## Option 2: The "Native Supabase" Migration (Recommended for Long-Term)
If you want to use Supabase's native superpowers (like Realtime WebSockets, built-in Authentication, or Row Level Security), you should migrate away from the raw `pg` library and use the official Supabase JavaScript client.

### What Changes?
1. **Dependencies:** You will uninstall `pg` and install `@supabase/supabase-js`.
2. **Environment Variables:** You will use Supabase API keys instead of a direct database URL.
3. **API Routes:** You will rewrite your SQL strings (e.g., `SELECT * FROM users`) into Supabase's object-relational mapping syntax.

### Step-by-Step Changes:

#### 1. Install the SDK
```bash
npm uninstall pg
npm install @supabase/supabase-js
```

#### 2. Update Environment Variables (`.env.local`)
Remove `DATABASE_URL` and add:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
```

#### 3. Create a Supabase Client (`src/lib/supabase.ts`)
You'll create a new utility file to initialize the client:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
```

#### 4. Rewrite the API Routes
You will need to update all your API files inside `src/app/api/` (`sync`, `chat/log`, `bills`, etc.).

**Before (Raw SQL with `pg`):**
```typescript
const client = new Client({ connectionString: dbUrl });
await client.connect();
const result = await client.query('SELECT state_data FROM user_sync WHERE user_name = $1', [userName]);
await client.end();
```

**After (Supabase Client):**
```typescript
import { supabase } from '@/lib/supabase';

const { data, error } = await supabase
  .from('user_sync')
  .select('state_data')
  .eq('user_name', userName)
  .single();
```

### Why do Option 2?
While Option 1 is instant, Option 2 gives you access to:
* **Supabase Auth:** You can replace your hardcoded "Aiman" username login with real Google/Apple/Email logins.
* **Supabase Realtime:** You can listen to database changes live. For example, if a background cron job pays a bill, the user's dashboard can update instantly without them refreshing the page.
* **Edge Functions:** You can move your Gemini AI logic (`/api/chat`) directly into Supabase Edge Functions for faster global response times.
