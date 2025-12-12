# Gmail API Setup Guide for GQ-AI

## 📚 What I Learned from Gmail API Documentation

### Key Concepts
1. **OAuth 2.0 Required**: All access requires user authentication via OAuth
2. **Scopes Needed**: 
   - `https://www.googleapis.com/auth/gmail.modify` - Read, write, send (recommended)
   - `https://mail.google.com/` - Full access (simplest for testing)
3. **RESTful API**: HTTP requests to `https://gmail.googleapis.com/gmail/v1/`
4. **Rate Limits**: 250 quota units/second per user

### Critical API Methods We'll Use

#### 1. **List Messages** (`users.messages.list`)
```
GET https://gmail.googleapis.com/gmail/v1/users/me/messages
```
**Query Parameters:**
- `q`: Search query (e.g., `from:@airbnb.com`)
- `maxResults`: Number of messages to return (default 100)
- `labelIds`: Filter by labels (e.g., `INBOX`, `UNREAD`)

#### 2. **Get Message** (`users.messages.get`)
```
GET https://gmail.googleapis.com/gmail/v1/users/me/messages/{id}
```
**Query Parameters:**
- `format`: `full` | `metadata` | `minimal` | `raw`
- Returns full message content, headers, body, attachments

#### 3. **Send Message** (`users.messages.send`)
```
POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send
```
**Body:**
```json
{
  "raw": "base64url encoded email"
}
```
**Important**: Must include proper headers (To, From, Subject, In-Reply-To for threading)

#### 4. **Watch for Changes** (Push Notifications - Optional)
```
POST https://gmail.googleapis.com/gmail/v1/users/me/watch
```
- Set up webhook for real-time notifications instead of polling
- Requires Google Pub/Sub setup

---

## 🎯 YOUR STEP-BY-STEP SETUP PLAN

### **PART 1: Google Cloud Setup (15 minutes)**

#### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project"
3. Name it: `GQ-AI-Gmail-Integration`
4. Click "Create"

#### Step 2: Enable Gmail API
1. In your project, go to "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click "Enable"

#### Step 3: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. First time: Click "Configure Consent Screen"
   - User Type: **External** (for testing)
   - App name: `GQ-AI`
   - User support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue"
   - Scopes: Add `https://www.googleapis.com/auth/gmail.modify`
   - Test users: Add your Gmail address
   - Click "Save and Continue"
4. Back to Create OAuth client ID:
   - Application type: **Desktop app**
   - Name: `GQ-AI Desktop Client`
   - Click "Create"
5. **DOWNLOAD** the JSON file (credentials.json)
   - Save it securely - you'll need this!

---

### **PART 2: Backend Setup (30 minutes)**

#### Step 4: Create Backend Folder Structure
```bash
# In your project root
mkdir backend
cd backend

# Initialize Node.js project
npm init -y

# Install core dependencies
npm install express cors dotenv
npm install googleapis nodemailer mailparser openai
npm install -D typescript @types/node @types/express ts-node nodemon @types/cors

# Create folder structure
mkdir -p src/services src/controllers src/models src/utils src/config
```

#### Step 5: Configure TypeScript
Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

#### Step 6: Set Up Environment Variables
Create `.env` file:
```bash
# Gmail API
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:4000/oauth2callback
GMAIL_USER=me

# OpenAI
OPENAI_API_KEY=your-openai-key-here

# Server
PORT=4000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000
```

