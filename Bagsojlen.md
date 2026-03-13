# Prompts

Your task in Phase 1 is to help me systematically document an existing web system and build the foundation for all subsequent improvement phases.

IMPORTANT:

In this phase, you should NOT redesign everything, force solutions, or dive into technical implementation. This phase is designed to thoroughly dissect the system, understand it, critically examine it, identify gaps, and establish a clear framework for the following phases.

\#\# Project Context

There are two separate but related websites under the same brand:

1\. Bag Søjlen \= Restaurant  
2\. Ishus Bag Søjlen \= Ice Cream Parlor

The separation was a conscious decision to:  
\- avoid confusing users when searching for the restaurant or the ice cream parlor  
\- create more SEO opportunities  
\- allow for clearer positioning of both offerings

\#\# Goals of the Two Websites

\#\#\# Restaurant Website  
Goal:

\- simple, clear branding  
\- conversion-optimized for bookings/reservations

\#\#\# Ice Cream Parlor Website  
Goal:

\- branding  
\- some SEO  
\- less emphasis on conversion/reservation logic than the restaurant

\#\# Backends

Currently, there are separate backends or administration areas for the restaurant and the ice cream parlor.

\#\#\# Restaurant Backend  
Used by the owners and us as administrators.

\#\#\# Restaurant Backend What is known so far:

\- Reservations can be viewed, edited, and deleted

\- Reservations are currently received via a frontend form

\- The menu can be modified

\- Pages/sections can be added to the website

\- Fonts/minor visual elements can be changed

\- Events/news can be posted with images and text

\- Images on the website can be changed

\- Marketing & reviews exist  
\- Testimonials/reviews are currently maintained manually  
\- Newsletter logic is not yet fully developed  
\- SEO functions in the backend are missing or insufficient  
\- Reservation logic is not yet well thought out

\#\#\# Ice House Backend  
Is significantly simpler.

What is known so far:

\- Dashboard  
\- Menu Manager  
\- Media/Forside Media  
\- Gallery  
\- Simple settings

\#\# Important starting point

The focus in this phase is NOT on the technical stack, frameworks, or code details.

We are deliberately leaving these out for now.

The focus is on:

\- Structure  
\- UX/UI  
\- Functionality  
\- Logic  
\- Missing features  
\- Missing system logic  
\- Future-proofing  
\- User-friendliness for administrators and website visitors  
\- Potential integration or separation of systems in the future

\#\# Key Issues / Target Image

Many things currently appear unfinished.

Important features and, above all, clear logic are missing.

Examples of relevant topics:

\- Reservation logic  
\- Meaningful backend functions  
\- Missing SEO management  
\- Missing or immature email sequences  
\- Potential newsletter logic  
\- Conversion analysis  
\- Backend usability  
\- Clear separation or meaningful integration of management logic  
\- Future-proofing for later integrations

Later, things like the following could be added:

\- Improved seat/reservation manager  
\- AI bot for website inquiries  
\- AI phone answering system  
\- More precise website analytics  
\- Further integrations

But that's not Phase 1\. Phase 1 is meant to lay the foundation.

\---

\# YOUR TASK IN PHASE 1

I want you to focus solely on Phase 1 right now.

\#\# Phase 1 Goal  
Build me a precise understanding of the overall system and a clean framework for all subsequent phases.

Therefore, you should:

\#\#\# 1\. Break the entire system down into clear areas.  
Clearly separate:  
\- Restaurant Frontend  
\- Restaurant Backend  
\- Ice Cream Parlor Frontend  
\- Ice Cream Parlor Backend  
\- Cross-brand/cross-system issues

\#\#\# 2\. Define what needs to be tested for each area.  
Don't solve it yet, but define:  
\- which test dimensions are important  
\- which subtopics belong  
\- what needs to be considered in each case

For example, depending on the area:

\- UX  
\- UI  
\- Conversion  
\- Branding  
\- Content structure  
\- SEO-relevant points  
\- Admin usability  
\- Functionality range  
\- Logic behind functions  
\- Missing states/roles/workflows  
\- Future-proofing  
\- Brand consistency

\#\#\# 3\. Clearly categorize known problems, risks, and areas of concern.  
Please strictly separate:

\- Known with certainty  
\- Probable/obvious  
\- Unclear/needs to be tested later

Don't hallucinate.

If something is unclear, explicitly mark it as open.

\#\#\# 4\. Identify the largest logical review areas  
For example:

\- What aspects of the reservation logic need to be conceptually reviewed?

\- Which backend logic is typically missing in such systems?

\- Which CMS/admin functions are often only superficially present but logically flawed?

\- Where are inconsistencies likely to arise between two separate brand areas under one brand?

\#\#\# 5\. Propose a clear phase plan for the next steps  
Please propose a logical sequence for the next steps.  
\-

# Phase 1 \- system overview

## **PHASE 1 — FINALS SYSTEM FINDINGS**

## **Behind the Pillar / Ice House Behind the Pillar**

---

## **1\. System overview**

Two custom-developed websites—completely custom code, from frontend to backend. Both live on Vercel. Both have functioning frontends and backends at different stages of development. The basic structure is in place. What's missing is the underlying logic—email flows, booking logic, newsletter infrastructure, capacity management. This isn't a minor detail. This is the difference between a beautiful website and a system that generates revenue.

---

## **2\. Inventory — What's there, what's missing**

### **Restaurant Backend**

**Present and functional:**

* Reservation dashboard with status filters: ALL / PENDING / CONFIRMED / CANCELLED  
* Per booking: Date, time, guest name, number of guests, email, phone, notes  
* Actions: Confirm, Decline, Edit, Delete  
* CSV export  
* Search by name / email / phone  
* Manual booking entry  
* Sidebar modules: Menu, Pages, Site Content, Events, Gallery, Marketing & Reviews, Appearance, Settings

**Not included:**

* No newsletter module  
* No inbox for customer messages  
* No automated emails (confirmation to guest, alert to restaurant, rejection with message)  
* No capacity logic per time slot  
* No reminder logic before the appointment  
* 

---

### Restaurant Frontend

Present:

