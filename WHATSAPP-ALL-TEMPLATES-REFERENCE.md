# 📋 WhatsApp Templates - Complete Reference

**Purpose**: This document lists ALL template types that need to be created in Meta Business Manager.  
**Status**: Code is ready, templates need to be created and submitted for approval.  
**Next Step**: Customer to finalize template content (some are too long for WhatsApp 1024 char limit).

---

## 📊 Template Overview

| # | Template Type | German Name | English Name | Variables | Status |
|---|--------------|-------------|--------------|-----------|--------|
| 1 | Booking Confirmation | `buchungsbestaetigung_de` | `buchungsbestaetigung_en` | 9 | ⚠️ TOO LONG |
| 2 | Cancellation | `cancellation_de` | `cancellation_en` | 3 | ⏳ Pending |
| 3 | Check-Out | `checkout_de` | `checkout_en` | 4 | ⏳ Pending |
| 4 | First Night Follow-Up | `first_night_de` | `first_night_en` | 2 | ⏳ Pending |
| 5 | Check-In Personal | `checkin_persoenlich_de` | `checkin_persoenlich_en` | 5 | ⏳ Pending |
| 6 | Check-In Sellergasse | `checkin_sellergasse_de` | `checkin_sellergasse_en` | 7 | ⏳ Pending |
| 7 | Check-In Radetzky Top 56 | `checkin_radetzky_top56_de` | `checkin_radetzky_top56_en` | 6 | ⏳ Pending |
| 8 | Check-In Radetzky Top 29 | `checkin_radetzky_top29_de` | `checkin_radetzky_top29_en` | 6 | ⏳ Pending |
| 9 | Check-In Radetzky Top 19 | `checkin_radetzky_top19_de` | `checkin_radetzky_top19_en` | 6 | ⏳ Pending |
| 10 | Check-In Radetzkystr (1D+2D) | `checkin_radetzkystr_1d2d_de` | `checkin_radetzkystr_1d2d_en` | 7 | ⏳ Pending |
| 11 | Guest Registration Reminder | `erinnerung_gaesteblatt_de` | `erinnerung_gaesteblatt_en` | 4 | ⏳ Pending |

**Total**: 22 templates (11 types × 2 languages)

---

## 📝 Template Details

### 1️⃣ **Buchungsbestätigung / Booking Confirmation**

**Template Names**: `buchungsbestaetigung_de`, `buchungsbestaetigung_en`  
**Category**: UTILITY  
**Variables**: 9

| # | Variable | Description | Example |
|---|----------|-------------|---------|
| {{1}} | Guest Name | Full name of guest | "Max Mustermann" |
| {{2}} | Booking Info Link | Link to booking details | "https://..." |
| {{3}} | Arrival Date | Check-in date | "15.12.2025" |
| {{4}} | Departure Date | Check-out date | "20.12.2025" |
| {{5}} | Street | Street name | "Radetzkystraße" |
| {{6}} | Street Number | Street number | "14" |
| {{7}} | ZIP Code | Postal code | "1030" |
| {{8}} | City | City name | "Wien" |
| {{9}} | Guest Registration Link | Link to guest form | "https://..." |

**Code Usage**:
```typescript
await whatsappService.sendBuchungsbestaetigung(
  '+43123456789',
  'Max Mustermann',
  'https://booking.link',
  '15.12.2025',
  '20.12.2025',
  'Radetzkystraße',
  '14',
  '1030',
  'Wien',
  'https://registration.link'
);
```

**⚠️ Status**: Original template is ~1,850 characters (WhatsApp limit: 1,024). Needs to be shortened or split.

---

### 2️⃣ **Cancellation / Stornierung**

**Template Names**: `cancellation_de`, `cancellation_en`  
**Category**: UTILITY  
**Variables**: 3

| # | Variable | Description | Example |
|---|----------|-------------|---------|
| {{1}} | Guest Name | Full name of guest | "Max Mustermann" |
| {{2}} | Booking Reference | Booking number | "BK-2025-12345" |
| {{3}} | Property Name | Apartment name | "Apartment Zentrum" |

**Code Usage**:
```typescript
await whatsappService.sendCancellationDE(
  '+43123456789',
  'Max Mustermann',
  'BK-2025-12345',
  'Apartment Zentrum'
);
```

---

### 3️⃣ **Check-Out Reminder**

**Template Names**: `checkout_de`, `checkout_en`  
**Category**: UTILITY  
**Variables**: 4

| # | Variable | Description | Example |
|---|----------|-------------|---------|
| {{1}} | Guest Name | Full name of guest | "Max Mustermann" |
| {{2}} | Property Name | Apartment name | "Apartment Zentrum" |
| {{3}} | Check-Out Date | Date of departure | "20.12.2025" |
| {{4}} | Check-Out Time | Time of departure | "11:00" |

**Code Usage**:
```typescript
await whatsappService.sendCheckOutDE(
  '+43123456789',
  'Max Mustermann',
  'Apartment Zentrum',
  '20.12.2025',
  '11:00'
);
```

---

### 4️⃣ **First Night Follow-Up**

