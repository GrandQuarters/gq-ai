# GrandQuarters AI Communication Platform

## Overview

GrandQuarters is an AI-powered guest communication platform for property management. It aggregates guest messages from multiple booking platforms (Airbnb, Booking.com, Expedia, FeWo-direkt) via Gmail, generates AI-assisted responses using OpenAI, and provides a real-time admin chat interface to manage all conversations in one place.

---

## Tech Stack

### Frontend
- **Next.js 15** (React 19) with App Router
- **TypeScript**
- **Tailwind CSS** for styling
- **Supabase Auth** for login/authentication
- **Lucide React** for icons
- **WebSocket** for real-time message updates

### Backend
- **Node.js + Express** (TypeScript)
- **WebSocket (`ws`)** for real-time push to frontend
- **Supabase (PostgreSQL)** via `@supabase/supabase-js` for database
- **OpenAI API** (`gpt-5-mini-2025-08-07`) for AI response generation and translation
- **Google Gmail API** (`googleapis`) for email polling, reading, and sending replies

### Infrastructure
- **Vercel** hosts the frontend
- **Railway** hosts the backend
- **Supabase** hosts the PostgreSQL database and authentication

---

## Third-Party Services

| Service | Purpose |
|---------|---------|
| **Supabase** | PostgreSQL database, user authentication |
| **OpenAI** | AI response generation, message translation |
| **Google Gmail API** | Read incoming booking platform emails, send replies |
| **Vercel** | Frontend hosting and deployment |
| **Railway** | Backend hosting and deployment |

---

## Architecture

```
Guest sends message on Airbnb/Booking/Expedia/FeWo
        ↓
Platform sends email notification to Gmail
        ↓
Backend polls Gmail every 15 seconds (GmailService)
        ↓
Email is parsed per platform (EmailParserService)
        ↓
Contact + Conversation created/updated (DatabaseService)
Message saved to DB
        ↓
AI generates a suggested reply (OpenAIService)
AI response saved to DB (ai_responses table)
        ↓
WebSocket broadcasts new message + AI suggestion to frontend
        ↓
Admin sees message + AI suggestion in chat UI
Admin can edit, approve, or write custom reply
        ↓
Reply sent via Gmail API back through the platform
Training example saved to DB for AI learning
```

---

## Database Schema (Supabase/PostgreSQL)

### Tables

| Table | Purpose |
|-------|---------|
| `contacts` | Guest info: name, platform, email, phone, avatar |
| `conversations` | Conversation threads per guest: platform, thread IDs, unread count, last message |
| `messages` | All messages in conversations: content, original content (for translations), sender, timestamps |
| `ai_responses` | AI-generated suggestions with status tracking (pending/sent/superseded/discarded) |
| `ai_training_examples` | Past guest→admin exchanges fed into the AI prompt for learning |
| `processed_messages` | Tracks which external messages have been processed to prevent duplicates |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Purpose |
|----------|----------|---------|
| `PORT` | No | Server port (default: 4000) |
| `FRONTEND_URL` | Yes | CORS allowed origin(s), comma-separated |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service role key |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `GMAIL_USER` | Yes | Gmail address used for polling |
| `GOOGLE_CLIENT_ID` | Yes* | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes* | Google OAuth client secret |
| `GOOGLE_REFRESH_TOKEN` | Yes* | Google OAuth refresh token |
| `GOOGLE_REDIRECT_URI` | No | OAuth redirect URI (default: `http://localhost:4000/oauth2callback`) |

*Either env vars or `credentials.json` + `token.json` files.

### Frontend (Vercel)

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_BACKEND_URL` | Yes | Backend API base URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |

---

## Backend Services

### `gmail-auth.service.ts` — Gmail OAuth Authentication

Handles Google OAuth2 authentication for Gmail API access.

- **`getAuthClient()`** — Returns an authenticated OAuth2 client. Checks env vars first (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`), then falls back to `credentials.json` + `token.json` files.
- **`authenticate()`** — Interactive OAuth flow for local development. Opens browser, receives callback, saves token to `token.json`.

### `gmail.service.ts` — Gmail API Operations

Reads and sends emails via the Gmail API.

- **`initialize()`** — Sets up the Gmail API client using the auth service.
- **`getNewMessages()`** — Queries Gmail for unread messages from booking platforms (Airbnb, Booking.com, Expedia, FeWo-direkt).
- **`getMessage(messageId)`** — Fetches a full email message, decodes the body (plain text or HTML→text), detects the booking platform from sender address, and extracts the Reply-To header.
- **`sendReply(to, subject, body, threadId, inReplyTo)`** — Sends an email reply within the same Gmail thread, preserving threading via `In-Reply-To` and `References` headers.
- **`markAsRead(messageId)`** — Removes the UNREAD label from a Gmail message.
- **`getMessageIdHeader(messageId)`** — Retrieves the Message-ID header for threading.

