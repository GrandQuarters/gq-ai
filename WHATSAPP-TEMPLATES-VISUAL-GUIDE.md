# 📱 WhatsApp Templates - Visual Summary

## 🎯 What You Need to Do

```
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: CREATE META BUSINESS ACCOUNT                           │
│  ↓                                                               │
│  Go to: business.facebook.com                                   │
│  Set up: WhatsApp Business Platform                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: SUBMIT TEMPLATES FOR APPROVAL                          │
│  ↓                                                               │
│  Templates: checkin_info, checkout_reminder, etc.               │
│  Use: WHATSAPP-TEMPLATES-COPY-PASTE.txt (ready to paste!)      │
│  Wait: ~24 hours for approval                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: CODE IS READY!                                         │
│  ↓                                                               │
│  Backend: whatsapp.service.ts already has all functions         │
│  Just call: sendCheckInInfo(), sendCheckOutReminder(), etc.     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 How Templates Work

### **Scenario 1: Guest Messages You (Free!)**
```
Guest sends WhatsApp → Backend receives webhook → AI generates response
                                                 ↓
                              Backend sends via sendMessage() [FREE]
                                                 ↓
                                        Guest receives instantly
```
✅ **Cost**: FREE (within 24-hour window)  
✅ **Type**: Free-form text (any message)

---

### **Scenario 2: You Send Info After 24h (Paid)**
```
Booking confirmed → Need to send check-in info (2 days later)
                                ↓
                    Call: sendCheckInInfo(phone, details...)
                                ↓
            Backend uses TEMPLATE: "checkin_info"
                                ↓
                WhatsApp sends template message
                                ↓
                    Guest receives structured info
```
✅ **Cost**: ~€0.05 per message  
⚠️ **Requirement**: Template must be pre-approved by Meta

---

## 📋 Templates vs Free Messages

| Feature | Free Messages | Template Messages |
|---------|---------------|-------------------|
| **When** | Within 24h of guest message | Anytime |
| **Cost** | FREE ✅ | ~€0.05 per message |
| **Content** | Any text | Pre-approved format |
| **Use Case** | Replies, conversations | Check-in, reminders, follow-ups |
| **Code** | `sendMessage()` | `sendTemplate()` or `sendCheckInInfo()` |
| **Approval** | Not needed | Required (24h wait) |

---

## 💻 Code Examples

### **Example 1: Reply to Guest (FREE)**
```typescript
// Guest asks: "What's the WiFi password?"
// You reply within 24 hours:

await whatsappService.sendMessage(
  '+491751234567',
  'Das WiFi-Passwort ist: GrandQuarters2025!'
);
```
✅ FREE - No template needed!

---

### **Example 2: Send Check-In Info (PAID)**
```typescript
// Guest booked 5 days ago, sending check-in info now:

await whatsappService.sendCheckInInfo(
  '+491751234567',           // Phone
  'Max Mustermann',          // Guest name
  'Apartment Zentrum',       // Property
  '15.12.2025',              // Date
  '15:00',                   // Time
  'Hauptstraße 123, Wien',   // Address
  '1234#'                    // Door code
);
```
💰 ~€0.05 - Uses "checkin_info" template

---

### **Example 3: Send Check-Out Reminder (PAID)**
```typescript
// Automatically send day before check-out:

await whatsappService.sendCheckOutReminder(
  '+491751234567',
  'Max Mustermann',
  'Apartment Zentrum',
  '20.12.2025',
  '11:00'
);
```
💰 ~€0.05 - Uses "checkout_reminder" template

---

## 🎨 Template Structure

### **What Guest Sees:**
```
┌─────────────────────────────────────┐
│ GrandQuarters                       │
│ ───────────────────────────────────│
│ Hallo Max Mustermann,               │
│                                     │
│ Willkommen bei Apartment Zentrum! 🏠│
│                                     │
│ Ihre Check-in Details:              │
│ 📅 Datum: 15.12.2025               │
│ 🕐 Zeit: 15:00                     │
│ 📍 Adresse: Hauptstraße 123        │
│ 🔑 Zugangscode: 1234#              │
│                                     │
│ Bei Fragen stehen wir Ihnen gerne  │
│ zur Verfügung.                      │
│                                     │
│ Viele Grüße,                        │
│ GrandQuarters Team                  │
└─────────────────────────────────────┘
```

### **What You Send in Code:**
```typescript
sendCheckInInfo(
  phone,
  'Max Mustermann',      // → {{1}}
  'Apartment Zentrum',   // → {{2}}
  '15.12.2025',         // → {{3}}
  '15:00',              // → {{4}}
  'Hauptstraße 123',    // → {{5}}
  '1234#'               // → {{6}}
)
```

---

## 📝 Templates You Need to Submit

### ✅ **Essential (Must Have)**
1. **checkin_info** - Send check-in details
2. **checkout_reminder** - Remind guests about check-out
3. **booking_confirmation** - Confirm bookings

### 🔄 **Optional (Nice to Have)**
4. **followup_message** - Post-stay follow-up
5. **payment_reminder** - Payment reminders
6. **house_rules** - House rules reminder

---

## 🚀 Quick Start Workflow

### **Today (15 minutes)**
1. ✅ Code is already done (in `whatsapp.service.ts`)
2. 📄 Copy templates from `WHATSAPP-TEMPLATES-COPY-PASTE.txt`
3. 🌐 Go to [business.facebook.com](https://business.facebook.com)
4. ➕ Create WhatsApp Business account
5. 📨 Submit 3 essential templates (checkin, checkout, confirmation)

### **Tomorrow (after approval)**
6. ✅ Check email for approval
7. 🧪 Test templates with your phone number
8. 🎉 Go live!

---

## 💡 Smart Strategy to Save Money

```
┌────────────────────────────────────────────────────────────┐
│  STRATEGY: Respond within 24h to keep conversation FREE    │
└────────────────────────────────────────────────────────────┘

Guest messages → Reply within 24h → FREE conversation window
                       ↓
        Continue replying → Window resets with each guest message
                       ↓
              Stay in FREE window as long as possible!
                       ↓
        Only use TEMPLATES when absolutely necessary
```

**Example Cost Breakdown:**
- Guest messages 5 times → You reply 5 times = **FREE** ✅
- You send check-in info after 48h = **€0.05** 💰
- You send check-out reminder = **€0.05** 💰
- **Total per guest**: ~€0.10 (much cheaper than SMS or calls!)

---

## ⚙️ Integration with GQ-AI

### **Current System:**
```
Gmail → fetch messages → parse → AI response → reply via Gmail
```

### **With WhatsApp:**
```
WhatsApp → webhook → parse → AI response → reply via WhatsApp (FREE within 24h)
                              ↓
                    Check-in time? → Send template (€0.05)
                              ↓
                    Check-out time? → Send template (€0.05)
```

### **Backend Handles Everything:**
- ✅ Receives WhatsApp webhooks
- ✅ Stores messages in database
- ✅ Generates AI responses
- ✅ Sends replies (free or template)
- ✅ Updates frontend in real-time

---

## 📞 Need Help?

- 📖 **Full Guide**: See `WHATSAPP-TEMPLATES-GUIDE.md`
- 📋 **Copy-Paste Ready**: See `WHATSAPP-TEMPLATES-COPY-PASTE.txt`
- 🔧 **Code**: See `backend/src/services/whatsapp.service.ts`
- 🌐 **Meta Docs**: [developers.facebook.com/docs/whatsapp](https://developers.facebook.com/docs/whatsapp)

---

**Ready to submit your templates?** Open `WHATSAPP-TEMPLATES-COPY-PASTE.txt` and go to [business.facebook.com](https://business.facebook.com)! 🚀

