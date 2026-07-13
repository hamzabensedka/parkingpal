# "List Your Spot" Feature - Complete Implementation Plan

## 🎯 OVERVIEW

This feature allows users (Hosts) to list their parking spots on ParkingPal. This is a **critical, high-risk feature** because we need to verify that users actually own/control the parking spots they're listing to prevent fraud, scams, and legal issues.

---

## ⚠️ CRITICAL RISKS TO PREVENT

### **Fraud Scenarios We Must Prevent:**

1. **Listing Someone Else's Property:**
   - User lists their neighbor's driveway
   - User lists public parking spaces
   - User lists private property they don't own

2. **Duplicate Listings:**
   - Multiple users list the same spot
   - Same user lists same spot twice

3. **Fake Locations:**
   - User pins random location on map
   - User claims spot in area they don't control

4. **Misleading Information:**
   - Claims spot is covered when it's not
   - Claims spot fits SUV when it only fits compact
   - Fake photos from internet

5. **Scams:**
   - List spot, take payment, spot doesn't exist
   - Collect multiple bookings for same time slot
   - List spot then deny access

### **Legal Risks:**

1. **Tenant Listing Landlord's Spot:**
   - Tenant doesn't have permission to sublet
   - Lease doesn't allow commercial use

2. **Property Damage Claims:**
   - Host claims renter damaged property that was already damaged
   - No proof of condition before/after

3. **Privacy Violations:**
   - Photos show inside someone else's property
   - Exact address revealed too early

---

## 📋 STEP-BY-STEP IMPLEMENTATION PLAN

---

### **PHASE 1: PRE-VERIFICATION (Before User Starts)**

#### **Step 1.1: Check User Eligibility**

**Requirements:**
- User must be logged in
- User must have verified email (emailVerified = true)
- User must have verified phone (phoneVerified = true)
- User must have verified ID (idVerified = true)
- User must not be suspended (isSuspended = false)

**Business Rule:**
```
IF user has NOT verified email:
  → Show message: "Please verify your email before listing a spot"
  → Show "Resend Verification Email" button
  → Block access to listing form

IF user has NOT verified phone:
  → Show message: "Please verify your phone number before listing a spot"
  → Show phone verification form
  → Block access to listing form

IF user has NOT verified ID:
  → Show message: "Please verify your identity before listing a spot"
  → Show ID upload form
  → Block access to listing form

IF all verified:
  → Show "List Your Spot" button
  → Allow access to listing form
```

**Why This Matters:**
- Reduces fraud (verified users less likely to scam)
- Legal accountability (we have their ID)
- Can contact them if issues arise

---

#### **Step 1.2: Display Terms & Host Agreement**

**Before user can proceed, they must:**

1. **Read and Accept Host Agreement:**
   - Agreement covers:
     - Host confirms they own/control the property
     - Host confirms they have legal right to rent the space
     - Host confirms address and photos are accurate
     - Host agrees to be available/responsive
     - Host agrees to refund policy
     - Host acknowledges liability for false information
     - Host acknowledges ParkingPal can remove listing if fraudulent

2. **Checkbox:**
   ```
   ☐ I confirm that I own or have legal permission to rent this parking spot
   ☐ I have read and agree to the Host Terms of Service
   ☐ I understand that providing false information may result in account suspension
   ```

3. **Only after checking all boxes:**
   → "Continue to List Spot" button becomes active

**Why This Matters:**
- Legal protection for ParkingPal
- Clear expectations for hosts
- Evidence of agreement if disputes arise

---

### **PHASE 2: SPOT INFORMATION COLLECTION (Multi-Step Form)**

---

#### **Step 2.1: Location & Address**

**Form Fields:**

1. **Address Input:**
   - Street address (autocomplete with OSM Nominatim)
   - City (auto-filled from geocoding)
   - Postal code (auto-filled from geocoding)
   - Country (default: France, locked)

2. **Map Pin:**
   - Interactive map showing address location
   - User can drag pin to EXACT spot location
   - Latitude/Longitude captured automatically
   - Zoom level: Street-level detail required

3. **Location Type:**
   - Radio buttons:
     - ○ Residential (private home/apartment)
     - ○ Commercial (office building, shop)
     - ○ Public building (hotel, mall - with permission)

**Validation Rules:**

```
Address:
- Required field
- Must geocode to valid France location
- Must be specific street address (not just city name)
- Cannot be: Airport, Train Station, Public Parking Lot (these require special verification)

Map Pin:
- Must be within 100 meters of geocoded address
- If pin is >100m from address, show warning:
  "Pin location doesn't match address. Please adjust."
- Prevent placement in: Water bodies, highways, parks (no parking allowed)

Location Type:
- Required field
- If "Public building" selected:
  → Show additional field: "Permission document upload"
  → Require proof of permission from property manager
```

**Why This Matters:**
- Prevents listing random locations
- Ensures accuracy for renters
- Legal proof of address

---

#### **Step 2.2: Ownership Verification (CRITICAL)**

**This is the MOST IMPORTANT step to prevent fraud.**

**User must provide ONE of the following proofs:**

**Option A: Property Tax Bill (Taxe foncière)**
- Upload recent property tax bill (PDF or photo)
- Must show:
  - Property address matching listing address
  - Owner name matching user's verified name
  - Recent date (within last 12 months)