* Hero with two CTAs: "BESTIL ET BORD" and "SE MENUKORT"  
* Navigation: Menu, Previous History, Self-Service, Contact, OA icon, BESTIL BORD  
* Menu page with tab structure  
* Reservation form: Date \+ number of guests → "SE LEDIGE TIDER"  
* Note for groups over 8 people (phone)  
* Newsletter email field in the footer  
* Events / News section visible  
* Private Arrangements section visible

Known issues:

* Menu tabs with question marks in the label — clearly unfinished  
* "SE LEDIGE TIDER" — what happens next is unclear, will be checked in Phase 3  
* OA icon in navigation — function unclear, will be checked in Phase 3  
* The newsletter form collects emails — where they go is not yet built.  
* 

---

Eishaus Backend

Present:

* Menu Manager with categories (Kugle Ice Cream, Soft Ice Cream, Specials, Pandekager)  
* Per Item: Name, Price, Edit, Delete, "Mark Sold Out"  
* Tabs: Menu Manager, Frontside Media, Gallery, Settings

Not present:

* No newsletter module  
* No contact/message area  
* No description fields visible per menu item

Eishaus Frontend

Present:

* Hero with two CTAs: "SE ICE-MENU" and "FOREES HISTORY"  
* Navigation: Frontside, Frontside, Ice Cream Menu, Gallery, Contact, Language Switcher (DA), BESTIL OS  
* Menu page complete with categories and prices  
* Gallery present  
* Contact area with map, opening hours, social media links  
* Newsletter in the footer

Known errors / unresolved issues:

* Gallery images with "Kastbergs" watermark — external content or placeholders  
* Map shows the Rønde region, address in the text is Aalborg — one of the two values ​​is incorrect  
* Menu item "1 Kugle" appears twice: once with €9 and once with €35  
* "Sugar, jam and soft serve" with a price of 477 — English name, implausible price  
* "BESTIL OS" — the button's purpose is still unclear

3\. Biggest Risk Areas — by priority

**🔴 1\. Reservation logic has no email system**

The most critical gap. A guest books, receives nothing. The restaurant doesn't get an alert. Kenan confirms manually — but the guest isn't notified automatically. This isn't a feature request. This is a functional break in the most important process of the entire site.

**🔴 2\. Newsletter exists only as a form — not as a system**

Both sides collect emails. Nobody knows where they go. No backend, no distribution list, no sending. This needs to be built — not sometime in the future, but in parallel with the booking logic, because it belongs to the same foundation.

**3\. Data errors on the ice cream parlor's front end**

Incorrect menu, duplicate menu item, implausible price, English item on a Danish menu. These aren't design issues—this is content that erodes trust.

**4\. Incomplete content on the restaurant's front end**

Menu tabs with question marks are publicly visible. This signals to users that the page is unfinished.

**5\. Brand consistency between the two websites**

Both sites use the Bag Søjlen logo. The tone and imagery are similar—but not yet implemented as a system. This will become relevant once we address SEO and advertising.

---

## **4\. Empfohlener Phasenplan**

| Phase | Fokus | Warum in dieser Reihenfolge |
| :---- | ----- | ----- |
| **Phase 2** | Restaurant Frontend — Conversion Audit | Publicly visible, directly impacting revenue. We fully analyze the booking process from the user's perspective. |
| **Phase 3** | Restaurant Backend — Logic Development | Booking confirmation, email flows, newsletter infrastructure, capacity logic. This is the core. |
| **Phase 4** | Restaurant SEO Foundation | Only when the frontend and backend are clean and sound does SEO have a solid foundation to build upon. |
| **Phase 5** | Ice Cream Parlor Frontend — Bug Fixes \+ Audit | Fix data errors, then focus on branding and SEO. |
| **Phase 6** | Ice Cream Parlor Backend — Enhancements | Identify what's missing, what can be improved. |
| **Phase 7** | Cross-System | Analytics, cross-promotion, GDPR compliance, overall strategy. |

---

## **5\. What each phase specifically delivers**

**Phase 2 — Restaurant Frontend:** Comprehensive conversion analysis. Every step of the booking process evaluated from the user's perspective. Prioritized list of shortcomings and optimizations. Specific recommendations.

**Phase 3 — Restaurant Backend Logic**: Complete email flow design (booking → confirmation → reminder → cancellation). Newsletter infrastructure recommendations. Capacity logic concept. Everything formulated for immediate implementation by the technical staff.

**Phase 4 — Restaurant SEO**: Meta structure, structured data (Schema.org), Google Business Profile recommendations, local SEO optimizations. Technical checklist for the developer.

**Phase 5 — Ice Cream Parlor Frontend**: All known errors documented and resolved. Conversion check (micro-conversions occur even without a booking). Branding comparison to the restaurant.

**Phase 6 — Ice Cream Parlor Backend**: Functional gaps identified. What additional features does the ice cream parlor need—and what doesn't?

**Phase 7 — Cross-System:** Analytics setup recommendations. GDPR compliance check. Cross-promotion strategy. Overall prioritization of all open issues according to impact and effort.

---

# Frontend audit

---

**Restaurant Frontend**

# **Conversion & UX Audit**

**Bag Søjlen — Restaurant Frontend**

**Focus**

Conversion, UX, content structure, trust, visual hierarchy, and frontend readiness for later logic/analytics/SEO work.

**Primary Goal**

Increase table reservations without weakening brand quality.

**Frontend Status**

Strong visual base, but strategically and conversion-wise still underdeveloped.

---

## **1\. Executive Verdict on the Restaurant Frontend**

The Bag Søjlen restaurant frontend already has a **credible premium foundation**. The typography, restrained color palette, black-and-gold accents, and large-format imagery fit the intended restaurant positioning well. The site does not look cheap or generic. It already communicates a certain level of atmosphere and ambition.

The main issue is not that the frontend is “bad.” The main issue is that it is still **more brand presentation than reservation machine**. It has the aesthetic direction, but not yet the operational sharpness, clarity, and conversion logic that a restaurant site with bookings as a primary goal should have.

The biggest current weaknesses are:

* the **booking journey is still too weak and too late in the page**

* the site contains **multiple signals of incompleteness or placeholder logic**

* the **trust layer is too thin**

* the **page structure is not yet arranged around decision-making**

* some parts are elegant visually, but **underpowered functionally**

* the design is good in style, but still lacks a few **high-end finishing decisions** that would make it feel truly polished and intentional

### **What is already usable**

* Strong overall brand direction

