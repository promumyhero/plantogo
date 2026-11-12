# Spec Module 3: `trip-onboarding` (Interactive Questionnaire & Hybrid Central Java Generator)

## Objective
Guide the user through an engaging, step-by-step initial questionnaire ("ditanyakan terlebih dahulu mengenai apa yang akan mereka rencanakan") that determines the trip structure, budget allocation, curated Central Java destinations, and initial email-invited collaborators (up to 4 members total).

## Questionnaire Flow (`/trips/new`)

### Step 1: Kawasan & Waktu Perjalanan (Where & When)
- Trip Title (e.g., *"Jawa Tengah Roadtrip 2026"*)
- Select 1 or more **Jawa Tengah Clusters**:
  1. **Semarang & Sekitarnya** (Kota Lama, Lawang Sewu, Umbul Sidomukti, Bandungan)
  2. **Dieng & Wonosobo** (Bukit Sikunir, Kawah Sikidang, Telaga Warna, Kebun Teh Tambi)
  3. **Magelang & Borobudur** (Candi Borobudur, Punthuk Setumbu, Nepal van Java, Svargabumi)
  4. **Solo & Karanganyar** (Keraton Surakarta, Pasar Gede, Pura Mangkunegaran, Tawangmangu)
  5. **Yogyakarta & Prambanan Border** (Candi Prambanan, Ratu Boko, Merapi Lava Tour, Malioboro)
  6. **Jepara & Karimunjawa** (Pulau Menjangan Besar, Pantai Tanjung Gelam, Bukit Love)
- Start Date & End Date (automatically calculates number of days).

### Step 2: Gaya Perjalanan & Prioritas (Travel Vibe & Pace)
- Interactive question cards (visualized with dot-matrix vibe bars like Reference #3):
  - **Dominant Vibe**: *Eksplorasi Alam & Gunung*, *Wisata Kuliner Legendaris*, *Heritage & Budaya*, or *Slow & Aesthetic Chill*.
  - **Trip Pace**: *Santai (2-3 tempat/hari)*, *Seimbang (3-4 tempat/hari)*, or *Padat/ambisius (5+ tempat/hari)*.
  - **Transportasi Utama**: *Mobil Pribadi / Sewa (Tol Trans-Jawa)*, *Kereta Api + Sewa Motor/Mobil Lokal*, or *Transportasi Umum / Travel*.

### Step 3: Rencana Anggaran (Budget Plan)
- Input **Total Target Budget** (or per-person target budget in IDR).
- Auto-calculates recommended category percentages based on Step 2 answers (e.g., higher `food` % for *Wisata Kuliner*, higher `transport` % for *Roadtrip Mobil Pribadi*, higher `tickets` % for *Heritage/Karimunjawa*), which the user can fine-tune with sliders.

### Step 4: Kolaborator via Email (Max 4 Orang & Izin Terbatas)
- Seat 1 is automatically the logged-in creator (`role: 'owner'`, e.g., `ridho@plantogo.id`).
- Up to **3 additional collaborator slots** where the Owner inputs:
  - **Email Login Teman** (`invited_email`, e.g., `andi@gmail.com`)
  - **Nama Panggilan** (`display_name`)
  - **Level Izin (`role`)**:
    - `Editor`: Bisa menambah/mengubah jadwal (yang tidak dikunci) & mencatat pengeluaran.
    - `Viewer`: Hanya bisa melihat jadwal & rincian keuangan tanpa bisa mengubah/menghapus.
- Enforces a strict UI + schema validation cap of 4 total members.

## Hybrid Output Generation
Upon submitting the wizard:
1. Creates the `trips` record and up to 4 `trip_members` records linked by `invited_email`.
2. Generates a complete **Day-by-Day Itinerary Skeleton** populated with curated Central Java destinations matching the selected clusters, pace, and vibe—complete with realistic time slots, **Transit Buffer slots** between cities/spots, and estimated costs in IDR.
3. Populates the **Wishlist / Rekomendasi Tambahan** drawer with leftover high-matching Central Java spots so the 4 collaborators can vote or drag them into the schedule.

## Success Criteria
- [ ] Completing the 4-step wizard transitions smoothly between steps (`framer-motion`) and validates inputs at every step.
- [ ] Generated itinerary accurately reflects the chosen Central Java clusters, trip duration, transport mode (transit slots), and vibe.
- [ ] Invited collaborator emails are saved in `trip_members` with their specific role (`editor` or `viewer`) and immediately available as participants in the Split-Bill module.