#### Step 7: Update package.json Scripts
```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

---

### **PART 3: Gmail Authentication Flow (45 minutes)**

#### Step 8: Create Gmail Service (`src/services/gmail.service.ts`)

**This handles:**
- OAuth authentication
- Token storage
- API calls to Gmail

**Key Functions:**
```typescript
- authenticate(): Promise<OAuth2Client>
- listMessages(query: string): Promise<Message[]>
- getMessage(messageId: string): Promise<FullMessage>
- sendMessage(to: string, subject: string, body: string, threadId?: string): Promise<void>
```

#### Step 9: First-Time Auth Flow

**What happens:**
1. Run authentication script
2. Opens browser with Google login
3. User grants permissions
4. Receives authorization code
5. Exchange code for tokens
6. Save refresh token (never expires unless revoked)
7. Use refresh token for all future requests

**Token Management:**
- Access token expires after 1 hour
- Automatically refresh using refresh token
- No need to re-authenticate

---

### **PART 4: Email Parsing (2 hours)**

#### Step 10: Create Email Parser (`src/services/email-parser.service.ts`)

**Must Handle:**
```typescript
interface ParsedEmail {
  platform: 'airbnb' | 'booking' | 'expedia' | 'fewo' | 'unknown'
  customerName: string
  message: string
  timestamp: Date
  threadId: string
  messageId: string
  replyTo: string
}
```

**Platform Patterns:**
- **Airbnb**: `from:automated@airbnb.com` or `from:noreply@airbnb.com`
- **Booking.com**: `from:noreply@booking.com`
- **Expedia**: `from:noreply@expedia.com`
- **FeWo-direkt**: `from:noreply@fewo-direkt.de`

**Parsing Strategy:**
1. Get email headers (`From`, `Subject`, `Date`, `Message-ID`, `In-Reply-To`)
2. Decode email body (base64url → text)
3. Extract customer name (usually in subject or first line)
4. Remove boilerplate text (regex patterns for each platform)
5. Extract clean message content

---

### **PART 5: Database Setup (1 hour)**

#### Step 11: Choose Database

**Option A: SQLite (Easiest for Testing)**
```bash
npm install better-sqlite3 @types/better-sqlite3
```

**Option B: PostgreSQL (Production Ready)**
```bash
npm install pg @types/pg
```

**Recommended: Start with SQLite, migrate to PostgreSQL later**

#### Step 12: Create Database Schema

**Tables:**
1. `contacts` - Store guest information
2. `conversations` - Link contacts to email threads
3. `messages` - All messages
4. `email_cache` - Track processed Gmail message IDs

---

### **PART 6: Testing Flow (1 hour)**

#### Step 13: Test Gmail Connection

**Test Checklist:**
- [ ] Can authenticate with Gmail
- [ ] Can list messages from inbox
- [ ] Can read a specific message
- [ ] Can search for messages by sender
- [ ] Can send a test email
- [ ] Can reply to an email thread

#### Step 14: Test with YOUR Gmail

**What you'll do:**
1. Send yourself an email from a test account
2. Use query: `from:test@example.com` (replace with your test email)
3. Backend fetches the email
4. Parse the content
5. Generate AI response
6. Send reply via Gmail API
7. Verify you receive the reply in your test account

---

## 🔑 Critical Information from Docs

### Authentication Scopes (Choose Based on Needs)

| Scope | Access Level | Use Case |
|-------|--------------|----------|
| `https://mail.google.com/` | Full access | Easiest, all operations |
| `https://www.googleapis.com/auth/gmail.modify` | Read, write, send | **Recommended** |
| `https://www.googleapis.com/auth/gmail.readonly` | Read only | Too restrictive |
| `https://www.googleapis.com/auth/gmail.send` | Send only | Not enough |

**Choose:** `gmail.modify` for production, `mail.google.com` for quick testing

### Message Formats

When calling `users.messages.get`:
- `format=full` - Complete message (body, headers, attachments)
- `format=metadata` - Headers only (faster, for listing)
- `format=minimal` - IDs and labels only
- `format=raw` - Original RFC 2822 email

**Use `format=full` to get message content**

### Query Syntax for Searching

```javascript
// Search by sender
q: "from:automated@airbnb.com"

// Search by subject
q: "subject:New message"

// Combine filters
q: "from:@airbnb.com is:unread"

// Date range
q: "after:2025/12/01 from:@booking.com"

// Multiple senders
q: "from:(@airbnb.com OR @booking.com)"
```

### Email Threading

**To reply to an email and maintain thread:**
```javascript
// Include these headers in your reply:
"In-Reply-To": "<original-message-id>",
"References": "<original-message-id>",
"Thread-Id": "gmail-thread-id"
```

**Gmail automatically groups emails into threads based on:**
- Subject line (ignoring Re:, Fwd:, etc.)
- References header
- In-Reply-To header

---

## 📝 IMPLEMENTATION CHECKLIST

### Phase 1: Setup & Auth (Today - 1 hour)
- [ ] Create Google Cloud project
- [ ] Enable Gmail API
- [ ] Download OAuth credentials
- [ ] Create backend folder structure
- [ ] Install dependencies
- [ ] Create .env file
- [ ] Implement OAuth flow
- [ ] Test authentication
- [ ] Save refresh token

### Phase 2: Basic Email Operations (Today - 2 hours)
- [ ] Create Gmail service class
- [ ] Implement `listMessages()` with query
- [ ] Implement `getMessage()` to get full content
- [ ] Implement `sendMessage()` to send emails
- [ ] Test listing your inbox
- [ ] Test reading a message
- [ ] Test sending an email to yourself

### Phase 3: Email Parsing (Tomorrow - 3 hours)
- [ ] Create email parser service
- [ ] Implement Airbnb email parser
- [ ] Implement Booking.com parser
- [ ] Implement Expedia parser
- [ ] Test parsing with real notification emails
- [ ] Extract customer name accurately
- [ ] Extract clean message content

### Phase 4: Database Integration (Tomorrow - 2 hours)
- [ ] Set up SQLite database
- [ ] Create schema
- [ ] Implement contact CRUD
- [ ] Implement conversation CRUD
- [ ] Implement message CRUD
- [ ] Test data persistence

### Phase 5: AI Integration (Day 3 - 2 hours)
- [ ] Set up OpenAI API
- [ ] Create system prompt
- [ ] Implement response generation
- [ ] Test AI responses
- [ ] Tune temperature/parameters

### Phase 6: Connect to Frontend (Day 3 - 3 hours)
- [ ] Create REST API endpoints
- [ ] Implement WebSocket for real-time
- [ ] Update frontend to use real API
- [ ] Test full flow end-to-end

---

## 🚀 IMMEDIATE NEXT STEPS

