# GQ-AI Backend Architecture Plan

## 🎯 Core Concept

**Genius Idea**: Use Gmail as the central messaging hub to communicate with ALL booking platforms (Airbnb, Booking.com, Expedia, FeWo-direkt, etc.) without needing their APIs or risking automation flags.

### Why This Works
- ✅ All platforms send email notifications for new messages
- ✅ All platforms accept email replies and post them back to their chat systems
- ✅ No platform APIs needed - just Gmail API
- ✅ No risk of automation detection on platforms
- ✅ Completely platform-agnostic system

---

## 🏗️ Architecture Overview

### Separation of Concerns
- **Frontend**: Next.js app (current codebase) - Can be hosted anywhere
- **Backend**: Separate React TS server - Independent deployment
- **Communication**: REST API or WebSocket between frontend & backend
- **Data Source**: Gmail API as single source of truth

---

## 📨 Email Processing Flow

### 1. **Incoming Message Detection**
```
Platform (Airbnb/Booking/Expedia) 
  → Sends notification email
  → Gmail inbox
  → Backend polls Gmail API
  → Detects new email from monitored domains
```

**Monitored Email Domains:**
- `@airbnb.com`
- `@booking.com`
- `@expedia.com`
- `@fewodirekt.de`
- Add more as needed

### 2. **Email Parsing & Extraction**

**For Each New Email:**
1. **Identify Platform**: Check sender domain (e.g., `noreply@airbnb.com`)
2. **Extract Customer Name**: Parse email content for guest name
3. **Extract Message Content**: 
   - Strip out platform boilerplate/headers/footers
   - Get only the actual message text from the guest
   - Handle multi-line messages
4. **Extract Metadata**:
   - Booking reference/confirmation number (if available)
   - Timestamp (email received time)
   - Reply-to email address (for sending responses)

**Platform-Specific Parsing:**
- Each platform has different email templates
- Create parsers for each platform's email format
- Use regex/string parsing to extract clean message content

### 3. **Contact Matching & Creation**

**Logic:**
```javascript
if (contactExists(customerName, platform)) {
  // Add message to existing conversation
  appendMessageToConversation(conversationId, message)
} else {
  // Create new contact & conversation
  createNewContact({
    name: customerName,
    platform: platform, // airbnb, booking, expedia
    avatar: platformLogo,
    conversationId: generateId(),
    emailThread: emailId
  })
}
```

**Sorting Messages:**
- If multiple emails from same customer
- Sort by `receivedTime` (email timestamp)
- Display in chronological order in chat

### 4. **AI Response Generation**

**GPT API Integration:**
```
Input:
  - Customer message
  - Conversation history
  - System prompt (Grand Quarters host context)
  
Processing:
  - GPT-4 analyzes message
  - Generates appropriate response
  - Context: Vienna apartment host, professional, helpful
  
Output:
  - AI-generated response text
  - Displayed in yellow preview container above input
```

**System Prompt Context:**
- Grand Quarters is a luxury serviced apartment provider in Vienna
- Professional but warm tone
- Common topics: check-in, parking, WiFi, amenities, directions
- Include apartment-specific info (address, codes, instructions)

### 5. **Response Sending Flow**

```
Admin clicks arrow (accept AI suggestion) or types own message
  → Message fills input field
  → Admin sends message
  → Backend receives message via API
  → Gmail API: Reply to original email thread
  → Platform receives email reply
  → Platform automatically posts message to their chat
  → Customer sees response in Airbnb/Booking/Expedia app
```

**Email Reply Requirements:**
- Must reply to correct email thread (preserve thread ID)
- Maintain proper email headers for threading
- Use platform's reply-to address
- Keep it simple text (no HTML unless needed)

---

## 🔄 Real-Time Synchronization

### Frontend ↔ Backend Communication

**Option 1: WebSocket (Recommended)**
- Real-time bidirectional communication
- Instant message updates
- No polling needed

**Option 2: REST API + Polling**
- Frontend polls backend every 5-10 seconds
- Simpler to implement
- Slight delay in updates

### Message States
- `pending`: Message sent to Gmail API, awaiting confirmation
- `sent`: Confirmed sent via Gmail
- `delivered`: Email delivered (if tracking available)
- `read`: Customer read the message (platform-dependent)