* Good typography pairing

* Cohesive black / white / gold visual language

* Decent hero image and strong initial atmosphere

* Menu section exists and is already partly structured

* Seasonal offer block is directionally strong

* Private events section is commercially useful

* Booking CTA already exists in navigation and hero

* Newsletter and footer blocks are visually aligned with the brand

### **Biggest current problems**

* Booking is still not positioned strongly enough as the core user action

* Trust and social proof are too weak for a restaurant whose goal is reservations

* Some public-facing data/content still feels placeholder-like or unverified

* The page contains too much passive reading before decisive action

* Several sections feel visually elegant but commercially under-leveraged

* The frontend still does not clearly prepare users for what happens after they try to book

### **Overall verdict**

**Visually promising. Commercially under-optimized.**

This is a good-looking early-stage restaurant frontend, but not yet a fully convincing, reservation-focused frontend. It is suitable as a foundation, but not yet as a finished conversion asset.

---

## **2\. Audit by Review Area**

---

### **2.1 Overall Positioning and First Impression**

**Finding**

The first impression is strong. The hero image, serif headline, short subline, and premium restraint communicate a restaurant identity clearly enough. A first-time visitor can understand that this is a more refined dining place rather than a casual fast-moving concept.

The restaurant positioning is clear enough in tone, but not yet fully sharpened in value proposition. The current hero says what the place is, but it does not yet strongly answer why someone should book here specifically instead of somewhere else nearby.

The visible opening times in the hero appear valid in the current screenshot, so the earlier claim about clearly broken hero hours should be removed. However, the footer opening times still look suspicious because every listed day appears identical and overly placeholder-like. That may or may not be factually wrong, but it should absolutely be verified before launch.

**Why it matters**

The hero does not need to explain everything, but it should do three jobs well:

* establish atmosphere

* establish confidence

* direct the user toward the main next action

Right now it does the first two better than the third.

**Impact on user / conversion / trust**

Users get a decent brand impression, but not enough decision momentum. The first screen feels elegant, but not yet commercially sharp.

**Recommendation**

* Keep the overall hero direction

* Strengthen the restaurant-specific value proposition slightly

* Verify all business-critical public data, especially opening hours

* Make the booking action feel more inevitable, not just available

---

### **2.2 Information Architecture and Page Logic**

**Finding**

The page structure is broadly understandable, but not yet optimized around the primary conversion goal. The site currently behaves more like a visual story page than a booking-led restaurant journey.

The order broadly appears to be:

* Hero

* Food philosophy

* Testimonial

* Event highlight

* Menu

* Private arrangements

* News / articles

* Reservation

* Newsletter

* Footer

That structure is not irrational, but it is also not ideal. The booking section appears too late relative to the business objective. A user with immediate booking intent has to either use the navigation CTA or keep scrolling through many layers of content before reaching the form.

There is also a general issue of **long stretches of elegant but low-pressure presentation**. This creates a good mood, but not enough forward motion.

**Why it matters**

Restaurant websites with reservation intent need narrative, but they also need decisiveness. Too much storytelling before action lowers booking efficiency.

**Impact**

The page likely performs better for passive browsing than for efficient conversion.

**Recommendation**

Rework the sequence into a more deliberate decision journey:

* Hero with strong booking priority

* Short brand/philosophy block

* Social proof / trust

* Menu highlights / reasons to visit

* Private arrangements

* Booking block

* Newsletter

* Footer

The current content can mostly remain, but it needs stronger sequencing and tighter role definition.

---

### **2.3 Conversion and CTA Architecture**

**Finding**

There is already a visible booking CTA in the navigation and a booking CTA in the hero, which is good. The problem is not absence of CTAs. The problem is **hierarchy and momentum**.

The hero contains both “book a table” and “see menu,” and while both are valid, the menu CTA currently competes too strongly with the core goal. In addition, the booking form itself arrives too late in the page to act as the central conversion anchor.

The seasonal menu block also includes a booking CTA, which is good. That logic should be expanded, not removed.

**Why it matters**

If booking is the primary business goal, the page should repeatedly and confidently guide users toward booking without feeling pushy or cheap.

**Impact**

The current CTA architecture spreads attention instead of building a steady flow toward reservation.

**Recommendation**

* Keep both hero CTAs, but make the booking CTA clearly dominant

* Add at least one additional mid-page booking prompt

* Strengthen contextual booking CTAs around menu and occasions

* Ensure the booking block feels like a destination, not an afterthought

---

### **2.4 Booking Flow from the Frontend Perspective**

**Finding**

The booking block itself is visually clean and restrained, which fits the brand. The problem is not visual ugliness. The problem is **lack of context, confidence, and expectation-setting**.

The section is titled well enough, but still feels thin for such an important business action. Users are asked for date and guest count, then pushed toward “See available times,” but the frontend does not yet do enough to answer:

* what happens next

* how long confirmation takes

* whether this is an instant booking or request flow

* what happens for larger groups

* what level of certainty the guest has after acting

This is where frontend and backend will later connect. But already at the frontend level, the user needs clearer reassurance and process framing.

**Why it matters**

Reservation is not like newsletter signup. It involves commitment, timing, trust, and uncertainty. Users need clarity.

**Impact**

Higher abandonment risk, especially among users who are not already fully convinced.

**Recommendation**

* Upgrade the booking section into a stronger conversion module

* Add a short explanation of what happens after submission

* Make large-group guidance more prominent

* Visually increase the importance of the booking block

* Hand off success-state, confirmation logic, and notification logic to Phase 3

---

### **2.5 Menu Structure and Content**

**Finding**

The menu section is stronger than Claude gave it credit for in one key respect: the tabs shown in the current screenshot do **not** contain question marks. That earlier finding should be removed.

The visible tab labels currently look more like:

* A La Carte

* Tilbudsmenu og Take Away

* Frokost

* Børnemenu

So this part is cleaner than Claude stated.

That said, the section still has meaningful weaknesses:

* the menu presentation is elegant but quite sparse

* some dishes have descriptions, but not all menu content is equally rich

* the section still feels more like a layout demonstration than a fully convincing appetite and decision driver

* allergen guidance is not clearly visible in the reviewed screenshots

* the current menu experience is aesthetically decent but still under-leveraged as a conversion asset

