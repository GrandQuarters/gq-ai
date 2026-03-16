# WhatsApp Template Mapping Status

## 📋 Overview

This document maps the booking system placeholders to WhatsApp template variables and shows the current implementation status.

---

## 🔄 Placeholder Mapping

### Your Current Placeholders → WhatsApp Format

| Your Placeholder | WhatsApp Format | Description |
|-----------------|-----------------|-------------|
| `{BOOKING:NAME}` | `{{1}}` | Guest name |
| `{BOOKING:GUEST_NAME}` | `{{1}}` | Guest name (same as above) |
| `{BOOKING:LINKINFO}` | `{{2}}` | Booking info link |
| `{BOOKING:ARRIVAL}` | `{{3}}` | Arrival/Check-in date |
| `{BOOKING:DEPARTURE}` | `{{4}}` | Departure/Check-out date |
| `{O:STREET}` | `{{5}}` | Street name |
| `{O:STREET_NR}` | `{{6}}` | Street number |
| `{O:ZIP}` | `{{7}}` | ZIP code |
| `{O:CITY}` | `{{8}}` | City name |
| `{BOOKING:GUEST_REGISTRATION_ONLY_LINK}` | `{{9}}` | Guest registration form link |
| `{BOOKING:KEYCODE}` | `{{X}}` | Door keycode |
| `{O:FLOOR}` | `{{X}}` | Floor number |
| `{O:DOOR_NR}` | `{{X}}` | Door/Apartment number |
| `{BOOKING:GUEST_REGISTRATION_SHORT}` | `{{X}}` | Short registration link |

---

## 📝 Template-by-Template Breakdown

### ✅ **1. Booking Confirmation (Buchungsbestätigung)**

**Current Placeholders Used:**
- `{BOOKING:NAME}` → {{1}}
- `{BOOKING:LINKINFO}` → {{2}}
- `{BOOKING:ARRIVAL}` → {{3}}
- `{BOOKING:DEPARTURE}` → {{4}}
- `{O:STREET}` → {{5}}
- `{O:STREET_NR}` → {{6}}
- `{O:ZIP}` → {{7}}
- `{O:CITY}` → {{8}}
- `{BOOKING:GUEST_REGISTRATION_ONLY_LINK}` → {{9}}

**Code Status:** ✅ Implemented in `whatsapp.service.ts` (lines 168-239)

**Function Signature (DE):**
```typescript
sendBuchungsbestaetigung(
  to: string,
  guestName: string,        // {{1}}
  bookingInfoLink: string,  // {{2}}
  arrivalDate: string,      // {{3}}
  departureDate: string,    // {{4}}
  street: string,           // {{5}}
  streetNr: string,         // {{6}}
  zip: string,              // {{7}}
  city: string,             // {{8}}
  guestRegistrationLink: string // {{9}}
)
```

---

### ✅ **2. Cancellation**

**Current Placeholders Used:**
- `{BOOKING:GUEST_NAME}` → {{1}}

**Code Status:** ✅ Implemented (lines 248-295)

**Function Signature (DE):**
```typescript
sendCancellationDE(
  to: string,
  guestName: string,         // {{1}}
  bookingReference: string,  // {{2}} - NOT IN TEMPLATE TEXT
  propertyName: string       // {{3}} - NOT IN TEMPLATE TEXT
)
```

⚠️ **Issue:** Code has extra parameters not used in template text!

---

### ✅ **3. Check-Out**

**Current Placeholders Used:**
- `{BOOKING:GUEST_NAME}` → {{1}}

**Code Status:** ✅ Implemented (lines 304-355)

**Function Signature (DE):**
```typescript
sendCheckOutDE(
  to: string,
  guestName: string,     // {{1}}
  propertyName: string,  // {{2}} - NOT IN TEMPLATE TEXT
  checkOutDate: string,  // {{3}} - NOT IN TEMPLATE TEXT
  checkOutTime: string   // {{4}} - NOT IN TEMPLATE TEXT
)
```

⚠️ **Issue:** Code has extra parameters not used in template text!

---

### ✅ **4. First Night Follow-Up**

**Current Placeholders Used:**
- `{BOOKING:GUEST_NAME}` → {{1}}

**Code Status:** ✅ Implemented (lines 364-407)

**Function Signature (DE):**
```typescript
sendFirstNightDE(
  to: string,
  guestName: string,     // {{1}}
  propertyName: string   // {{2}} - NOT IN TEMPLATE TEXT
)
```

⚠️ **Issue:** Code has extra parameter not used in template text!

---

### ✅ **5. Check-In Personal (Persönlich)**

**Current Placeholders Used:**
- `{BOOKING:GUEST_NAME}` → {{1}}

