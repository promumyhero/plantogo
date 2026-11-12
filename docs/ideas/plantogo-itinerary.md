# PlanToGo — Collaborative Trip Itinerary & Split-Bill Platform

## Problem Statement
How might we help small travel groups (up to 4 people) plan hyper-specific, realistic daily itineraries and manage shared trip finances (budgeting, actual expenses, and automated split-bill settlement) across mobile, tablet, and desktop devices without spreadsheet chaos and with bank-grade database security?

## Recommended Direction
Build **PlanToGo**, a minimalist-modern, editorial-inspired responsive web application powered by **Next.js (App Router)** and **Supabase (PostgreSQL + RLS)**.

### 1. Email-Based Collaboration & Auth Flow
- **Invite by Login Email:** When creating or managing a trip (during onboarding or inside the trip dashboard), the Trip Owner simply enters the **email address** of up to 3 friends (total max 4 members) and assigns their role (`editor` or `viewer`).
- **Smart Auto-Binding (`invited_email` → `user_id`):**
  - If the email already exists in `profiles`, they immediately gain access on their Home Dashboard.
  - If the friend hasn't logged in yet, the row is stored in `trip_members` with `invited_email = 'teman@email.com'` and `status = 'pending'`. The moment that friend logs in using that exact email (via Supabase Auth or Demo Email Switcher), a PostgreSQL trigger automatically binds their `user_id` and activates their membership—and they can already be assigned to Split-Bill expenses even before their first login!

### 2. Visual Direction (Synthesized from Your 3 Design References)
- **Editorial Minimalist Typography:** Pairing a clean geometric sans-serif (`Plus Jakarta Sans` / `Inter`) with an expressive **Editorial Serif Italic** accent (`Instrument Serif` / `Playfair Display Italic`) for headlines (e.g., *"Jawa Tengah Without Limits"*, *"Discover Your Curated Itinerary"*), inspired by Reference #3 (*Nepalora*) and Reference #1 (*Visa Travels*).
- **Immersive Hero + Floating Glass Quick-Bar:** Full-bleed high-contrast Jawa Tengah nature photography (Dieng Plateau, Borobudur mist, Karimunjawa, Merbabu) with a translucent glassmorphic bottom bar (`Activity/Vibe`, `Location`, `Date/Duration`, `Budget` + pill CTA `Build My Trip`), combining Reference #1 and #2 (*Visit Indonesia*).
- **Bento Analytics & Card Aesthetic:** Generous white canvas (`#FAFAFA` / `#FFFFFF`), deep obsidian contrast cards (`#0F172A`), large rounded corners (`rounded-3xl`), floating glass pill badges, and dot-matrix progress indicators (for budget health & trip vibe breakdown: *Alam / Kuliner / Heritage / Relax*) from Reference #3.

### 3. Core Functional Pillars
- **Interactive Onboarding Questionnaire (Hybrid Generator):** Multi-step wizard collecting destination clusters in Central Java, dates, member emails + roles, travel vibe, and target budget. Generates a day-by-day skeleton, budget category allocations, and curated local recommendations.
- **Hyper-Specific Collaborative Itinerary (`max 4 members`):** Day-by-day timeline slots, **Transit Buffers** between destinations, wishlist/voting staging area, item locking by Owner, and strict RBAC (`owner`, `editor`, `viewer`).
- **Integrated Finance & Split-Bill Engine:** Direct 1-click expense logging from itinerary cards, `BIGINT` Rupiah storage, *Planned vs. Actual* budget tracking, automated debt simplification (*who owes whom*), and an immutable `expense_audit_logs` table.

## Key Assumptions to Validate
- [ ] **Assumption 1 (Email Invite Pre-Assignment):** Trip owners want to split budgets and assign expenses to all 4 members immediately during planning, even before the other 3 friends have logged in for the first time. *Solution:* Key `trip_members` by `id` (UUID) with `invited_email` + nullable `user_id` that auto-links on login.
- [ ] **Assumption 2 (Mobile-First Field Usage):** During the Central Java trip, >85% of interactions will happen on mobile phones. *Solution:* Mobile bottom navigation bar + 3-tap quick expense sheet, paired with editorial multi-column bento layouts on tablet/laptop.
- [ ] **Assumption 3 (RLS Scalability):** Using an indexed security-definer helper function `is_trip_member(trip_id)` and `get_trip_role(trip_id)` avoids nested-loop RLS bottlenecks as user count scales.

## MVP Scope
### What's In:
- **Editorial Landing Page, Home Dashboard, & Trip Command Center** following the 3 uploaded visual references, with Framer Motion page transitions, contextual skeletons, and Sonner toasts.
- **Email-Based Auth & Member Invitation** (Demo Quick-Login by Email for instant testing + production Supabase Auth email/OAuth support) with a hard PostgreSQL trigger enforcing **max 4 members per trip**.
- **Onboarding Wizard** with Central Java destination presets (Semarang, Dieng, Magelang/Borobudur, Yogyakarta, Solo, Karimunjawa).
- **Specific Itinerary Planner:** Day tabs, time slots, transit buffer cards, wishlist staging area, and item locking.
- **Finance & Split-Bill Module:** Category budgets, Plan vs. Actual comparison, multi-payer/multi-split expense logging, automated settlement calculator, and financial audit trail.

### Not Doing (and Why)
- **Automated Payment Gateway / In-App Bank Transfers (Midtrans/Xendit):** High compliance overhead and fees; automated debt simplification + static bank/QRIS info + "Mark as Settled" is faster and free.
- **Real-Time Continuous GPS Member Tracking:** Drains mobile battery and database write quota.
- **Direct OTA Hotel/Ticket Booking API Integration:** Focused on collaborative planning and group finance, not ticketing.