The seasonal menu block is one of the strongest parts of the page. It combines imagery, structure, price, and a reservation CTA. This is closer to the right direction.

**Why it matters**

For many restaurant users, the menu is not just informational. It is one of the main persuasion tools.

**Impact**

A weak menu presentation reduces emotional buy-in and booking confidence.

**Recommendation**

* Keep the current menu design direction

* Enrich selected dishes with slightly stronger micro-descriptions

* Add clear allergen guidance or at minimum an allergy note

* Use the seasonal / featured menu block as the standard for stronger menu selling

* Consider adding one or two additional visual moments in the menu area so it feels less text-heavy and more sensorial

---

### **2.6 Trust and Credibility**

**Finding**

This is one of the weaker areas of the current frontend.

There is a testimonial, which is directionally useful, but the trust layer overall is too thin. One isolated quote is not enough for a reservation-focused restaurant site. In the current screenshot, the testimonial content references travel and service and appears to come from a guest from Islamabad. That may be genuine, but on its own it does not create enough local, restaurant-specific social proof.

This does **not** mean the testimonial is fake. Claude was too aggressive there. It should not be labeled as a placeholder unless confirmed. But it also should not be treated as sufficient proof.

There is currently not enough visible trust reinforcement through:

* multiple guest reviews

* review volume

* Google rating integration

* media recognition

* chef / owner credibility

* local proof

* signals of popularity or consistency

**Why it matters**

People book restaurants heavily based on external reassurance.

**Impact**

The site currently asks users to trust the brand more than it helps them trust it.

**Recommendation**

* Add multiple genuine guest testimonials or Google review integration

* Include more local and restaurant-specific credibility signals

* Consider adding a short founder / chef / team credibility layer later if appropriate

* Keep the premium tone, but make trust more substantial

---

### **2.7 Design and Visual Hierarchy**

**Finding**

This is where the frontend has real potential, but also where Claude underdeveloped the critique.

The design direction is good. The brand fit is there. The site already has:

* a refined serif / sans-serif combination

* restrained luxury cues

* good use of negative space

* a visually coherent gold accent system

* a strong light/dark contrast between content area and footer

However, the design is not yet fully resolved. Several things keep it from feeling truly finished and high-end:

#### **A. Too much passive white space in some sections**

The page uses a lot of white space, which can look premium when the content density and hierarchy are excellent. Here, some sections instead feel underfilled rather than intentionally spacious. This is especially noticeable in:

* the news/articles block

* the booking area around the form

* some transitions between sections

#### **B. Strong style, weaker emphasis**

The booking block is visually too soft relative to its importance. It looks elegant, but not decisive. The site is visually polite where it should sometimes be commercially assertive.

#### **C. Section rhythm is not fully controlled**

Some sections feel balanced, while others feel like they need one stronger anchor, more contrast, or tighter composition. The site has the ingredients of premium design, but not yet the full editorial discipline.

#### **D. Navigation has one unclear artifact**

The “OA” item in the navigation still looks unclear from a public-user perspective. If it has no meaningful public purpose, it should not be there.

#### **E. Hero slider may not justify itself**

If the second slide does not create a materially better storytelling or conversion result, a single excellent hero can be stronger, cleaner, and more premium than a slider.

**Why it matters**

At this level, the problem is not “ugly design.” The problem is missed refinement. Premium hospitality design requires precision.

**Impact**

The site feels promising and tasteful, but not yet fully authoritative.

**Recommendation**

* Keep the overall aesthetic system

* Tighten spacing discipline section by section

* Make the booking section stronger without breaking the brand

* Remove unclear navigation artifacts

* Simplify components where simplification creates more authority

* Add a bit more structured contrast between editorial sections and conversion sections

---

### **2.8 Mobile UX**

**Finding**

A full mobile view was not directly reviewed in the current materials, so mobile-specific findings must be treated carefully. That said, there are obvious probable risks based on the desktop structure:

* the booking section is too late in the page

* long storytelling sections may become even longer on mobile

* the menu may become cumbersome if tab logic and content density are not carefully handled

* spacing that feels premium on desktop can feel wasteful and tiring on mobile

* CTA visibility and scroll fatigue are likely more significant on smaller screens

**Why it matters**

For restaurants, mobile is often the dominant or at least highly important traffic source.

**Impact**

Any friction that already exists on desktop will usually become worse on mobile.

**Recommendation**

Phase 2 should flag mobile as a high-priority validation area, but not fabricate exact mobile issues without the actual view. The design team should explicitly test:

* header behavior

* hero CTA visibility

* menu usability

* booking form interaction

* spacing efficiency

* footer usability

---

### **2.9 SEO Readiness from the Frontend Side**

**Finding**

This phase is not a full SEO audit, but the frontend already raises several structural readiness points.

Good signs:

* the page has named sections and a reasonable narrative flow

* there are content blocks that can later support local SEO

* menu, events, and news are relevant content categories

Weak signs:

* the trust/content depth is still too thin in places

* some sections still feel generic or underdeveloped

* the page currently prioritizes presentation more than structured discoverability

* there is not yet enough visible depth to fully support stronger local organic positioning

**Why it matters**

Later SEO improvements work better when the page already has clean structure, useful content, and no obvious public incompleteness.

**Impact**

The frontend is not anti-SEO, but it is not yet making the most of its SEO opportunity.

**Recommendation**

Do not overload the page with SEO tactics at this stage. Instead:

* strengthen content substance

* clean public inconsistencies

* improve menu and article usefulness

* ensure later local SEO work has strong editorial ground to stand on

---

### **2.10 Analytics and Measurement Readiness from the Frontend Side**

**Finding**

There is no visible proof in the reviewed material of a mature analytics setup. That is fine for now, but the frontend should already be designed in a way that later measurement is obvious.

The page has several natural event points:

* navigation booking CTA clicks

* hero booking CTA clicks

* menu CTA clicks

* seasonal menu reservation CTA clicks

* booking section interactions

* article clicks

* newsletter submissions

* private arrangements interest actions

**Why it matters**

Without clean event points, later optimization becomes guesswork.

**Impact**

If the team launches traffic or campaigns before measurement logic is clarified, prioritization becomes weak.

**Recommendation**

In this phase, just mark these points clearly as required future event nodes. The actual implementation belongs later, but the frontend structure should support clean tracking.

---