### `email-parser.service.ts` — Platform Email Parsing

Extracts guest names, messages, and booking details from platform-specific email formats.

- **`parseEmail(gmailMessage)`** — Main entry point. Routes to platform-specific extractors based on detected platform. Returns a `ParsedMessage` with customer name, cleaned message, platform, conversation hash, reply email, and property name. Strips `Re:`/`AW:`/`Fwd:` subject lines from all messages.
- **Platform-specific name extractors:** `extractAirbnbName()`, `extractBookingName()`, `extractExpediaName()`, `extractFewoName()` — Each uses platform-specific patterns to find the guest name in the email subject or body.
- **Platform-specific hash extractors:** `extractAirbnbHash()`, `extractBookingHash()`, `extractExpediaHash()`, `extractFewoHash()` — Extract unique conversation identifiers from email headers (Reply-To or From) to group messages into conversations.
- **Message cleaners:** `cleanAirbnbMessage()`, `cleanBookingMessage()`, `cleanExpediaMessage()`, `cleanFewoMessage()` — Strip platform boilerplate (footer text, links, copyright notices) and extract only the guest's actual message. Booking.com messages also extract structured booking details (reservation number, dates, property, guests) into a `[BOOKING_INFO]` JSON block.

### `database.service.ts` — Supabase Database Layer

All database interactions via the Supabase client.

- **Contacts:** `getContacts()`, `createContact()`, `findContactByEmail()`, `findContactByPhone()`, `findContactByNameAndPlatform()`, `updateContactLastMessage()`
- **Conversations:** `getConversations()`, `createConversation()`, `updateConversation()`, `findConversationByThread()`, `findConversationByHash()`, `findConversationByContactAndProperty()`
- **Messages:** `getMessagesByConversation()`, `createMessage()`, `updateMessage()`, `getMessageById()` — Message creation uses upsert with `external_message_id` for deduplication.
- **AI Responses:** `createAiResponse()`, `supersedePendingAiResponses()`, `markAiResponseSent()`, `getPendingAiResponse()`
- **AI Training:** `saveTrainingExample()`, `getTrainingExamples(limit)` — Stores and retrieves past guest→admin exchanges for AI learning.
- **Processed Messages:** `isMessageProcessed()`, `markMessageAsProcessed()` — Prevents duplicate processing of the same external email.

### `message-monitor.service.ts` — Email Polling & Processing

The core message processing loop.

- **`start()`** — Begins polling Gmail every 15 seconds for new messages.
- **`stop()`** — Stops polling.
- **`checkForNewMessages()`** — Fetches unread emails, skips already-processed ones, then for each new message:
  1. Parses the email with `EmailParserService`
  2. Finds or creates the contact in the database
  3. Finds or creates the conversation (matching by thread ID, platform hash, or contact+property)
  4. Translates non-Latin messages to German (if translation succeeds)
  5. Saves the message to the database
  6. Generates an AI response using `OpenAIService`
  7. Saves the AI response to `ai_responses` table
  8. Marks the email as read in Gmail
  9. Broadcasts the new message + AI suggestion via WebSocket
- **`addWebSocketClient(ws)`** — Registers a WebSocket client for real-time updates.
- **`broadcast(data)`** — Sends data to all connected WebSocket clients.

### `openai.service.ts` — AI Response Generation & Translation

Manages all OpenAI API interactions.

