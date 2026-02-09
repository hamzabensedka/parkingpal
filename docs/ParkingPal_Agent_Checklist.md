# ParkingPal — Agent Execution Plan (Lean Edition)

## CONTEXT — READ THIS FIRST

- **Founder:** Solo developer, full-time CDI employee, building ParkingPal on the side
- **Stage:** App is 50% built, no company registered yet, no revenue yet
- **Budget:** Under 500€ total
- **Business model:** Pure intermediary. Connect hosts (parking spots) with renters. Take ~20% commission. That's it.
- **Location:** France, launching in Paris first

---

## WHAT PARKINGPAL IS AND IS NOT

### We ARE:
- A platform that connects people (like Leboncoin but for parking)
- An escrow payment handler (hold money, release after booking)
- A basic identity verifier (make sure users are real people)
- A basic ownership checker (host proves they can rent the spot)

### We are NOT:
- Responsible for vehicle damage, theft, or accidents
- Responsible for spot quality or condition
- Responsible for host's tax declarations (we inform, we don't enforce)
- An insurance provider
- A property manager

### We MUST do (French law, non-negotiable even for intermediaries):
- Report host earnings to tax authorities once/year (DAC7 — 50K€ fine if we skip)
- Comply with GDPR (we store names, emails, IDs = we must protect them)
- Remove fraudulent listings when reported (LCEN hosting provider obligation)
- Display legal mentions on the website (CGU, mentions légales)
- Offer access to a consumer mediator (mandatory since 2016)

---

## AGENT RULES

1. Follow tasks in order within each phase
2. Tasks marked ⛔ BLOCKER must be done before moving to next phase
3. Tasks marked 👤 FOUNDER need the founder to do them personally
4. Tasks marked 🤖 AGENT can be done autonomously
5. **STOP and alert founder if:** any legal threat, government contact, or decision involving >100€
6. **Keep it simple.** No over-engineering. Minimum viable compliance.

---

## PHASE 1: FINISH THE APP (Now → Week 4)

Focus: Complete the 50% remaining with compliance built in.

### Core Features to Build

- [ ] 🤖 **1.1** User registration with email verification
  - Send verification link, valid 24h, one-time use
  - Block disposable email domains (use a free blocklist)

- [ ] 🤖 **1.2** Phone verification for hosts
  - SMS 6-digit code via Twilio (free tier: trial credits ~15€ worth)
  - Valid 10 min, max 3 attempts
  - Required before a host can create a listing

