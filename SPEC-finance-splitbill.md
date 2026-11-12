# Spec Module 5: `finance-splitbill` (Budget Plan vs. Actual, Split-Bill Engine & Financial Audit Log)

## Objective
Deliver a high-trust, bank-grade group finance module for the 4 trip members, combining **Budget Plan vs. Actual** tracking, flexible **Split-Bill** expense logging (`equal`, `exact`, `percentage`), **Automated Debt Simplification** (*Who Owes Whom*), and an immutable **Financial Audit Trail**.

## Core Capabilities

### 1. Bento Budget Overview (Plan vs. Actual)
- **Total Trip Budget Card**: Displays Total Planned Budget (`total_budget_plan`), Total Actual Expenses (`SUM(expenses.amount)`), Remaining Budget, and Estimated Schedule Cost (`SUM(itinerary_items.estimated_cost)`).
- **Category Breakdown with Dot-Matrix Progress Bars** (inspired by Reference #3 *Nepalora*):
  - Tracks `Transportasi & BBM/Tol`, `Penginapan`, `Kuliner & Makan`, `Tiket Wisata`, and `Lainnya`.
  - Visual alert (Amber at >85%, Rose toast warning at >100%) when actual spending exceeds planned category allocation.

### 2. Multi-Mode Expense & Split-Bill Logger
- Can be triggered standalone ("+ Tambah Pengeluaran") or via 1-click from any Itinerary Card ("Catat Pengeluaran Aktual").
- Captures:
  - Title, Category, Date, Amount in integer IDR (`BIGINT`), and **Paid By (`paid_by_member_id`)** (any of the up to 4 email-invited trip members).
  - **Split Method**:
    1. **Bagi Rata (`equal`)**: Select 1 to 4 members; divides `amount` evenly in integer IDR, distributing any `1 - 3 IDR` remainder deterministically so `SUM(share_amount) === amount`.
    2. **Nominal Spesifik (`exact`)**: Enter exact IDR per member (useful when ordering different meals); validates that the sum of shares equals total `amount` before saving.
    3. **Persentase (`percentage`)**: Split by percentage across members totaling `100%`.

### 3. Automated Debt Simplification & Settlement Engine
- Computes net balance for each of the 4 members:
  $$\text{Net Balance}_i = \text{Total Paid}_i - \text{Total Share}_i + \text{Settlements Paid}_i - \text{Settlements Received}_i$$
- Runs a greedy min-cash-flow debt simplification algorithm (`simplifyDebts`) to produce the minimum number of transfers (at most $N - 1 = 3$ transfers for 4 people).
- Displays clear settlement cards: e.g., **`andi@gmail.com` membayar `Rp 245.000` ke `ridho@gmail.com`** with a **"Tandai Lunas (Settle)"** button (restricted to `owner` and `editor`).

### 4. Financial Security & Audit Trail (`expense_audit_logs`)
- Because `editor` members are allowed to add, edit, or delete expenses, every financial action (`CREATE`, `UPDATE`, `DELETE`, `SETTLE`) is recorded with:
  - Actor's login email (`actor_email`)
  - Timestamp (`created_at`)
  - Previous vs. New amount/title (`previous_data`, `new_data`)
- Accessible via the **"Riwayat & Audit Keamanan Keuangan"** drawer so all 4 members have 100% transparency on every Rupiah changed.

## Success Criteria
- [ ] Splitting any IDR amount (including odd numbers like `Rp 100.000` divided by 3 or 4 members) produces integer Rupiah shares whose sum equals `100.000` with zero rounding loss.
- [ ] Debt simplification accurately calculates net balances and updates immediately when a settlement is marked as paid.
- [ ] Editing or deleting an expense appends a visible, immutable entry in the Audit Log showing which member's email made the change and what values changed.

