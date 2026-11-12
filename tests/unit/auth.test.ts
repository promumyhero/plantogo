import { describe, it, expect } from 'vitest';
import {
  normalizeEmail,
  isValidEmailFormat,
  isValidPersonName,
  resolveMemberRoleByEmail,
  DEMO_ACCOUNTS,
} from '@/lib/auth/demo-users';

describe('Module 1: core-db-auth & Strict Input Rules for Email/Name', () => {
  it('normalizes emails by stripping spaces and lowercasing', () => {
    expect(normalizeEmail('  Ridho.Hery@PlanToGo.ID  ')).toBe('ridho.hery@plantogo.id');
    expect(normalizeEmail('andi.pratama @ gmail.com')).toBe('andi.pratama@gmail.com');
  });

  it('validates email format strictly', () => {
    expect(isValidEmailFormat('andi@gmail.com')).toBe(true);
    expect(isValidEmailFormat('budi.santoso@company.co.id')).toBe(true);
    expect(isValidEmailFormat('bukan-email')).toBe(false);
    expect(isValidEmailFormat('andi@gmail')).toBe(false);
  });

  it('enforces letters-only rule for person display names (rejects numbers and symbols)', () => {
    expect(isValidPersonName('Ridho Hery')).toBe(true);
    expect(isValidPersonName("Putri D'Arc")).toBe(true);
    expect(isValidPersonName('Budi123')).toBe(false);
    expect(isValidPersonName('Andi @#$')).toBe(false);
    expect(isValidPersonName('A')).toBe(false);
  });

  it('resolves member role accurately by login email (case-insensitive)', () => {
    const members = [
      { invited_email: 'ridho@plantogo.id', role: 'owner' as const },
      { invited_email: 'andi.pratama@gmail.com', role: 'editor' as const },
      { invited_email: 'citra.lestari@gmail.com', role: 'viewer' as const },
    ];

    expect(resolveMemberRoleByEmail(members, 'RIDHO@PLANTOGO.ID')).toBe('owner');
    expect(resolveMemberRoleByEmail(members, '  andi.pratama@gmail.com ')).toBe('editor');
    expect(resolveMemberRoleByEmail(members, 'citra.lestari@gmail.com')).toBe('viewer');
    expect(resolveMemberRoleByEmail(members, 'orang.asing@gmail.com')).toBeNull();
  });

  it('provides 4 pre-configured demo accounts for 4-member collaboration testing', () => {
    expect(DEMO_ACCOUNTS).toHaveLength(4);
    expect(DEMO_ACCOUNTS[0].defaultRoleHint).toBe('owner');
    expect(DEMO_ACCOUNTS[3].defaultRoleHint).toBe('viewer');
  });
});