**Code Status:** ✅ Implemented (lines 416-471)

**Function Signature (DE):**
```typescript
sendCheckInPersoenlichDE(
  to: string,
  guestName: string,     // {{1}}
  propertyName: string,  // {{2}} - NOT IN TEMPLATE TEXT
  checkInDate: string,   // {{3}} - NOT IN TEMPLATE TEXT
  checkInTime: string,   // {{4}} - NOT IN TEMPLATE TEXT
  address: string        // {{5}} - NOT IN TEMPLATE TEXT
)
```

⚠️ **Issue:** Code has extra parameters not used in template text!

---

### ✅ **6. Check-In Seilergasse**

**Current Placeholders Used:**
- `{BOOKING:GUEST_NAME}` → {{1}}
- `{BOOKING:KEYCODE}` → {{2}}

**Code Status:** ✅ Implemented (lines 480-543)

**Function Signature (DE):**
```typescript
sendCheckInSeilergasseDE(
  to: string,
  guestName: string,       // {{1}}
  checkInDate: string,     // {{2}} - NOT IN TEMPLATE TEXT
  checkInTime: string,     // {{3}} - NOT IN TEMPLATE TEXT
  doorCode: string,        // {{4}} - SHOULD BE {{2}}
  apartmentNumber: string, // {{5}} - NOT IN TEMPLATE TEXT
  wifiName: string,        // {{6}} - NOT IN TEMPLATE TEXT
  wifiPassword: string     // {{7}} - NOT IN TEMPLATE TEXT
)
```

⚠️ **Issue:** WiFi info is hardcoded in template, not dynamic! Code parameters mismatch.

---

### ✅ **7. Check-In Radetzky Top 56**

**Current Placeholders Used:**
- `{BOOKING:GUEST_NAME}` → {{1}}
- `{BOOKING:KEYCODE}` → {{2}}

**Code Status:** ✅ Implemented (lines 552-611)

**Function Signature (DE):**
```typescript
sendCheckInRadetzkyTop56DE(
  to: string,
  guestName: string,    // {{1}}
  checkInDate: string,  // {{2}} - NOT IN TEMPLATE TEXT
  checkInTime: string,  // {{3}} - NOT IN TEMPLATE TEXT
  doorCode: string,     // {{4}} - SHOULD BE {{2}}
  wifiName: string,     // {{5}} - NOT IN TEMPLATE TEXT
  wifiPassword: string  // {{6}} - NOT IN TEMPLATE TEXT
)
```

⚠️ **Issue:** WiFi info is hardcoded! Date/time not in template text.

---

### ✅ **8. Check-In Radetzky Top 29**

**Current Placeholders Used:**
- `{BOOKING:GUEST_NAME}` → {{1}}
- `{BOOKING:KEYCODE}` → {{2}}

**Code Status:** ✅ Implemented (lines 620-679)

Same issues as Top 56.

---

### ✅ **9. Check-In Radetzky Top 19**

**Current Placeholders Used:**
- `{BOOKING:GUEST_NAME}` → {{1}}
- `{BOOKING:KEYCODE}` → {{2}}

**Code Status:** ✅ Implemented (lines 688-747)

Same issues as Top 56.

---

### ✅ **10. Check-In Radetzkystr (1D+2D)**

**Current Placeholders Used:**
- `{BOOKING:GUEST_NAME}` → {{1}}
- `{BOOKING:KEYCODE}` → {{2}}
- `{O:FLOOR}` → {{3}}
- `{O:DOOR_NR}` → {{4}}

**Code Status:** ✅ Implemented (lines 756-819)

**Function Signature (DE):**
```typescript
sendCheckInRadetzkystr1D2DDE(
  to: string,
  guestName: string,       // {{1}}
  checkInDate: string,     // {{2}} - NOT IN TEMPLATE TEXT
  checkInTime: string,     // {{3}} - NOT IN TEMPLATE TEXT
  doorCode: string,        // {{4}} - SHOULD BE {{2}}
  apartmentNumber: string, // {{5}} - DUPLICATE OF DOOR_NR
  wifiName: string,        // {{6}} - NOT IN TEMPLATE TEXT
  wifiPassword: string     // {{7}} - NOT IN TEMPLATE TEXT
)
```

⚠️ **Issue:** Missing `floor` and `doorNr` parameters! WiFi hardcoded.

---

### ✅ **11. Guest Registration Reminder**

**Current Placeholders Used:**
- `{BOOKING:GUEST_NAME}` → {{1}}
- `{BOOKING:GUEST_REGISTRATION_SHORT}` → {{2}}
- `{O:CITY}` → {{3}}

