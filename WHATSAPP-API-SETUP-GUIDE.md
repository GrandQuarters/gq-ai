# WhatsApp Business API Setup Guide

## Prerequisites
- Meta Developer Account (Facebook account)
- WhatsApp Business Account
- A phone number to verify

---

## Step 1: Create Meta App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **"My Apps"** → **"Create App"**
3. Select **"Business"** as app type
4. Fill in app details:
   - **App Name**: GQ-AI WhatsApp
   - **App Contact Email**: your-email@example.com
5. Click **"Create App"**

---

## Step 2: Add WhatsApp Product

1. In your app dashboard, click **"Add Product"**
2. Find **"WhatsApp"** and click **"Set Up"**
3. Select **"Manage"** under WhatsApp

---

## Step 3: Get Credentials

### Get Phone Number ID:
1. In WhatsApp → **API Setup**
2. Under **"From"** dropdown, you'll see your test phone number
3. Click on it to reveal the **Phone Number ID**
4. Copy this ID

### Get Access Token:
1. In the same **API Setup** section
2. Under **"Temporary access token"**, click **"Copy"**
3. **⚠️ Important**: This token expires in 24 hours!
4. For production, you need to generate a **permanent token** (see Step 5)

---

## Step 4: Configure Webhook

### Set up webhook URL:
1. In WhatsApp → **Configuration**
2. Click **"Edit"** next to Webhook
3. Enter webhook URL:
   ```
   https://your-domain.com/webhook/whatsapp
   ```
   **For testing locally, use ngrok:**
   ```bash
   ngrok http 4000
   ```
   Then use: `https://your-ngrok-url.ngrok.io/webhook/whatsapp`

4. Enter **Verify Token**: `gq-ai-webhook-token`
5. Click **"Verify and Save"**

### Subscribe to webhook fields:
1. Click **"Manage"** next to Webhook Fields
2. Subscribe to:
   - ✅ `messages` (required)
   - ✅ `message_status` (optional, for delivery status)
3. Click **"Save"**

---

## Step 5: Generate Permanent Access Token

**Temporary tokens expire after 24 hours!** For production:

1. Go to **App Settings** → **Basic**
2. Note your **App ID** and **App Secret**
3. Go to **Tools** → **Access Token Debugger**
4. Paste your temporary token
5. Click **"Extend Access Token"**
6. Or use **System User Token** (recommended):
   - Go to **Business Settings** → **System Users**
   - Create a new system user
   - Assign **WhatsApp Business Messaging** permissions
   - Generate token (never expires)

---

## Step 6: Update Backend Configuration

Add to `backend/.env`:

```env
# OpenAI API Key (already configured)
OPENAI_API_KEY=your_openai_api_key_here

# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_from_step3
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token_from_step5
WHATSAPP_VERIFY_TOKEN=gq-ai-webhook-token

# Server
PORT=4000
FRONTEND_URL=http://localhost:3000
```

---

## Step 7: Test Setup

### Test webhook verification:
```bash
curl "http://localhost:4000/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=gq-ai-webhook-token&hub.challenge=test123"
```
Should return: `test123`

### Send test message:
1. Use the test number provided by Meta
2. Send a WhatsApp message to that number
3. Check backend console for incoming message logs

---

## Step 8: Add Your Business Phone Number

**The test number only works for 5 test users!**

To use your own business number:

1. Go to WhatsApp → **API Setup**
2. Click **"Add phone number"**
3. Verify your business phone number
4. Update `WHATSAPP_PHONE_NUMBER_ID` in `.env`
5. **⚠️ Note**: This number will be dedicated to WhatsApp Business API
   (You cannot use it for regular WhatsApp anymore)

---

## Pricing Reminder

- **First 1,000 conversations/month**: FREE
- **Receiving messages**: Always FREE
- **Replying within 24h**: FREE
- **Template messages (after 24h)**: ~€0.05 per message

---

## Troubleshooting

### "Webhook verification failed"
- Check that verify token matches exactly: `gq-ai-webhook-token`
- Ensure webhook URL is publicly accessible (use ngrok for local testing)

### "Phone number not found"
- Verify `WHATSAPP_PHONE_NUMBER_ID` is correct
- Ensure phone number is added to your WhatsApp Business Account

### "Access token expired"
- Generate a permanent token (Step 5)
- Use System User Token for production

### "Messages not being received"
- Check webhook subscriptions (Step 4)
- Verify webhook URL is correct
- Check backend console logs

---

## Next Steps

Once configured:
1. ✅ Restart backend: `npm run dev`
2. ✅ Send test message to your WhatsApp Business number
3. ✅ Message appears in GQ-AI frontend with WhatsApp logo
4. ✅ AI generates response
5. ✅ Reply directly from frontend → sends via WhatsApp!

---

## Resources

- [WhatsApp Business Platform Docs](https://developers.facebook.com/docs/whatsapp/)
- [Cloud API Getting Started](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
- [Webhooks Guide](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks)
- [Pricing](https://developers.facebook.com/docs/whatsapp/pricing)