### **2.11 Unfinished, Confusing, or Risky Public Elements**

**Finding**

The earlier Claude version overstated a few things. This section has been corrected.

Items that still deserve attention:

* footer opening times need verification because they currently look repetitive and placeholder-like

* the “OA” nav item is still unclear

* the news/articles section feels too thin and visually underpowered with only one visible card

* the booking block still feels too isolated and under-explained

* the trust layer is too weak relative to the booking goal

* the footer contact details should be reviewed for realism and finality before launch

* the “Administer Reservation” footer-area link should be reviewed carefully to ensure public users are not exposed to internal/admin-oriented pathways unnecessarily

**Why it matters**

Even if each issue seems small, together they create a “not fully finished” impression.

**Impact**

This reduces trust, especially for first-time visitors.

**Recommendation**

Treat public-facing cleanup as part of launch readiness, not as optional polish.

---

### **2.12 Missing Elements**

**Finding**

The frontend is not missing everything. It already has the skeleton. But it is still missing several elements that would make it substantially stronger:

* a stronger trust layer

* clearer booking expectation-setting

* more persuasive menu support

* better mid-page conversion support

* stronger distinction between regular reservation and private arrangement inquiry

* clearer final verification of all business-critical public info

* more robust social proof

* stronger design finishing in key commercial sections

**Why it matters**

High-performing restaurant frontends usually do not win because of one hero image. They win because every section reinforces the booking decision.

**Impact**

The current frontend asks the design to do too much of the commercial work on its own.

**Recommendation**

Add only what materially improves trust, clarity, and booking intent. Do not overbuild.

---

## **3\. Booking Flow Step by Step**

### **Step 1 — Arrival on the page**

**Status:** Good but improvable

The user gets a strong first brand impression. The environment looks premium enough. The booking CTA is visible. This part works reasonably well.

### **Step 2 — Early decision: browse or act**

**Status:** Mixed

The user can book or explore the menu. That is good. But the menu CTA competes too strongly with the booking CTA instead of supporting the same decision journey.

### **Step 3 — Trust-building phase**

**Status:** Weak

The site provides some story and some atmosphere, but not enough meaningful reassurance before asking for commitment.

### **Step 4 — Menu exploration**

**Status:** Decent but underpowered

The menu exists and helps. The seasonal menu section is strongest. The rest still needs more persuasive richness.

### **Step 5 — Private arrangements / additional offer logic**

**Status:** Commercially useful but not fully leveraged

This section is valuable, but it still needs clearer separation from standard reservation logic.

### **Step 6 — Reservation section**

**Status:** Visually clean, strategically too weak

The booking block is easy enough to spot once reached, but it arrives late and does not explain enough.

### **Step 7 — “See available times”**

**Status:** Frontend-to-backend boundary

At this point the main issue becomes process logic. The frontend should still better prepare the user, but the real solution moves into Phase 3\.

### **Step 8 — Post-attempt confidence**

**Status:** Missing

The frontend currently does not appear to give enough certainty about what happens next. That must be solved partly in messaging and fully in backend flow logic.

### **Booking flow conclusion**

The booking journey is not broken at the visual level. It is broken at the **confidence and system-clarity level**. That is an important distinction. The frontend needs stronger framing, and Phase 3 must complete the operational logic.

---

## **4\. Prioritized Issue List**

### **Critical**

1. Booking flow lacks clear expectation-setting and likely ends in uncertainty

2. Footer opening times and other public business data must be verified before launch

3. Trust layer is too weak for a reservation-led restaurant site

4. Booking section is too late and too passive relative to business priority

### **High**

5. CTA hierarchy is not sharp enough

6. Menu section is useful but still not persuasive enough

7. News/articles section feels too sparse and unfinished

8. Private arrangements logic is present but not commercially optimized

9. “OA” navigation item is unclear and should be clarified or removed

10. Public-facing footer/admin-related elements should be audited carefully

### **Medium**

11. Some sections use premium whitespace well, others feel underfilled

12. Design rhythm and section emphasis need tightening

13. Analytics readiness should be defined before any serious traffic push

14. SEO readiness is acceptable as a base, but still too light in content substance

### **Low**

15. Hero slider may be unnecessary if it adds no meaningful value

16. More visible personality could help later, but it is not urgent

17. Additional editorial refinements can wait until the core booking flow is stronger

---

## **5\. Quick Wins**

1. **Verify and correct all public business data**

    Especially opening times, contact details, and any admin-facing links or odd public elements.

2. **Make the booking CTA hierarchy clearer**

    Booking must visibly outrank menu browsing.

3. **Strengthen the booking section with one sentence of expectation-setting**

    This is small work with high trust value.

4. **Clarify or remove the “OA” nav item**

    Public navigation must be self-explanatory.

5. **Strengthen the trust layer quickly**

    Even 2 to 3 strong real reviews would help materially.

6. **Improve the thin news/articles area**

    Either make it stronger or reduce its prominence.

7. **Upgrade the visual weight of the booking block**

    It should feel like a key section, not a quiet form dropped late in the page.

---

## **6\. Larger Structural Improvements**

### **6.1 Re-sequence the page around decision-making**

The page should feel less like a passive scroll and more like a guided progression toward reservation.

### **6.2 Upgrade the booking section into a true conversion module**

It should include:

* a stronger heading

* one reassurance sentence

* clearer group-booking guidance

* stronger visual framing

* a cleaner bridge into backend logic later

### **6.3 Build a more serious trust layer**

This is one of the biggest gaps. It needs:

* multiple real reviews

* local proof

* stronger social reassurance

* potentially a small credibility layer around the restaurant story or people behind it

### **6.4 Make the menu work harder**

The seasonal menu is already the best example. The rest of the menu section should move closer to that standard.

### **6.5 Distinguish clearly between standard reservation and private-event inquiry**

Those are different commercial paths and should not feel blended or underexplained.

### **6.6 Tighten the premium design execution**

The current design direction is correct. The improvement now is not reinvention. It is refinement:

* spacing discipline

* contrast control

* section emphasis

* better commercial hierarchy inside the same brand language

---

## **7\. Things to Remove, Simplify, or Re-group**

### **Downgrade, not necessarily remove**

* Secondary hero CTA to menu

   Keep it, but make it visually weaker than booking.

### **Remove or clarify**

