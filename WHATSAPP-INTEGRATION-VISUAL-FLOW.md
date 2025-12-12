# 📊 WhatsApp Integration - Visual Flow

## 🔄 **How It All Works Together**

```
┌─────────────────────────────────────────────────────────────────┐
│                    WHATSAPP CLOUD API SETUP                      │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────┐
        │  1. Meta Developer Account & Business App │
        └──────────────────────────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────┐
        │  2. Add WhatsApp Product to App          │
        │     - Test Business Account Created      │
        │     - Test Phone Number Assigned         │
        │     - "hello_world" Template Approved    │
        └──────────────────────────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────┐
        │  3. Get Credentials                      │
        │     📋 Phone Number ID                   │
        │     🔑 Access Token                      │
        │     🔐 Verify Token (you create this)    │
        └──────────────────────────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────┐
        │  4. Update backend/.env                  │
        │     WHATSAPP_PHONE_NUMBER_ID=...         │
        │     WHATSAPP_ACCESS_TOKEN=...            │
        │     WHATSAPP_VERIFY_TOKEN=...            │
        └──────────────────────────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────┐
        │  5. Make Backend Publicly Accessible     │
        │     Option A: ngrok http 4000            │
        │     Option B: Deploy to server           │
        │     → Get public URL                     │
        └──────────────────────────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────┐
        │  6. Configure Webhook in Meta            │
        │     Callback URL:                        │
        │     https://your-url/webhook/whatsapp    │
        │     Verify Token: (from .env)            │
        └──────────────────────────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────┐
        │  7. Subscribe to Webhook Fields          │
        │     ✅ messages                          │
        │     ✅ message_status                    │
        └──────────────────────────────────────────┘
                               │
                               ▼
        ┌──────────────────────────────────────────┐
        │  ✅ READY TO TEST!                       │
        └──────────────────────────────────────────┘
```

---

## 📱 **Message Flow - Guest Sends Message**

```
┌────────────┐         ┌─────────────┐         ┌──────────────┐
│   Guest    │         │  WhatsApp   │         │ Your Backend │
│ WhatsApp   │         │  Cloud API  │         │   (Port 4000)│
└─────┬──────┘         └──────┬──────┘         └──────┬───────┘
      │                       │                       │
      │ 1. Send message       │                       │
      │ "Hello"               │                       │
      ├──────────────────────>│                       │
      │                       │                       │
      │                       │ 2. Webhook POST       │
      │                       │ /webhook/whatsapp     │
      │                       ├──────────────────────>│
      │                       │                       │
      │                       │                       │ 3. Parse message
      │                       │                       │    Store in Supabase
      │                       │                       │    Generate AI response
      │                       │                       │
      │                       │ 4. Webhook 200 OK    │
      │                       │<──────────────────────┤
      │                       │                       │
      │                       │                       │ 5. WebSocket broadcast
      │                       │                       │    to Frontend
      │                       │                       │
      │                       │                       ▼
      │                       │              ┌──────────────┐
      │                       │              │   Frontend   │
      │                       │              │   (Next.js)  │
      │                       │              └──────────────┘
      │                       │                     │
      │                       │                     │ 6. Show message
      │                       │                     │    Show AI suggestion
      │                       │                     │
```

---

## 💬 **Message Flow - You Reply**

```
┌────────────┐         ┌─────────────┐         ┌──────────────┐
│   Guest    │         │  WhatsApp   │         │ Your Backend │
│ WhatsApp   │         │  Cloud API  │         │   (Port 4000)│
└─────┬──────┘         └──────┬──────┘         └──────┬───────┘
      │                       │                       │
      │                       │                       │ 1. Admin sends reply
      │                       │                       │    from Frontend
      │                       │                       │
      │                       │ 2. POST /messages     │<─────────────
      │                       │<──────────────────────┤
      │                       │    Authorization:     │
      │                       │    Bearer TOKEN       │
      │                       │                       │
      │ 3. Receive message    │                       │
      │ "Thanks for..."       │                       │
      │<──────────────────────┤                       │
      │                       │                       │
      │                       │ 4. Webhook (delivered)│
      │                       ├──────────────────────>│
      │                       │                       │
      │ 5. Read message       │                       │
      │ ✓✓ (blue checkmarks)  │                       │
      │                       │                       │
      │                       │ 6. Webhook (read)     │
      │                       ├──────────────────────>│
      │                       │                       │
```

---

## 🔐 **Authentication Flow**