---

## 🗄️ Database Schema

### Collections/Tables Needed

**1. Contacts**
```typescript
{
  id: string
  name: string
  platform: 'airbnb' | 'booking' | 'expedia' | 'fewo'
  email: string // platform's notification email
  avatar: string // platform logo
  createdAt: Date
  lastMessageAt: Date
}
```

**2. Conversations**
```typescript
{
  id: string
  contactId: string
  platform: string
  emailThreadId: string // Gmail thread ID
  lastMessage: string
  unreadCount: number
  isPinned: boolean
  actionRequired: boolean
  createdAt: Date
  updatedAt: Date
}
```

**3. Messages**
```typescript
{
  id: string
  conversationId: string
  content: string
  senderId: string // 'admin' or contactId
  senderName: string
  senderAvatar: string
  timestamp: Date
  isOwn: boolean // false = from customer
  gmailMessageId: string
  attachments: Attachment[]
  metadata: {
    platform: string
    emailSubject: string
    rawEmailId: string
  }
}
```

**4. Attachments**
```typescript
{
  id: string
  messageId: string
  type: 'image' | 'pdf'
  url: string
  name: string
  size: number
}
```

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js or Fastify
- **Database**: PostgreSQL or MongoDB
- **Gmail API**: `@googleapis/gmail` npm package
- **AI**: OpenAI GPT-4 API
- **Email Parsing**: `mailparser` npm package
- **Authentication**: OAuth 2.0 for Gmail

### Frontend (Already Built)
- Next.js 14+
- React 18+
- TypeScript
- Tailwind CSS

---

## 🔐 Security & Authentication

### Gmail API Setup
1. Create Google Cloud Project
2. Enable Gmail API
3. Set up OAuth 2.0 credentials
4. Implement OAuth flow for authorization
5. Store refresh tokens securely
6. Handle token refresh automatically

### API Security
- JWT tokens for frontend ↔ backend auth
- Environment variables for secrets
- Rate limiting
- CORS configuration
- Secure WebSocket connections (WSS)

---

## 📋 Implementation Phases

### Phase 1: Gmail Integration (Foundation)
- [ ] Set up Google Cloud project
- [ ] Implement Gmail API authentication
- [ ] Create email monitoring service (poll for new emails)
- [ ] Test receiving emails from platforms

### Phase 2: Email Parsing
- [ ] Build parsers for each platform:
  - [ ] Airbnb email parser
  - [ ] Booking.com email parser
  - [ ] Expedia email parser
  - [ ] FeWo-direkt email parser
- [ ] Extract customer name from emails
- [ ] Extract clean message content
- [ ] Handle edge cases (forwarded emails, etc.)

### Phase 3: Database & Storage
- [ ] Set up database (PostgreSQL/MongoDB)
- [ ] Create schema/models
- [ ] Implement CRUD operations
- [ ] Message history storage
- [ ] Contact management

### Phase 4: Contact & Conversation Management
- [ ] Match incoming emails to existing contacts
- [ ] Create new contacts when needed
- [ ] Thread message grouping
- [ ] Conversation sorting (pinned, unread, timestamps)

### Phase 5: AI Integration
- [ ] Integrate OpenAI GPT-4 API
- [ ] Create comprehensive system prompt
- [ ] Context building (conversation history)
- [ ] Response generation
- [ ] Temperature/parameter tuning

### Phase 6: Response Sending
- [ ] Implement email reply via Gmail API
- [ ] Maintain email threading
- [ ] Handle reply-to addresses
- [ ] Confirm successful sending

### Phase 7: Frontend Integration
- [ ] Build REST API endpoints
- [ ] Real-time updates (WebSocket or polling)
- [ ] Connect frontend to backend
- [ ] Replace mock data with live data

### Phase 8: Action Required System
- [ ] Detect urgent keywords (broken, defekt, problem, emergency)
- [ ] Flag conversations for action
- [ ] Red alert UI triggers
- [ ] Auto-clear on response

### Phase 9: Testing & Refinement
- [ ] End-to-end testing with real emails
- [ ] Test with each platform
- [ ] Error handling & edge cases
- [ ] Performance optimization

