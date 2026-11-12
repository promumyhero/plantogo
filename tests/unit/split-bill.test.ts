import { describe, it, expect } from 'vitest';
import {
  calculateExpenseSplits,
  calculateNetBalances,
  simplifyDebts,
} from '@/lib/split-bill/calculator';
import { Expense, Settlement, TripMember } from '@/types/database';

const mockMembers: TripMember[] = [
  {
    id: 'm1',
    trip_id: 't1',
    user_id: 'u1',
    invited_email: 'ridho@plantogo.id',
    display_name: 'Ridho Hery',
    role: 'owner',
    invite_status: 'active',
    personal_budget: 2500000,
    bank_info: 'BCA 8820194812',
    created_at: '',
  },
  {
    id: 'm2',
    trip_id: 't1',
    user_id: 'u2',
    invited_email: 'andi.pratama@gmail.com',
    display_name: 'Andi Pratama',
    role: 'editor',
    invite_status: 'active',
    personal_budget: 2000000,
    created_at: '',
  },
  {
    id: 'm3',
    trip_id: 't1',
    user_id: null,
    invited_email: 'budi.santoso@gmail.com',
    display_name: 'Budi Santoso',
    role: 'editor',
    invite_status: 'pending',
    personal_budget: 2000000,
    created_at: '',
  },
  {
    id: 'm4',
    trip_id: 't1',
    user_id: null,
    invited_email: 'citra.lestari@gmail.com',
    display_name: 'Citra Lestari',
    role: 'viewer',
    invite_status: 'pending',
    personal_budget: 1500000,
    created_at: '',
  },
];

describe('Module 5: finance-splitbill Mathematical Engine', () => {
  it('distributes odd remainder deterministically in equal split (zero rounding loss)', () => {
    const splits = calculateExpenseSplits('exp-odd', 100000, 'equal', [
      { member_id: 'm1' },
      { member_id: 'm2' },
      { member_id: 'm3' },
    ]);

    expect(splits).toHaveLength(3);
    const total = splits.reduce((sum, s) => sum + s.share_amount, 0);
    expect(total).toBe(100000);
    expect(splits[0].share_amount).toBe(33334);
    expect(splits[1].share_amount).toBe(33333);
    expect(splits[2].share_amount).toBe(33333);
  });

  it('validates exact split sum strictly', () => {
    expect(() =>
      calculateExpenseSplits('exp-exact-bad', 200000, 'exact', [
        { member_id: 'm1', exact_amount: 100000 },
        { member_id: 'm2', exact_amount: 50000 },
      ])
    ).toThrow(/harus sama persis/i);

    const valid = calculateExpenseSplits('exp-exact-ok', 200000, 'exact', [
      { member_id: 'm1', exact_amount: 120000 },
      { member_id: 'm2', exact_amount: 80000 },
    ]);
    expect(valid.reduce((s, i) => s + i.share_amount, 0)).toBe(200000);
  });

  it('simplifies debts across 4 collaborators into minimum transfers and accounts for settlements', () => {
    const splits1 = calculateExpenseSplits(
      'e1',
      400000,
      'equal',
      mockMembers.map((m) => ({ member_id: m.id }))
    );

    const expenses: Expense[] = [
      {
        id: 'e1',
        trip_id: 't1',
        itinerary_item_id: null,
        title: 'Sewa Villa Dieng',
        category: 'lodging',
        amount: 400000,
        paid_by_member_id: 'm1', // Ridho paid 400k for all 4 (each owes 100k)
        split_type: 'equal',
        splits: splits1,
        incurred_at: '2026-11-12',
        created_by_member_id: 'm1',
        updated_at: '',
      },
    ];

    const settlements: Settlement[] = [];
    const transfers = simplifyDebts(mockMembers, expenses, settlements);

    expect(transfers).toHaveLength(3);
    expect(transfers.every((t) => t.to_member_id === 'm1' && t.amount === 100000)).toBe(true);

    // Now Andi (m2) settles his 100k debt to Ridho (m1)
    const afterSettlement = simplifyDebts(mockMembers, expenses, [
      {
        id: 's1',
        trip_id: 't1',
        from_member_id: 'm2',
        to_member_id: 'm1',
        amount: 100000,
        settled_at: '',
      },
    ]);

    expect(afterSettlement).toHaveLength(2);
    const balances = calculateNetBalances(mockMembers, expenses, [
      {
        id: 's1',
        trip_id: 't1',
        from_member_id: 'm2',
        to_member_id: 'm1',
        amount: 100000,
        settled_at: '',
      },
    ]);
    const andiBalance = balances.find((b) => b.member_id === 'm2');
    expect(andiBalance?.net_balance).toBe(0);
  });
});

