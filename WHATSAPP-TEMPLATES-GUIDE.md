# WhatsApp Message Templates Setup Guide

## Overview
WhatsApp requires **pre-approved templates** for sending messages outside the 24-hour messaging window. This guide explains how to create and submit templates for your GQ-AI system.

---

## 📋 Why Templates Are Needed

- **24-Hour Window**: You can send free-form messages ONLY within 24 hours after a guest messages you
- **Outside 24 Hours**: You MUST use pre-approved templates (costs ~€0.05 per message)
- **Use Cases**: Check-in info, check-out reminders, follow-ups, booking confirmations

---

## 🎯 Required Templates for GQ-AI

### **1. Check-In Information Template**
**Template Name**: `checkin_info`  
**Category**: UTILITY  
**Language**: German (de)

**Template Content**:
```
Hallo {{1}},

Willkommen bei {{2}}! 🏠

Ihre Check-in Details:
📅 Datum: {{3}}
🕐 Zeit: {{4}}
📍 Adresse: {{5}}
🔑 Zugangscode: {{6}}

Bei Fragen stehen wir Ihnen gerne zur Verfügung.

Viele Grüße,
GrandQuarters Team
```

**Variables**:
1. `{{1}}` - Guest name (e.g., "Max Mustermann")
2. `{{2}}` - Property name (e.g., "Apartment Zentrum")
3. `{{3}}` - Check-in date (e.g., "15.12.2025")
4. `{{4}}` - Check-in time (e.g., "15:00")
5. `{{5}}` - Full address
6. `{{6}}` - Door/access code

---

### **2. Check-Out Reminder Template**
**Template Name**: `checkout_reminder`  
**Category**: UTILITY  
**Language**: German (de)

**Template Content**:
```
Hallo {{1}},

Wir hoffen, Sie hatten einen angenehmen Aufenthalt bei {{2}}! 😊

Ihre Check-out Details:
📅 Datum: {{3}}
🕐 Zeit: {{4}}

Bitte:
✅ Schlüssel im Apartment lassen
✅ Alle Fenster schließen
✅ Müll entsorgen

Vielen Dank und gute Reise!
GrandQuarters Team
```

**Variables**:
1. `{{1}}` - Guest name
2. `{{2}}` - Property name
3. `{{3}}` - Check-out date
4. `{{4}}` - Check-out time

---

### **3. Booking Confirmation Template**
**Template Name**: `booking_confirmation`  
**Category**: UTILITY  
**Language**: German (de)

**Template Content**:
```
Hallo {{1}},

Ihre Buchung ist bestätigt! ✅

🏠 Unterkunft: {{2}}
📅 Check-in: {{3}}
📅 Check-out: {{4}}
🔖 Buchungsnummer: {{5}}

Weitere Details erhalten Sie per E-Mail.

Wir freuen uns auf Ihren Besuch!
GrandQuarters Team
```

**Variables**:
1. `{{1}}` - Guest name
2. `{{2}}` - Property name
3. `{{3}}` - Check-in date
4. `{{4}}` - Check-out date
5. `{{5}}` - Booking reference number

---

### **4. Follow-Up Message Template**
**Template Name**: `followup_message`  
**Category**: UTILITY  
**Language**: German (de)

**Template Content**:
```
Hallo {{1}},

Wir hoffen, Sie hatten einen wunderbaren Aufenthalt bei {{2}}! 🌟

{{3}}

Bei Fragen oder Anliegen melden Sie sich gerne bei uns.

Beste Grüße,
GrandQuarters Team
```

**Variables**:
1. `{{1}}` - Guest name
2. `{{2}}` - Property name
3. `{{3}}` - Custom message (e.g., "Vielen Dank für Ihre Bewertung!")

---

## 🚀 How to Submit Templates