* “OA” item in public navigation

   If it has no customer-facing purpose, it should not be there.

### **Simplify**

* Hero slider

   If slide two does not create clear value, a single strong hero may perform better.

### **Re-group**

* News/articles section

   If only one weak article is available, either strengthen the section or reduce its visual footprint.

### **Reposition**

* Booking section

   It needs stronger integration into the main persuasive journey.

### **Separate more clearly**

* Private arrangements vs normal table booking

   Different user goals, different CTAs, different logic.

---

## **8\. Handover Points to Phase 3**

The following points should move directly into **Phase 3 — Restaurant Backend / Logic / Booking Flow**:

1. What exactly happens after “See available times”

2. Reservation status logic

3. Confirmation logic

4. Guest-facing success state

5. Restaurant-side notifications

6. Auto-email flow after reservation attempt

7. Capacity / table / time-slot logic

8. Group-booking rules and escalation path

9. Cancellation / change logic

10. Newsletter backend logic, if retained

11. Admin-side handling of reservation flow states

12. Clean separation between booking request, confirmed booking, and special-case inquiry

---

## **9\. Open Questions**

Only the most important ones for the next phase:

1. Is Bag Søjlen intended to operate as **instant booking**, **manual confirmation**, or **hybrid request-to-confirm**?

2. Are the footer opening times correct, or are they placeholders?

3. What is the public purpose of the “OA” navigation item?

4. Should the news/articles section be a serious ongoing content area, or just a light support block?

5. Is there already any real review source that can be integrated soon?

6. Should private arrangements become a clearly separate inquiry flow rather than just a content section?

---

## **10\. Recommended Action Order**

### **First**

Clean public-facing trust and clarity issues:

* verify business data

* remove confusing public artifacts

* sharpen CTA hierarchy

* strengthen booking context

* improve thin trust signals

### **Then**

Refine the restaurant frontend structurally:

* tighten section order

* strengthen the booking module

* improve trust architecture

* improve menu persuasion

* reduce underfilled or weak sections

### **Then**

Move directly into Phase 3:

* reservation logic

* confirmation logic

* backend handoff

* operational workflow

* admin-side process and states

---

# **Final Directional Note**

This frontend does **not** need a full stylistic reinvention.

That would be the wrong move.

It needs:

* **commercial sharpening**

* **trust-building**

* **booking clarity**

* **better section discipline**

* **high-end finishing**

* **cleaner connection to the logic that Phase 3 must solve**

The brand direction is already there. The next job is to make it **feel finished, credible, and effective**.

---

# Backend audit

---

# **Bag Søjlen**

# **Phase 3 Full Audit \+ Implementation Brief**

## **Restaurant Backend, Booking Logic, Admin Flow, Supporting Backend Modules, SEO, Integrations**

## **Purpose of this document**

This document combines:

* the **full Phase 3 audit**

* the **practical implementation brief**

So the team can understand:

* where the system currently stands

* what is already there

* what is missing

* what is risky

* what should stay

* what should change

* what should be built now

* what should wait

This is written as a **strong V1 document**, not a perfect forever-spec.

The goal is to build a restaurant backend that is:

* robust

* easy to use

* hard to break

* automation-friendly

* future-proof enough

* realistic to build in a reasonable time

We are using **80/20 thinking**:

* keep what gives the highest ROI

* keep what prevents future rebuilds

* avoid unnecessary complexity

* but do not leave out clearly important things

---

# **1\. Phase 3 context and current position**

We are now past the frontend-only discussion.

## **What is already clear**

* The restaurant frontend booking flow is already visually designed

* The booking journey already exists as:

  * date \+ guests

  * slot selection

  * guest details

  * confirmation page

* The system already gives users the impression that:

  * slot availability is real

  * confirmation is real

  * email confirmation is real

## **What is actually missing**

The backend logic behind that frontend is not complete enough yet.

That means the current system risks:

* showing slots that are not truly governed by backend logic

* promising confirmations/emails that do not yet fully exist

* creating operational chaos for admins

* appearing more complete than it really is

## **Core Phase 3 objective**

Turn the existing frontend flow into a **real operating system**.

Not just a pretty frontend.

---

# **2\. Locked decisions for this phase**

These decisions are now treated as fixed.

## **2.1 Booking model**

The booking system should be **instant confirmation**.

Not request-based.

Not manual-confirmation-first.

That means:

* if the guest sees and selects an available slot

* and the booking passes the booking rules

* the booking is confirmed immediately

## **2.2 Availability model**

V1 should use:

**slot-based availability with a guest-count threshold**

That means:

* each slot has a configurable capacity

* availability depends on:

  * date

  * slot

  * guest count

  * booking rules

  * date overrides

This is the correct practical V1 model.

## **2.3 Email automation**

Email flows are important now and stay in scope.

They are needed for:

* trust

* clarity

* guest confidence

* real automation

* truthfulness of the frontend flow

## **2.4 SEO**

SEO stays in scope now.

Not because we need a huge SEO platform immediately, but because:

* the site is business-critical

* metadata and SEO structure should not be bolted on blindly later

* the backend should already support core SEO control

## **2.5 Integrations**

Integrations stay in scope now, but should remain practical.

The goal is not to build a giant integrations platform in V1.

The goal is to create the right foundation for:

* analytics

* review/trust integrations

* Google-related setup

* later automation

## **2.6 Other backend modules**

The system is not only for reservations.

The rest of the restaurant backend must also be kept coherent:

* Menu  
* Events  
* Gallery / Media  
* Marketing & Reviews  
* Pages  
* Site Content  
* Appearance  
* Settings

These do not all need deep redesign, but they do need enough structure so the system remains usable and safe.

---

# **3\. Audit of the current backend situation**

This section is the actual audit layer.

---

## **3.1 Overall backend verdict**

The backend appears to already contain several modules and a visible admin structure, but it is not yet a complete operational system.

### **Current likely reality**

The backend is closer to:

* a working custom admin shell

* with some functional content areas

* plus a reservation UI

* but without enough complete logic behind the most important workflows

### **Main backend strengths**

* The system is already modular

* The booking frontend already exists visually

* The admin clearly already has major content areas

* The project is not starting from zero

### **Main backend weaknesses**

* The booking flow is ahead of the actual backend logic

* Some public-facing promises are not yet fully true

