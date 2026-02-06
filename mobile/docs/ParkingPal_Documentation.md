# ParkingPal - Complete App Documentation

## Table of Contents
1. [App Overview](#app-overview)
2. [Core Concept](#core-concept)
3. [User Types](#user-types)
4. [Key Features](#key-features)
5. [User Scenarios](#user-scenarios)
6. [Detailed User Flows](#detailed-user-flows)
7. [Feature Specifications](#feature-specifications)
8. [Business Logic](#business-logic)
9. [Technical Requirements](#technical-requirements)

---

## App Overview

**ParkingPal** is a peer-to-peer parking space rental marketplace that connects people who need parking (Renters) with people who have available parking spaces (Hosts). Think of it as "Airbnb for parking spots."

### The Problem
- Finding parking in dense French cities (Paris, Lyon, Marseille) is extremely difficult and expensive
- Public parking lots charge €4-8/hour, with event parking costing €20-30
- Drivers waste 15-25 minutes circling for spots, burning fuel and causing frustration
- Meanwhile, thousands of private driveways, garages, and parking spaces sit empty during work hours

### The Solution
ParkingPal allows anyone with an unused parking spot to rent it out by the hour, while drivers can find and book affordable, convenient parking near their destination through a mobile app.

### Value Proposition
**For Renters:**
- Save money (typically 30-50% cheaper than public parking)
- Save time (no more circling for spots)
- Guaranteed parking (book in advance)
- More convenient locations (closer to destinations)

**For Hosts:**
- Passive income (€400-800/month from empty spots)
- No effort required (automated bookings and payments)
- Complete control (set your own prices and availability)
- Safe and secure (verified users, ratings, optional insurance)

---

## Core Concept

### How It Works

**For Hosts (Spot Owners):**
1. List your parking spot (driveway, garage, reserved space)
2. Add photos, set your price, and define availability
3. Receive bookings automatically or approve requests
4. Get paid automatically after each booking
5. Earn passive income while your spot would otherwise sit empty

**For Renters (Drivers):**
1. Search for parking near your destination
2. See available spots on a map with prices and ratings
3. Book instantly or reserve in advance
4. Get access instructions and directions
5. Park, pay automatically, and leave a review

### Business Model
- **Commission:** 15-20% service fee on each transaction
- **Insurance:** Optional damage protection (€1-3 per booking)
- **Premium Features:** Subscriptions for hosts and frequent renters (future)
- **Featured Listings:** Hosts can pay to appear at top of search (future)

---

## User Types

### 1. Renter (Driver)
**Primary Goal:** Find affordable, convenient parking quickly

**Characteristics:**
- Needs parking occasionally or regularly
- Values time and money
- Uses smartphone for navigation and payments
- May be commuter, shopper, event-goer, or tourist

**Pain Points:**
- Can't find parking near destination
- Wastes time circling
- Pays high parking fees
- Uncertain about availability

### 2. Host (Spot Owner)
**Primary Goal:** Earn passive income from unused parking space

**Characteristics:**
- Owns driveway, garage, or reserved parking space
- Space is empty during certain hours (work, travel, etc.)
- Wants easy, hands-off income
- Concerned about safety and reliability

**Pain Points:**
- Asset (parking spot) generates no income
- Worried about strangers, damage, liability
- Doesn't want hassle of manual coordination
- Needs simple payment system

---

## Key Features

### Core Features (MVP)

#### For Renters:
1. **Interactive Map Search** - See available spots in real-time on a map
2. **Spot Discovery** - Filter by price, distance, amenities, vehicle size
3. **Instant Booking** - Reserve spots with one tap
4. **In-App Navigation** - Get directions to your spot
5. **Secure Payments** - Pay automatically with saved card
6. **Access Instructions** - Get entry codes/instructions when booking
7. **Booking Management** - View active, upcoming, and past bookings
8. **Reviews & Ratings** - Read and write reviews
9. **Favorites** - Save frequently used spots
10. **Push Notifications** - Booking confirmations, reminders, messages

#### For Hosts:
1. **Easy Listing Creation** - Add spot in 5 minutes with photos
2. **Flexible Pricing** - Set hourly, daily, weekly rates
3. **Calendar Management** - Block off times when spot is unavailable
4. **Automated Bookings** - Accept bookings automatically or manually approve
5. **Earnings Dashboard** - Track income in real-time
6. **Automatic Payouts** - Receive money directly to bank account
7. **Guest Messaging** - Communicate with renters
8. **Performance Analytics** - See booking trends, earnings by period
9. **Multiple Listings** - List multiple spots from one account
10. **Booking Management** - View and manage all reservations

#### For Both:
1. **User Profiles** - Build reputation with ratings and reviews
2. **Identity Verification** - ID upload for trust and safety
3. **In-App Messaging** - Communicate securely
4. **Support Center** - Help articles and contact support
5. **Cancellation Policies** - Flexible, moderate, or strict options
6. **Insurance Options** - Optional damage protection

### Advanced Features (Future Releases)
- Dynamic pricing (surge during events)
- Monthly subscriptions (unlimited bookings, no fees)
- Corporate accounts (businesses listing multiple spots)
- API for parking partners (malls, stadiums, etc.)
- EV charging coordination
- Parking pass for regular commuters
- Referral program
- Multi-city expansion

---

## User Scenarios

### Scenario 1: First-Time Renter - Concert in Paris

**Character:** Sophie, 28, from suburbs of Paris  
**Goal:** Park near Stade de France for a concert tonight  
**Challenge:** Concert parking costs €25 and lots fill up quickly

**Journey:**
1. **Discovery (2:00 PM, day of concert)**
   - Sophie googles "parking near Stade de France"
   - Finds ParkingPal in results, downloads app
   - Signs up with Google account (30 seconds)

2. **Search (2:05 PM)**
   - Opens app, sees map view
   - Types "Stade de France" in search
   - Sees 12 available spots within 500m
   - Filters: "Available 6pm-11pm tonight"

3. **Discovery (2:07 PM)**
   - Browses spot details
   - Finds "Driveway 300m from stadium - €8/hour"
   - Sees photos, 4.9★ rating, "Superhost" badge
   - Reads reviews: "Perfect for concerts, easy walk"

4. **Booking (2:10 PM)**
   - Taps "Book Now"
   - Selects time: 6:00 PM - 11:00 PM (5 hours)
   - Adds her vehicle (Renault Clio, license plate)
   - Adds payment card
   - Reviews total: €40 (vs €25 at stadium but guaranteed spot)
   - Adds insurance for €2 (peace of mind)
   - Confirms booking: Total €42

5. **Confirmation (2:11 PM)**
   - Receives instant confirmation
   - Gets push notification
   - Email with booking details and receipt
   - Saves spot to favorites for future concerts

6. **Pre-Arrival (5:30 PM)**
   - Gets reminder: "Your booking starts in 30 minutes"
   - Reviews access instructions: "Gate code: 4523#, park on right side"
   - Taps "Navigate to Spot" - opens Google Maps

7. **Arrival (6:15 PM)**
   - Finds spot easily with navigation
   - Enters gate code 4523#
   - Parks in designated area
   - Takes arrival photo in app (for insurance)
   - Locks car and walks to concert

8. **During Event**
   - Enjoys concert worry-free
   - Gets notification at 10:30 PM: "Your booking ends in 30 minutes"
   - Taps "Extend Booking +1 hour" for €8 (concert running late)

9. **Departure (11:20 PM)**
   - Returns to car
   - Takes departure photo in app
   - Taps "End Booking"
   - Automatic payment processed

10. **Post-Booking (Next Day)**
    - Receives prompt: "How was your experience?"
    - Leaves 5★ review: "Perfect spot, easy access, will use again!"
    - Host also rates Sophie 5★
    - Sophie now has verified rating for future bookings

**Outcome:** Sophie saved time and stress, got guaranteed parking, and will use ParkingPal for every future concert. Total time from discovery to booking: 11 minutes.

---

### Scenario 2: Regular Renter - Daily Commuter

**Character:** Marc, 35, works in central Paris, lives in suburbs  
**Goal:** Park near office Monday-Friday for work  
**Challenge:** Monthly parking garage costs €320/month

**Journey:**
1. **Initial Discovery (Sunday Evening)**
   - Marc searches for cheaper parking options
   - Downloads ParkingPal, signs up
   - Searches "parking near 15 Rue de la Paix" (his office)
   - Finds garage spot: "Mon-Fri, 8am-6pm, €5/hour"
   - Books for Monday as a test

2. **First Week (Monday)**
   - Parks at booked spot (8am-6pm = 10 hours = €50)
   - Loves the convenience and savings
   - Tuesday: Rebooks same spot
   - Wednesday: Adds spot to "Favorites"
   - Thursday: Notices "Book weekly for 10% discount"
   - Friday: Books next week in advance (Mon-Fri)

3. **Ongoing Usage**
   - Receives weekly booking: Mon-Fri, 8am-6pm = €225/week
   - Saves €95/month vs monthly garage (€225/week × 4 = €900/month vs €1,280)
   - Actually saves €380/month vs monthly garage (€900 vs €1,280)
   - Builds relationship with host via messages
   - Gets "Verified Renter" badge after 10 bookings
   - Leaves parking spot key feedback in review

4. **Long-Term (3 Months Later)**
   - Marc has 60+ bookings, 5.0★ rating
   - Gets email: "Try ParkingPal Premium - €9.99/month for 15% off all bookings"
   - Calculates: 15% off €900 = saves €135/month, pays €10 = net €125/month extra savings
   - Subscribes to Premium
   - Now saves €505/month total vs original garage

**Outcome:** Marc found a regular, affordable parking solution, saves €6,000/year, and became a loyal user. Host earns consistent €720/month passive income.

---

### Scenario 3: First-Time Host - Unused Driveway

**Character:** Marie, 42, homeowner in Le Marais, Paris  
**Goal:** Earn extra income from driveway she doesn't use during workday  
**Challenge:** Driveway sits empty 9am-6pm Monday-Friday while she's at office

**Journey:**
1. **Discovery (Saturday Morning)**
   - Marie sees Facebook ad: "Earn €500/month from your empty driveway"
   - Clicks through, downloads ParkingPal
   - Signs up, selects "I have a spot to rent"
   - Sees tutorial: "List your spot in 5 minutes"

2. **Listing Creation (Saturday 10:00 AM)**
   - Step 1: Enters address, pins exact location on map
   - Step 2: Takes 5 photos (entrance, driveway, street view, signage)
   - Step 3: Describes spot
     - Type: Driveway
     - Fits: Sedan, SUV
     - Amenities: Covered, Well-lit
   - Step 4: Access instructions
     - "Gate code is 1234, park on left side next to blue door"
     - Access type: Gate code (no key exchange needed)
   - Step 5: Pricing
     - App suggests: €6/hour based on location
     - Marie sets: €5/hour (slightly below to attract first renters)
     - Daily rate: €35 (for 8+ hours)
   - Step 6: Availability
     - Sets: Monday-Friday, 9:00 AM - 6:00 PM
     - Blocks next Friday (doctor appointment)
   - Step 7: Description & Rules
     - Title: "Secure Driveway in Heart of Le Marais"
     - Description: "Quiet residential street, 2 min walk to metro, perfect for daily commuters or shoppers"
     - Rules: "No loud music, no in-and-out privileges, must vacate by 6pm"
   - Step 8: Review & Publish
     - Previews how listing will appear
     - Taps "Publish Listing"

3. **First Booking (Sunday, Next Day)**
   - Gets notification: "New booking request!"
   - Renter: Thomas, 4.8★, wants Monday 9am-5pm
   - Marie reviews his profile, sees good ratings
   - Approves booking
   - Sends welcome message: "Hi Thomas! Looking forward to hosting you. Gate code is 1234, park on the left. Let me know if you have any questions!"

4. **First Experience (Monday)**
   - 8:45 AM: Gets notification "Thomas checked in"
   - Thomas parks, no issues
   - 5:00 PM: Gets notification "Thomas checked out"
   - Thomas leaves 5★ review: "Perfect spot, Marie was very responsive!"
   - Marie rates Thomas 5★
   - Earnings show: €40 (8 hours × €5)
   - Marie feels confident, successful first booking

5. **Growing Confidence (Week 1)**
   - Gets 3 more bookings during the week
   - All smooth experiences
   - Earns €160 first week
   - Enables "Instant Booking" (no longer requires approval)
   - Realizes she doesn't need to do anything - it's automated

6. **Optimization (Week 2)**
   - Notices high demand
   - Raises price to €6/hour
   - Still getting bookings
   - Adds weekend availability for extra income
   - Gets "Superhost" badge after 5 bookings with 4.9★ average

7. **Ongoing Success (Month 1)**
   - 45 bookings in first month
   - Total earnings: €620
   - After ParkingPal's 20% fee: €496 in her account
   - Time spent: ~30 minutes total for month (just checking app occasionally)
   - Zero customer service issues (all handled through app)

8. **Expansion (Month 3)**
   - Marie tells her neighbor about success
   - Neighbor also lists their garage
   - Marie considers listing her second parking spot (for her second car she rarely uses)
   - Now earning €800-900/month from both spots
   - Uses extra income for family vacations

**Outcome:** Marie turned an unused asset into €6,000-10,000/year passive income with minimal effort. She's now a ParkingPal advocate, referring friends.

---

### Scenario 4: Event Parking - Football Match

**Character:** Luc, 25, going to PSG match at Parc des Princes  
**Goal:** Park near stadium without paying €30 in official lot  
**Challenge:** Official parking sold out, street parking impossible on game day

**Journey:**
1. **Search (Game Day, 3 Hours Before)**
   - Luc opens ParkingPal (he's used it before for concerts)
   - Searches "Parc des Princes"
   - Filters: Available today 6:00 PM - 11:00 PM
   - Sees surge pricing notification: "High demand - prices 50% higher"

2. **Decision Making**
   - Compares options:
     - Garage 800m away: €12/hour (€60 total) - still cheaper than official €30 but far
     - Driveway 300m away: €10/hour (€50 total) - better location
     - Apartment spot 150m away: €15/hour (€75 total) - closest but expensive
   - Chooses driveway at €10/hour (€50 total for 5 hours)

3. **Booking & Arrival**
   - Books spot, gets access code
   - Arrives 90 minutes before match
   - Easy access, parks quickly
   - 5-minute walk to stadium
   - Watches match stress-free

4. **Extension During Match**
   - Match goes to extra time
   - Gets notification: "Booking ends in 15 minutes"
   - Extends for 1 more hour (+€10)
   - Total cost: €60 vs €30 official but guaranteed spot

5. **Post-Match**
   - Leaves 5★ review
   - Host thanks him for business
   - Luc saves this spot for next PSG match
   - Sets calendar reminder to book early next time for better price

**Outcome:** Luc got guaranteed parking close to stadium, avoided the stress of circling, and will use ParkingPal for every match going forward.

---

### Scenario 5: Tourist - Weekend in Paris

**Character:** Emma, 30, from London, visiting Paris for weekend  
**Goal:** Park near hotel for 2 nights  
**Challenge:** Hotel parking is €45/night (€90 total)

**Journey:**
1. **Pre-Trip Planning (Thursday)**
   - Emma googles "cheap parking Paris near Eiffel Tower"
   - Finds ParkingPal, reads reviews
   - Downloads app, browses without signing up
   - Sees garage near her hotel: €8/hour or €50/day
   - Calculates: 2 days = €100 vs €90 at hotel... not worth it yet

2. **Arrival Day (Friday Evening)**
   - Emma arrives in Paris, hotel parking full (!!)
   - Front desk says "try public lot 1km away - €40/night"
   - Emma opens ParkingPal, signs up quickly
   - Searches near hotel
   - Finds covered garage 200m away: €35/day
   - Books Friday-Sunday (2 nights = €70)

3. **Booking Experience**
   - Adds UK credit card (accepted)
   - Adds vehicle details (UK license plate)
   - Gets access: "Underground garage, space #12, access code 5678"
   - Drives to garage, easy entry
   - Parks in assigned spot
   - Takes arrival photo

4. **During Stay**
   - Car safely parked for 48 hours
   - No need to move it
   - Convenient location for hotel
   - Peace of mind (covered, secure)

5. **Departure (Sunday)**
   - Retrieves car easily
   - Takes departure photo
   - Automatic payment processed
   - Leaves 5★ review in English
   - Saves €20 vs hotel parking

**Outcome:** Emma solved an unexpected problem, saved money, and will recommend ParkingPal to friends visiting Paris.

---

### Scenario 6: Problem Resolution - Booking Conflict

**Character:** David (Renter) & Antoine (Host)  
**Situation:** David books spot, but Antoine's friend is already parked there  
**Goal:** Resolve issue quickly and fairly

**Journey:**
1. **The Problem (3:00 PM)**
   - David arrives at booked parking spot
   - Another car is already parked there
   - David is frustrated - he paid, he's late for meeting

2. **Initial Contact (3:02 PM)**
   - David opens app, taps "Contact Host"
   - Messages: "Hi, there's already a car in the spot. What should I do?"
   - Gets auto-response: "Antoine usually responds within 10 minutes"

3. **Host Response (3:05 PM)**
   - Antoine sees message, mortified
   - His friend parked there unexpectedly, didn't tell him
   - Antoine messages: "I'm so sorry! My friend parked there by mistake. Give me 5 minutes, I'll call him to move"
   - David: "I have a meeting in 20 minutes, I need to park now"

4. **Host Offers Solution (3:07 PM)**
   - Antoine: "I'm 2 blocks away. I can meet you and you can use MY parking spot instead - it's actually closer to downtown"
   - David: "That would be great, where?"
   - Antoine shares address, meets David in person
   - Shows him to his personal spot (better than original)

5. **Resolution (3:15 PM)**
   - David parks in Antoine's spot
   - Makes his meeting on time
   - Antoine profusely apologizes
   - Offers to refund 50% as apology

6. **Platform Resolution (3:30 PM)**
   - Antoine contacts ParkingPal support via app
   - Explains situation, says he wants to refund David 50%
   - Support: "We can see the messages. We'll process partial refund. Thanks for resolving quickly"
   - David receives €15 refund (50% of €30)

7. **Post-Resolution**
   - David still leaves 5★ review: "Had an issue but host went above and beyond to fix it immediately. Great communication!"
   - Antoine leaves 5★ for David: "Very understanding and patient"
   - Both users happy, issue resolved in 15 minutes
   - Support marks this as positive resolution

**Outcome:** Problem was resolved through good communication, host took responsibility, platform supported fair resolution. Both users remain active, trust in platform maintained.

---

### Scenario 7: Host Maximizing Earnings - Multi-Spot Owner

**Character:** Jean-Paul, 55, owns apartment building with 6 parking spots  
**Goal:** Maximize income from underutilized parking spots  
**Challenge:** Only 3 of 6 spots are rented to tenants long-term

**Journey:**
1. **Discovery & Setup (Month 1)**
   - Jean-Paul hears about ParkingPal from friend (Marie from Scenario 3)
   - Signs up, lists all 3 empty spots
   - Takes photos, writes descriptions
   - Sets pricing: €6/hour, €40/day
   - Sets availability: 24/7 for all spots

2. **Initial Success (Month 1)**
   - Gets 20 bookings first month across 3 spots
   - Earns €380 net (after fees)
   - Realizes weekend demand is highest
   - Adjusts pricing: €8/hour on weekends

3. **Optimization (Month 2)**
   - Analyzes earnings dashboard
   - Spot A (closest to metro): Always booked Mon-Fri
   - Spot B (largest): Booked mostly weekends (families with SUVs)
   - Spot C (furthest): Rarely booked
   - Adjusts strategies:
     - Spot A: Raises to €7/hour weekdays, offers weekly deals
     - Spot B: Markets as "Large space for SUVs/Vans" with photos
     - Spot C: Lowers to €4/hour to attract budget users

4. **Marketing (Month 3)**
   - Enables "Instant Book" on all spots
   - Takes professional photos
   - Adds amenities: "Well-lit, Security camera, Gate access"
   - Gets "Superhost" badge
   - Featured in ParkingPal's "Top Spots in 11th Arrondissement"

5. **Peak Performance (Month 4-6)**
   - Spot A: Regular commuter books Mon-Fri, 9am-6pm (€280/week = €1,120/month)
   - Spot B: Weekend warriors and event-goers (€400/month)
   - Spot C: Now busier with lower price (€200/month)
   - Total monthly earnings: €1,720 gross, €1,376 net
   - ROI: Spots cost him nothing (building already owned)

6. **Expansion (Month 7)**
   - One tenant moves out, frees up 4th spot
   - Jean-Paul doesn't re-rent long-term (was getting €150/month)
   - Lists on ParkingPal instead
   - Earns €400/month from that spot on ParkingPal
   - Now 4 spots earning €1,776/month net

7. **Premium Features (Month 12)**
   - Gets invited to "Property Manager" tier
   - Bulk management tools
   - Priority support
   - Featured listing discount
   - Annual revenue: €21,000+ from parking alone

**Outcome:** Jean-Paul turned unused parking spots into €21K/year passive income stream, equivalent to 1-2 additional apartments in rent. He's now referring other building owners to ParkingPal.

---

### Scenario 8: Edge Case - Last-Minute Cancellation

**Character:** Claire (Renter) has emergency  
**Situation:** Booked spot for 2pm-5pm, needs to cancel at 1:30pm  
**Goal:** Cancel with minimal penalty

**Journey:**
1. **The Emergency (1:30 PM)**
   - Claire booked parking for doctor appointment
   - Doctor's office calls: "We need to reschedule, emergency surgery bumped your appointment"
   - Claire no longer needs parking

2. **Cancellation Attempt (1:32 PM)**
   - Opens ParkingPal app
   - Goes to "My Bookings" → selects booking
   - Taps "Cancel Booking"
   - Sees cancellation policy: "Flexible: Full refund if cancelled 2+ hours before start time"
   - Realizes she's only 30 minutes before start time

3. **Policy Application (1:33 PM)**
   - App shows: "Your booking starts in 28 minutes"
   - Cancellation penalty: 50% (policy for <2 hours notice)
   - Original booking: €15
   - Refund if cancelled: €7.50
   - Claire accepts, confirms cancellation

4. **Host Notification (1:34 PM)**
   - Host receives notification: "Booking cancelled - Spot now available"
   - Host's calendar updates automatically
   - Spot appears back on map as available
   - Host still receives 50% payment (€7.50) for last-minute cancellation

5. **Outcome**
   - Claire loses €7.50 but gets €7.50 back
   - Host gets €7.50 for opportunity cost (could have been booked by someone else)
   - Platform keeps its % of the €7.50 that host received
   - All parties treated fairly per policy

6. **Alternative If Earlier Cancellation**
   - If Claire had cancelled at 11:30 AM (2.5 hours before):
     - Full refund: €15
     - Host receives nothing (no penalty)
     - Spot re-listed with plenty of time for new booking

**Outcome:** Clear, automated cancellation policy protects both renters and hosts. No manual intervention needed.

---

### Scenario 9: Safety & Trust - ID Verification

**Character:** Nadia (Host) concerned about security  
**Goal:** Feel safe renting out her garage to strangers  
**Challenge:** Worried about theft, damage, or suspicious activity

**Journey:**
1. **Initial Hesitation (Week 1)**
   - Nadia signs up to list her garage
   - Gets through listing process
   - Pauses before publishing: "Am I really letting strangers park here?"
   - Reads "Trust & Safety" guide in app

2. **Learning About Protections (Week 1)**
   - Sees verification features:
     - All renters must verify phone number
     - Can require renters to have verified ID
     - Can see renter ratings/reviews before accepting
     - Insurance available for damage protection
     - 24/7 support for issues
   - Nadia enables: "Require verified ID for bookings"

3. **First Booking Request (Week 2)**
   - Gets request from "Omar" - no profile photo, 0 reviews
   - Sees: "ID Verified ✓" badge
   - Can see: Name, join date, vehicle info
   - Nadia messages: "Hi! First time using ParkingPal?"
   - Omar replies: "Yes, just moved to Paris for work. Looking for monthly parking near office."
   - Conversation builds trust
   - Nadia accepts booking

4. **Monitoring (Ongoing)**
   - Omar arrives on time, parks properly
   - No issues for first week
   - Nadia adds security camera in garage (for her peace of mind)
   - Mentions camera in listing (legal in France if disclosed)
   - Omar doesn't mind, continues booking

5. **Building Trust (Month 1)**
   - After 10 bookings, Nadia realizes:
     - All renters have been respectful
     - No damage or issues
     - Ratings system filters out bad actors
     - She's earning €450/month
   - Enables "Instant Book" (no longer manually approves)

6. **Handling an Issue (Month 3)**
   - New renter leaves oil stain on garage floor
   - Nadia takes photos, reports issue in app
   - Renter purchased optional insurance (€2)
   - Insurance covers cleaning cost (€50)
   - Issue resolved in 48 hours
   - Nadia leaves honest 2★ review for renter
   - Platform notes it in renter's history

**Outcome:** Nadia learned the verification and insurance systems work. She went from anxious to confident, now earning steady income. Trust systems are effective.

---

## Detailed User Flows

### Flow 1: Renter - Finding & Booking Parking

```
START → Download App → Sign Up → Main Map View → Search/Filter → Browse Spots → 
Select Spot → View Details → Choose Date/Time → Add Vehicle → Review & Pay → 
Booking Confirmed → Navigate to Spot → Check In (Photo) → Park → Check Out (Photo) → 
Leave Review → END
```

**Step-by-Step:**

1. **Download & Sign Up (2 minutes)**
   - User downloads ParkingPal from App Store/Google Play
   - Opens app, sees splash screen
   - Taps "Get Started"
   - Signs up with email/Google/Apple
   - Verifies phone number via SMS
   - Chooses user type: "I need parking"

2. **First-Time Tutorial (30 seconds)**
   - Sees 3 onboarding screens explaining:
     - Find parking in seconds
     - Book instantly
     - Park stress-free
   - Taps "Continue"

3. **Main Map View (Default Home Screen)**
   - Sees map of current location
   - Blue pins showing available parking spots
   - Each pin has price label (e.g., "€5/h")
   - Top: Search bar "Where do you need parking?"
   - Top-right: Filter icon
   - Bottom: Draggable sheet with "24 spots near you"

4. **Search for Destination**
   - Taps search bar
   - Types: "Louvre Museum" or address
   - Map re-centers to that location
   - Shows available spots nearby
   - Distance shown from destination

5. **Apply Filters (Optional)**
   - Taps filter icon
   - Sets:
     - Date & time needed
     - Price range (€2-10/hour)
     - Distance (within 500m)
     - Amenities (covered, EV charging)
     - Vehicle size (my SUV)
   - Taps "Show Results"
   - Map updates with filtered spots

6. **Browse Spot List**
   - Drags up bottom sheet
   - Sees list of spots with:
     - Photo
     - Title (e.g., "Garage near Louvre")
     - Distance (300m away)
     - Price (€6/hour)
     - Rating (⭐ 4.8)
     - "Available now" badge
   - Can switch to map view or list view

7. **Select Spot**
   - Taps on spot card or map pin
   - Opens Spot Detail Page

8. **View Spot Details**
   - Swipes through photo gallery (5-8 photos)
   - Reads description
   - Sees host profile (photo, name, rating, response time)
   - Reviews amenities (covered, lit, camera, etc.)
   - Checks availability calendar
   - Reads reviews from other renters
   - Sees house rules
   - Sees cancellation policy
   - Bottom shows: "€18 for 3 hours" and "Book Now" button

9. **Initiate Booking**
   - Taps "Book Now"
   - Booking flow begins

10. **Select Date & Time**
    - If not already set: Chooses date (today/tomorrow/specific)
    - Selects start time (2:00 PM)
    - Selects duration (3 hours) via slider or dropdown
    - App calculates: 3 hours × €6 = €18
    - Taps "Continue"

11. **Select Vehicle**
    - If first time: "Add your vehicle"
      - Make/Model: Peugeot 308
      - License plate: AB-123-CD
      - Vehicle type: Sedan
      - Save vehicle
    - If returning user: Selects from saved vehicles
    - Taps "Continue"

12. **Review & Payment**
    - Sees booking summary:
      - Spot: Garage near Louvre
      - Date: Oct 15, 2025
      - Time: 2:00 PM - 5:00 PM (3h)
      - Vehicle: Peugeot 308 (AB-123-CD)
    - Price breakdown:
      - Parking fee: €18.00
      - Service fee: €3.60 (20%)
      - Insurance (optional): €2.00 ✓ Toggle on
      - **Total: €23.60**
    - Payment method:
      - If first time: "Add payment method"
        - Enters card number, expiry, CVV
        - Billing address
        - Saves card
      - If returning: Selects saved card (Visa ****4242)
    - Special instructions box: "I'll arrive around 2:15pm"
    - Checkbox: ✓ "I agree to House Rules and Cancellation Policy"
    - Taps "Confirm & Pay €23.60"

13. **Processing Payment**
    - Loading spinner: "Processing payment..."
    - Payment processes (2-3 seconds)

14. **Booking Confirmation**
    - Success screen appears
    - Large green checkmark ✓
    - "Booking Confirmed!"
    - Booking details card shown
    - Email sent with confirmation and receipt
    - Push notification sent
    - Buttons:
      - "Get Directions" (primary, blue)
      - "View Booking Details" (secondary, white)
      - "Done"

15. **Pre-Arrival (Day of Booking)**
    - User receives push notification: "Your booking starts in 30 minutes"
    - Opens app → "My Bookings" → Active tab
    - Sees booking with countdown timer
    - Access instructions prominently shown:
      - "Gate code: 4523#"
      - "Park in spot B12"
      - "Look for blue door on left"
    - Taps "Navigate to Spot" → Opens Google Maps with destination

16. **Arrival at Spot (2:15 PM)**
    - Follows GPS navigation
    - Finds spot easily
    - Enters gate code 4523#
    - Finds parking spot B12
    - App prompts: "📸 Take arrival photo" (for insurance)
    - User takes photo of car parked
    - Taps "Check In" in app
    - Timestamp recorded
    - Locks car and leaves

17. **During Parking**
    - User goes about their business
    - App shows active booking with countdown: "2h 45m remaining"
    - Option to "Extend Booking" if needed
    - Option to "Contact Host" if issues
    - Option to "End Booking Early"

18. **End of Booking Time (4:45 PM)**
    - Push notification: "Your booking ends in 15 minutes"
    - User returns to car

19. **Departure (5:00 PM)**
    - App prompts: "📸 Take departure photo" (for insurance)
    - User takes photo showing no damage
    - Taps "Check Out"
    - Payment automatically processed
    - Receipt generated

20. **Post-Booking (Within 24 Hours)**
    - Push notification: "How was your experience?"
    - User opens app
    - Review screen:
      - Star rating (1-5): Selects 5 stars
      - Text review: "Perfect spot, easy access, great location!"
      - Tags: ✓ Easy access, ✓ Great value, ✓ Clean
      - Submit review
    - Host also rates user: 5 stars "Great guest!"
    - Both ratings visible on profiles

**END OF FLOW**

**Time Investment:**
- Sign-up to booking: ~5 minutes (first time)
- Booking to confirmation: ~2 minutes
- Total first-time experience: ~7 minutes
- Returning user: ~2 minutes to book

---

### Flow 2: Host - Listing a Parking Spot

```
START → Sign Up → Select "I have a spot" → Add Listing Wizard → Add Location → 
Upload Photos → Set Details → Access Instructions → Set Price → Set Availability → 
Description & Rules → Preview → Publish → Receive Bookings → Manage Calendar → 
Get Paid → END
```

**Step-by-Step:**

1. **Download & Sign Up (2 minutes)**
   - Downloads ParkingPal
   - Signs up with email/Google/Apple
   - Verifies phone number
   - Uploads ID for verification (photo of driver's license)
   - Chooses: "I have a spot to rent"

2. **Host Onboarding (1 minute)**
   - Sees tutorial: "Earn money from your empty spot"
   - Learn about:
     - Set your own prices
     - Control your availability
     - Get paid automatically
   - Taps "List Your First Spot"

3. **Add Listing - Step 1: Location (1 minute)**
   - Screen: "Where is your parking spot?"
   - Enters address with autocomplete
   - Map appears with pin
   - Drags pin to exact location
   - Option: "Use my current location"
   - Taps "Next"

4. **Add Listing - Step 2: Photos (2 minutes)**
   - Screen: "Add photos (minimum 3)"
   - Tips shown:
     - Show entrance/access point
     - Show the parking space itself
     - Show any signage or landmarks
     - Include different angles
   - Taps "+" to add photos
   - Options: Take photo or choose from gallery
   - Uploads 5 photos:
     1. Street view of building
     2. Entrance/gate
     3. The parking space
     4. Close-up of space number/marker
     5. Surrounding area
   - Can rearrange order (drag & drop)
   - Taps "Next"

5. **Add Listing - Step 3: Spot Details (2 minutes)**
   - "What type of spot is this?"
     - Radio buttons:
       - ○ Driveway
       - ⦿ Garage (selected)
       - ○ Covered parking
       - ○ Street parking
   - "What size vehicles fit?"
     - Checkboxes:
       - ☑ Compact car
       - ☑ Sedan
       - ☑ SUV
       - ☐ Van/Truck
       - ☐ Motorcycle only
   - "Amenities" (select all that apply):
     - ☑ Covered/Indoor
     - ☑ Well-lit at night
     - ☑ Security camera
     - ☐ EV charging (€2 extra/hour if selected)
     - ☑ Gated access
     - ☐ Handicap accessible
   - Taps "Next"

6. **Add Listing - Step 4: Access Instructions (2 minutes)**
   - "How will renters access your spot?"
   - Options:
     - ○ Meet in person (I'll hand them a key)
     - ⦿ Gate/Door code (most popular)
     - ○ Smart lock (Nuki, August, etc.)
     - ○ Leave unlocked (trust-based)
   - Selected: Gate code
   - Text box: "Provide detailed instructions"
   - Host writes:
     "Enter gate code 4523# at main entrance. Walk through courtyard, garage is on left. Park in spot B12 (marked). Lock gate behind you."
   - Option to upload instruction video (optional)
   - Taps "Next"

7. **Add Listing - Step 5: Pricing (3 minutes)**
   - "Set your hourly rate"
   - App shows suggestion based on location:
     "💡 Similar spots in your area earn €5-7/hour"
   - Slider: €2 ←→ €15
   - Host sets: €6/hour
   - "Set a daily rate?" (optional, for 8+ hour bookings)
     - Host sets: €40/day (33% discount for full day)
   - "Set a weekly rate?" (optional)
     - Skips for now
   - "Enable dynamic pricing?"
     - Toggle: ☑ Increase price by 50% during high demand
     - (App automatically detects events, holidays, peak times)
   - Taps "Next"

8. **Add Listing - Step 6: Availability (2 minutes)**
   - "When is your spot available?"
   - Calendar view (current month)
   - "Set recurring schedule" (recommended)
     - Toggle ON
     - Monday - Friday: 9:00 AM to 6:00 PM ✓
     - Saturday - Sunday: All day ☐
     - (Host only gone weekdays for work)
   - "Block specific dates"
     - Taps Oct 20-22 (going on vacation)
     - Those dates grayed out
   - "Minimum booking duration"
     - Dropdown: 1 hour (default)
   - "Maximum booking duration"
     - Dropdown: 12 hours
   - Taps "Next"

9. **Add Listing - Step 7: Description & Rules (3 minutes)**
   - "Give your spot a title" (max 50 characters)
     - Host writes: "Secure Garage in Le Marais - Metro Nearby"
   - "Describe your spot" (max 500 characters)
     - Host writes:
     "Covered garage in quiet residential building, perfect for daily commuters or tourists. 2-minute walk to Saint-Paul metro station, 5 minutes to Place des Vosges. Safe neighborhood with 24/7 lighting. Easy in-and-out access."
   - "House rules" (optional)
     - Host writes:
     "• No smoking
     • No loud music or idling
     • Must leave by 6 PM sharp
     • No in-and-out privileges during booking (park once, leave once)"
   - Taps "Next"

10. **Add Listing - Step 8: Review & Publish (1 minute)**
    - Shows preview of how listing will appear to renters
    - All details shown in card format
    - Host reviews everything
    - Edit buttons next to each section if changes needed
    - Checkbox: ☑ "I confirm this information is accurate"
    - Two buttons:
      - "Save as Draft" (to finish later)
      - "Publish Listing" (go live immediately)
    - Host taps "Publish Listing"

11. **Success! (30 seconds)**
    - Confetti animation 🎉
    - "Your spot is now live!"
    - "Tip: Respond quickly to booking requests to get higher ratings"
    - "You'll get notified when someone books"
    - Buttons:
      - "View My Listing"
      - "Go to Dashboard"

12. **First Booking Arrives (Next Day)**
    - Push notification: "🎉 New booking request!"
    - Host opens app
    - Sees booking request:
      - Renter: "Thomas M." (photo, 4.7★ rating)
      - Vehicle: Honda Civic (license: XY-789-ZZ)
      - Date: Tomorrow, Oct 16
      - Time: 9:00 AM - 5:00 PM (8 hours)
      - Earnings: €48 (8h × €6)
      - Your payout: €38.40 (after 20% platform fee)
    - If "Instant Book" OFF (default for new hosts):
      - Buttons: "Accept" or "Decline"
      - Can message renter first
      - Host messages: "Hi Thomas! Looks good. Confirmed!"
      - Taps "Accept"
    - If "Instant Book" ON:
      - Auto-accepted, just notification
      - No manual action needed

13. **Managing Bookings (Ongoing)**
    - Dashboard shows:
      - **Active:** Current bookings (someone parked now)
      - **Upcoming:** Future reservations
      - **Past:** Completed bookings
    - Host can:
      - View renter contact info
      - Message renters
      - Cancel bookings (with penalty to self)
      - Block calendar dates
      - Edit listing details
      - Pause/unpause listing

14. **Day of Booking**
    - Morning of Thomas's booking:
      - Notification: "Thomas's booking starts at 9:00 AM today"
    - 8:55 AM:
      - Notification: "Thomas checked in"
    - Host doesn't need to do anything (code access)
    - 5:00 PM:
      - Notification: "Thomas checked out. You earned €38.40!"

15. **Post-Booking**
    - Prompt: "Rate your guest"
    - Host rates Thomas: 5 stars
    - Optional review: "Great guest, respectful, on time!"
    - Thomas rates host: 5 stars
    - Review: "Perfect spot, exactly as described!"

16. **Getting Paid (Automatic)**
    - Payment held in escrow during booking
    - 48 hours after booking ends (dispute window):
      - €38.40 transferred to host's bank account
    - Arrives in 2-3 business days (SEPA transfer)
    - Receipt emailed
    - Dashboard updates: "Available balance: €38.40"

17. **Earnings Dashboard**
    - Host can view:
      - Today's earnings
      - This week
      - This month
      - All time
      - Graph showing trends
      - List of all transactions
    - "Withdraw Funds" button
      - Minimum: €20
      - Transfers to connected bank account

18. **Ongoing Optimization**
    - After 5 bookings → Gets "Superhost" badge
    - After 20 bookings → Invited to enable "Instant Book"
    - After 50 bookings → Qualifies for lower platform fee (18% instead of 20%)
    - App sends tips:
      - "Spots with 5+ photos get 2× more bookings"
      - "Respond within 10 minutes for higher ranking"
      - "Enable weekend availability to earn 30% more"

**END OF FLOW**

**Time Investment:**
- Listing creation: ~15-20 minutes (one-time)
- Managing bookings: ~2-5 minutes/week (mostly automated)
- Earning potential: €400-800/month passive

---

### Flow 3: Dispute Resolution - Damage Claim

**Scenario:** Renter accidentally scrapes wall, host files damage claim

**Flow:**
```
Damage Occurs → Host Documents → Files Claim → Platform Reviews → Insurance Processes → 
Resolution → Ratings Exchanged → END
```

**Step-by-Step:**

1. **Damage Occurs (5:00 PM)**
   - Renter (Sophie) departs from host's (Marc's) garage
   - While backing out, scrapes side wall with car
   - Sophie doesn't notice (minor scrape on wall, not her car)
   - Leaves without reporting

2. **Host Discovers Damage (5:30 PM)**
   - Marc goes to check garage after booking ends
   - Sees new scrape mark on wall (about 30cm long)
   - Takes photos from multiple angles
   - Checks "before" condition (he took photos last week for reference)
   - Confirms: damage is new, from Sophie's booking

3. **Host Files Report (5:35 PM)**
   - Marc opens ParkingPal app
   - Goes to Sophie's completed booking
   - Taps "Report an Issue"
   - Selects issue type: "Property damage"
   - Uploads photos:
     - Wall scrape (3 photos)
     - "Before" photo (for comparison)
     - Full garage view (for context)
   - Describes damage:
     "Scrape on left wall, about 30cm long, appears to be from car bumper. Will need repainting. Estimate €150 repair cost."
   - Selects: "Renter had insurance: Yes ☑"
   - Taps "Submit Claim"

4. **Renter Notification (5:36 PM)**
   - Sophie receives push notification: "Your host has reported an issue with your booking"
   - Opens app, sees claim details
   - Views Marc's photos
   - Thinks: "Oh no, I didn't realize I did that!"

5. **Renter Response (5:40 PM)**
   - Sophie can:
     - Accept responsibility
     - Dispute claim
     - Upload her own photos
     - Add comment
   - Sophie writes:
     "I'm so sorry, I didn't realize I scraped the wall. I accept responsibility. I purchased insurance for this reason. Please proceed with the claim."
   - Taps "Submit Response"

6. **Platform Review (Within 24 Hours)**
   - ParkingPal's automated system reviews:
     - Photos from both parties
     - Booking details
     - Insurance status: ✓ Renter purchased €2 insurance
     - Insurance coverage: Up to €1,000 damage
     - Host's claim: €150
   - System flags for manual review (amounts >€100 require human verification)

7. **Manual Review by Support (Next Day, 10:00 AM)**
   - Support agent "Julie" reviews case
   - Checks:
     - Photos clearly show new damage
     - Damage consistent with car scrape
     - Renter accepted responsibility
     - Insurance is active
     - Claim amount (€150) is reasonable for wall repair
   - Julie approves claim

8. **Resolution Notification (10:30 AM)**
   - Marc receives notification:
     "Your damage claim has been approved. €150 will be paid to you within 5 business days."
   - Sophie receives notification:
     "A damage claim has been processed. Your insurance covered €150. No additional charge to you."

9. **Payment Processing (Within 5 Days)**
   - Insurance company (partner of ParkingPal) processes claim
   - €150 transferred to Marc's account
   - Sophie's card is NOT charged (insurance covered it)
   - Sophie's insurance premium for next booking: €2.50 (increased slightly due to claim history)

10. **Ratings & Reviews**
    - Marc can still rate Sophie
    - Despite damage, Sophie was responsive and cooperative
    - Marc leaves 4★ review (not 5★ due to damage, but fair)
    - Review: "Accidental damage occurred but guest was honest and cooperative. Insurance handled it smoothly."
    - Sophie leaves 5★ for Marc: "Great spot, host was understanding about accident"

11. **Long-Term Effects**
    - Sophie's profile shows: "1 insurance claim"
    - Doesn't significantly affect her ability to book (accidents happen)
    - If Sophie had multiple claims, she'd be flagged
    - Marc's trust in platform increased (system worked)
    - Both continue using ParkingPal

**END OF FLOW**

**Resolution Time:** 24-48 hours  
**Outcome:** Fair, automated process protected both parties. Insurance system worked as designed.

---

## Feature Specifications

### 1. Map & Location Features

**Map View:**
- **Technology:** Google Maps API or Mapbox
- **Display:**
  - Real-time parking availability
  - Custom blue pin markers with price labels
  - Clustering for multiple nearby spots (shows number)
  - User's current location (blue pulsing dot)
  - Destination marker (if searching for specific location)
- **Interactions:**
  - Pinch to zoom
  - Drag to pan
  - Tap pin to see quick preview
  - Tap preview to open full spot details
- **Performance:**
  - Load pins within 5km radius initially
  - Lazy load more pins as user pans
  - Update availability every 30 seconds

**Geolocation:**
- Request location permission on first launch
- Auto-center map on user's location
- "Use current location" button
- Distance calculations from user to spots
- Navigation integration (Google Maps/Apple Maps)

**Search:**
- Address autocomplete (Google Places API)
- Search by landmark ("Eiffel Tower")
- Search by neighborhood ("Le Marais")
- Search history (last 5 searches)
- Popular destinations suggested

---

### 2. Booking System

**Booking States:**
1. **Pending** - Request sent, awaiting host approval (if not instant book)
2. **Confirmed** - Booking accepted, payment processed
3. **Active** - Currently in use (user is parked)
4. **Completed** - Ended successfully
5. **Cancelled** - Cancelled by renter or host
6. **Disputed** - Issue reported, under review

**Booking Rules:**
- Minimum booking: 1 hour (or host-defined)
- Maximum booking: 24 hours (or host-defined)
- Cannot overlap with existing bookings
- Cannot book past spots (only present/future)
- Can book up to 3 months in advance

**Instant Book vs. Request to Book:**
- **Instant Book:** Auto-confirmed, payment processed immediately
- **Request to Book:** Host has 24 hours to accept/decline
  - If no response in 24h, auto-declined and renter refunded

**Time Extensions:**
- Available during active booking
- Only if spot is available after current booking
- Charged pro-rata (same hourly rate)
- Payment processed immediately
- Maximum 2 extensions per booking

---

### 3. Payment System

**Payment Processing:**
- **Provider:** Stripe or PayPal
- **Supported Methods:**
  - Credit/Debit cards (Visa, Mastercard, Amex)
  - Apple Pay
  - Google Pay
  - Bank transfers (future)

**Payment Flow:**
1. Renter books → Payment authorized (hold on card)
2. Booking starts → Payment captured
3. Booking ends → 48-hour dispute window
4. After 48h → Funds released to host (minus platform fee)
5. Host receives payout 2-3 business days later

**Pricing Breakdown:**
```
Parking fee:     €15.00  (3h × €5/h)
Service fee:     €3.00   (20% platform fee, charged to renter)
Insurance:       €2.00   (optional, charged to renter)
────────────────────────
Total charged:   €20.00

Host receives:   €12.00  (€15 - 20% = €12)
Platform keeps:  €3.00
Insurance pool:  €2.00
```

**Refund Policy:**
- **Flexible (default):**
  - Full refund if cancelled 2+ hours before start
  - 50% refund if cancelled <2 hours before start
  - No refund if cancelled after start time or no-show
- **Moderate:**
  - Full refund if cancelled 24+ hours before
  - 50% refund if cancelled 24h-2h before
  - No refund if <2 hours before
- **Strict:**
  - Full refund only if cancelled 72+ hours before
  - No refund otherwise

**Host Payouts:**
- Minimum payout: €20 accumulated
- Automatic weekly payouts (every Monday)
- Manual withdrawal option (instant, €1 fee)
- SEPA bank transfer (France/EU)
- 2-3 business days to receive

---

### 4. Rating & Review System

**Rating Scale:** 1-5 stars

**Rating Categories:**
- **For Spots (Renters rate Hosts):**
  - Overall rating (required)
  - Cleanliness (optional)
  - Accuracy (optional)
  - Value for money (optional)
  - Communication (optional)
- **For Renters (Hosts rate Renters):**
  - Overall rating (required)
  - Communication (optional)
  - Respectfulness (optional)
  - Timeliness (optional)

**Review Rules:**
- Both parties must rate within 14 days of booking end
- Ratings are blind (not revealed until both submit or 14 days pass)
- Cannot edit rating once submitted
- Can reply to reviews received
- Star ratings required, written review optional

**Review Display:**
- Overall average shown on profiles
- Individual reviews listed chronologically
- Most recent 3 reviews shown on spot detail page
- "See all reviews" link to full list
- Hosts can reply to reviews publicly

**Superhost Badge:**
- Requirements:
  - Minimum 10 completed bookings
  - 4.8+ average rating
  - <5% cancellation rate
  - 90%+ response rate within 1 hour
  - No serious issues or violations
- Benefits:
  - "Superhost" badge on listing
  - Higher ranking in search results
  - Featured in "Top Hosts" section

---

### 5. Messaging System

**In-App Chat:**
- Real-time messaging (WebSocket)
- Push notifications for new messages
- Message status: Sent, Delivered, Read
- Photo sharing supported
- Voice messages (future)

**Message Templates:**
- Pre-written quick replies for hosts:
  - "Thanks for booking!"
  - "Access code is [CODE]"
  - "I'm running 5 minutes late"

**Automated Messages:**
- Booking confirmation sent automatically
- "Booking starts in 30 min" reminder
- "Booking ends in 15 min" warning
- "Please rate your experience" follow-up

**Message Archive:**
- Messages persist for 60 days after booking
- Can download message history
- Search through past conversations

**Safety:**
- No phone numbers or email addresses allowed in messages (auto-filtered)
- Report inappropriate messages
- Block users

---

### 6. Trust & Safety

**Identity Verification:**
- Phone number verification (SMS code) - required
- Government ID upload - optional but recommended
  - Driver's license, passport, or national ID
  - OCR extraction of data
  - Face matching (selfie vs. ID photo)
  - Verified badge shown on profile

**Vehicle Verification:**
- License plate required
- Vehicle make/model/color
- Photo of vehicle (optional)
- Verified badge if photo matches registration

**Background Checks (Future):**
- Optional criminal background check
- Enhanced verification for high-value properties

**Reporting System:**
- Report user for:
  - Inappropriate behavior
  - Fraud/scam
  - Property damage
  - Safety concerns
- Report listing for:
  - Inaccurate info
  - Unsafe conditions
  - Doesn't exist
- Platform reviews within 24-48 hours

**Banning:**
- Automated ban triggers:
  - Multiple damage claims
  - Repeated cancellations
  - Fraudulent activity
  - Inappropriate messages
- Manual bans by support team
- IP and device fingerprinting to prevent re-registration

---

### 7. Insurance & Protection

**Renter Insurance:**
- **Cost:** €2-3 per booking
- **Coverage:** Up to €1,000 property damage
- **Claims:** Processed within 5 business days
- **Opt-in:** Checkbox during booking
- **Provider:** Third-party insurance partner

**Host Protection:**
- Renters undergo identity verification
- Photo check-in/check-out timestamps
- Rating system filters bad actors
- Platform investigates disputes
- Can require deposit hold (€50-200)

**Damage Claims Process:**
1. Host reports damage within 48 hours
2. Uploads photos as evidence
3. Provides repair estimate
4. Renter has 24h to respond
5. Platform reviews claim
6. If approved:
   - Insurance pays (if renter had insurance)
   - OR renter's card charged (if no insurance)
7. Funds released to host within 5 days

---

### 8. Search & Discovery

**Search Filters:**
- **Location:** Address, landmark, coordinates
- **Date & Time:** Specific date/time or "Now"
- **Price Range:** €2-15/hour slider
- **Distance:** Within 500m, 1km, 2km, 5km
- **Spot Type:** Driveway, garage, covered, street
- **Amenities:**
  - Covered/Indoor
  - Well-lit
  - Security camera
  - EV charging
  - Gated
  - Handicap accessible
- **Vehicle Size:** Compact, sedan, SUV, van
- **Booking Type:** Instant book only toggle
- **Host Type:** Superhosts only toggle

**Sort Options:**
- **Recommended** (default) - Algorithm based on:
  - Distance from destination
  - Price
  - Rating
  - Host responsiveness
  - Availability match
- **Closest First**
- **Lowest Price First**
- **Highest Rated First**
- **Most Reviews First**

**Search Algorithm:**
- Prioritizes:
  - Spots within filter criteria
  - Superhosts (+10% ranking boost)
  - Recently active hosts (+5% boost)
  - Instant book enabled (+5% boost)
  - Perfect match on vehicle size
- De-prioritizes:
  - Hosts with slow response (<1 hour avg)
  - Listings with <4.0 rating
  - Hosts with >10% cancellation rate

---

### 9. Notifications

**Push Notifications:**
- Booking confirmed
- Booking request (for hosts)
- Booking starts in 30 min
- Booking ends in 15 min
- New message received
- Payment received (for hosts)
- Review left by other party
- Payout processed
- Special offers/promotions

**Email Notifications:**
- Booking confirmation with details
- Receipt after payment
- Weekly earnings summary (hosts)
- Monthly summary (renters)
- Canceled booking
- Dispute filed
- New feature announcements

**SMS Notifications:**
- Booking confirmation code
- Access code reminder
- Emergency alerts

**Notification Settings:**
- Users can customize:
  - Which notifications to receive
  - Channel (push, email, SMS)
  - Frequency (real-time, daily digest, weekly)
  - Quiet hours (no push between 10pm-8am)

---

### 10. Analytics & Reporting

**For Hosts - Earnings Dashboard:**
- Total earnings (all time)
- This month's earnings
- Available balance (ready to withdraw)
- Pending balance (in 48h dispute window)
- Graph: Earnings over time (daily, weekly, monthly)
- Breakdown by spot (if multiple listings)
- Average rating over time
- Booking trends (busiest days/times)

**For Renters - Usage Dashboard:**
- Total spent (all time)
- Number of bookings
- Favorite spots
- Most frequent locations
- Average parking cost
- Savings vs. public parking estimate

**For Platform (Admin):**
- Total users (renters, hosts, both)
- Total bookings
- GMV (Gross Merchandise Volume)
- Revenue (platform fees)
- Growth rate (MoM, YoY)
- User acquisition costs
- Churn rate
- Average booking value
- Geographic heatmap of activity
- Top hosts (by earnings)
- Top spots (by bookings)

---

## Business Logic

### Pricing Strategy

**Platform Commission:**
- 20% service fee on each transaction (industry standard)
- Split options:
  - **Option A:** 20% from renter only (clearer for users)
  - **Option B:** 10% from renter + 10% from host (shared burden)
- Current recommendation: **Option A** (20% from renter)

**Dynamic Pricing (Optional for Hosts):**
- Host enables toggle: "Increase prices during high demand"
- Algorithm detects:
  - Events nearby (concerts, sports, conferences)
  - Holidays (Christmas, New Year's, etc.)
  - Peak times (weekends in tourist areas)
- Suggested price increase: 30-100%
- Host sets max multiplier (e.g., "never more than 2× base price")

**Promotional Discounts:**
- First-time user: First booking free up to €10
- Referral: Both parties get €10 credit
- Weekly booking: 10% discount
- Monthly booking: 20% discount
- Loyalty: After 10 bookings, 5% off all future bookings

---

### Availability Logic

**Real-Time Availability:**
- Spots shown on map are available RIGHT NOW (if searching "now")
- If searching for future date/time, shows future availability
- Unavailable spots hidden from search results
- Host can block calendar in real-time

**Buffer Times:**
- 15-minute buffer between bookings (optional, host-defined)
- Prevents back-to-back without time for renter to leave
- Example:
  - Booking 1: 9:00 AM - 12:00 PM
  - Buffer: 12:00 PM - 12:15 PM (spot unavailable)
  - Booking 2: 12:15 PM - 3:00 PM

**Overlapping Bookings:**
- System prevents double-bookings
- If Booking A is 2:00 PM - 5:00 PM, no one can book 3:00 PM - 6:00 PM (overlaps)

**Recurring Bookings (Future Feature):**
- Renter can book "Every Monday 9am-6pm for next 3 months"
- One payment, one confirmation, auto-renews
- Can cancel individual dates
- Host can opt-in to allow recurring

---

### Cancellation Policy

**Who Can Cancel:**
- **Renter:** Anytime before start, with penalty per policy
- **Host:** Only in emergencies, with penalty to self

**Renter Cancellation Penalties:**
- Flexible: 0% penalty if >2h before, 50% if <2h before
- Moderate: 0% penalty if >24h before, 50% if 24h-2h before, 100% if <2h
- Strict: 0% penalty if >72h before, 50% if 72h-24h before, 100% if <24h

**Host Cancellation Penalties:**
- If host cancels within 24 hours of booking start:
  - Renter gets full refund
  - Host penalized €20 (deducted from future earnings)
  - Host's "reliability score" decreases
  - After 3 cancellations, listing suspended
- Exception: Legitimate emergencies (system malfunction, property damage)

**No-Show Policy:**
- If renter doesn't check in within 1 hour of booking start:
  - Host can report no-show
  - Host still gets full payment
  - Renter gets no refund
  - Renter's reliability score decreases

---

### Quality Control

**Listing Approval (Launch Phase):**
- First 100 listings manually reviewed before going live
- Checks:
  - Photos are real and high-quality
  - Address is valid
  - Description matches photos
  - Pricing is reasonable
- Approval time: 24-48 hours
- After 100 listings, switch to automated with spot-checks

**Automated Flags:**
- Listing gets flagged if:
  - <3.5 stars after 5+ reviews
  - Multiple damage claims
  - Host response time >24 hours average
  - Frequent cancellations
- Flagged listings reviewed by support team
- May result in:
  - Warning to host
  - Temporary suspension
  - Required improvements
  - Permanent ban (severe cases)

**User Quality Scores:**
- Each user has hidden "quality score" (0-100)
- Factors:
  - Average rating
  - Response time
  - Cancellation rate
  - Dispute history
  - Completion rate
- High scores (90+): Perks (lower fees, priority support)
- Low scores (<50): Restrictions (can't instant book, deposit required)

---

## Technical Requirements

### Tech Stack Recommendations

**Mobile App:**
- **Frontend Framework:**
  - React Native (iOS + Android from one codebase)
  - OR Flutter (Google's framework)
  - OR Native iOS (Swift) + Native Android (Kotlin)
- **State Management:** Redux or MobX
- **Navigation:** React Navigation
- **Maps:** Google Maps SDK or Mapbox
- **Push Notifications:** Firebase Cloud Messaging (FCM)

**Backend:**
- **Server:** Node.js (Express.js) or Python (Django/Flask)
- **Database:** PostgreSQL (relational) + Redis (caching)
- **File Storage:** AWS S3 or Google Cloud Storage
- **API:** RESTful API or GraphQL
- **Authentication:** JWT tokens
- **Real-time:** WebSocket (Socket.io) for messaging

**Payment Processing:**
- Stripe or PayPal
- PCI compliance handled by payment processor
- Support for 3D Secure (Strong Customer Authentication in EU)

**Third-Party Services:**
- **Maps & Geocoding:** Google Maps API
- **SMS Verification:** Twilio or AWS SNS
- **Email:** SendGrid or AWS SES
- **Analytics:** Mixpanel or Amplitude
- **Error Tracking:** Sentry
- **ID Verification:** Stripe Identity or Onfido

**Infrastructure:**
- **Hosting:** AWS, Google Cloud, or Microsoft Azure
- **CI/CD:** GitHub Actions or GitLab CI
- **Monitoring:** Datadog or New Relic
- **Load Balancing:** AWS ELB or Nginx

---

### Database Schema (Simplified)

**Users Table:**
```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  phone VARCHAR UNIQUE,
  password_hash VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_photo URL,
  user_type ENUM('renter', 'host', 'both'),
  verified_phone BOOLEAN,
  verified_id BOOLEAN,
  created_at TIMESTAMP,
  last_login TIMESTAMP
)
```

**Listings Table:**
```sql
listings (
  id UUID PRIMARY KEY,
  host_id UUID FOREIGN KEY → users(id),
  title VARCHAR,
  description TEXT,
  address VARCHAR,
  latitude DECIMAL,
  longitude DECIMAL,
  spot_type ENUM('driveway', 'garage', 'covered', 'street'),
  hourly_rate DECIMAL,
  daily_rate DECIMAL,
  amenities JSON, -- ['covered', 'ev_charging', 'camera']
  access_instructions TEXT,
  photos JSON, -- array of URLs
  status ENUM('active', 'paused', 'deleted'),
  created_at TIMESTAMP
)
```

**Bookings Table:**
```sql
bookings (
  id UUID PRIMARY KEY,
  listing_id UUID FOREIGN KEY → listings(id),
  renter_id UUID FOREIGN KEY → users(id),
  host_id UUID FOREIGN KEY → users(id),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  vehicle_info JSON,
  total_amount DECIMAL,
  platform_fee DECIMAL,
  insurance_fee DECIMAL,
  host_payout DECIMAL,
  status ENUM('pending', 'confirmed', 'active', 'completed', 'cancelled'),
  payment_status ENUM('pending', 'paid', 'refunded'),
  created_at TIMESTAMP
)
```

**Reviews Table:**
```sql
reviews (
  id UUID PRIMARY KEY,
  booking_id UUID FOREIGN KEY → bookings(id),
  reviewer_id UUID FOREIGN KEY → users(id),
  reviewee_id UUID FOREIGN KEY → users(id),
  rating INT, -- 1-5
  review_text TEXT,
  created_at TIMESTAMP
)
```

**Messages Table:**
```sql
messages (
  id UUID PRIMARY KEY,
  booking_id UUID FOREIGN KEY → bookings(id),
  sender_id UUID FOREIGN KEY → users(id),
  receiver_id UUID FOREIGN KEY → users(id),
  message_text TEXT,
  read BOOLEAN,
  created_at TIMESTAMP
)
```

---

### Security & Privacy

**Data Encryption:**
- Passwords: Bcrypt hashing
- Sensitive data at rest: AES-256 encryption
- Data in transit: TLS/SSL (HTTPS)
- Database: Encrypted backups

**Privacy Compliance:**
- **GDPR** (EU): Right to access, delete, export data
- **Data Retention:** User data kept for 7 years after last activity (legal requirement), then deleted
- **Cookie Consent:** Required for tracking/analytics
- **Privacy Policy:** Clear, user-friendly language

**Payment Security:**
- PCI DSS Level 1 compliance (via Stripe/PayPal)
- Never store full credit card numbers
- Tokenization for recurring payments
- 3D Secure authentication for EU transactions

**API Security:**
- Rate limiting (100 requests/minute per user)
- JWT tokens with 24-hour expiry
- OAuth 2.0 for third-party integrations
- Input validation and sanitization (prevent SQL injection, XSS)

**Location Privacy:**
- Exact address only shown after booking confirmed
- Before booking: "General area" shown (300m radius)
- User location tracked only when using map (not in background)

---

### Performance Requirements

**Load Time:**
- App launch: <2 seconds
- Map load with pins: <3 seconds
- Spot detail page: <1 second
- Booking confirmation: <2 seconds

**Scalability:**
- Support 10,000 concurrent users
- Handle 1,000 bookings/hour
- Database queries <100ms
- API response time <500ms

**Offline Support:**
- Cache user's active bookings
- Cache favorite spots
- Show "No connection" message gracefully
- Sync data when connection restored

**Push Notification Delivery:**
- 95% delivery rate
- <5 second latency
- Fallback to SMS if push fails (critical notifications)

---

### App Store Requirements

**iOS (App Store):**
- Apple Developer Account (€99/year)
- Compliance with App Store Review Guidelines
- Privacy nutrition label
- Support for latest iOS versions (iOS 15+)
- Minimum deployment: iPhone 8 and newer

**Android (Google Play):**
- Google Play Developer Account ($25 one-time)
- Compliance with Google Play policies
- Privacy policy URL
- Support for Android 8.0+ (API level 26+)
- Minimum deployment: Devices from 2018+

**Age Rating:**
- 12+ (due to user-generated content and real-world meetups)

**App Permissions:**
- Location (required for map and search)
- Camera (for ID verification, photos)
- Notifications (for booking alerts)
- Contacts (optional, for referrals)

---

## Launch Strategy

### Phase 1: MVP (Months 1-3)
**Goal:** Validate product-market fit in one neighborhood

**Features:**
- Core renter flow (search, book, pay, park)
- Core host flow (list, price, accept, earn)
- Basic messaging
- Ratings & reviews
- Payment processing
- ID verification

**Geography:** One dense neighborhood in Paris (e.g., Le Marais)

**Metrics:**
- 50 active hosts
- 200 active renters
- 500 bookings in 3 months
- 4.5+ average rating
- 20% month-over-month growth

---

### Phase 2: Expansion (Months 4-6)
**Goal:** Expand to all of Paris

**Features Added:**
- Search filters
- Favorites
- Premium subscriptions
- Referral program
- Advanced analytics for hosts

**Geography:** All 20 arrondissements of Paris

**Metrics:**
- 500 active hosts
- 2,000 active renters
- 5,000 bookings/month
- €50,000 GMV/month
- €10,000 revenue/month (20% fees)

---

### Phase 3: Multi-City (Months 7-12)
**Goal:** Launch in 3 more major French cities

**Features Added:**
- Dynamic pricing
- Recurring bookings
- Corporate accounts
- API for partners

**Geography:** Lyon, Marseille, Nice

**Metrics:**
- 2,000 active hosts
- 10,000 active renters
- 20,000 bookings/month
- €200,000 GMV/month
- €40,000 revenue/month

---

### Phase 4: National & Funding (Year 2)
**Goal:** Cover all major French cities, raise Series A

**Features Added:**
- EV charging coordination
- Parking passes
- Mobile web version
- International payments

**Geography:** Toulouse, Bordeaux, Nantes, Strasbourg, Lille + 10 more

**Metrics:**
- 10,000 hosts
- 50,000 renters
- 100,000 bookings/month
- €1M GMV/month
- €200K revenue/month
- Raise €2-5M Series A

---

## Success Metrics (KPIs)

### User Acquisition:
- New signups per week
- Activation rate (% who complete first booking)
- Acquisition cost (CAC)

### Engagement:
- Daily/Monthly active users
- Bookings per user per month
- Average session duration
- Retention rate (30-day, 90-day)

### Marketplace Health:
- Supply (hosts) vs. Demand (renters) ratio (ideal: 1:4)
- Listing utilization rate (% of time spots are booked)
- Average booking value
- Host earnings per month

### Quality:
- Average rating (goal: 4.7+)
- Completion rate (% of bookings not cancelled)
- Dispute rate (goal: <2%)
- Response time (goal: <10 minutes average)

### Revenue:
- GMV (Gross Merchandise Volume)
- Revenue (platform fees)
- Average take rate (% of GMV)
- Customer Lifetime Value (LTV)
- LTV:CAC ratio (goal: >3:1)

---

## Risk Mitigation

### Risk 1: Low Initial Supply (Not Enough Hosts)
**Mitigation:**
- Offer higher host payouts initially (lower platform fee to 10% for first 100 hosts)
- Personally recruit hosts door-to-door
- Partner with property managers/building owners
- Referral bonuses for hosts who bring other hosts

### Risk 2: Safety Issues (Theft, Assault, Fraud)
**Mitigation:**
- Mandatory ID verification
- Rating system filters bad actors
- Insurance options
- 24/7 customer support
- Clear terms of service with liability disclaimers

### Risk 3: Legal/Regulatory Issues
**Mitigation:**
- Consult with French property law attorney
- Ensure hosts own or have permission to rent spot
- Comply with GDPR
- Pay VAT on platform fees
- Monitor for local parking regulations

### Risk 4: Competition (Existing Players)
**Mitigation:**
- Differentiate with better UX
- Focus on hourly (not just monthly) rentals
- Build community and trust faster
- Superior customer service
- Local-first approach (France before international)

### Risk 5: Payment Fraud
**Mitigation:**
- Use Stripe's fraud detection
- Require 3D Secure for EU cards
- Hold payments in escrow
- Monitor suspicious patterns
- Ban repeat offenders

---

## Future Vision (Years 2-5)

**Geographic Expansion:**
- All major European cities (London, Berlin, Barcelona, Amsterdam)
- North America (NYC, SF, LA, Toronto)
- Asia (Tokyo, Singapore, Hong Kong)

**Feature Additions:**
- **EV Charging Network:** Partner with hosts who have EV chargers
- **Smart City Integration:** API for city governments to manage public/private parking
- **Autonomous Vehicle Support:** Reserve spots for self-driving cars
- **Parking Passes:** Monthly unlimited subscriptions for commuters
- **Corporate Partnerships:** B2B accounts for companies
- **Airport Parking:** Long-term parking near airports

**Monetization:**
- Premium subscriptions for power users
- Featured listings for hosts
- Dynamic pricing algorithms (charge hosts for access)
- Data insights (sell anonymized parking trends to city planners)
- White-label solution for property managers

**Exit Strategy:**
- Acquisition by:
  - Ride-sharing company (Uber, Lyft, BlaBlaCar)
  - Car rental company (Hertz, Europcar)
  - Real estate platform (SeLoger, Airbnb)
  - Tech giant (Google, Apple - for Maps integration)
- OR: IPO after reaching €100M+ annual revenue

---

**END OF DOCUMENTATION**

---

**Document Version:** 1.0  
**Last Updated:** February 4, 2026  
**Author:** ParkingPal Founding Team  
**Status:** Ready for Development

---

This documentation covers everything from concept to execution. Use it as your single source of truth when building, pitching, or scaling ParkingPal. Good luck! 🚀