---

## 🚀 Deployment Strategy

### Backend Deployment Options
- **VPS**: DigitalOcean, Linode, AWS EC2
- **Serverless**: AWS Lambda, Google Cloud Functions
- **Container**: Docker on any cloud provider

### Frontend Deployment
- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- Can be separate from backend

### Environment Variables Needed
```bash
# Gmail API
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GMAIL_ADDRESS=your-monitoring-email@gmail.com

# OpenAI
OPENAI_API_KEY=

# Database
DATABASE_URL=

# Backend API
BACKEND_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  BOOKING PLATFORMS (Airbnb, Booking.com, Expedia, etc.)    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Email Notification
                     ▼
          ┌──────────────────────┐
          │   Gmail Inbox        │
          │  (Central Hub)       │
          └──────────┬───────────┘
                     │
                     │ Gmail API (Poll)
                     ▼
          ┌──────────────────────┐
          │   Backend Server     │
          │  ┌────────────────┐  │
          │  │ Email Parser   │  │
          │  │ Contact Match  │  │
          │  │ GPT-4 AI       │  │
          │  │ Database       │  │
          │  └────────────────┘  │
          └──────────┬───────────┘
                     │
                     │ REST/WebSocket API
                     ▼
          ┌──────────────────────┐
          │  Frontend (Next.js)  │
          │  ┌────────────────┐  │
          │  │ Chat UI        │  │
          │  │ Contact List   │  │
          │  │ AI Suggestions │  │
          │  └────────────────┘  │
          └──────────────────────┘
                     │
                     │ Admin Sends Reply
                     ▼
          ┌──────────────────────┐
          │   Backend Server     │
          │  Gmail API (Reply)   │
          └──────────┬───────────┘
                     │
                     │ Email Reply
                     ▼
          ┌──────────────────────┐
          │   Gmail Outbox       │
          └──────────┬───────────┘
                     │
                     │ Email Delivery
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  BOOKING PLATFORMS - Post to In-App Chat Automatically      │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 Key Advantages

1. **No Platform APIs Needed**: Gmail is the only API integration required
2. **No Automation Detection**: Platforms see normal email replies
3. **Platform Agnostic**: Works with ANY platform that uses email notifications
4. **Scalable**: Add new platforms by just adding their email domain
5. **Reliable**: Gmail API is stable and well-documented
6. **Centralized**: All messages in one place regardless of platform
7. **AI-Powered**: GPT-4 generates contextual responses
8. **Cost-Effective**: No per-platform API fees

---

## ⚠️ Challenges & Solutions

### Challenge 1: Email Parsing Complexity
**Solution**: Build robust parsers for each platform, use regex + string matching

### Challenge 2: Duplicate Detection
**Solution**: Track Gmail message IDs to prevent duplicate messages

### Challenge 3: Email Delays
**Solution**: Poll Gmail frequently (every 30-60 seconds), use webhooks if available

### Challenge 4: Attachment Handling
**Solution**: Gmail API can fetch attachments, store them, display in chat

### Challenge 5: Thread Management
**Solution**: Use Gmail thread IDs to keep conversations organized

---

## 🎯 Success Metrics

- [ ] All platform emails successfully parsed
- [ ] <5 second delay from email → chat display
- [ ] 100% message accuracy (no lost messages)
- [ ] AI responses >80% acceptance rate
- [ ] Zero automation flags from platforms

---

## 🔮 Future Enhancements

1. **Multi-Language AI**: Detect customer language, respond accordingly
2. **Smart Categorization**: Auto-categorize messages (booking inquiry, issue, review)
3. **Response Templates**: Quick replies for common questions
4. **Analytics Dashboard**: Response times, customer satisfaction, booking trends
5. **Mobile App**: Native iOS/Android apps using same backend
6. **Team Collaboration**: Multiple admin users
7. **Automated Responses**: Auto-reply to simple questions (check-in time, WiFi password)
8. **Booking Integration**: Link messages to specific bookings/apartments

---

## 📝 Next Steps - Where to Start

### Recommended Starting Order:

1. **Gmail API Setup** (1-2 hours)
   - Create Google Cloud project
   - Enable Gmail API
   - Get OAuth credentials
   - Test basic email fetching

2. **Backend Scaffold** (2-3 hours)
   - Set up Node.js/Express server
   - Environment configuration
   - Database setup (start with SQLite for dev)
   - Basic API structure

3. **Email Monitoring Service** (3-4 hours)
   - Poll Gmail for new emails
   - Filter by sender domains
   - Store raw emails initially

4. **Email Parser for ONE Platform** (4-6 hours)
   - Start with Airbnb (most common)
   - Parse email structure
   - Extract name + message
   - Test with real Airbnb notification emails

5. **Database Integration** (2-3 hours)
   - Save contacts
   - Save conversations
   - Save messages
   - Query functionality

6. **Basic AI Integration** (2-3 hours)
   - OpenAI API setup
   - Simple system prompt
   - Generate one response
   - Test output quality

7. **Email Reply Functionality** (3-4 hours)
   - Gmail API send email
   - Maintain thread
   - Test round-trip (send → receive on platform)

8. **Frontend Connection** (3-4 hours)
   - REST API endpoints
   - Replace mock data
   - Real-time updates
   - Test full flow

9. **Additional Platforms** (2-3 hours each)
   - Add Booking.com parser
   - Add Expedia parser
   - Add FeWo-direkt parser

10. **Polish & Production** (5-10 hours)
    - Error handling
    - Logging
    - Monitoring
    - Deployment scripts

**Total Estimated Time**: 30-45 hours for MVP

---

## 🎬 Quick Start Command Sequence

```bash
# 1. Create backend folder
mkdir backend
cd backend