### What You Need to Do RIGHT NOW:

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** (5 min)
3. **Enable Gmail API** (2 min)
4. **Create OAuth credentials** (5 min)
5. **Download credentials.json** (1 min)
6. **Share your test Gmail address** with me (the one you want to monitor)
7. **Send a test email** from another account to that Gmail (so we have test data)

Once you do this, I'll build the entire authentication system and we'll test it with your real Gmail!

---

## 🛠️ Technical Architecture

### Authentication Flow
```
1. First Time:
   User → OAuth URL → Google Login → Grant Permission → 
   Auth Code → Exchange for Tokens → Save Refresh Token

2. Subsequent Requests:
   Refresh Token → Get Access Token → Make API Call
   (Access tokens expire after 1 hour, auto-refresh)
```

### Email Monitoring Loop
```javascript
setInterval(async () => {
  // 1. Query Gmail for new messages
  const messages = await gmail.users.messages.list({
    userId: 'me',
    q: 'from:(@airbnb.com OR @booking.com OR @expedia.com) is:unread',
    maxResults: 10
  })
  
  // 2. For each new message
  for (const msg of messages.data.messages) {
    // Get full message
    const fullMsg = await gmail.users.messages.get({
      userId: 'me',
      id: msg.id,
      format: 'full'
    })
    
    // 3. Parse email
    const parsed = parseEmail(fullMsg)
    
    // 4. Save to database
    await saveMessage(parsed)
    
    // 5. Generate AI response
    const aiResponse = await generateResponse(parsed.message)
    
    // 6. Send to frontend
    ws.send({ type: 'new_message', data: parsed, aiSuggestion: aiResponse })
    
    // 7. Mark as read
    await gmail.users.messages.modify({
      userId: 'me',
      id: msg.id,
      resource: { removeLabelIds: ['UNREAD'] }
    })
  }
}, 30000) // Poll every 30 seconds
```

### Reply Flow
```javascript
async function sendReply(originalMessageId, replyText) {
  // 1. Get original message to extract headers
  const original = await gmail.users.messages.get({
    userId: 'me',
    id: originalMessageId,
    format: 'metadata'
  })
  
  // 2. Extract thread ID and headers
  const threadId = original.data.threadId
  const originalFrom = getHeader(original, 'From')
  const originalSubject = getHeader(original, 'Subject')
  const originalMessageId = getHeader(original, 'Message-ID')
  
  // 3. Create email reply
  const email = [
    `To: ${originalFrom}`,
    `Subject: Re: ${originalSubject}`,
    `In-Reply-To: ${originalMessageId}`,
    `References: ${originalMessageId}`,
    '',
    replyText
  ].join('\n')
  
  // 4. Encode to base64url
  const encodedEmail = Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  
  // 5. Send via Gmail API
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedEmail,
      threadId: threadId
    }
  })
}
```

---

## 🔐 Security Best Practices

1. **Never commit credentials**: Add `.env` and `credentials.json` to `.gitignore`
2. **Store tokens securely**: Encrypt refresh tokens in database
3. **Use minimal scopes**: Only request permissions you need
4. **Implement rate limiting**: Don't exceed Gmail API quotas
5. **Validate all inputs**: Sanitize email content before displaying
6. **Use HTTPS in production**: Encrypt all communication

---

## 📊 Expected Performance

Based on Gmail API docs:

- **Quota**: 250 units/second per user (1 billion/day)
- **Operations**:
  - `list`: 5 units per call
  - `get`: 5 units per call
  - `send`: 100 units per call
- **Polling frequency**: Every 30-60 seconds (safe)
- **Max emails per poll**: 10-20 (efficient)

**Math**: At 30-second intervals, you can process ~2,880 new emails per day

---

## ⚠️ Important Gotchas

1. **First-time auth requires browser**: Can't be fully automated
2. **Tokens expire**: Implement auto-refresh logic
3. **Email encoding**: Use base64url (not base64)
4. **Thread matching**: Gmail is picky about subject lines
5. **Rate limits**: Implement exponential backoff on errors
6. **Attachment size**: Max 35 MB per attachment

---

## 🎬 WHAT TO DO NOW

### Option A: Manual Setup (You do it)
1. Follow Part 1 above
2. Download credentials.json
3. Give me the file
4. I'll build the backend

### Option B: I'll Guide You (Interactive)
1. Open Google Cloud Console
2. Share your screen/describe what you see
3. I'll tell you exactly what to click
4. We'll do it together

### Option C: Give Me Access Info (Fastest)
Just tell me:
- Your Gmail address you want to use
- I'll give you the exact credentials.json structure
- You fill in the values
- We start building

---

## 🎯 READY TO START?

**Tell me your test Gmail address and I'll create the complete backend code!**

Once I have your Gmail address, I will:
1. ✅ Build the complete authentication system
2. ✅ Create the email monitoring service  
3. ✅ Implement email parsing
4. ✅ Set up the backend server
5. ✅ Connect it to your frontend

**Then you just need to:**
- Get Gmail API credentials (15 min)
- Run one auth command
- Watch it work! 🚀

---

*Based on official [Gmail API documentation](https://developers.google.com/workspace/gmail/api/guides)*