* Business-critical data still risks inconsistency

* Supporting modules may work visually, but not yet safely/governed enough

* Too much of the system still depends on “looks like it works” rather than “actually works robustly”

### **Overall audit judgment**

The system is **promising but immature**.

It is not broken as an idea.

It is incomplete as an operational product.

---

## **3.2 Reservations audit**

### **What is already good**

* The booking flow structure already exists

* The user journey is already understandable

* The arrangement redirect for larger groups already exists

* Newsletter and GDPR checkboxes already exist in the form

### **What is weak or missing**

* slot availability is not yet trustworthy enough

* instant confirmation logic is not truly backed by a full system yet

* cancellation logic is incomplete

* backend reservation states need formalization

* admin handling needs a more practical dashboard

* booking emails need to be real, not implied

### **Audit judgment**

Reservations are the **most important part of Phase 3** and the area where the gap between frontend polish and backend reality is currently largest.

---

## **3.3 Settings audit**

### **What is already good**

* Settings already exist as a concept in the backend

* They can become the right place for global business truth

### **What is weak or risky**

* business-critical information may still be spread across different places

* opening hours errors suggest poor or inconsistent source-of-truth handling

* email/sender/admin notification logic is not clearly centralized enough yet

* security handling is currently not safe enough if plaintext password visibility exists

### **Audit judgment**

Settings should become the **single source of truth** for key business data.

This is one of the highest-ROI improvements in the whole system.

---

## **3.4 Menu audit**

### **What is already good**

* Menu management already exists

* It appears functional enough as a content area

* This should not be overcomplicated in V1

### **What is weak or missing**

* sold-out logic must be quick and obvious

* prices must be validated correctly

* category structure must stay clean

* the menu must remain easy to update without layout issues

### **Audit judgment**

The Menu module does **not** need a rebuild.

It needs a few focused improvements and stronger field discipline.

---

## **3.5 Events audit**

### **What is already good**

* Events already exist as a module

* This is useful for freshness, campaigns, and restaurant activity

### **What is weak or missing**

* outdated events can quickly harm trust

* archive logic must be automatic or at least unavoidable

* event dates must be structured, not loosely handled

### **Audit judgment**

Events are valuable, but only if they remain current.

The biggest risk is stale public content.

---

## **3.6 Gallery / Media audit**

### **What is already good**

* Media/gallery management already exists

* This is important for a premium restaurant brand

### **What is weak or missing**

* weak media governance can degrade frontend quality fast

* alt text is missing or too weak

* quality discipline may be inconsistent

### **Audit judgment**

Media does not need heavy complexity, but it does need basic safeguards.

---

## **3.7 Marketing & Reviews audit**

### **What is already good**

* This area already exists conceptually

* It is strategically important because trust is currently too weak on the frontend

### **What is weak or missing**

* placeholder testimonials have been used

* review logic is not strong enough yet

* newsletter handling needs to be clean and lawful

* this module is too broad if left undefined

### **Audit judgment**

This area matters a lot, but it should stay simple in V1:

* real reviews/testimonials

* subscriber storage

* consent state

* optionally simple sending if kept practical

---

## **3.8 Pages / Site Content / Appearance audit**

### **What is already good**

* These modules already exist

* They likely already support a meaningful amount of frontend control

### **What is weak or risky**

* boundaries between them may be unclear

* too much editor freedom can damage the frontend

* too little freedom makes the backend frustrating

* appearance tools are especially risky if not constrained

### **Audit judgment**

These modules do not need a deep redesign now, but they do need **guardrails**:

* clearer purpose

* safe editing

* limited freedom where needed

* no brand-breaking controls

---

## **3.9 SEO audit**

### **What is already good**

* SEO is clearly important to the business

* there is good reason to include SEO support in backend planning now

### **What is weak or missing**

* SEO controls are not mature enough yet

* metadata and structured SEO control need clearer handling

* the system needs a cleaner SEO foundation

### **Audit judgment**

SEO should stay in scope, but V1 should focus on **useful essentials**, not an oversized SEO suite.

---

## **3.10 Integrations audit**

### **What is already good**

* Integrations matter for the long-term system

* analytics and trust/review readiness are important

### **What is weak or missing**

* integrations are likely too underdeveloped or fragmented

* analytics setup needs a cleaner place

* future Google/review readiness should be planned properly

### **Audit judgment**

Integrations should stay in scope, but V1 should focus on **core connection points**, not full integration depth.

---

# **4\. What should stay, what should change, what should wait**

---

## **4.1 Keep as-is or mostly as-is**

These areas are directionally fine and only need improvement, not reinvention:

* overall booking UI flow structure

* Menu module structure

* Events module concept

* Gallery / Media concept

* existing backend modularity

* Pages / Site Content / Appearance as categories

---

## **4.2 Change now**

These areas need real change in Phase 3:

* reservation engine logic

* instant confirmation truthfulness

* email automation

* reservation dashboard usability

* arrangement inquiry flow

* Settings as single source of truth

* opening hours handling

* backend security for admin credentials

* review/testimonial trust logic

* minimal SEO controls

* practical integrations setup

* light governance for content modules

---

## **4.3 Wait or keep light for now**

These should not dominate V1:

* full table/seat map

* advanced newsletter marketing features

* complex analytics dashboards

* advanced social automations

* payment/deposit system

* overbuilt CMS/page-builder complexity

* highly detailed workflow states in every module

---

# **5\. Phase 3 target state**

At the end of this phase, the restaurant backend should be able to do the following well:

1. accept and confirm real bookings instantly

2. show real slot availability

3. send real booking-related emails

4. let admins manage bookings fast and clearly

5. handle private arrangements in a structured way

6. keep business information correct in one place

7. support key backend content modules without chaos

8. give SEO and integrations a strong starting foundation

9. remain simple enough for a strong V1

---

# **6\. Implementation brief**

This is the practical build layer.

---

## **6.1 Security first**

### **Must do immediately**

Remove any plaintext password visibility from admin.

Replace with a proper password change flow:

* current password

* new password

* confirm password

---

## **6.2 Reservations system**

### **Core V1 model**

Instant confirmation system using:

* date

* guest count

* slot

* configurable slot capacity

* booking rules

### **Admin-configurable booking rules**

In Settings, admin must be able to configure:

* booking days