- [ ] 🤖 **1.3** Host listing flow with ownership proof
  - Host uploads ONE document proving they can rent the spot:
    - Property tax bill (taxe foncière), OR
    - Lease + landlord permission letter, OR
    - Building management letter, OR
    - Property deed
  - YOU review it manually (just you, looking at PDFs)
  - No OCR, no AI — just eyeball it: does the name match? Does the address match? Is it recent?
  - Approve or reject within 48h
  - Store document encrypted (use your hosting provider's encryption at rest)

- [ ] 🤖 **1.4** Stripe Connect escrow payments
  - Renter pays → money held in YOUR Stripe platform account
  - Booking completes → wait 48h dispute window
  - No dispute → release 80% to host, keep 20%
  - Dispute filed → freeze money, you investigate manually, decide
  - This is the #1 fraud protection. Don't skip it.

- [ ] 🤖 **1.5** Basic check-in system
  - Renter confirms arrival (button tap + optional photo)
  - Timestamps logged for dispute evidence
  - No GPS verification needed — too complex for now

- [ ] 🤖 **1.6** Rating system
  - After booking: both sides rate 1-5 stars + short comment
  - Display average rating on profiles
  - Flag users below 3.0 stars for review

- [ ] 🤖 **1.7** Host Agreement checkbox (during listing creation)
  - Host must check a box confirming:
    - "I have the legal right to rent this spot (I own it or have landlord permission)"
    - "I understand rental income is taxable and I will declare it"
    - "I accept the Terms of Service"
  - Store the timestamp + IP of acceptance
  - This is your legal shield — if host lied, it's on them

- [ ] 🤖 **1.8** Renter Agreement checkbox (during booking)
  - "I understand ParkingPal is an intermediary and is not responsible for the condition of the parking spot, vehicle damage, or theft"
  - "I accept the Terms of Service"
  - Store timestamp + IP

---

## PHASE 2: LEGAL MINIMUM (Week 4-5)

Focus: The absolute minimum legal documents you need before going live. You can write these yourself using templates — no lawyer needed at this budget.

### ⛔ BLOCKER: Do NOT launch without all items in this phase complete.

- [ ] 👤 **2.1** Register as Micro-Entrepreneur
  - Go to autoentrepreneur.urssaf.fr
  - Activity: "Mise en relation par voie électronique" (digital intermediation)
  - APE code will be assigned automatically
  - Cost: FREE
  - Takes: 1-2 weeks to get SIRET
  - Revenue cap: 77,700€/year for services (more than enough to start)
  - ⚠️ No limited liability — but at <500€ budget, SASU is not realistic
  - ⚠️ If the app takes off (>10K€/year revenue), switch to SASU then

- [ ] 🤖 **2.2** Write Terms of Service (CGU)
  - Use plain French, keep it short (2-3 pages max)
  - Must include:
    - **Your identity:** Name, SIRET, address, email, phone
    - **What the platform does:** "ParkingPal met en relation des propriétaires de places de parking avec des conducteurs. ParkingPal est un simple intermédiaire et n'est pas partie au contrat de location."
    - **Commission:** "ParkingPal prélève une commission de 20% sur chaque réservation"
    - **User obligations:** Must be 18+, provide accurate info, comply with laws
    - **Host obligations:** Must have legal right to rent, must declare income
    - **Renter obligations:** Park at own risk, responsible for own vehicle
    - **Platform NOT responsible for:** Vehicle damage, theft, accidents, spot condition, host/renter disputes beyond mediation, host tax compliance
    - **Escrow:** Explain payment hold + 48h dispute window
    - **Cancellation:** Define your policy (e.g., free cancel 24h before, 50% within 24h, 0% no-show)
    - **Account termination:** You can ban users for fraud, fake listings, abuse
    - **Dispute resolution:** Internal mediation first, then external mediator
    - **Governing law:** French law, Paris courts
  - Template sources (free): Captain Contrat blog templates, LegalPlace free examples, adapting Leboncoin/Yespark CGU structure

- [ ] 🤖 **2.3** Write Privacy Policy
  - Required by GDPR, keep it simple:
    - **What you collect:** Name, email, phone, ID document (hosts), payment info (via Stripe — you don't store card numbers), photos of spots, booking history
    - **Why:** Account creation, identity verification, payments, fraud prevention, legal obligations (tax reporting)
    - **Who sees it:** Other users see first name + rating only. Stripe processes payments. Tax authorities get annual earnings report. Nobody else.
    - **How long:** Active account duration + 3 years after deletion. Financial records: 10 years (legal requirement). ID documents: account duration + 5 years.
    - **User rights:** Access, correction, deletion — email you at [your email]
    - **Security:** Encryption in transit (HTTPS), encryption at rest, access limited to you
    - **Cookies:** Only essential cookies (auth session). No tracking, no analytics cookies = no cookie banner needed!

- [ ] 🤖 **2.4** Write Mentions Légales page
  - Required on every French website. One short page:
    - Your name (or micro-entreprise name)
    - SIRET number
    - Address (can be your home address)
    - Email + phone
    - Hosting provider name + address (e.g., Vercel, OVH, AWS)
    - Publication director: your name

- [ ] 🤖 **2.5** Set up consumer mediator
  - French law requires you to name a mediator consumers can contact
  - Cheapest option: Subscribe to a mediation service
    - Medicys: ~50€/year for micro-entrepreneurs
    - Or CMAP (Centre de Médiation et d'Arbitrage de Paris)
  - Display mediator name + contact on your CGU and website footer
  - You'll probably never need it, but it's legally required

- [ ] 👤 **2.6** Open a dedicated bank account
  - Not legally required for micro-entrepreneur BUT strongly recommended
  - Separate personal money from ParkingPal money
  - Stripe payouts go here
  - Free options: Boursorama, Revolut Business (free tier), N26 Business

---

## PHASE 3: PRE-LAUNCH TESTING (Week 5-6)

- [ ] 🤖 **3.1** Test the full flow end-to-end
  - Create a test host account, upload a real document, create listing
  - Create a test renter account, book the spot, pay with Stripe test mode
  - Verify escrow holds money correctly
  - Complete booking, verify 48h window, verify payout
  - Test dispute flow: file dispute, freeze payment, resolve

- [ ] 👤 **3.2** Recruit 5-10 beta testers
  - Friends, family, colleagues with parking spots
  - Ask them to list real spots
  - Ask other friends to book real spots
  - Collect feedback: confusing? buggy? trustworthy?

- [ ] 🤖 **3.3** Security basics (no audit needed, just common sense)
  - HTTPS everywhere (Let's Encrypt = free)
  - No secrets in code (use environment variables)
  - Stripe handles all card data (you never see card numbers)
  - Uploaded documents stored with encryption at rest
  - SQL injection protection (use parameterized queries / ORM)
  - Rate limiting on auth endpoints (prevent brute force)
  - Basic input validation

- [ ] 🤖 **3.4** Verify all legal pages are live and linked
  - Footer links: CGU, Privacy Policy, Mentions Légales
  - Host listing flow: checkbox agreement present + logged
  - Renter booking flow: checkbox agreement present + logged
  - Mediator info visible on CGU page

---

## PHASE 4: LAUNCH (Week 6-7)

- [ ] 👤 **4.1** Flip to production
  - Stripe live mode activated
  - Domain pointing to production
  - All legal pages live

- [ ] 👤 **4.2** Start small
  - Launch to friends/family first (soft launch)
  - Then local Facebook groups, Reddit (r/paris), expat groups
  - Free marketing only at this budget
  - Goal: 10 listings, 20 bookings in first month

- [ ] 👤 **4.3** You are customer support
  - Set up a support email (support@parkingpal.fr or just use a Gmail)
  - You handle disputes manually
  - You review ownership documents manually
  - You approve/reject listings manually
  - This is fine at small scale — automate later when overwhelmed

---

## PHASE 5: AFTER LAUNCH — DO WHEN NEEDED

These are things you do NOT need at launch, but must set up as you grow:

### When you hit first January after launch:
- [ ] 👤 **5.1** Send annual earnings report to each host (PDF with total earned)
- [ ] 👤 **5.2** File DAC7 report to DGFiP (report all host earnings to tax authority)
  - Format: XML file uploaded to impots.gouv.fr
  - Deadline: January 31
  - ⛔ THIS IS MANDATORY — 50,000€ fine if you skip it

### When you hit ~5,000€/year revenue:
- [ ] 👤 **5.3** Consider switching from micro-entrepreneur to SASU
  - Reason: limited liability (protect personal assets)
  - Cost: ~500-1,000€ to register
  - When: once you're confident the business works

### When you hit ~10,000€/year revenue:
- [ ] 👤 **5.4** Hire an accountant (~100€/month)
- [ ] 👤 **5.5** Register for VAT (required if >36,800€/year for services)
- [ ] 👤 **5.6** Get professional liability insurance RC Pro (~80€/month)
- [ ] 👤 **5.7** Consider paying a lawyer to review your CGU (~500-1,000€ one-time)

### When you get first dispute:
- [ ] 👤 **5.8** Handle it yourself using escrow evidence (booking timestamps, check-in data, messages)
- [ ] Document your decision and reasoning (precedent for future disputes)

---

## BUDGET BREAKDOWN

| Item | Cost | When |
|------|------|------|
| Micro-entrepreneur registration | FREE | Before launch |
| Domain name (parkingpal.fr) | ~12€/year | Before launch |
| Hosting (Vercel free tier / small VPS) | 0-20€/month | Before launch |
| Twilio SMS (pay-as-you-go) | ~5€/month at small scale | Before launch |
| Stripe fees | 1.5% + 0.25€ per transaction | Per transaction (paid by revenue) |
| Consumer mediator subscription | ~50€/year | Before launch |
| Dedicated bank account | FREE (Boursorama/Revolut) | Before launch |
| **TOTAL TO LAUNCH** | **~100-150€** | |

Remaining ~350€ = emergency buffer for unexpected costs.

---

## RED FLAGS — STOP EVERYTHING IF:

1. **You receive a letter from any government body** → Read carefully, don't ignore, research or ask in a legal forum before responding
2. **Stripe freezes your account** → Usually means they suspect fraud, contact Stripe support immediately
3. **Multiple users report fake listings in one week** → Pause new listings, review all pending ones
4. **Someone threatens legal action** → Take it seriously, consult a lawyer (many offer free 30min first consultation)
5. **Your chargeback rate goes above 1%** → Stripe will shut you down, investigate immediately

---

## LEGAL CHEAT SHEET — WHAT YOU NEED TO KNOW

### "Am I liable if something goes wrong?"
As an intermediary under LCEN (French e-commerce law), you have limited liability IF:
- You don't control or modify listings (you just display what hosts submit)
- You remove illegal content when notified (takedown obligation)
- Your CGU clearly states you are an intermediary, not a party to the rental

Your CGU + user checkboxes are your legal shield. If a host lied about ownership, they checked a box saying they had the right. That's on them.

### "Do I need to declare this income?"
YES. As micro-entrepreneur, you declare your commission revenue (not the total booking amount, just your 20% cut) on impots.gouv.fr quarterly or monthly. Tax rate: ~22% social charges on revenue.

### "Do I need to tell hosts about taxes?"
YES. You must inform hosts their income is taxable (put it in CGU + show a reminder in the app). AND you must report their earnings to DGFiP annually (DAC7). But you don't need to withhold tax or enforce anything — just report.

### "What about GDPR?"
You collect personal data = you're a data controller. Minimum requirements:
- Privacy policy on your site explaining what you collect and why
- Users can request their data or deletion (email you)
- Encrypt data, use HTTPS, don't share data with anyone except Stripe and tax authorities
- If you get hacked: notify CNIL within 72 hours + notify affected users

### "Do I need insurance?"
Not legally required at micro-entrepreneur stage. But recommended once you're making real money (~RC Pro at ~80€/month when revenue justifies it).

### "Can tenants rent out their parking spots?"
Only if their lease allows it or their landlord gives written permission. Your ownership check catches this — if they upload a lease, you check for subletting permission. If no clause, ask for landlord letter.

### "Is there a rental frequency limit like Airbnb's 120 days?"
NO. The 120-day rule is for tourist housing only. Parking has no equivalent cap.

### "Can I do this while on CDI?"
YES. French law allows CDI employees to have a micro-entreprise on the side. Check your employment contract for any non-compete or exclusivity clause. Most CDI contracts don't restrict side projects unless they compete with your employer's business. If your employer is NOT in the parking/real estate business, you're fine.

### "What do I declare to URSSAF as micro-entrepreneur?"
Only your COMMISSION revenue. If a booking is 20€ and you keep 4€ (20%), you declare 4€ — not 20€. Stripe sends 4€ to your account, the rest goes to the host.

---

## FOR THE AGENT — EXECUTION SUMMARY

```
PHASE 1 (Weeks 1-4): Finish building the app with compliance features baked in
PHASE 2 (Weeks 4-5): Register micro-entrepreneur + write legal pages
PHASE 3 (Weeks 5-6): Test everything, recruit beta testers
PHASE 4 (Weeks 6-7): Soft launch, founder handles everything manually
PHASE 5 (Ongoing):   Scale up compliance as revenue grows

Total cost to launch: ~100-150€
Time to launch: ~6-7 weeks from now
```

**The #1 rule: launch small, stay lean, add complexity only when revenue justifies it.**
