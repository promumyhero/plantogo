import { TripMemberRole } from '@/types/database';

export const MAX_TRIP_MEMBERS = 4;

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

export function canAddOrEditItineraryItem(
  role: TripMemberRole | null,
  isItemLocked: boolean = false
): PermissionCheckResult {
  if (!role) {
    return {
      allowed: false,
      reason: 'Email Anda tidak terdaftar sebagai kolaborator di perjalanan ini.',
    };
  }
  if (role === 'viewer') {
    return {
      allowed: false,
      reason: 'Role Anda adalah Viewer (Hanya Lihat). Hubungi Owner untuk akses Editor.',
    };
  }
  if (isItemLocked && role !== 'owner') {
    return {
      allowed: false,
      reason: 'Jadwal ini telah dikunci (Locked) oleh Owner dan tidak dapat diubah oleh Editor.',
    };
  }
  return { allowed: true };
}

export function canToggleItineraryLock(role: TripMemberRole | null): PermissionCheckResult {
  if (role !== 'owner') {
    return {
      allowed: false,
      reason: 'Hanya Owner perjalanan yang memiliki izin mengunci atau membuka kunci jadwal.',
    };
  }
  return { allowed: true };
}

export function canMutateFinances(role: TripMemberRole | null): PermissionCheckResult {
  if (!role) {
    return {
      allowed: false,
      reason: 'Email Anda bukan anggota perjalanan ini.',
    };
  }
  if (role === 'viewer') {
    return {
      allowed: false,
      reason: 'Role Viewer hanya diizinkan melihat rincian anggaran dan split-bill.',
    };
  }
  return { allowed: true };
}

export function canManageMembers(
  role: TripMemberRole | null,
  currentMemberCount: number,
  action: 'invite' | 'change_role' | 'remove'
): PermissionCheckResult {
  if (role !== 'owner') {
    return {
      allowed: false,
      reason: 'Hanya Owner perjalanan yang dapat mengundang email atau mengubah izin anggota.',
    };
  }
  if (action === 'invite' && currentMemberCount >= MAX_TRIP_MEMBERS) {
    return {
      allowed: false,
      reason: `Batas maksimal tercapai (${MAX_TRIP_MEMBERS}/${MAX_TRIP_MEMBERS} orang). Tidak dapat menambah kolaborator lagi.`,
    };
  }
  return { allowed: true };
}

