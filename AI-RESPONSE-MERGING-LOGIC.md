# 🎯 AI Response Merging Logic - Explained

## Problem Statement

**Scenario:**
```
10:00:00 - Guest: "Where is the microwave?"
          ↓ AI generates: "The microwave is in the kitchen."
10:00:45 - Guest: "And where is the TV remote?"
          ↓ AI should NOT generate separate response!
          ↓ AI should MERGE: "The microwave is in the kitchen, 
                              and the TV remote is on the coffee table."
```

## Current Flow (❌ Problem)

```
Message 1 arrives
   ↓
Generate AI Response 1
   ↓
Broadcast to frontend
   ↓
(45 seconds later)
   ↓
Message 2 arrives
   ↓
Generate AI Response 2  ← ❌ SEPARATE response!
   ↓
Broadcast to frontend
   ↓
Frontend shows TWO separate AI suggestions
```

## New Flow (✅ Solution)

```
Message 1 arrives
   ↓
Check: Any PENDING AI response? NO
   ↓
Get all UNANSWERED guest messages: [Message 1]
   ↓
Generate AI Response 1
   ↓
Save to ai_responses (status: 'pending')
   ↓
Broadcast to frontend
   ↓
(45 seconds later)
   ↓
Message 2 arrives
   ↓
Check: Any PENDING AI response? YES!
   ↓
Mark old response as 'superseded'
   ↓
Get all UNANSWERED guest messages: [Message 1, Message 2]
   ↓
Generate NEW merged AI Response addressing BOTH
   ↓
Save to ai_responses (status: 'pending')
   ↓
Broadcast to frontend (replaces old suggestion)
```

## Database Schema

### ai_responses Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `conversation_id` | UUID | Which conversation |
| `content` | TEXT | The AI-generated response |
| `status` | ENUM | `pending`, `sent`, `superseded`, `discarded` |
| `source_message_ids` | UUID[] | Array of message IDs this responds to |
| `unanswered_message_count` | INT | How many messages this addresses |
| `created_at` | TIMESTAMPTZ | When AI generated this |
| `updated_at` | TIMESTAMPTZ | Last modified |
| `sent_at` | TIMESTAMPTZ | When admin actually sent it |
| `superseded_at` | TIMESTAMPTZ | When replaced by newer response |

### Status Flow

```
pending → sent         (admin sends the AI suggestion)
pending → superseded   (new message arrives, AI re-generates)
pending → discarded    (admin writes custom response instead)
```

## Code Logic

### When Message Arrives:

```typescript
async function processIncomingMessage(message) {
  // 1. Save incoming message to database
  const savedMessage = await db.saveMessage(message);
  
  // 2. Check for pending AI response
  const pendingAI = await db.getPendingAIResponse(conversationId);
  
  if (pendingAI) {
    // 3a. Supersede old AI response
    await db.supersedePendingAIResponse(pendingAI.id);
  }
  
  // 4. Get ALL unanswered guest messages
  const unansweredMessages = await db.getUnansweredMessages(conversationId);
  
  // 5. Generate AI response addressing ALL unanswered messages
  const combinedPrompt = unansweredMessages
    .map(m => `${m.sender_name}: ${m.content}`)
    .join('\n');
  
  const aiResponse = await openAI.generateResponse(combinedPrompt, history);
  
  // 6. Save new AI response as 'pending'
  const aiResponseRecord = await db.createAIResponse({
    conversation_id: conversationId,
    content: aiResponse,
    status: 'pending',
    source_message_ids: unansweredMessages.map(m => m.id),
    unanswered_message_count: unansweredMessages.length
  });
  
  // 7. Broadcast to frontend
  broadcast({
    type: 'new_message',
    message: savedMessage,
    aiSuggestion: {
      id: aiResponseRecord.id,
      content: aiResponse,
      addressesMessages: unansweredMessages.length
    }
  });
}
```

### When Admin Sends Message:

```typescript
async function sendAdminMessage(conversationId, content, aiResponseId) {
  // 1. Save admin's message
  const message = await db.saveMessage({
    conversation_id: conversationId,
    content: content,
    is_own: true,
    sender_id: 'admin'
  });
  
  // 2. Mark AI response as 'sent' or 'discarded'
  if (aiResponseId) {
    // Admin used the AI suggestion
    await db.updateAIResponse(aiResponseId, {
      status: 'sent',
      sent_at: new Date()
    });
  } else {
    // Admin wrote custom response - discard pending AI
    const pendingAI = await db.getPendingAIResponse(conversationId);
    if (pendingAI) {
      await db.updateAIResponse(pendingAI.id, {
        status: 'discarded'
      });
    }
  }
  
  // 3. Send via WhatsApp/Gmail
  await sendMessageViaChannel(conversationId, content);
}
```

## Example Timeline

```
10:00:00 - Guest: "Where is the microwave?"
           ↓
           DB: messages table
           ID: msg-001
           content: "Where is the microwave?"
           is_own: FALSE
           sent_at: 10:00:00
           
           ↓
           
           DB: ai_responses table
           ID: ai-001
           content: "The microwave is in the kitchen."
           status: 'pending'
           source_message_ids: [msg-001]
           created_at: 10:00:01
           
           ↓
           
           Frontend shows: "The microwave is in the kitchen."

───────────────────────────────────────────────────────

10:00:45 - Guest: "And where is the TV remote?"
           ↓
           DB: messages table
           ID: msg-002
           content: "And where is the TV remote?"
           is_own: FALSE
           sent_at: 10:00:45
           
           ↓
           
           Check: Pending AI? YES (ai-001)
           
           ↓
           
           DB: ai_responses table UPDATE
           ID: ai-001
           status: 'superseded' ← Changed!
           superseded_at: 10:00:45
           
           ↓
           
           Get unanswered: [msg-001, msg-002]
           
           ↓
           
           Generate AI for BOTH:
           "The microwave is in the kitchen, and 
            the TV remote is on the coffee table."
           
           ↓
           
           DB: ai_responses table
           ID: ai-002
           content: "The microwave is in the kitchen, and..."
           status: 'pending'
           source_message_ids: [msg-001, msg-002] ← Both!
           created_at: 10:00:46
           
           ↓
           
           Frontend replaces with: "The microwave is in the 
           kitchen, and the TV remote is on the coffee table."

───────────────────────────────────────────────────────

10:02:00 - Admin clicks "Send" (using AI suggestion)
           ↓
           DB: messages table
           ID: msg-003
           content: "The microwave is in the kitchen, and..."
           is_own: TRUE ← Admin sent
           sent_at: 10:02:00
           
           ↓
           
           DB: ai_responses table UPDATE
           ID: ai-002
           status: 'sent' ← Marked as sent!
           sent_at: 10:02:00
           
           ↓
           
           Send via WhatsApp/Gmail
```

## Benefits

✅ **No Duplicate AI Suggestions** - Only one pending AI response at a time
✅ **Smart Merging** - AI considers all unanswered messages together
✅ **Full History** - Track which AI suggestions were sent/superseded/discarded
✅ **Analytics Ready** - Know how many messages per AI response, response time, etc.
✅ **Better UX** - Frontend shows one coherent response, not fragmented ones

## Database Queries for Analytics

```sql
-- How many AI responses were sent vs discarded?
SELECT status, COUNT(*) 
FROM ai_responses 
GROUP BY status;

-- Average messages per AI response
SELECT AVG(unanswered_message_count) 
FROM ai_responses 
WHERE status = 'sent';

-- How often do guests send multiple messages?
SELECT 
  unanswered_message_count,
  COUNT(*) as frequency
FROM ai_responses
WHERE status = 'sent'
GROUP BY unanswered_message_count
ORDER BY unanswered_message_count;

-- Average time between message and AI response
SELECT AVG(
  EXTRACT(EPOCH FROM (ai.created_at - m.sent_at))
) as avg_response_time_seconds
FROM ai_responses ai
JOIN messages m ON m.id = ai.source_message_ids[1]
WHERE ai.status = 'sent';
```

---

**This solves the multi-message problem perfectly! 🎯**

