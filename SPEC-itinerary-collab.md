# Spec Module 4: `itinerary-collab` (Hyper-Specific Schedule, Transit Slots, Wishlist & 4-User RBAC)

## Objective
Provide a hyper-specific, collaborative itinerary workspace where up to 4 email-invited members can view, propose, edit, lock, and track their day-by-day Central Java trip schedule according to strict role permissions (`owner`, `editor`, `viewer`).

## Core Capabilities

### 1. Day-by-Day Specific Timeline
- **Day Selector Tabs**: `Hari 1 (Semarang)`, `Hari 2 (Dieng)`, etc., with daily estimated cost summary and activity count.
- **Detailed Activity Cards**:
  - Time range (`08:00 - 10:30 WIB`), Category badge (`Destinasi`, `Kuliner`, `Penginapan`), City cluster tag, Location name, Specific Notes (e.g., *"Beli tiket terusan di loket barat, bawa jaket tebal 12°C"*), and Planned Budget (`Rp 150.000`).
  - **Lock Status (`is_locked`)**: Owner can toggle a lock icon on finalized items. When locked, `editor` members cannot edit or delete the item.
  - **1-Click "Catat Pengeluaran Aktual" Button**: Opens the Expense Modal pre-filled with the activity's title, category, and planned cost, linking the resulting expense directly to `itinerary_item_id`.

### 2. Realistic Transit Buffer Slots
- Between destinations, the timeline displays **Transit Cards** showing:
  - Transport mode (`Mobil Pribadi via Tol`, `Kereta Api`, `Perjalanan Darat Pegunungan`)
  - Estimated travel duration (`45 menit`, `2 jam 15 menit`)
  - Estimated transit cost (e.g., Tol/BBM/Parkir) so roadtrip budgets in Central Java stay realistic.

### 3. Collaborative Wishlist / Proposal Staging Area
- Side panel (or tab on mobile) listing proposed places & curated Central Java recommendations.
- `Owner` and `Editor` can add new ideas to the Wishlist or promote a Wishlist item into a specific Day & Time slot.

### 4. Strict Role-Based Access Control (RBAC) Matrix (Max 4 Users)
| Action | `Owner` (Creator) | `Editor` (Invited Email) | `Viewer` (Invited Email) |
|---|---|---|---|
| View itinerary, budget & split-bill | ✅ Allowed | ✅ Allowed | ✅ Allowed |
| Add new itinerary item or wishlist idea | ✅ Allowed | ✅ Allowed | ❌ Blocked (UI disabled + guard toast) |
| Edit / Delete unlocked itinerary item | ✅ Allowed | ✅ Allowed | ❌ Blocked |
| Lock / Unlock itinerary item (`is_locked`) | ✅ Allowed | ❌ Blocked | ❌ Blocked |
| Edit / Delete a **LOCKED** itinerary item | ✅ Allowed | ❌ Blocked | ❌ Blocked |
| Invite / Remove member email (up to 4) | ✅ Allowed | ❌ Blocked | ❌ Blocked |
| Change member role (`editor` ↔ `viewer`) | ✅ Allowed | ❌ Blocked | ❌ Blocked |

### 5. Interactive Role & Email Switcher (For Instant Testing & Demo)
- Top bar includes a **"Simulasi Login Email (4 Member)"** pill switcher alongside standard login so you can immediately test switching between `Owner (Anda)`, `Editor 1 (email teman)`, `Editor 2 (email teman)`, and `Viewer (email teman)` and experience the exact permission boundaries and toast alerts in real time.

## Success Criteria
- [ ] Users can filter by day, add/edit/delete specific itinerary items and transit slots, and promote wishlist items into the schedule.
- [ ] `Viewer` role is strictly prevented from mutating any schedule or financial data, receiving clear visual indicators and toast explanations.
- [ ] `Editor` role can edit unlocked items but is blocked from modifying or deleting `Owner`-locked items (`is_locked = true`).
- [ ] Member management modal enforces the maximum of 4 email-invited members and allows `Owner` to update roles or remove a member (if they have no unsettled financial balances).