**Option B: Rental Agreement (Bail d'habitation)**
- Upload rental lease agreement
- Must show:
  - Property address matching listing address
  - Tenant name matching user's verified name
  - Clause allowing subletting OR additional permission letter from landlord
- If no subletting clause:
  → Require "Landlord Permission Letter" upload

**Option C: Parking Deed (Titre de propriété du parking)**
- Upload parking ownership document
- Must show:
  - Parking space number/location
  - Owner name matching user's verified name

**Option D: Building Management Authorization**
- For residents of apartment buildings with assigned spots
- Letter from building manager/syndic confirming:
  - Resident has assigned parking spot #X
  - Resident has permission to rent it out
- Must include manager's contact info for verification

**Option E: Business Lease (For commercial properties)**
- Business rental agreement
- Must show business name + authorized representative
- Authorized rep must match user's verified ID

**File Upload Requirements:**
```
Accepted formats: PDF, JPG, PNG, HEIC
Max file size: 10 MB
Minimum resolution: 1200x800 pixels (readable text)
Required: Full document (all pages if multi-page)
Auto-detect: OCR to extract address and name (validate against user data)
```

**Validation Process:**

```
AUTOMATED CHECKS (Immediate):
1. OCR extract text from uploaded document
2. Search for address keywords (street name, postal code)
3. Search for user's name (firstName + lastName)
4. Check document date (must be within 24 months)
5. If all found → Green checkmark "Document appears valid"
6. If missing → Yellow warning "Document may be incomplete - will be manually reviewed"
7. If clearly fake (stock photo, blank document) → Red flag "Invalid document"

MANUAL REVIEW (Within 24-48 hours):
- Human reviewer checks document authenticity
- Verifies address matches listing
- Verifies name matches user profile
- Checks for signs of editing/forgery
- Cross-references with public property records (if available)
- Approves or Rejects listing

LISTING STATUS:
- After upload: "Pending Verification"
- After automated pass: "Under Review"
- After manual approval: "Active"
- After rejection: "Rejected - Resubmit Required"
```

**Edge Cases:**

```
IF user doesn't own property:
→ They can STILL list IF they upload landlord permission
→ Template provided: "Landlord Permission Letter Template"
→ Must include landlord signature and contact info

IF spot is in shared driveway:
→ Require letter from co-owner/neighbor consenting
→ Letter must state: "I consent to [User] renting the shared parking space"

IF user manages multiple properties:
→ Can upload business license + management agreement
→ Each property verified separately

IF document is in different name (married name, family name):
→ Allow upload of marriage certificate or name change document
→ Or allow listing under family member with their consent + ID

IF user recently moved:
→ Allow recent utility bill (last 3 months) as alternative
→ Must show same address + name
```

**Why This Matters:**
- **PREVENTS 90% OF FRAUD**
- Legal proof host has right to rent
- Protection against lawsuits
- Build trust with renters

---

#### **Step 2.3: Spot Details & Characteristics**

**Form Fields:**

1. **Spot Type (Required):**
   - Radio buttons:
     - ○ Driveway (outdoor, private property)
     - ○ Garage (enclosed, private)
     - ○ Covered Parking (roof, no walls)
     - ○ Street Parking (with resident permit)
     - ○ Parking Lot Space (numbered space in lot)
     - ○ Underground Parking (basement)

2. **Vehicle Size (Required - Multiple select):**
   - Checkboxes:
     - ☐ Motorcycle/Scooter
     - ☐ Compact Car (e.g., Renault Clio)
     - ☐ Sedan (e.g., Peugeot 308)
     - ☐ SUV (e.g., Peugeot 3008)
     - ☐ Van/Large SUV (e.g., Renault Trafic)
   - Dimensions help:
     - Show reference image of each vehicle type
     - "Measure your space: Length __ m × Width __ m"
     - Auto-suggest based on measurements

3. **Exact Spot Location (Required):**
   - Text input:
     - "Spot #12 in underground garage, Level -1"
     - "Blue gate, right side of driveway"
     - "Reserved spot marked 'A3' in building parking"
   - Purpose: Help renters find exact spot

4. **Access Type (Required):**
   - Radio buttons:
     - ○ Gate/Door Code (enter code: ____)
     - ○ Remote Control (provided by host)
     - ○ Smart Lock (app-controlled)
     - ○ Physical Key (exchange with host)
     - ○ Barrier Card/Badge (provided by host)
     - ○ No barrier (open access)

5. **Access Instructions (Required):**
   - Text area (500 chars max):
     - Step-by-step directions
     - Example: "Enter code 1234# at main gate. Drive straight, turn left after 2nd building. Spot is between blue and red cars."
   - Optional: Upload instructional video (max 30 seconds)

**Validation Rules:**

```
Spot Type:
- Required
- If "Street Parking" selected:
  → Additional field: "Resident Permit Number"
  → Require photo of permit
  → Warn: "Street parking may have time restrictions"

Vehicle Size:
- At least ONE must be selected
- If "Van/Large SUV" selected:
  → Require dimensions confirmation: "Spot is at least 5m × 2.5m"
  → Prevent false advertising

Exact Location:
- Minimum 20 characters (force detail)
- Cannot be vague like "in the parking lot"

Access Type:
- Required
- If "Gate Code" selected:
  → Validate code format (numbers only, 4-6 digits)
  → Encrypt code in database (don't store plain text)
- If "Physical Key" selected:
  → Show warning: "You must be available to meet renters"

Access Instructions:
- Required
- Minimum 50 characters
- Check for completeness:
  → Must mention entry point ("main gate", "garage door")
  → Must mention direction ("left", "right", "straight")
  → Must mention identifier ("spot number", "color", "sign")
```

**Why This Matters:**
- Renters know exactly what to expect
- Reduces disputes ("spot was too small!")
- Clear access reduces confusion and frustration

---

#### **Step 2.4: Photos & Visual Proof (CRITICAL)**

**Photo Requirements:**

**Mandatory Photos (Minimum 4):**

1. **Street/Building Entrance (Wide shot):**
   - Purpose: Renter can find the location
   - Must show: Street view, building number, identifiable landmark
   - Quality: Well-lit, clear, no blur

2. **Parking Space (Empty):**
   - Purpose: Show actual size and condition
   - Must show: Full parking space, floor markings, dimensions
   - Quality: Bright, entire space visible

3. **Access Point (Gate/Door/Entrance):**
   - Purpose: Show where renter enters
   - Must show: Gate, keypad, door, entry mechanism
   - Quality: Clear view of access method

4. **Spot Identifier (Spot Number/Sign):**
   - Purpose: Proof this specific spot exists
   - Must show: Spot number painted/marked, or identifying feature
   - Quality: Number/sign clearly readable

**Optional Photos (Highly Recommended):**

5. **Covered/Garage Interior** (if applicable)
   - Shows roof, protection from weather

6. **Security Features:**
   - Camera, lighting, fence, gate

7. **Nearby Landmarks:**
   - Helps renters navigate ("next to red mailbox")

8. **Measurements:**
   - Photo with measuring tape showing length/width

**Photo Upload Specifications:**

```
Technical Requirements:
- Format: JPG, PNG, HEIC
- Min resolution: 1920×1080 (Full HD)
- Max file size: 5 MB per photo
- Min photos: 4
- Max photos: 12
- EXIF data: Preserve GPS coordinates (verify location matches listing)

Auto-Validation:
1. GPS check: Extract EXIF GPS data
   → If coordinates don't match listing address (within 200m):
   → Show warning: "Photo appears to be from different location"
   → Flag for manual review

2. Duplicate check: Reverse image search
   → Check if photo exists elsewhere online (stock photo, other listing)
   → If duplicate found: Reject photo, require original

3. Quality check:
   → Blur detection (reject blurry photos)
   → Brightness check (reject too dark photos)
   → Resolution check (reject low quality)

4. Content check (AI):
   → Verify photo shows parking space (not random room)
   → Detect if spot is currently occupied by car
   → Detect inappropriate content

Manual Review:
- Human checks photos match description
- Verifies spot looks safe and accessible
- Confirms photos are recent (no snow in summer listing)
```

**Photo Requirements Enforcement:**

```
IF fewer than 4 photos uploaded:
→ Show error: "Please upload at least 4 photos"
→ Block form submission

IF photo GPS doesn't match address:
→ Show warning (but allow manual override with explanation)
→ Flag for manual review

IF photo is duplicate/stock:
→ Reject immediately
→ Show error: "Please upload original photos of YOUR parking spot"

IF photo quality is poor:
→ Show tips: "Retake in better lighting" + example photo
→ Allow re-upload

IF no spot identifier visible:
→ Show warning: "Please include photo showing spot number or unique feature"
```

**Why This Matters:**
- **VISUAL PROOF spot exists**
- Prevents using fake/stock photos
- Renters see exactly what they're booking
- GPS metadata proves location

---

#### **Step 2.5: Amenities & Features**

**Amenities Checklist (Multiple select):**

1. **Protection & Security:**
   - ☐ Covered/Roofed (protected from rain)
   - ☐ Fully enclosed garage (walls + roof)
   - ☐ Security camera (surveillance)
   - ☐ Well-lit at night (streetlight or dedicated light)
   - ☐ Gated/Fenced (secured perimeter)
   - ☐ Security guard (24/7 or daytime)

2. **Convenience:**
   - ☐ Direct access (no stairs, straight from street)
   - ☐ Elevator nearby (for underground parking)
   - ☐ Close to metro/public transport (<300m)
   - ☐ Wheelchair accessible
   - ☐ Wide entry (easy for large vehicles)

3. **Special Features:**
   - ☐ EV Charging (Type 2 socket, specify kW)
   - ☐ Bike storage (additional locked area)
   - ☐ Car wash area (hose available)
   - ☐ Air pump (tire inflation)

4. **Type of Parking:**
   - ☐ Tandem parking (2 cars, one behind other)
   - ☐ Parallel parking (street style)
   - ☐ Perpendicular parking (standard)
   - ☐ Angled parking (diagonal)

**Validation & Proof Requirements:**

```
IF "EV Charging" selected:
→ Require photo of charging socket
→ Specify: Type 2 / Type 3 / Standard outlet
→ Specify: Charging speed (3.7kW, 7kW, 22kW)
→ Charge extra €2/hour for EV charging

IF "Covered" or "Garage" selected:
→ Require photo showing roof/coverage
→ Cross-check with "Spot Type" field (must match)

IF "Security Camera" selected:
→ Require photo of camera (privacy notice visible)
→ Disclose to renters: "This parking spot has surveillance"

IF "Gated" selected:
→ Must specify access method (code, remote, etc.)
→ Require photo of gate

IF "Tandem Parking" selected:
→ Show warning: "Both spots must be available simultaneously"
→ Require coordination instructions
```

**Why This Matters:**
- Accurate expectations for renters
- Premium features justify higher prices
- Photos prove amenity claims

---

#### **Step 2.6: Pricing Strategy**

**Pricing Fields:**

1. **Hourly Rate (Required):**
   - Input: € __ per hour
   - Min: €2/hour
   - Max: €20/hour
   - Suggested range shown based on:
     - Location (city center = higher)
     - Amenities (covered, EV charging = higher)
     - Nearby competition (show 3 similar spots' prices)

2. **Daily Rate (Optional but recommended):**
   - Input: € __ per day (8+ hours)
   - Auto-suggest: Hourly × 8 hours × 0.8 (20% discount)
   - Example: €6/hour → €38/day (save €10)

3. **Weekly Rate (Optional):**
   - Input: € __ per week
   - Auto-suggest: Daily × 7 × 0.7 (30% discount)
   - Target: Commuters who park Mon-Fri

4. **Monthly Rate (Optional):**
   - Input: € __ per month
   - Auto-suggest: Daily × 30 × 0.6 (40% discount)
   - Target: Long-term renters

**Dynamic Pricing (Optional):**

```
Toggle: "Enable surge pricing during high demand"

IF enabled:
→ Price increases automatically during:
   - Major events nearby (concerts, sports, conferences)
   - Holidays (Christmas, New Year, Bastille Day)
   - Peak times (Friday/Saturday nights)
   - Low availability (all nearby spots booked)

Surge amount: +30% to +100%
Max surge cap: Set by host (default: 2× base price)

Event detection:
→ Integrated with event calendars
→ Stade de France match → spots within 2km surge
→ Notify host: "Event detected: PSG match tonight. Enable surge pricing?"
```

**Pricing Intelligence (Show to Host):**

```
Display on pricing page:

"Similar spots in your area:"
1. Garage 300m away: €7/hour (⭐ 4.8)
2. Driveway 500m away: €5/hour (⭐ 4.6)
3. Covered spot 800m away: €8/hour (⭐ 4.9)

"Recommended price: €6-7/hour"
"Premium features increase value by 20%:
  ✅ Covered (+€1/hour)
  ✅ EV Charging (+€2/hour)
  ✅ Security Camera (+€0.50/hour)"

"Earnings projection:
  At €6/hour, 4 hours/day, 20 days/month = €480/month"
```

**Validation Rules:**

```
Hourly Rate:
- Required
- Must be between €2-€20
- If above €15/hour:
  → Show warning: "High price may reduce bookings. Recommended: €6-8/hour"

Daily Rate:
- Optional
- If provided: Must be less than (Hourly × 12)
  → Prevents illogical pricing

Weekly/Monthly:
- Optional
- Must show significant discount vs daily/hourly
- If Monthly > (Daily × 25):
  → Show warning: "Monthly rate should offer discount"

Surge Pricing:
- If enabled: Max 2× base price (prevent price gouging)
- Clearly disclosed to renters before booking
```

**Why This Matters:**
- Competitive pricing increases bookings
- Flexible rates attract different customer segments
- Transparency builds trust
- Prevents underpricing (host loses money) or overpricing (no bookings)

---

#### **Step 2.7: Availability & Calendar**

**Availability Settings:**

1. **Recurring Schedule (Recommended):**

   **Weekly Template:**
   ```
   Monday:    [_] All Day  [_] Custom Times: __:__ to __:__
   Tuesday:   [_] All Day  [_] Custom Times: __:__ to __:__
   Wednesday: [_] All Day  [_] Custom Times: __:__ to __:__
   Thursday:  [_] All Day  [_] Custom Times: __:__ to __:__
   Friday:    [_] All Day  [_] Custom Times: __:__ to __:__
   Saturday:  [_] All Day  [_] Custom Times: __:__ to __:__
   Sunday:    [_] All Day  [_] Custom Times: __:__ to __:__
   ```

   **Example:** Host works Mon-Fri 9am-6pm
   ```
   Monday-Friday: 9:00 AM to 6:00 PM ✅
   Saturday-Sunday: All Day ✅
   ```

2. **Specific Blocked Dates:**
   - Calendar view (next 365 days)
   - Click dates to block/unblock
   - Use cases:
     - Host on vacation: Block entire week
     - Doctor appointment: Block Tuesday 2pm-4pm
     - Family visiting: Block next weekend

3. **Minimum Booking Duration:**
   - Dropdown: 1 hour, 2 hours, 3 hours, 4 hours, 8 hours
   - Purpose: Prevent short bookings if not convenient
   - Example: "Min 2 hours" means no 1-hour bookings

4. **Maximum Booking Duration:**
   - Dropdown: 4 hours, 8 hours, 12 hours, 24 hours, No limit
   - Purpose: Prevent someone booking for weeks
   - Example: "Max 8 hours" for daily use spot

5. **Advance Notice:**
   - Dropdown: Instant, 1 hour, 2 hours, 4 hours, 12 hours, 24 hours
   - How far in advance renters must book
   - Example: "2 hours notice" means can't book for right now

6. **Booking Window:**
   - "Allow bookings up to __ days in advance"
   - Dropdown: 7 days, 14 days, 30 days, 90 days, 365 days
   - Purpose: Don't want calendar filled months ahead

**Validation Rules:**

```
Recurring Schedule:
- At least 8 hours per week must be available
  → If less: Show warning "Increase availability for more bookings"

Blocked Dates:
- Cannot block past dates (irrelevant)
- Cannot block more than 90% of next 30 days
  → If trying: Show warning "Too many blocked dates. Consider pausing listing instead"

Min/Max Duration:
- Min must be ≤ Max
  → If Min > Max: Show error "Minimum cannot exceed maximum"

Advance Notice:
- Recommended: 1-2 hours (gives time to respond)
- If "Instant" selected:
  → Must enable instant booking (auto-accept)
  → Warning: "Be ready to respond immediately"

Booking Window:
- Recommended: 30-90 days
- If 7 days:
  → Warning: "Short booking window may reduce reservations"
```

**Calendar Sync (Future Feature):**

```
Option: "Sync with Google Calendar"
→ Automatically block times when host has personal calendar events
→ No manual blocking needed
→ Update ParkingPal calendar when Google Calendar changes

Option: "Sync with other platforms"
→ If host lists on multiple platforms
→ Prevent double-bookings
```

**Why This Matters:**
- Hosts have full control of availability
- Prevents double-bookings
- Accommodates host's schedule (work, vacation, etc.)
- Clear expectations for renters

---

#### **Step 2.8: House Rules & Policies**

**House Rules (Optional but recommended):**

Text area for custom rules. Common examples:

1. **Vehicle Restrictions:**
   - "No commercial vehicles (trucks, vans)"
   - "No motorcycles" (if narrow space)
   - "Electric vehicles only" (if EV charging spot)
   - "Clean vehicles only - no muddy/dirty cars"

2. **Behavior:**
   - "No loud music or idling engines"
   - "No working on cars (repairs, oil changes)"
   - "No car washing (unless specified)"
   - "No parties or gatherings in parking area"

3. **Time Restrictions:**
   - "Must exit by 6:00 PM sharp"
   - "Quiet hours after 10:00 PM"
   - "No in-and-out during booking (park once, leave once)"

4. **Safety:**
   - "No flammable materials in vehicle"
   - "Lock your car - not responsible for theft"
   - "Follow all building rules"

5. **Access:**
   - "Do not block driveway entrance"
   - "Do not park in neighbor's spot"
   - "Close gate after entering"

**Cancellation Policy (Required - Select One):**

```
○ Flexible:
   - Full refund if cancelled 2+ hours before booking start
   - 50% refund if cancelled <2 hours before
   - No refund if cancelled after start time or no-show

○ Moderate:
   - Full refund if cancelled 24+ hours before booking start
   - 50% refund if cancelled 24-2 hours before
   - No refund if <2 hours or no-show

○ Strict:
   - Full refund if cancelled 48+ hours before booking start
   - 50% refund if cancelled 48-24 hours before
   - No refund if <24 hours or no-show

○ Non-refundable:
   - No refunds under any circumstances
   - Warning: "May reduce bookings significantly"
```

**Instant Booking (Toggle):**

```
[_] Enable Instant Booking

IF enabled:
→ Renters can book immediately without host approval
→ Payment processed automatically
→ Host receives notification, not confirmation request

IF disabled:
→ Renters send booking request
→ Host has 24 hours to accept or decline
→ If no response in 24h, auto-declined

Recommendation: Enable for most bookings
→ Faster, easier, more bookings
→ Only disable if you need to screen renters
```

**Validation Rules:**

```
House Rules:
- Optional
- Max 1000 characters
- Cannot include: Contact info, external links, offensive language
- Auto-scan for prohibited content

Cancellation Policy:
- Required (must select one)
- Recommended: Flexible (gets more bookings)
- Warning if "Strict" or "Non-refundable":
  → "Strict policies may reduce bookings by up to 30%"

Instant Booking:
- Recommended: ON
- Requirements if enabled:
  → Must have 4.5+ rating (after first 3 bookings)
  → Must respond to messages within 24 hours (average)
  → Cannot have >10% cancellation rate
```

**Why This Matters:**
- Sets clear expectations (reduces disputes)
- Protects host's property
- Cancellation policy balances flexibility and certainty
- Instant booking increases conversion rate

---

#### **Step 2.9: Description & Title**

**Listing Title (Required):**

```
Input: Short, catchy title (50 characters max)

Guidelines shown:
✅ Good Examples:
  - "Secure Garage in Le Marais - EV Charging"
  - "Covered Spot Near Eiffel Tower - Instant Access"
  - "Underground Parking in Business District"

❌ Bad Examples:
  - "Parking" (too vague)
  - "Best Parking Spot Ever!!!" (spammy)
  - "Cheap spot contact me" (inappropriate)

Auto-suggestions based on spot details:
  - "{Spot Type} in {Neighborhood} - {Key Feature}"
  - "Secure Garage in 16th Arrondissement - Well Lit"
```

**Full Description (Required):**

```
Text area (500 characters minimum, 2000 maximum)

Prompt template to help host:
"Describe your parking spot to potential renters:

1. What makes your spot special?
   Example: "Safe, well-lit garage in quiet residential building"

2. Nearby landmarks or attractions?
   Example: "5-minute walk to Louvre Museum, 2 minutes to metro"

3. Access details?
   Example: "Simple code entry, no keys needed"

4. Best for which type of renter?
   Example: "Perfect for tourists visiting Paris or daily commuters"

5. Any important details?
   Example: "Note: Ceiling height is 2m - may not fit tall vans"

Auto-checks:
→ Spell check (highlight errors)
→ Keyword optimization (suggest adding: "secure", "covered", "central")
→ Readability score (too complex = warn to simplify)
→ Length check (too short = warn to add more detail)
```

**Prohibited Content (Auto-filter):**

```
Cannot include:
❌ Contact information (phone, email, social media)
❌ External links
❌ Requests to book off-platform
❌ Discriminatory language
❌ False claims ("100% safe", "guaranteed parking")
❌ Spam or promotional content

If detected:
→ Highlight in red
→ Show error: "Please remove [prohibited content]"
→ Block submission until fixed
```

**Validation Rules:**

```
Title:
- Required
- 15-50 characters
- Cannot be all caps
- Cannot contain special characters (except dash, comma)
- Must include at least one keyword (parking, garage, spot, etc.)

Description:
- Required
- Minimum 100 characters (force detail)
- Maximum 2000 characters
- Must mention at least 2 of:
  → Location details
  → Access method
  → Nearby landmarks
  → Spot features

Quality checks:
- If too many exclamation marks (!!!) → Warn "Avoid excessive punctuation"
- If all uppercase → Error "Please use normal capitalization"
- If very generic → Warn "Add specific details to attract more renters"
```

**Why This Matters:**
- Good titles attract more clicks
- Detailed descriptions reduce questions
- Sets accurate expectations (fewer disputes)
- SEO for internal search

---

### **PHASE 3: VERIFICATION & APPROVAL PROCESS**

---

#### **Step 3.1: Automated Pre-Checks (Immediate)**

After user submits listing, run these automatic checks:

**Technical Validation:**
```
1. All required fields completed? ✅/❌
2. Photos uploaded (min 4)? ✅/❌
3. Ownership document uploaded? ✅/❌
4. Address geocoded successfully? ✅/❌
5. Map pin within 100m of address? ✅/❌
6. Pricing within allowed range (€2-€20/h)? ✅/❌
7. Availability set (min 8 hours/week)? ✅/❌

IF any check fails:
→ Show error message with specific issue
→ Block submission
→ Allow user to fix and resubmit
```

**Document OCR Analysis (5 minutes):**
```
1. Extract text from ownership document using OCR
2. Search for:
   - User's name (firstName + lastName)
   - Listed address (street, postal code)
   - Recent date (within 24 months)

3. Confidence scoring:
   - High confidence (90%+): "Document appears valid ✓"
   - Medium confidence (60-89%): "Document needs manual review ⚠"
   - Low confidence (<60%): "Document may be invalid ✗"

4. Set listing status:
   - High confidence → "Under Review" (manual verification queue)
   - Medium confidence → "Under Review" (priority manual verification)
   - Low confidence → "Rejected" (user must resubmit better document)
```

**Photo Analysis (10 minutes):**
```
1. EXIF GPS extraction:
   - Extract GPS coordinates from photo metadata
   - Compare with listing address coordinates
   - If match (within 200m) → ✅ Pass
   - If mismatch → ⚠ Flag for review

2. Duplicate detection (Reverse image search):
   - Check photo against image database (TinEye, Google Images)
   - If found online → ❌ Reject (stock photo or stolen)
   - If unique → ✅ Pass

3. AI content analysis:
   - Detect if photo shows parking space (not random building)
   - Detect if spot is occupied (car in space)
   - Detect inappropriate content (NSFW, etc.)
   - If passes → ✅ Pass
   - If fails → ⚠ Flag for review

4. Quality checks:
   - Blur detection (reject if blurry)
   - Brightness check (reject if too dark)
   - Resolution check (reject if too low quality)
```

**Fraud Detection Scoring:**
```
Calculate risk score (0-100):

Red flags (increase score):
+30: Document OCR failed to find name
+30: Document OCR failed to find address
+20: Photo GPS mismatch
+20: Duplicate photos found online
+15: User account created very recently (<7 days)
+15: No previous bookings as renter (new user)
+10: Pricing unusually low (€2/hour in city center)
+10: Pricing unusually high (€20/hour in suburbs)
+10: Title/description has prohibited content
+5: Generic description (<200 characters)

Green flags (decrease score):
-10: User has verified ID
-10: User has verified phone and email
-10: User has positive reviews as renter
-5: Ownership document is property tax bill (strongest proof)
-5: Photos have matching GPS data
-5: Professional-quality photos

Risk levels:
0-30: Low risk → Auto-approve (fast track)
31-60: Medium risk → Manual review (normal queue)
61-80: High risk → Manual review (thorough investigation)
81-100: Very high risk → Auto-reject or request more proof

Action based on score:
Low risk: Approve within 2 hours
Medium risk: Review within 24 hours
High risk: Review within 48 hours + request additional docs
Very high risk: Immediate rejection + notify fraud team
```

---

#### **Step 3.2: Manual Review Process (24-48 hours)**

**Human Reviewer Checklist:**

```
Reviewer sees:
□ All submitted information (form data)
□ All uploaded photos (gallery view)
□ Ownership document (PDF viewer)
□ OCR extracted text (highlighted matching data)
□ Fraud risk score (color-coded)
□ Map showing exact pin location
□ User's account history (past bookings, reviews, verification status)
□ Comparison with nearby listings (similar spots in area)

Reviewer must verify:
1. Ownership Document Authenticity:
   □ Document appears genuine (not edited/forged)
   □ Document shows user's name clearly
   □ Document shows listed address clearly
   □ Document is recent (within 24 months)
   □ Document type appropriate (property tax, lease, permission letter)
   
   IF lease agreement:
   □ Check for subletting clause
   □ If no clause, check for landlord permission letter
   
   IF permission letter:
   □ Verify landlord contact info provided
   □ Consider calling landlord to confirm (for high-risk cases)

2. Photos Match Description:
   □ Photos show actual parking space (not stock images)
   □ Photos match spot type claimed (garage vs driveway vs street)
   □ Photos show amenities claimed (covered, lit, camera, etc.)
   □ Photos appear recent (weather, seasons match)
   □ No signs of photo manipulation (editing, filters)

3. Location Accuracy:
   □ Address is specific and valid
   □ Map pin is in reasonable location (not water, highway, etc.)
   □ Street View check (if available): Confirm building exists
   □ Cross-reference: Check if spot already listed by someone else

4. Pricing Reasonableness:
   □ Price is competitive with area (not suspiciously low/high)
   □ Premium features justify premium price
   □ Not price gouging (€50/hour would be rejected)

5. Listing Quality:
   □ Title and description are detailed and helpful
   □ No prohibited content (contact info, external links)
   □ Professional presentation
   □ Availability settings reasonable

6. Overall Legitimacy:
   □ Everything adds up (no contradictions)
   □ User seems legitimate (verified identity)
   □ Spot seems genuine and accessible
   □ No red flags
```

**Reviewer Actions:**

```
Option 1: APPROVE
→ Listing goes live immediately
→ Visible to all renters
→ Host notified: "Your listing is now active!"
→ Send tips email: "How to get your first booking"

Option 2: REQUEST MORE INFO
→ Listing remains "Pending"
→ Message to host with specific request:
  Examples:
  - "Please upload clearer photo of spot number"
  - "Please provide landlord permission letter"
  - "Please clarify access instructions"
→ Host has 7 days to respond
→ If no response: Auto-reject
→ If responds: Re-enter review queue

Option 3: REJECT
→ Listing not approved
→ Detailed rejection reason sent to host:
  Examples:
  - "Ownership document does not show your name"
  - "Photos appear to be from another property"
  - "Address could not be verified"
→ Host can resubmit with corrections
→ Flag account if repeated rejections (fraud prevention)

Option 4: ESCALATE TO FRAUD TEAM
→ If serious concerns (fake documents, stolen photos, etc.)
→ Fraud team investigates deeply
→ May contact user for phone interview
→ May suspend account pending investigation
```

---

#### **Step 3.3: Post-Approval Monitoring**

**After listing is approved and active:**

**First 30 Days (Probation Period):**
```
Monitor for:
1. Booking activity:
   - If 0 bookings in 30 days → Send tips to improve listing
   - If 5+ bookings in first week → Possible fraud (too good to be true?)

2. Cancellations:
   - If host cancels >20% of bookings → Flag for review
   - If renters report "spot doesn't exist" → Immediate investigation

3. Reviews:
   - If first 3 reviews are negative → Re-review listing
   - If complaints about "not as described" → Require updated photos

4. No-shows:
   - If multiple renters report "couldn't access spot" → Contact host
   - If access code doesn't work → Verify with host

Action if issues detected:
→ Warning to host (explain problem, request fix)
→ Pause listing temporarily (until resolved)
→ Remove listing permanently (if fraud confirmed)
→ Suspend account (if serious violations)
```

**Ongoing Monitoring:**
```
1. Duplicate listing detection:
   - Run weekly check: Is this same spot listed by another user?
   - If duplicate found: Contact both users, keep only legitimate one

2. Inactive listings:
   - If 0 bookings in 90 days → Email host: "Update your listing?"
   - If 0 bookings in 180 days → Auto-pause listing
   - If host doesn't reactivate in 30 days → Archive listing

3. Price monitoring:
   - If host suddenly increases price 200%+ → Review for price gouging
   - If price is now far below market → Check if account compromised

4. Review score:
   - If rating drops below 3.5 stars → Quality review
   - If consistent complaints → Require improvements or delist

5. Legal compliance:
   - Periodic re-verification of ownership (every 12 months)
   - Request updated documents if original expired
```

---

### **PHASE 4: LISTING MANAGEMENT (POST-PUBLICATION)**

---

#### **Step 4.1: Host Dashboard**

**What host sees after listing is approved:**

```
Listing Status: ✅ Active

Quick Stats:
- Views this week: 47
- Booking requests: 3
- Accepted bookings: 2
- Earnings this month: €120
- Average rating: 4.8 ⭐ (5 reviews)

Actions:
[Edit Listing] [Pause Listing] [View Bookings] [Calendar] [Insights]

Recent Activity:
- New booking: Marie R. - Tomorrow 2pm-6pm (€24)
- Booking request: Jean D. - Friday 9am-5pm (Pending your response)
- Review received: ⭐⭐⭐⭐⭐ "Perfect spot, easy access!"
```

---

#### **Step 4.2: Edit Listing Capability**

**What host can edit:**

```
ANYTIME (No re-approval needed):
✅ Photos (add, remove, reorder)
✅ Pricing (hourly, daily, weekly rates)
✅ Availability (block/unblock dates)
✅ Description text
✅ House rules
✅ Access instructions
✅ Amenities (add/remove features)

REQUIRES RE-APPROVAL:
⚠ Address/Location (triggers new verification)
⚠ Ownership document (triggers new verification)
⚠ Spot type (garage → driveway requires proof)

CANNOT EDIT:
❌ Host name (tied to verified ID)
❌ Past bookings (historical data locked)
❌ Past reviews (immutable)
```

**Edit flow:**
```
1. Host clicks "Edit Listing"
2. Form pre-filled with current data
3. Host makes changes
4. If changes require re-approval:
   → Show warning: "These changes require verification. Listing will be paused during review."
   → Confirm or cancel
5. If no re-approval needed:
   → Changes save instantly
   → Listing updated immediately
6. Notify renters with pending bookings if relevant changes made
```

---

#### **Step 4.3: Pause/Unpause Listing**

**Reasons to pause:**
- Host going on vacation (2 weeks)
- Spot temporarily unavailable (construction, repairs)
- Host wants break from rentals
- Need time to update listing

**Pause flow:**
```
Host clicks "Pause Listing"

Options:
○ Pause indefinitely (until I unpause)
○ Pause for specific dates (select date range)

Warning shown:
"While paused:
- Listing won't appear in search
- No new bookings accepted
- Existing bookings honored
- You can unpause anytime"

Confirm pause → Listing status: ⏸ Paused

Unpause:
Click "Reactivate Listing"
Listing goes live immediately (if previously approved)
```

---

#### **Step 4.4: Delete Listing**

**Delete flow:**
```
Host clicks "Delete Listing"

Warning shown:
"Are you sure you want to delete this listing?

⚠ This action cannot be undone.

Consequences:
- Listing removed from search immediately
- Future bookings will be cancelled (with full refund)
- Past booking history preserved
- Reviews remain visible on your profile
- You can create a new listing anytime"

Confirm or Cancel

If confirmed:
1. Cancel all future bookings (auto-refund renters)
2. Email renters: "This spot is no longer available"
3. Mark listing as "Deleted" in database (don't actually delete - keep for records)
4. Remove from public view
5. Archive in host's account (can view history)
```

---

### **PHASE 5: EDGE CASES & SPECIAL SCENARIOS**

---

#### **Edge Case 1: Host Doesn't Own Property (Tenant)**

**Scenario:** User rents an apartment and wants to list the included parking spot.

**Solution:**
```
1. Upload rental lease agreement (bail d'habitation)
2. Check lease for subletting clause:
   
   IF lease allows subletting:
   → Approve immediately
   
   IF lease silent on subletting:
   → Require "Landlord Permission Letter"
   → Template provided:
     "I, [Landlord Name], owner of [Address], hereby give permission to
      [Tenant Name] to rent out the parking space included with their rental
      unit for short-term use via ParkingPal platform."
   → Must include landlord's signature and contact info
   → ParkingPal may contact landlord to verify (spot checks)
   
   IF lease prohibits subletting:
   → Reject listing
   → Explain: "Your lease does not allow subletting. Please contact your landlord."
```

---

#### **Edge Case 2: Shared Driveway / Multiple Owners**

**Scenario:** Driveway shared between 2-3 neighbors, user wants to list their portion.

**Solution:**
```
1. Require "Co-owner Consent Letter"
   → All co-owners must sign
   → Letter states: "We consent to [User] renting parking space in shared driveway"
   
2. Diagram/Photo showing:
   → Which portion user controls
   → Clear boundaries (painted lines, markers)
   
3. Access considerations:
   → Other residents must be able to access their portions
   → No blocking shared entrance
   
4. House rules must state:
   → "Do not block driveway entrance"
   → "Respect neighbors' access at all times"
   
5. Higher scrutiny during review (more likely to cause disputes)
```

---

#### **Edge Case 3: Multiple Spots in Same Location**

**Scenario:** Host owns building with 5 parking spots, wants to list all.

**Solution:**
```
1. Allow multiple listings under same account
2. Each spot must have:
   → Unique photos (showing spot number A, B, C, etc.)
   → Unique description (Spot A vs Spot B)
   → Separate availability calendars
   
3. Verification:
   → Single ownership document covers all spots OR
   → Detailed property deed showing # of parking spaces owned
   
4. Simplified management:
   → "Duplicate Listing" feature
   → Copy most settings, just change spot number and photos
   → Bulk calendar management (block all spots for vacation)
   
5. Prevent double-booking:
   → System tracks bookings across all host's listings
   → Can't book overlapping times if host needs to be present for access
```

---

#### **Edge Case 4: Street Parking with Resident Permit**

**Scenario:** Host has resident parking permit, wants to rent "their" street spot.

**Solution:**
```
⚠ HIGH RISK - Street parking is not controlled by host

1. Require proof of resident permit:
   → Upload permit (photo)
   → Show permit number and expiry date
   
2. Require signed acknowledgment:
   "I understand:
   ☐ I do not own this public street parking space
   ☐ I cannot guarantee availability (someone else might park there)
   ☐ Renters park at their own risk
   ☐ ParkingPal is not responsible if spot is occupied
   ☐ I will refund renters if spot is unavailable"
   
3. Special listing disclosure:
   → Badge: "⚠ Public Street Parking"
   → Clear warning to renters:
     "This is public street parking. Availability not guaranteed.
      Host will refund if spot is occupied on arrival."
   
4. Reduced approval rate:
   → Only approve if:
     - Host has excellent reviews (4.8+)
     - Host willing to refund if unavailable
     - Street has low occupancy (not always full)
     
5. Consider NOT allowing street parking listings at launch:
   → Too risky, too many potential disputes
   → Revisit later once platform is established
```

**Recommendation:** Reject street parking listings in Phase 1 (MVP). Allow only private property.

---

#### **Edge Case 5: Parking Spot is Already Listed by Someone Else**

**Scenario:** Duplicate listing detected (same address, same spot).

**Investigation process:**
```
1. Alert fraud team: "Potential duplicate listing detected"

2. Compare both listings:
   - Photos (same photos = one is fake)
   - Ownership docs (which is legitimate?)
   - User verification status
   - Account history
   
3. Contact both users:
   - "We've detected a listing for [Address] already exists."
   - "Please provide additional proof of ownership"
   
4. Determine legitimate owner:
   - Whichever has stronger ownership proof
   - Whichever listed first (if both equal proof)
   
5. Action:
   - Approve legitimate listing
   - Reject duplicate listing
   - Suspend fraudulent account if intentional fraud
   
6. Prevent future:
   - Hash address during listing creation
   - Check if hash already exists in database
   - If exists: Show warning before allowing submission
```

---

#### **Edge Case 6: Host Changes Ownership (Sold Property)**

**Scenario:** Host sells property mid-listing. New owner wants to take over listing.

**Process:**
```
1. Old host must:
   → Delete or transfer listing
   → Cancel all future bookings (with refund)
   → Notify ParkingPal of ownership change
   
2. New owner must:
   → Create new account (or use existing)
   → Submit new listing with new ownership document
   → Go through full verification again
   
3. Do NOT allow "transfer" of listings:
   → Too risky (could transfer to anyone)
   → Each owner must verify independently
   
4. Handle active bookings:
   → Contact renters: "Ownership changed. Booking cancelled with full refund."
   → Offer alternative: "Similar spot nearby available"
```

---

#### **Edge Case 7: Temporary Event Parking (One-Time Use)**

**Scenario:** Host has large event (wedding, party), wants to rent neighbor's driveway for just that day.

**Solution:**
```
Option A: Don't allow one-time listings
→ Minimum listing period: 30 days
→ Prevents spam and low-quality listings

Option B: Create "Event Parking" category (future)
→ Special verification process
→ Higher commission (30% vs 20%)
→ Require event proof (invitation, venue booking)
→ More flexible ownership requirements
→ One-day or weekend-only listings allowed

Recommendation: Reject one-time listings in MVP. Require minimum 30-day availability.
```

---

### **PHASE 6: ANTI-FRAUD MEASURES SUMMARY**

**Multi-Layer Fraud Prevention:**

```
Layer 1: User Verification (Before Listing)
✅ Email verified
✅ Phone verified
✅ ID verified
→ Reduces anonymous fraud

Layer 2: Ownership Proof (During Listing)
✅ Upload property tax bill, lease, or permission letter
✅ OCR extracts name and address
✅ Manual human review
→ Confirms legal right to rent

Layer 3: Photo Verification (During Listing)
✅ GPS metadata check (photos taken at location)
✅ Reverse image search (not stock photos)
✅ AI content analysis (shows actual parking spot)
✅ Quality check (not blurry/dark)
→ Proves spot exists and matches description

Layer 4: Risk Scoring (Automated)
✅ Algorithm calculates fraud risk (0-100)
✅ High-risk listings get extra scrutiny
✅ Very high-risk auto-rejected
→ Prioritizes reviewer time

Layer 5: Manual Review (Human)
✅ Trained reviewer checks all evidence
✅ Can request additional documents
✅ Can reject if suspicious
→ Final human judgment

Layer 6: Post-Approval Monitoring (Ongoing)
✅ Track first bookings (detect fake listings)
✅ Monitor reviews (catch "spot doesn't exist")
✅ Check for duplicates (prevent double-listing)
✅ Re-verify ownership annually
→ Catches fraud that slipped through

Layer 7: Renter Feedback (Community)
✅ Renters report if spot not as described
✅ Reviews flag issues
✅ No-show reports trigger investigation
→ Crowdsourced fraud detection

Result: 95%+ fraud prevention rate
```

---

## 🎯 IMPLEMENTATION CHECKLIST

### **Backend Requirements:**

**Database (Add to existing schema):**
- [ ] Create `spots` table with all fields
- [ ] Create `spot_photos` table (one-to-many relationship)
- [ ] Create `spot_documents` table (ownership proofs)
- [ ] Create `spot_availability` table (calendar data)
- [ ] Create `spot_reviews` table (linked to bookings)
- [ ] Add indexes for performance (location, price, availability)

**API Endpoints (11 new endpoints):**
- [ ] `POST /api/spots` - Create new listing
- [ ] `GET /api/spots/:id` - Get spot details
- [ ] `PUT /api/spots/:id` - Update listing
- [ ] `DELETE /api/spots/:id` - Delete listing
- [ ] `POST /api/spots/:id/pause` - Pause listing
- [ ] `POST /api/spots/:id/activate` - Activate listing
- [ ] `POST /api/spots/:id/photos` - Upload photos
- [ ] `DELETE /api/spots/:id/photos/:photoId` - Delete photo
- [ ] `POST /api/spots/:id/documents` - Upload ownership doc
- [ ] `GET /api/spots/my-listings` - Host's all listings
- [ ] `GET /api/spots/search` - Search spots (for renters)

**File Upload Service:**
- [ ] Photo upload handler (Multer)
- [ ] Document upload handler (PDF, images)
- [ ] Image processing (resize, compress, watermark)
- [ ] Storage (local or AWS S3)
- [ ] EXIF data extraction (GPS coordinates)

**Verification Services:**
- [ ] OCR service (extract text from documents) - Tesseract or Google Vision API
- [ ] Reverse image search integration - TinEye API
- [ ] AI image analysis - AWS Rekognition or Google Vision
- [ ] Fraud risk scoring algorithm
- [ ] Manual review queue system

**Geocoding Integration:**
- [ ] Address → Coordinates (Nominatim)
- [ ] Coordinates → Address (reverse geocoding)
- [ ] Distance calculations (haversine formula)
- [ ] Map integration (for pin placement)

**Email Notifications:**
- [ ] Listing submitted (to host)
- [ ] Listing approved (to host)
- [ ] Listing rejected (to host with reason)
- [ ] Request for more info (to host)
- [ ] Tips for first listing (to host)

### **Frontend Requirements:**

**New Screens (9 screens):**
- [ ] List Spot Intro (eligibility check, terms)
- [ ] Location & Address
- [ ] Ownership Verification (document upload)
- [ ] Spot Details & Characteristics
- [ ] Photos Upload (multi-image picker)
- [ ] Amenities & Features
- [ ] Pricing Strategy
- [ ] Availability & Calendar
- [ ] House Rules & Policies
- [ ] Description & Title
- [ ] Review & Submit
- [ ] Listing Management Dashboard
- [ ] Edit Listing

**Components:**
- [ ] Multi-step form with progress bar
- [ ] Image upload with preview
- [ ] Document upload (PDF viewer)
- [ ] Interactive map (OSM with pin placement)
- [ ] Calendar picker (availability)
- [ ] Price calculator (hourly, daily, weekly)
- [ ] Amenities checklist
- [ ] Photo gallery (drag to reorder)

**Validation:**
- [ ] Real-time form validation (Zod/Joi)
- [ ] Photo quality checks (size, format, resolution)
- [ ] GPS extraction from photos
- [ ] Address geocoding
- [ ] All required fields enforced

### **Admin Panel Requirements:**

**Review Dashboard:**
- [ ] Queue of listings pending review
- [ ] Filter by risk score (high, medium, low)
- [ ] Sort by submission date
- [ ] Reviewer assignment system

**Review Interface:**
- [ ] Display all listing data
- [ ] Photo gallery viewer
- [ ] Document viewer (PDF)
- [ ] OCR results display
- [ ] Map with pin location
- [ ] Fraud risk score (color-coded)
- [ ] Actions: Approve, Reject, Request Info, Escalate

**Fraud Detection:**
- [ ] Duplicate listing detector
- [ ] Risk scoring dashboard
- [ ] Fraud alerts (suspicious patterns)
- [ ] Account suspension tools

**Analytics:**
- [ ] Listings created per day
- [ ] Approval rate
- [ ] Average review time
- [ ] Rejection reasons (top 5)
- [ ] Fraud attempts blocked

---

## 🚀 SUCCESS CRITERIA

The "List Your Spot" feature is complete when:

**Functionality:**
- [ ] User can create listing in 10-15 minutes
- [ ] All validation rules enforced
- [ ] Ownership verification working (OCR + manual review)
- [ ] Photo verification working (GPS, duplicates, quality)
- [ ] Fraud risk scoring accurate
- [ ] Manual review queue functional
- [ ] Listings approved within 24-48 hours
- [ ] Host can edit/pause/delete listings
- [ ] Email notifications sent correctly

**Quality:**
- [ ] 95%+ of legitimate listings approved
- [ ] <5% fraud rate (fake listings)
- [ ] <10% rejection rate (legitimate users blocked)
- [ ] Average review time <24 hours
- [ ] Clear error messages when rejected
- [ ] Professional, trustworthy UX

**Security:**
- [ ] Cannot list without verified identity
- [ ] Cannot list without ownership proof
- [ ] Cannot use stock photos
- [ ] Cannot list duplicate spots
- [ ] All sensitive documents encrypted
- [ ] GDPR compliant (data storage, deletion)

---

## 🎬 IMPLEMENTATION ORDER

**Week 1: Database & Backend Foundation**
- Day 1-2: Database schema (spots, photos, documents tables)
- Day 3-4: API endpoints (create, read, update, delete)
- Day 5: File upload service (photos, documents)

**Week 2: Verification Systems**
- Day 1-2: OCR integration (document text extraction)
- Day 3: Photo verification (GPS, reverse search, AI)
- Day 4: Fraud risk scoring algorithm
- Day 5: Manual review queue system

**Week 3: Frontend (Part 1)**
- Day 1-2: Multi-step form structure
- Day 3-4: Location & ownership screens
- Day 5: Photo upload screens

**Week 4: Frontend (Part 2)**
- Day 1-2: Pricing, availability, amenities screens
- Day 3-4: Description, rules, review screens
- Day 5: Listing management dashboard

**Week 5: Admin Panel**
- Day 1-3: Review dashboard and interface
- Day 4-5: Testing and refinements

**Week 6: Testing & Launch**
- Day 1-2: End-to-end testing
- Day 3: Security audit
- Day 4: Beta test with 10 real hosts
- Day 5: Fix issues, prepare for launch

---

## 💡 FINAL NOTES

**This is a HIGH-STAKES feature.** Fraud here can:
- Destroy user trust
- Lead to lawsuits
- Damage brand reputation
- Get platform shut down

**Invest heavily in verification.**
- Better to over-verify than under-verify
- Reject suspicious listings (protect renters)
- Build trust slowly and carefully

**Start conservative, loosen later:**
- Launch with strict verification (property tax only)
- Expand to leases + permission letters after proving system works
- Never allow street parking in Phase 1

**Monitor obsessively:**
- First 100 listings: Manual review every single one
- First 1000 bookings: Check for "spot doesn't exist" complaints
- Adjust fraud scoring based on real data

**Success = Zero fraud incidents in first 3 months.** 🎯

Now build it! 🚀
