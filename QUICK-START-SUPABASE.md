# ⚡ Quick Start: Supabase + AI Merging

## 🎯 What This Solves

**Problem:**
```
Guest: "Where is microwave?"  → AI suggests response A
Guest: "Where is TV remote?"  → AI suggests response B (separate!)
```

**Solution:**
```
Guest: "Where is microwave?"
Guest: "Where is TV remote?"  → AI suggests ONE response for BOTH! ✅
```

---

## 🚀 Setup (5 Minutes)

### 1. Create Supabase Project
```
1. Go to supabase.com
2. New Project → "gq-ai-database"
3. Copy URL + Service Key
```

### 2. Run Database Schema
```
1. Supabase → SQL Editor
2. Paste contents of SUPABASE-SCHEMA.sql
3. Run
```

### 3. Add Credentials
```env
# backend/.env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here
```

### 4. Update Code

**Only need to change imports in 3 files:**

`backend/src/index.ts`:
```typescript
import { supabaseDatabaseService as databaseService } from './services/supabase-database.service';
```

`backend/src/services/message-monitor.service.ts`:
```typescript
import { supabaseDatabaseService as databaseService } from './supabase-database.service';

// Update AI generation section (line ~177):
const pendingAI = await databaseService.getPendingAIResponse(conversation.id);
if (pendingAI) {
  await databaseService.supersedePendingAIResponse(conversation.id);
}

const unansweredMessages = await databaseService.getUnansweredMessages(conversation.id);
const combinedContext = unansweredMessages.map(m => `${m.sender_name}: ${m.content}`).join('\n');

const aiResponse = await openAIService.generateResponse(combinedContext, history);

const aiResponseRecord = await databaseService.createAIResponse({
  conversation_id: conversation.id,
  content: aiResponse,
  source_message_ids: unansweredMessages.map(m => m.id),
  model: 'gpt-4',
});
```

`backend/src/services/whatsapp-monitor.service.ts`:
```typescript
import { supabaseDatabaseService as databaseService } from './supabase-database.service';
// Same AI merging logic as above
```

### 5. Test
```bash
npm run dev
```

Send 2 quick messages → See 1 merged AI response! ✅

---

## 📊 Key Database Tables

```sql
-- All messages
messages (id, conversation_id, content, sent_at, is_own)

-- AI responses (NEW!)
ai_responses (
  id,
  conversation_id,
  content,
  status,                -- 'pending', 'sent', 'superseded', 'discarded'
  source_message_ids,    -- [msg1, msg2, ...] array
  created_at
)
```

---

## ✅ That's It!

**Changed**: 3 import statements + AI generation logic
**Result**: Intelligent message merging! 🎉

**Full Details**:
- `SUPABASE-SETUP-GUIDE.md` - Detailed setup
- `AI-RESPONSE-MERGING-LOGIC.md` - How it works
- `SUPABASE-IMPLEMENTATION-SUMMARY.md` - Complete overview