**Code Status:** ✅ Implemented (lines 828-879)

**Function Signature (DE):**
```typescript
sendGuestRegistrationReminderDE(
  to: string,
  guestName: string,            // {{1}}
  propertyName: string,         // {{2}} - NOT IN TEMPLATE TEXT
  guestRegistrationLink: string, // {{3}} - SHOULD BE {{2}}
  checkInDate: string           // {{4}} - NOT IN TEMPLATE TEXT
)
```

⚠️ **Issue:** Missing `city` parameter! `propertyName` not in template.

---

## 🎯 REQUIRED ACTIONS

### **Action 1: Fix Function Signatures**

The code currently has parameters that don't match the actual template text. Need to:

1. **Remove unused parameters** (propertyName, checkInDate, checkInTime where not used)
2. **Add missing parameters** (floor, doorNr, city)
3. **Reorder parameters** to match {{1}}, {{2}}, {{3}} sequence

### **Action 2: Fix Parameter Mapping**

Current parameter order in code doesn't match the {{X}} numbering in templates:

**Example Fix Needed for `sendCheckInSeilergasseDE`:**

**BEFORE (Current):**
```typescript
sendCheckInSeilergasseDE(
  to,
  guestName,        // {{1}}
  checkInDate,      // Not in template
  checkInTime,      // Not in template
  doorCode,         // Should be {{2}}
  apartmentNumber,  // Not in template
  wifiName,         // Hardcoded in template
  wifiPassword      // Hardcoded in template
)
```

**AFTER (Correct):**
```typescript
sendCheckInSeilergasseDE(
  to: string,
  guestName: string,  // {{1}}
  doorCode: string    // {{2}}
): Promise<boolean>
```

### **Action 3: Update Template Components**

When calling `sendTemplate()`, the `components` array must match:

```typescript
components: [
  {
    type: 'body',
    parameters: [
      { type: 'text', text: guestName },   // {{1}}
      { type: 'text', text: doorCode }     // {{2}}
    ]
  }
]
```

---

## 📊 DATA SOURCE REQUIREMENTS

To make these templates work, you'll need a **PMS (Property Management System) integration** or **database** that provides:

### **Guest Data:**
- Guest name
- Phone number
- Email
- Arrival date
- Departure date

### **Booking Data:**
- Booking reference/ID
- Booking info link
- Guest registration link (short & long)
- Check-in date/time
- Check-out date/time

### **Property Data:**
- Property name
- Street name
- Street number
- ZIP code
- City
- Floor number
- Door/Apartment number
- Door keycode (dynamic)
- WiFi name (currently hardcoded as "GrandQuarters")
- WiFi password (currently hardcoded as "welcome2vienna")

---

## 🔌 NEXT STEPS

### **Phase 1: Fix Code to Match Templates** ✋ **YOU ARE HERE**

1. Review each template text
2. Identify actual placeholders used
3. Update function signatures
4. Update parameter arrays
5. Test each template

### **Phase 2: PMS Integration** 🔜

1. Connect to your booking system API
2. Fetch guest/booking/property data
3. Store in Supabase database
4. Create automated triggers for sending templates

### **Phase 3: Automation** 🔜

1. Booking confirmed → Send buchungsbestaetigung
2. 48h before check-in → Send registration reminder
3. 24h before check-in → Send check-in instructions
4. Day 1 of stay → Send first night follow-up
5. Day before checkout → Send checkout reminder

---

## ⚙️ CODE FIX STRATEGY

I recommend we:

1. ✅ **Keep existing code structure** (22 functions work well)
2. 🔧 **Fix parameter lists** to match actual template variables
3. 🔧 **Remove unused parameters** (propertyName, dates/times not in text)
4. 🔧 **Add missing parameters** (floor, doorNr, city where needed)
5. ✅ **Keep hardcoded values** for now (WiFi, building codes)
6. 🔜 **Later**: Make WiFi, building codes dynamic via PMS integration

---

## 🚨 CRITICAL NOTES

1. **WiFi credentials are HARDCODED** in templates (GrandQuarters / welcome2vienna)
   - If you have different WiFi per apartment, templates need editing
   
2. **Building codes are HARDCODED** (e.g., "2468" for Radetzkystraße)
   - If codes change, templates need re-approval from Meta

3. **Some templates are VERY LONG** (> 1024 characters)
   - WhatsApp has character limits
   - May need approval review from Meta

4. **Template language must match** message language
   - Send `_de` to German speakers
   - Send `_en` to English speakers
   - Need language detection logic

---

**Status:** 📋 **Analysis Complete - Ready for Code Fixes**

**Do you want me to fix all the function signatures and parameter mappings now?**