# 2. Initialize Node.js project
npm init -y

# 3. Install dependencies
npm install express dotenv @googleapis/gmail openai pg
npm install -D typescript @types/node @types/express ts-node nodemon

# 4. Create basic structure
mkdir src
mkdir src/services
mkdir src/controllers
mkdir src/models
mkdir src/utils

# 5. Set up TypeScript
npx tsc --init

# 6. Create .env file with credentials

# 7. Start building!
```

---

## 📧 Example Email Parsing

### Airbnb Email Example
```
From: noreply@airbnb.com
Subject: New message from Max Mustermann

----------------------------------------
Max Mustermann sent you a message:

"Hi! I just booked your apartment for next weekend. 
What time is check-in?"

View full conversation on Airbnb
----------------------------------------
```

**Parsed Output:**
```json
{
  "platform": "airbnb",
  "customerName": "Max Mustermann",
  "message": "Hi! I just booked your apartment for next weekend. What time is check-in?",
  "timestamp": "2025-11-27T14:30:00Z",
  "emailThreadId": "abc123xyz",
  "replyTo": "noreply@airbnb.com"
}
```

---

## 🧠 AI System Prompt Template

```
You are an AI assistant for Grand Quarters, a luxury serviced apartment provider in Vienna, Austria.

CONTEXT:
- You manage multiple apartments in central Vienna
- Primary location: Radetzkystraße 14, 1030 Wien
- You provide professional, warm, helpful service
- Guests book through Airbnb, Booking.com, Expedia, etc.

YOUR ROLE:
- Answer guest questions accurately
- Provide helpful information about Vienna
- Give clear instructions (check-in, parking, amenities)
- Maintain professional yet friendly tone
- Be concise but thorough

COMMON TOPICS:
- Check-in/Check-out times (flexible 3PM-9PM)
- Parking (€22/day, nearby)
- WiFi (included, password in welcome booklet)
- Public transport (U-Bahn 2 min walk)
- Luggage storage (available at office)
- Local recommendations (restaurants, cafes, sights)

APARTMENT DETAILS:
- Fully equipped kitchen
- Washer/dryer available
- Fresh linens/towels provided
- Central heating
- High-speed WiFi

RESPONSE STYLE:
- Warm and welcoming
- Clear and informative
- Anticipate follow-up questions
- Offer additional help
- Use appropriate language (match guest's language)

Generate appropriate responses to guest messages.
```

---

**END OF PLAN**

---

*This document outlines the complete architecture for the GQ-AI Gmail-based messaging system.*