### **Step 1: Access Meta Business Manager**
1. Go to [business.facebook.com](https://business.facebook.com)
2. Select your Business Account
3. Go to **WhatsApp Manager** → **Message Templates**

### **Step 2: Create a New Template**
1. Click **"Create Template"**
2. Choose **Category**: "UTILITY" (for transactional messages)
3. Enter **Template Name** (e.g., `checkin_info`)
4. Select **Language**: German (de)

### **Step 3: Add Template Content**
1. **Header** (optional): Add greeting or title
2. **Body**: Paste the template content from above
3. **Footer** (optional): Add company info
4. **Buttons** (optional): Add action buttons

### **Step 4: Add Variables**
- Use `{{1}}`, `{{2}}`, `{{3}}`, etc. for dynamic content
- Add **Sample Values** for Meta's review (e.g., "Max Mustermann", "Apartment Zentrum")

### **Step 5: Submit for Review**
- Templates are usually reviewed within 24 hours
- You'll receive an email when approved/rejected
- **Important**: Templates must comply with WhatsApp's [Business Policy](https://www.whatsapp.com/legal/business-policy)

---

## 💻 How to Use Templates in Code

Once your templates are approved, you can use them in the backend:

### **Example 1: Send Check-In Info**
```typescript
await whatsappService.sendCheckInInfo(
  '+491751234567',           // Guest phone number
  'Max Mustermann',          // Guest name
  'Apartment Zentrum',       // Property name
  '15.12.2025',              // Check-in date
  '15:00',                   // Check-in time
  'Hauptstraße 123, Wien',   // Address
  '1234#'                    // Door code
);
```

### **Example 2: Send Check-Out Reminder**
```typescript
await whatsappService.sendCheckOutReminder(
  '+491751234567',
  'Max Mustermann',
  'Apartment Zentrum',
  '20.12.2025',
  '11:00'
);
```

### **Example 3: Send Custom Template**
```typescript
await whatsappService.sendTemplate(
  '+491751234567',
  'checkin_info',            // Template name
  'de',                      // Language code
  [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: 'Max Mustermann' },
        { type: 'text', text: 'Apartment Zentrum' },
        { type: 'text', text: '15.12.2025' },
        { type: 'text', text: '15:00' },
        { type: 'text', text: 'Hauptstraße 123' },
        { type: 'text', text: '1234#' },
      ],
    },
  ]
);
```

---

## 📊 Template Status Tracking

### **Template States**:
- **PENDING**: Under review by Meta
- **APPROVED**: Ready to use
- **REJECTED**: Needs modifications (check rejection reason)
- **DISABLED**: Violates policy or too many failures

### **Check Template Status**:
You can check template status in Meta Business Manager or via API:
```bash
curl -X GET "https://graph.facebook.com/v18.0/YOUR_WABA_ID/message_templates" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## ⚠️ Important Guidelines

### **WhatsApp Template Policy**:
1. ✅ **DO**: Use for transactional info (bookings, confirmations, reminders)
2. ❌ **DON'T**: Use for marketing without opt-in
3. ✅ **DO**: Personalize with guest names and booking details
4. ❌ **DON'T**: Send spam or unsolicited messages

### **Best Practices**:
- Keep templates concise (max 1024 characters)
- Use emojis sparingly (for readability)
- Always provide opt-out mechanism
- Test templates before sending to guests

### **Cost Optimization**:
- **Free**: Messages within 24-hour window (use `sendMessage()`)
- **Paid (~€0.05)**: Templates outside 24-hour window (use `sendTemplate()`)
- Strategy: Respond quickly to guest messages to stay within free window

---

## 🧪 Testing Templates

### **Test in Meta Business Manager**:
1. Go to your template
2. Click **"Send Test Message"**
3. Enter your test phone number
4. Fill in sample values

### **Test in Development**:
```typescript
// Test with your own phone number first
await whatsappService.sendCheckInInfo(
  '+YOUR_PHONE_NUMBER',
  'Test Guest',
  'Test Apartment',
  '31.12.2025',
  '15:00',
  'Test Address 123',
  'TEST123'
);
```

---

## 📞 Next Steps

1. **Create Business Account**: [business.facebook.com](https://business.facebook.com)
2. **Set Up WhatsApp Business**: Follow Meta's setup wizard
3. **Submit Templates**: Use the examples above
4. **Wait for Approval**: Usually 24 hours
5. **Test**: Send test messages to your phone
6. **Go Live**: Start sending to guests!

---

## 🆘 Support

- **Meta Business Support**: [business.facebook.com/help](https://business.facebook.com/help)
- **WhatsApp Business API Docs**: [developers.facebook.com/docs/whatsapp](https://developers.facebook.com/docs/whatsapp)
- **Template Guidelines**: [developers.facebook.com/docs/whatsapp/message-templates/guidelines](https://developers.facebook.com/docs/whatsapp/message-templates/guidelines)

---

**Need help?** Check the WhatsApp Business API documentation or contact Meta Business Support.

