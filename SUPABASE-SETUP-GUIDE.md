# 🚀 Supabase Setup Guide for GQ-AI

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in details:
   - **Name**: `gq-ai-database`
   - **Database Password**: (save this securely!)
   - **Region**: Choose closest to your server (e.g., `eu-central-1`)
4. Click **"Create new project"**
5. Wait ~2 minutes for project to provision

---

## Step 2: Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy entire contents of `SUPABASE-SCHEMA.sql`
4. Paste into SQL Editor
5. Click **"Run"** (or press Ctrl/Cmd + Enter)
6. ✅ You should see: "Success. No rows returned"

---

## Step 3: Get Credentials

### Get Supabase URL:
1. Go to **Project Settings** → **API**
2. Copy **"Project URL"**
   - Format: `https://xxxxxxxxxxxxx.supabase.co`

### Get Service Key:
1. Same page (**Project Settings** → **API**)
2. Under **"Project API keys"**, find **"service_role"**
3. Click **"Reveal"** and copy the key
4. ⚠️ **Important**: This is a SECRET key with full database access!

---

## Step 4: Configure Backend

Add to `backend/.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here

# Existing configs...
OPENAI_API_KEY=your_openai_key
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_VERIFY_TOKEN=gq-ai-webhook-token
PORT=4000
FRONTEND_URL=http://localhost:3000
```

---

## Step 5: Switch to Supabase Database

**Current**: Using `database.service.ts` (SQLite)
**New**: Use `supabase-database.service.ts` (Supabase)

### Option A: Quick Switch (Replace)

Replace all imports:

```typescript
// OLD
import { databaseService } from './services/database.service';

// NEW
import { supabaseDatabaseService as databaseService } from './services/supabase-database.service';
```

### Option B: Manual Update (Recommended for Production)

Update each file individually:
1. `backend/src/index.ts`
2. `backend/src/services/message-monitor.service.ts`
3. `backend/src/services/whatsapp-monitor.service.ts`

---

## Step 6: Update Message Monitor for AI Merging

The new logic handles multiple quick messages properly!

**Key Changes:**
1. Check for pending AI response before generating new one
2. Get all unanswered messages (not just latest)
3. Supersede old pending AI if new message arrives
4. Generate single AI response addressing all unanswered messages

---

## Step 7: Test

### Test 1: Single Message
```bash
cd backend
npm install
npm run dev
```

Send one message → AI generates response → ✅

### Test 2: Multiple Quick Messages
1. Send message: "Where is the microwave?"
2. Wait 2 seconds
3. Send message: "And where is the TV remote?"
4. ✅ Frontend should show ONE AI response addressing BOTH questions

### Test 3: Check Database
```sql
-- In Supabase SQL Editor
SELECT * FROM ai_responses ORDER BY created_at DESC LIMIT 10;
```

Should see:
- First AI response: `status = 'superseded'`
- Second AI response: `status = 'pending'`, `source_message_ids = [msg1, msg2]`

---

## Verification Queries

### Check Contacts
```sql
SELECT id, name, platform, email, phone_number 
FROM contacts 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check Conversations
```sql
SELECT 
  c.*,
  ct.name as contact_name
FROM conversations c
JOIN contacts ct ON c.contact_id = ct.id
ORDER BY c.updated_at DESC
LIMIT 10;
```

### Check Messages
```sql
SELECT 
  m.*,
  c.platform
FROM messages m
JOIN conversations c ON m.conversation_id = c.id
ORDER BY m.sent_at DESC
LIMIT 20;
```

### Check AI Responses
```sql
SELECT 
  id,
  conversation_id,
  LEFT(content, 50) as preview,
  status,
  unanswered_message_count,
  created_at
FROM ai_responses
ORDER BY created_at DESC
LIMIT 10;
```

### Check Pending AI Responses
```sql
SELECT *
FROM ai_responses
WHERE status = 'pending'
ORDER BY created_at DESC;
```

---

## Row Level Security (Optional)

If you want to restrict access:

### Disable Public Access
```sql
-- Remove public policies
DROP POLICY IF EXISTS "Allow all operations for service role" ON contacts;
-- Repeat for all tables
```

### Create Service-Only Policies
```sql
-- Only allow service role (your backend)
CREATE POLICY "Service role only" ON contacts
  FOR ALL 
  TO service_role
  USING (true);

-- Repeat for: conversations, messages, ai_responses, processed_messages
```

---

## Migration from SQLite (Optional)

If you have existing data in SQLite:

### Export from SQLite
```bash
cd backend
sqlite3 gq-ai.db ".dump" > sqlite-dump.sql
```

### Transform & Import
Use the migration script (we'll create this if needed) or manually insert data:

```sql
-- Example: Insert contacts
INSERT INTO contacts (id, name, platform, email, avatar)
VALUES 
  ('uuid-1', 'John Doe', 'airbnb', 'john@example.com', '/Logos/airbnb-logo.png'),
  -- ... more contacts
```

---

## Monitoring & Logs

### Supabase Dashboard
- **Database** → **Tables**: View/edit data
- **Database** → **Extensions**: See installed extensions (uuid-ossp)
- **Logs** → **Postgres Logs**: See database errors
- **API** → **Logs**: See API request logs

### Backend Logs
```bash
# Watch backend logs
cd backend
npm run dev

# Look for:
✅ Supabase client initialized
✅ Processed message from [contact]
🤖 AI Response: [text]
🔄 Superseded pending AI response
```

---

## Troubleshooting

### "Supabase credentials not configured"
- Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are in `.env`
- Restart backend

### "PGRST116 error"
- This means "no rows returned" - it's expected for `.single()` queries
- Code handles this gracefully

### "Foreign key violation"
- Ensure you're creating contacts before conversations
- Check that conversation references valid contact_id

### "Function get_unanswered_messages does not exist"
- Re-run the SQL schema (`SUPABASE-SCHEMA.sql`)
- Check **Database** → **Functions** in Supabase Dashboard

---

## Cost Estimate

**Supabase Free Tier:**
- ✅ 500 MB database
- ✅ 2 GB file storage
- ✅ 50 MB file uploads
- ✅ 2 GB bandwidth
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests

**For your use case:**
- ~1,000 messages/month = ~1 MB
- ~100 conversations = ~10 KB
- **Well within free tier! 🎉**

**Upgrade to Pro ($25/month) only if:**
- Need more than 8 GB database
- Need more than 100 GB bandwidth
- Want daily backups

---

## Next Steps

1. ✅ Create Supabase project
2. ✅ Run SQL schema
3. ✅ Add credentials to `.env`
4. ✅ Install dependencies: `npm install`
5. ✅ Update imports to use `supabase-database.service`
6. ✅ Test with real messages
7. ✅ Monitor AI response merging in dashboard

---

**You're ready! The AI will now intelligently merge multiple quick messages into one response! 🚀**

