import { Profile, TripMemberRole } from '@/types/database';

export interface DemoAccount extends Profile {
  defaultRoleHint: TripMemberRole;
  badgeColor: string;
  shortBio: string;
}

// Harmonious Earth-Tone User Colors (Sage Olive, Terracotta Clay, Warm Umber, Sand Ochre)
export const EARTH_TONE_AVATAR_COLORS = [
  '#4F5D48', // Deep Sage Olive
  '#C46A4E', // Terracotta Clay
  '#8C6D53', // Warm Umber / Cocoa
  '#B58B61', // Sand Ochre
];

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'user-owner-ridho',
    email: 'ridho@plantogo.id',
    full_name: 'Ridho Hery',
    bank_info: 'BCA 8820194812 a/n Ridho Hery',
    defaultRoleHint: 'owner',
    badgeColor: '#4F5D48',
    shortBio: 'Pemilik Rencana Perjalanan (Owner)',
    created_at: '2026-11-01T08:00:00.000Z',
  },
  {
    id: 'user-editor-andi',
    email: 'andi.pratama@gmail.com',
    full_name: 'Andi Pratama',
    bank_info: 'Mandiri 137009281721 a/n Andi Pratama',
    defaultRoleHint: 'editor',
    badgeColor: '#C46A4E',
    shortBio: 'Kolaborator — Bisa Edit (Can Edit)',
    created_at: '2026-11-01T08:15:00.000Z',
  },
  {
    id: 'user-editor-budi',
    email: 'budi.santoso@gmail.com',
    full_name: 'Budi Santoso',
    bank_info: 'BNI 0918273645 a/n Budi Santoso',
    defaultRoleHint: 'editor',
    badgeColor: '#8C6D53',
    shortBio: 'Kolaborator — Bisa Edit (Can Edit)',
    created_at: '2026-11-01T08:30:00.000Z',
  },
  {
    id: 'user-viewer-citra',
    email: 'citra.lestari@gmail.com',
    full_name: 'Citra Lestari',
    bank_info: 'SeaBank 90128371625 a/n Citra Lestari',
    defaultRoleHint: 'viewer',
    badgeColor: '#B58B61',
    shortBio: 'Kolaborator — Hanya Lihat (Can View)',
    created_at: '2026-11-01T08:45:00.000Z',
  },
];

export function normalizeEmail(rawEmail: string): string {
  return rawEmail.replace(/\s+/g, '').trim().toLowerCase();
}

export function isValidEmailFormat(email: string): boolean {
  const cleaned = normalizeEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleaned);
}

export function isValidPersonName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 50) return false;
  return /^[a-zA-Z\s'’.-]+$/.test(trimmed);
}

export function resolveMemberRoleByEmail(
  members: Array<{ invited_email: string; role: TripMemberRole }>,
  activeEmail: string
): TripMemberRole | null {
  const normalized = normalizeEmail(activeEmail);
  const found = members.find((m) => normalizeEmail(m.invited_email) === normalized);
  return found ? found.role : null;
}