**Template Names**: `first_night_de`, `first_night_en`  
**Category**: UTILITY  
**Variables**: 2

| # | Variable | Description | Example |
|---|----------|-------------|---------|
| {{1}} | Guest Name | Full name of guest | "Max Mustermann" |
| {{2}} | Property Name | Apartment name | "Apartment Zentrum" |

**Code Usage**:
```typescript
await whatsappService.sendFirstNightDE(
  '+43123456789',
  'Max Mustermann',
  'Apartment Zentrum'
);
```

---

### 5️⃣ **Check-In Persönlich (Personal)**

**Template Names**: `checkin_persoenlich_de`, `checkin_persoenlich_en`  
**Category**: UTILITY  
**Variables**: 5

| # | Variable | Description | Example |
|---|----------|-------------|---------|
| {{1}} | Guest Name | Full name of guest | "Max Mustermann" |
| {{2}} | Property Name | Apartment name | "Apartment Zentrum" |
| {{3}} | Check-In Date | Date of arrival | "15.12.2025" |
| {{4}} | Check-In Time | Time of arrival | "15:00" |
| {{5}} | Address | Full address | "Radetzkystraße 14, 1030 Wien" |

**Code Usage**:
```typescript
await whatsappService.sendCheckInPersoenlichDE(
  '+43123456789',
  'Max Mustermann',
  'Apartment Zentrum',
  '15.12.2025',
  '15:00',
  'Radetzkystraße 14, 1030 Wien'
);
```

---

### 6️⃣ **Check-In Sellergasse**

**Template Names**: `checkin_sellergasse_de`, `checkin_sellergasse_en`  
**Category**: UTILITY  
**Variables**: 7

| # | Variable | Description | Example |
|---|----------|-------------|---------|
| {{1}} | Guest Name | Full name of guest | "Max Mustermann" |
| {{2}} | Check-In Date | Date of arrival | "15.12.2025" |
| {{3}} | Check-In Time | Time of arrival | "15:00" |
| {{4}} | Door Code | Entry code | "1234#" |
| {{5}} | Apartment Number | Unit number | "Top 5" |
| {{6}} | WiFi Name | WiFi SSID | "GQ-Sellergasse" |
| {{7}} | WiFi Password | WiFi password | "password123" |

**Code Usage**:
```typescript
await whatsappService.sendCheckInSellergasseDE(
  '+43123456789',
  'Max Mustermann',
  '15.12.2025',
  '15:00',
  '1234#',
  'Top 5',
  'GQ-Sellergasse',
  'password123'
);
```

---

### 7️⃣ **Check-In Radetzky Top 56**

**Template Names**: `checkin_radetzky_top56_de`, `checkin_radetzky_top56_en`  
**Category**: UTILITY  
**Variables**: 6

| # | Variable | Description | Example |
|---|----------|-------------|---------|
| {{1}} | Guest Name | Full name of guest | "Max Mustermann" |
| {{2}} | Check-In Date | Date of arrival | "15.12.2025" |
| {{3}} | Check-In Time | Time of arrival | "15:00" |
| {{4}} | Door Code | Entry code | "1234#" |
| {{5}} | WiFi Name | WiFi SSID | "GQ-Radetzky-56" |
| {{6}} | WiFi Password | WiFi password | "password123" |

**Code Usage**:
```typescript
await whatsappService.sendCheckInRadetzkyTop56DE(
  '+43123456789',
  'Max Mustermann',
  '15.12.2025',
  '15:00',
  '1234#',
  'GQ-Radetzky-56',
  'password123'
);
```

---

### 8️⃣ **Check-In Radetzky Top 29**

**Template Names**: `checkin_radetzky_top29_de`, `checkin_radetzky_top29_en`  
**Category**: UTILITY  
**Variables**: 6

| # | Variable | Description | Example |
|---|----------|-------------|---------|
| {{1}} | Guest Name | Full name of guest | "Max Mustermann" |
| {{2}} | Check-In Date | Date of arrival | "15.12.2025" |
| {{3}} | Check-In Time | Time of arrival | "15:00" |
| {{4}} | Door Code | Entry code | "1234#" |
| {{5}} | WiFi Name | WiFi SSID | "GQ-Radetzky-29" |
| {{6}} | WiFi Password | WiFi password | "password123" |

**Code Usage**:
```typescript
await whatsappService.sendCheckInRadetzkyTop29DE(
  '+43123456789',
  'Max Mustermann',
  '15.12.2025',
  '15:00',
  '1234#',
  'GQ-Radetzky-29',
  'password123'
);
```

---

### 9️⃣ **Check-In Radetzky Top 19**

**Template Names**: `checkin_radetzky_top19_de`, `checkin_radetzky_top19_en`  
**Category**: UTILITY  
**Variables**: 6

| # | Variable | Description | Example |
|---|----------|-------------|---------|
| {{1}} | Guest Name | Full name of guest | "Max Mustermann" |
| {{2}} | Check-In Date | Date of arrival | "15.12.2025" |
| {{3}} | Check-In Time | Time of arrival | "15:00" |
| {{4}} | Door Code | Entry code | "1234#" |
| {{5}} | WiFi Name | WiFi SSID | "GQ-Radetzky-19" |
| {{6}} | WiFi Password | WiFi password | "password123" |