* time slots

* max covers per slot

* minimum booking notice

* maximum booking window

* arrangement threshold

### **Date overrides**

Admin must also be able to:

* close specific dates

* reduce capacity for a date

* add an operational note if needed

### **Frontend behavior**

The slot grid must be driven by real backend availability:

* available means genuinely available

* full means blocked

* closed dates show no valid slots

### **Booking statuses**

Use a clean, useful V1 model:

* CONFIRMED

* CANCELLED\_BY\_GUEST

* CANCELLED\_BY\_ADMIN

* COMPLETED

* NO\_SHOW

* ARRANGEMENT\_LEAD

### **Logging**

Log all important booking changes:

* created

* changed

* cancelled

* no-show

* admin modifications

Soft delete only.

---

## **6.3 Booking emails**

These are part of V1.

### **Required flows**

1. Booking confirmation to guest

2. Admin alert for new booking

3. Guest cancellation confirmation

4. Admin cancellation email to guest

5. 24-hour reminder email

6. Post-visit follow-up email

### **Backend controls**

Settings should include:

* sender name

* sender email

* reply-to

* admin alert email

### **Templates**

Email templates should be editable with:

* subject

* body

* placeholders

* preview

Keep it practical and editable.

---

## **6.4 Guest cancellation flow**

Guest should be able to cancel via secure token link in email.

### **Flow**

* click link

* confirm cancellation

* booking status updates

* admin is notified

No guest login required.

---

## **6.5 Reservation dashboard**

The reservation backend should become fast and operational.

### **Main views**

* Today’s bookings

* Upcoming bookings

* Cancelled / no-show

* Arrangements

* All bookings / search

### **Key row data**

Each booking should show:

* date

* time

* guest name

* guest count

* contact details

* notes

* status

### **Fast actions**

* view

* edit

* cancel

* mark no-show

* search / filter

---

## **6.6 Private arrangements**

Private arrangements are important and should not stay phone-only.

### **Add a proper arrangement inquiry flow**

Form should include:

* name

* email

* phone

* occasion

* preferred date

* estimated guests

* notes

* privacy checkbox

### **Backend**

Create an Arrangements area/tab.

### **Arrangement statuses**

* NEW

* IN\_PROGRESS

* OFFER\_SENT

* CONFIRMED

* DECLINED

### **Emails**

At minimum:

* guest acknowledgment

* admin alert

---

## **6.7 Settings**

Settings should be the single source of truth.

### **Business info**

* restaurant name

* address

* phone

* public email

* map link/embed

* social links

### **Opening hours**

Per day:

* open/closed

* open time

* close time

Also:

* special closures

* special overrides if needed

Use time pickers only.

### **Reservation rules**

* booking days

* time slots

* max covers per slot

* minimum notice

* maximum booking window

* arrangement threshold

### **Email settings**

* sender name

* sender email

* reply-to

* admin notification email

### **Principle**

Key frontend business data must read from Settings.

---

## **6.8 Menu**

Keep current structure.

### **Add**

* proper numeric price validation

* sold-out toggle

* clean category handling

No major redesign needed.

---

## **6.9 Events**

Keep current structure.

### **Add**

* structured event date

* auto-archive after event passes

This is enough for V1.

---

## **6.10 Gallery / Media**

Keep current structure.

### **Add**

* alt text field

* basic media quality discipline

Enough for V1.

---

## **6.11 Marketing & Reviews**

Keep this simple and useful.

### **Must include**

* manual review/testimonial management

* newsletter subscriber storage

* stored consent state

### **Recommended**

Simple newsletter sending can stay if it remains lightweight.

---

## **6.12 Pages / Site Content / Appearance**

No major rebuild now.

### **But add light guardrails**

#### **Pages**

Keep controlled page editing.

#### **Site Content**

Use for structured editable frontend sections.

#### **Appearance**

Only safe editing controls.

No design-breaking freedom.

---

## **6.13 SEO**

SEO stays in scope.

### **Minimum useful SEO controls**

For key pages:

* meta title

* meta description

* OG title

* OG description

* OG image

* canonical URL where needed

### **Global basics**

* default OG image

* Search Console verification field

* sitemap support

* basic indexing controls if practical

### **Structured data**

Generate restaurant schema from Settings where possible.

---

## **6.14 Integrations**

Integrations stay in scope, but V1 should remain practical.

### **Priority items**

* GA4 measurement ID or equivalent tracking setup

* Google-related review/business readiness

* clean setup fields for future integrations

### **Keep light**

Do not overbuild the integrations area.

---

# **7\. Build order**

## **First**

1. Fix admin password visibility

2. Clean and expand Settings

3. Add proper opening hours handling

4. Add reservation rules

5. Add email config

## **Then**

6. Implement real slot availability

7. Implement instant booking confirmation logic

8. Implement statuses and booking logging

9. Implement booking emails

10. Implement token cancellation

## **Then**

11. Improve reservation dashboard

12. Add arrangement inquiry flow

13. Improve Menu with sold-out \+ validation

14. Add Events auto-archive

15. Add Media alt text

## **Then**

16. Add SEO module/controls

17. Add Integrations module/controls

18. Add light guardrails to Pages / Site Content / Appearance

---

# **8\. Simplicity rules for the team**

## **Rule 1**

Do not overengineer V1.

## **Rule 2**

Anything business-critical must have one source of truth.

## **Rule 3**

Anything public-facing must be easy to edit but hard to break.

## **Rule 4**

Use structured fields wherever practical.

## **Rule 5**

Build real logic before extra admin complexity.

## **Rule 6**

Future-proof only where ROI is strong.

## **Rule 7**

If something creates more confusion than value, simplify it.

---

# **9\. Final summary**

Phase 3 is about making the restaurant system **real**.

Not just attractive.

Not just partially working.

Not just manually patched.

The most important outcomes are:

* real instant-confirmation booking

* real slot availability

* real automated emails

* useful admin flow

* structured arrangements

* clean Settings

* safe supporting backend modules

* practical SEO and integration foundations

* a strong V1 that does not need rebuilding too soon

---

# **10\. Recommended note to send with this document**

Use this document as:

* the **Phase 3 audit**

* and the **Phase 3 build brief**

The team should treat:

* Sections 1–5 as the audit layer

* Sections 6–8 as the implementation layer

---