- **`generateResponse(context, messages)`** — Builds a comprehensive system prompt with guest context, conversation history, FAQ, and past training examples, then calls `gpt-5-mini-2025-08-07` to generate a response. Max completion tokens: 50,000 (to accommodate the model's internal reasoning).
- **`translateToGerman(text)`** — Translates any text to German using the OpenAI API.
- **`needsTranslation(text)`** — Checks if text contains more than 30% non-Latin characters.

#### System Prompt Structure

The AI system prompt contains 17 sections:

1. Role and goal (Moe, apartment host in Vienna)
2. Communication style (always positive, solution-oriented)
3. Handling emotional guests
4. Offering multiple options
5. Recommendations and closings
6. Complaint handling
7-11. Various scenarios (unknown guest, thank-you messages, closings)
12. Language rules (German or English only, never other languages)
13. Response format structure
14. Platform rules (never mention competing platforms)
15. Training examples from past conversations (loaded from DB)
16. FAQ section with standard answers
17. Summary of core rules

Dynamic placeholders filled at runtime: guest name, phone, email, language, apartment details, booking info, check-in/out dates, current time, office status, chat history (read vs. unread messages), and training examples.

---

## API Endpoints

### Conversations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/conversations` | List all conversations with contact info |
| `POST` | `/api/conversations/:id/read` | Reset unread count to 0 |
| `GET` | `/api/conversations/:id/pending-ai` | Get stored pending AI suggestion |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/conversations/:id/messages` | Get all messages for a conversation |
| `POST` | `/api/messages/send` | Send a reply (via Gmail or WhatsApp) |
| `GET` | `/api/messages/:id/raw` | Get raw email data for debugging |
| `POST` | `/api/messages/:id/retry-translation` | Translate or re-translate a message |

### AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/conversations/:id/generate-ai` | Manually trigger AI response generation |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/action-required` | Get IDs of conversations needing action |
| `GET` | `/health` | Health check |

---

## Frontend Components

### Pages

- **`/` (`page.tsx`)** — Main admin chat interface. Protected by Supabase auth. Loads conversations from backend, handles real-time WebSocket updates, manages AI suggestions, message sending, and conversation selection.
- **`/login` (`login/page.tsx`)** — Login page with email/password authentication via Supabase Auth.

### Chat Components

| Component | Purpose |
|-----------|---------|
| `ChatSidebar` | Left sidebar listing all conversations with search, unread badges, platform avatars, and pinning |
| `ChatHeader` | Top bar showing guest name, online status, KI Antwort button, info button, and logout |
| `MessageBubble` | Individual message display with translation toggle/retry, booking info cards, timestamps |
| `MessageInput` | Text input with AI suggestion overlay, emoji support, and send button |
| `MessageContextMenu` | Right-click context menu for messages |
| `ApartmentDetails` | Dropdown panel showing apartment information |
| `ToastNotification` | Pop-up notifications for new messages |
| `ImageViewer` | Full-screen image viewer for attachments |

### Key Frontend Features

- **AI Suggestion Display:** When a new message arrives or when opening a conversation with a pending AI response, the suggested reply appears in the message input area. The admin can use it as-is, edit it, or write a custom reply.
- **Translation:** Every guest message shows a translate icon. Clicking it translates the message to German via the backend API. Already-translated messages show a toggle (original/translated) and a re-translate button.
- **Real-time Updates:** WebSocket connection receives new messages and AI suggestions instantly.
- **Training Data Collection:** Every reply the admin sends is captured as a training example (guest messages + admin reply) and stored in the database. These examples are fed into the AI system prompt to improve future responses.

---

## AI Learning System

Every time an admin sends a reply:

1. The system identifies the guest messages being responded to (all unanswered guest messages since the last admin reply).
2. These guest messages + the admin's reply are saved as a training example in `ai_training_examples`.
3. When the AI generates its next response, it loads the last 50 training examples and includes them in the system prompt under "Vergangene Konversationen (Lernbeispiele)".
4. The AI uses these real examples to match tone, style, and problem-solving approach.

The more replies sent, the better the AI adapts to the team's communication style.

---

## Message Flow (Detailed)

### Incoming Message

1. `MessageMonitorService` polls Gmail every 15 seconds
2. New unread emails from booking platforms are fetched
3. Each email is checked against `processed_messages` to avoid duplicates
4. `EmailParserService.parseEmail()` extracts guest name, message content, platform hash, and booking details
5. Contact is found or created in the database
6. Conversation is found (by thread ID, platform hash, or contact+property) or created
7. If the message contains non-Latin characters and translation succeeds, the translated text becomes `content` and the original becomes `original_content`
8. Message is saved to `messages` table
9. `OpenAIService.generateResponse()` creates an AI suggestion using the full conversation history and training examples
10. AI suggestion is saved to `ai_responses` table with status `pending`
11. Email is marked as read in Gmail
12. Message ID is added to `processed_messages`
13. WebSocket broadcasts the new message + AI suggestion to all connected clients

### Outgoing Reply

1. Admin types or accepts AI suggestion in the frontend
2. `POST /api/messages/send` is called
3. Backend determines the platform and sends via Gmail (as a threaded reply)
4. Reply is saved to `messages` table as `is_own: true`
5. Pending AI responses for this conversation are superseded
6. A training example is saved (guest messages + admin reply)
7. Conversation `last_message` and `action_required` are updated
