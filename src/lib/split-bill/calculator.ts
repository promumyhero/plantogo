import { Expense, ExpenseSplit, Settlement, SplitType, TripMember } from '@/types/database';

export interface SplitParticipantInput {
  member_id: string;
  exact_amount?: number;
  percentage?: number;
}

/**
 * Calculates integer Rupiah splits deterministically so that the sum of shares
 * ALWAYS equals the exact total expense amount (zero rounding discrepancy).
 */
export function calculateExpenseSplits(
  expenseId: string,
  totalAmount: number,
  splitType: SplitType,
  participants: SplitParticipantInput[]
): ExpenseSplit[] {
  const cleanTotal = Math.max(0, Math.floor(totalAmount));
  if (participants.length === 0 || cleanTotal === 0) {
    return [];
  }

  if (splitType === 'equal') {
    const count = participants.length;
    const baseShare = Math.floor(cleanTotal / count);
    const remainder = cleanTotal - baseShare * count;

    return participants.map((p, index) => ({
      id: `split-${expenseId}-${p.member_id}`,
      expense_id: expenseId,
      member_id: p.member_id,
      share_amount: baseShare + (index < remainder ? 1 : 0),
      is_settled: false,
    }));
  }

  if (splitType === 'exact') {
    const sumExact = participants.reduce(
      (acc, p) => acc + Math.max(0, Math.floor(p.exact_amount || 0)),
      0
    );
    if (sumExact !== cleanTotal) {
      throw new Error(
        `Total rincian nominal (Rp ${sumExact.toLocaleString('id-ID')}) harus sama persis dengan total pengeluaran (Rp ${cleanTotal.toLocaleString('id-ID')}).`
      );
    }

    return participants.map((p) => ({
      id: `split-${expenseId}-${p.member_id}`,
      expense_id: expenseId,
      member_id: p.member_id,
      share_amount: Math.max(0, Math.floor(p.exact_amount || 0)),
      is_settled: false,
    }));
  }

  // percentage split
  const sumPercent = participants.reduce((acc, p) => acc + (p.percentage || 0), 0);
  if (Math.abs(sumPercent - 100) > 0.01) {
    throw new Error(`Total persentase harus 100% (saat ini ${sumPercent}%).`);
  }

  let allocated = 0;
  return participants.map((p, idx) => {
    const pct = p.percentage || 0;
    const isLast = idx === participants.length - 1;
    const share = isLast
      ? cleanTotal - allocated
      : Math.floor((cleanTotal * pct) / 100);
    allocated += share;

    return {
      id: `split-${expenseId}-${p.member_id}`,
      expense_id: expenseId,
      member_id: p.member_id,
      share_amount: share,
      percentage: pct,
      is_settled: false,
    };
  });
}

export interface MemberNetBalance {
  member_id: string;
  display_name: string;
  invited_email: string;
  total_paid: number;
  total_share: number;
  net_balance: number; // positive = owed money (creditor), negative = owes money (debtor)
}

export interface SimplifiedDebtTransfer {
  from_member_id: string;
  from_name: string;
  from_email: string;
  to_member_id: string;
  to_name: string;
  to_email: string;
  to_bank_info?: string;
  amount: number; // integer IDR
}

export function calculateNetBalances(
  members: TripMember[],
  expenses: Expense[],
  settlements: Settlement[] = []
): MemberNetBalance[] {
  const map = new Map<string, MemberNetBalance>();

  (members || []).forEach((m) => {
    map.set(m.id, {
      member_id: m.id,
      display_name: m.display_name,
      invited_email: m.invited_email,
      total_paid: 0,
      total_share: 0,
      net_balance: 0,
    });
  });

  (expenses || []).forEach((exp) => {
    const payer = map.get(exp.paid_by_member_id);
    if (payer) {
      payer.total_paid += exp.amount || 0;
      payer.net_balance += exp.amount || 0;
    }

    const splits = Array.isArray(exp.splits) ? exp.splits : [];
    splits.forEach((s) => {
      const participant = map.get(s.member_id);
      if (participant) {
        participant.total_share += s.share_amount || 0;
        participant.net_balance -= s.share_amount || 0;
      }
    });
  });

  (settlements || []).forEach((st) => {
    const from = map.get(st.from_member_id);
    const to = map.get(st.to_member_id);
    if (from) {
      from.net_balance += st.amount || 0;
    }
    if (to) {
      to.net_balance -= st.amount || 0;
    }
  });

  return Array.from(map.values());
}

/**
 * Greedy min-cash-flow debt simplification across up to 4 collaborators.
 * Produces at most (N - 1) transfers.
 */
export function simplifyDebts(
  members: TripMember[],
  expenses: Expense[],
  settlements: Settlement[] = []
): SimplifiedDebtTransfer[] {
  const balances = calculateNetBalances(members, expenses, settlements);
  const memberLookup = new Map(members.map((m) => [m.id, m]));

  const debtors = balances
    .filter((b) => b.net_balance < 0)
    .map((b) => ({ ...b, remaining: Math.abs(b.net_balance) }))
    .sort((a, b) => b.remaining - a.remaining);

  const creditors = balances
    .filter((b) => b.net_balance > 0)
    .map((b) => ({ ...b, remaining: b.net_balance }))
    .sort((a, b) => b.remaining - a.remaining);

  const transfers: SimplifiedDebtTransfer[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];
    const transferAmount = Math.min(debtor.remaining, creditor.remaining);

    if (transferAmount > 0) {
      const creditorMember = memberLookup.get(creditor.member_id);
      transfers.push({
        from_member_id: debtor.member_id,
        from_name: debtor.display_name,
        from_email: debtor.invited_email,
        to_member_id: creditor.member_id,
        to_name: creditor.display_name,
        to_email: creditor.invited_email,
        to_bank_info: creditorMember?.bank_info,
        amount: transferAmount,
      });
    }

    debtor.remaining -= transferAmount;
    creditor.remaining -= transferAmount;

    if (debtor.remaining === 0) dIdx++;
    if (creditor.remaining === 0) cIdx++;
  }

  return transfers;
}