**Code Usage**:
```typescript
await whatsappService.sendCheckInRadetzkyTop19DE(
  '+43123456789',
  'Max Mustermann',
  '15.12.2025',
  '15:00',
  '1234#',
  'GQ-Radetzky-19',
  'password123'
);
```

---

### 🔟 **Check-In Radetzkystr (1D+2D)**

**Template Names**: `checkin_radetzkystr_1d2d_de`, `checkin_radetzkystr_1d2d_en`  
**Category**: UTILITY  
**Variables**: 7

| # | Variable | Description | Example |
|---|----------|-------------|---------|
| {{1}} | Guest Name | Full name of guest | "Max Mustermann" |
| {{2}} | Check-In Date | Date of arrival | "15.12.2025" |
| {{3}} | Check-In Time | Time of arrival | "15:00" |
| {{4}} | Door Code | Entry code | "1234#" |
| {{5}} | Apartment Number | Unit number | "1D" or "2D" |
| {{6}} | WiFi Name | WiFi SSID | "GQ-Radetzky-1D" |
| {{7}} | WiFi Password | WiFi password | "password123" |

**Code Usage**:
```typescript
await whatsappService.sendCheckInRadetzkystr1D2DDE(
  '+43123456789',
  'Max Mustermann',
  '15.12.2025',
  '15:00',
  '1234#',
  '1D',
  'GQ-Radetzky-1D',
  'password123'
);
```

---

### 1️⃣1️⃣ **Guest Registration Reminder / Erinnerung Gästeblatt**

**Template Names**: `erinnerung_gaesteblatt_de`, `erinnerung_gaesteblatt_en`  
**Category**: UTILITY  
**Variables**: 4

| # | Variable | Description | Example |
|---|----------|-------------|---------|
| {{1}} | Guest Name | Full name of guest | "Max Mustermann" |
| {{2}} | Property Name | Apartment name | "Apartment Zentrum" |
| {{3}} | Guest Registration Link | Link to form | "https://registration.link" |
| {{4}} | Check-In Date | Date of arrival | "15.12.2025" |

**Code Usage**:
```typescript
await whatsappService.sendGuestRegistrationReminderDE(
  '+43123456789',
  'Max Mustermann',
  'Apartment Zentrum',
  'https://registration.link',
  '15.12.2025'
);
```

---

## 🎯 Next Steps

### **For Customer:**
1. ✅ Review ALL template types listed above
2. ⚠️ **IMPORTANT**: Fix `buchungsbestaetigung` - it's too long (1,850 chars vs 1,024 limit)
   - Option A: Shorten the content
   - Option B: Split into 2 templates
3. ✅ Provide the actual German and English text for EACH template
4. ✅ Confirm all variable mappings are correct

### **For Developer:**
1. ✅ Code is ready and waiting
2. ⏳ Once customer provides final templates, create formatted versions for Meta
3. ⏳ Customer submits to Meta Business Manager
4. ⏳ Wait for approval (~24 hours each)
5. ✅ Test all templates
6. 🎉 Go live!

---

## 📊 Template Summary by Property

### **Sellergasse**
- `checkin_sellergasse_de`
- `checkin_sellergasse_en`

### **Radetzky Top 56**
- `checkin_radetzky_top56_de`
- `checkin_radetzky_top56_en`

### **Radetzky Top 29**
- `checkin_radetzky_top29_de`
- `checkin_radetzky_top29_en`

### **Radetzky Top 19**
- `checkin_radetzky_top19_de`
- `checkin_radetzky_top19_en`

### **Radetzkystr 1D/2D**
- `checkin_radetzkystr_1d2d_de`
- `checkin_radetzkystr_1d2d_en`

### **Personal Check-In (Any Property)**
- `checkin_persoenlich_de`
- `checkin_persoenlich_en`

### **Universal Templates**
- `buchungsbestaetigung_de` / `buchungsbestaetigung_en`
- `cancellation_de` / `cancellation_en`
- `checkout_de` / `checkout_en`
- `first_night_de` / `first_night_en`
- `erinnerung_gaesteblatt_de` / `erinnerung_gaesteblatt_en`

---

## 💡 Important Notes

1. **All functions are ready in code** - see `backend/src/services/whatsapp.service.ts`
2. **PMS data not integrated yet** - Will be added when PMS system is connected
3. **Template names must match exactly** - Case-sensitive!
4. **Language codes**: `de` for German, `en` for English
5. **Character limit**: 1,024 characters max per template body
6. **Cost**: ~€0.05 per template message sent (outside 24h window)
7. **Approval time**: Usually 24 hours per template

---

## 📞 Contact

When templates are ready, provide them in this format:
```
TEMPLATE: [name]
GERMAN VERSION: [full text with {{1}}, {{2}}, etc.]
ENGLISH VERSION: [full text with {{1}}, {{2}}, etc.]
```

**Status**: ⏳ Waiting for customer to provide final template texts