```
┌─────────────────────────────────────────────────────────┐
│             META BUSINESS MANAGER                        │
│                                                          │
│  System User (GQ-AI WhatsApp Bot)                       │
│    │                                                     │
│    ├─ Has permissions:                                  │
│    │  ✅ whatsapp_business_messaging                    │
│    │  ✅ whatsapp_business_management                   │
│    │                                                     │
│    └─ Generates Token                                   │
│       │                                                  │
└───────┼──────────────────────────────────────────────────┘
        │
        │ Token (eyJhbGc...)
        ▼
┌─────────────────────────────────────────────────────────┐
│             YOUR BACKEND (.env)                          │
│                                                          │
│  WHATSAPP_ACCESS_TOKEN=eyJhbGc...                       │
│  WHATSAPP_PHONE_NUMBER_ID=123456789                     │
│  WHATSAPP_VERIFY_TOKEN=your-secret-token                │
│                                                          │
└─────────────────────────────────────────────────────────┘
        │
        │ Uses for all API calls
        ▼
┌─────────────────────────────────────────────────────────┐
│          WHATSAPP CLOUD API                              │
│                                                          │
│  graph.facebook.com/v18.0/{PHONE_ID}/messages           │
│    Authorization: Bearer {TOKEN}                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🌐 **Webhook Setup - What Gets Verified**

```
┌─────────────────────────────────────────────────────────┐
│                   META DASHBOARD                         │
│                                                          │
│  Webhook Configuration:                                 │
│  ┌────────────────────────────────────────────┐        │
│  │ Callback URL:                               │        │
│  │ https://abc123.ngrok.io/webhook/whatsapp   │        │
│  │                                             │        │
│  │ Verify Token:                               │        │
│  │ gq-ai-webhook-token-12345                  │        │
│  │                                             │        │
│  │ [Verify and Save] ◄───────┐                │        │
│  └────────────────────────────┼───────────────┘        │
│                                │                         │
└────────────────────────────────┼─────────────────────────┘
                                 │
                                 │ 1. GET request
                                 │ ?hub.mode=subscribe
                                 │ &hub.verify_token=gq-ai-webhook-token-12345
                                 │ &hub.challenge=123456
                                 ▼
┌─────────────────────────────────────────────────────────┐
│              YOUR BACKEND (Running)                      │
│                                                          │
│  GET /webhook/whatsapp                                  │
│  ┌────────────────────────────────────────────┐        │
│  │ 1. Receive verification request             │        │
│  │ 2. Check: mode === 'subscribe'              │        │
│  │ 3. Check: token === WHATSAPP_VERIFY_TOKEN   │        │
│  │ 4. If match: return challenge               │        │
│  │ 5. If no match: return 403                  │        │
│  └────────────────────────────────────────────┘        │
│                                 │                        │
│                                 │ 2. Return challenge    │
└─────────────────────────────────┼─────────────────────────┘
                                  │
                                  ▼
                          ✅ Webhook Verified!
```

---

## 📊 **Current Code Status**

```
YOUR CODEBASE
│
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── whatsapp.service.ts          ✅ READY
│   │   │   │   ├── verifyWebhook()          ✅ Implemented
│   │   │   │   ├── parseWebhookPayload()    ✅ Implemented
│   │   │   │   ├── sendMessage()            ✅ Implemented
│   │   │   │   ├── markAsRead()             ✅ Implemented
│   │   │   │   ├── sendTemplate()           ✅ Implemented
│   │   │   │   └── 22 Template Functions    ✅ Implemented
│   │   │   │
│   │   │   ├── whatsapp-monitor.service.ts  ✅ READY
│   │   │   │   └── processIncomingMessage() ✅ Implemented
│   │   │   │
│   │   │   └── supabase-database.service.ts ✅ READY
│   │   │       └── All CRUD operations      ✅ Implemented
│   │   │
│   │   └── index.ts                          ✅ READY
│   │       ├── GET /webhook/whatsapp        ✅ Webhook verification
│   │       └── POST /webhook/whatsapp       ✅ Incoming messages
│   │
│   └── .env                                  ⏳ NEEDS CREDENTIALS
│       ├── WHATSAPP_PHONE_NUMBER_ID         ⏳ From Meta
│       ├── WHATSAPP_ACCESS_TOKEN            ⏳ From Meta
│       └── WHATSAPP_VERIFY_TOKEN            ⏳ You create this
│
└── frontend/
    └── src/
        └── app/page.tsx                      ✅ READY
            ├── WebSocket connection          ✅ Implemented
            ├── Real-time message display     ✅ Implemented
            └── Send/reply functionality      ✅ Implemented
```

---

## 🎯 **What You Need to Do**

```
┌─────────────────────────────────────────────────────────┐
│                  YOUR ACTION ITEMS                       │
└─────────────────────────────────────────────────────────┘

1. ⏳ Create Meta Developer Account
   └─> https://developers.facebook.com/

2. ⏳ Create Business App
   └─> Add WhatsApp Product

3. ⏳ Get 3 Credentials:
   ├─> Phone Number ID
   ├─> Access Token
   └─> Create Verify Token

4. ⏳ Update backend/.env
   └─> Add the 3 credentials

5. ⏳ Set up ngrok
   └─> Make backend publicly accessible

6. ⏳ Configure Webhook in Meta
   └─> Point to your public URL

7. ⏳ Test!
   └─> Send/receive messages

8. ⏳ Move to Production
   └─> System User Token + Real Phone Number
```

---

## 📞 **Support Resources**

- **Setup Guide**: `WHATSAPP-SETUP-STEP-BY-STEP.md`
- **API Documentation**: https://developers.facebook.com/docs/whatsapp/cloud-api
- **Template Guide**: `WHATSAPP-TEMPLATES-GUIDE.md` (do this AFTER setup)
- **Template Reference**: `WHATSAPP-ALL-TEMPLATES-REFERENCE.md`

---

**Start with the step-by-step guide now!** 🚀

