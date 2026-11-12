# Spec Module 2: `ui-shell-landing` (Editorial Minimalist Design System, Landing Page, Dashboard & Transitions)

## Objective
Deliver a cohesive, responsive UI shell and marketing/dashboard pages modeled directly after the user's 3 design references (*Visa Travels*, *Visit Indonesia*, and *Nepalora*), featuring smooth page transitions, contextual loading skeletons, and expressive toast notifications across Mobile, Tablet, and Desktop.

## Visual Language (From the 3 Uploaded References)

### 1. Typography & Hierarchy
- **Display / Editorial Headlines**: Clean geometric sans-serif (`Plus Jakarta Sans`, 600/700 weight) mixed with **Editorial Serif Italic** (`Instrument Serif` italic) on key emotional words:
  - Example Hero: *"Jawa Tengah *Without Limits*. Rencanakan Perjalanan Terbaikmu."*
  - Example Section: *"Discover *Curated Destinations* Across Central Java"*
- **Data & Currency**: Tabular numerals (`font-variant-numeric: tabular-nums`) so Rupiah columns and time slots align cleanly.

### 2. Color Palette & Surfaces
- **Canvas Background**: Warm Alabaster / Pure White (`#F9FAFB` / `#FFFFFF`) for effortless reading during daytime travel.
- **High-Contrast Editorial Blocks**: Deep Obsidian (`#0B0F17` / `#111827`) for featured Bento cards and dramatic destination showcase strips (inspired by Reference #2 *Visit Indonesia* & Reference #3 *Nepalora* bottom-left card).
- **Glassmorphic Overlays**: `bg-white/15 backdrop-blur-md border border-white/25` for hero search bars, floating pill badges (`relax`, `4 hari`, `Open Collab`), and slide indicators (`01 02 03 04`).
- **Semantic Accents**:
  - Primary CTA: Solid Obsidian `#0F172A` on light backgrounds, Solid White `#FFFFFF` pill button on hero photography.
  - Budget Healthy / Settled: Emerald `#10B981`
  - Budget Warning / Pending Invite: Amber `#F59E0B`
  - Over-budget / Locked / Restricted: Rose `#F43F5E`

### 3. Key Pages & Components in This Module
1. **Landing Page (`/`)**:
   - **Hero Section**: Full-bleed Central Java highland/temple photography with centered editorial title, right-hand vertical slide counter (`01 - 05`), pill CTA `Rencanakan Trip Sekarang`, and the **bottom translucent 4-column Quick Filter Bar** (`Gaya Trip / Aktivitas`, `Kawasan Jawa Tengah`, `Durasi / Tanggal`, `Estimasi Budget` + `Explore` button).
   - **Editorial Value Section**: *"Not Your Boring Spreadsheet"* section with staggered `rounded-3xl` photography cards (Dieng, Borobudur, Kota Lama Semarang, Karimunjawa).
   - **Popular Central Java Curated Cards Carousel**: Tall `rounded-3xl` cards with image background, glass tags, and full-width bottom `Explore` pill button.
   - **Bento Metric & Vibe Section**: 3-column bento row featuring a dark Tailor-Made card, an imagery card (`Made for Your Squad — Max 4 Collaborators`), and a white metric card with **dot-matrix progress bars** (`Alam`, `Kuliner`, `Heritage`, `Relax`) + bottom big stats (`6+ Kawasan`, `Maks 4 Kolaborator`, `100% Split-Bill Akurat`, `Multi-Device`).
2. **Home Dashboard (`/dashboard`)**:
   - Active user header showing logged-in **email badge** + quick account/demo-member switcher.
   - Pending Email Invitations banner (if another user invited your email, 1-click accept or auto-joined notification).
   - Trip Grid Cards + Quick Financial Overview Bento + Skeleton loading states.
3. **Responsive Navigation Shell**:
   - **Desktop & Landscape Tablet (`>= 768px`)**: Minimalist collapsible left sidebar + top context bar with collaborator avatars and role badges.
   - **Mobile (`< 768px`)**: Sticky frosted-glass **Bottom Navigation Bar** (`Ringkasan`, `Jadwal`, `Keuangan`, `Tim/4`) for effortless one-handed use on the road.
4. **Smooth Transitions, Skeletons & Toasts**:
   - `PageTransitionWrapper` using `framer-motion` (`opacity`, subtle `y: 8 -> 0`, spring physics).
   - Shimmering `<Skeleton />` components matching card and timeline geometries during state/route transitions.
   - Configured `<Toaster />` (`sonner`) with rich colors, icons, and Indonesian feedback messages.

## Success Criteria
- [ ] Landing page visually incorporates the Hero glass bar (Ref #1), dark editorial destination strip & vertical numbering (Ref #2), and Serif-Italic headlines + Bento dot-matrix stats (Ref #3).
- [ ] Every page transition animates smoothly without layout shift (`CLS < 0.1`), and loading states display structured skeletons.
- [ ] Mobile viewport (`375px`) displays a thumb-friendly bottom navigation bar, while desktop (`1280px`) uses a clean sidebar + top bar.

