import { describe, it, expect } from 'vitest';
import {
  canAddOrEditItineraryItem,
  canToggleItineraryLock,
  canMutateFinances,
  canManageMembers,
  MAX_TRIP_MEMBERS,
} from '@/lib/rbac/guards';

describe('Module 4: itinerary-collab RBAC & 4-Member Cap Guards', () => {
  it('enforces max 4 collaborators per trip', () => {
    expect(MAX_TRIP_MEMBERS).toBe(4);
    expect(canManageMembers('owner', 3, 'invite').allowed).toBe(true);
    expect(canManageMembers('owner', 4, 'invite').allowed).toBe(false);
    expect(canManageMembers('editor', 2, 'invite').allowed).toBe(false);
  });

  it('protects Owner-locked itinerary items from Editor modifications', () => {
    expect(canAddOrEditItineraryItem('owner', true).allowed).toBe(true);
    expect(canAddOrEditItineraryItem('editor', false).allowed).toBe(true);
    expect(canAddOrEditItineraryItem('editor', true).allowed).toBe(false);
    expect(canAddOrEditItineraryItem('viewer', false).allowed).toBe(false);
  });

  it('restricts lock toggling strictly to Owner', () => {
    expect(canToggleItineraryLock('owner').allowed).toBe(true);
    expect(canToggleItineraryLock('editor').allowed).toBe(false);
    expect(canToggleItineraryLock('viewer').allowed).toBe(false);
  });

  it('blocks Viewer from financial mutations while allowing Owner and Editor', () => {
    expect(canMutateFinances('owner').allowed).toBe(true);
    expect(canMutateFinances('editor').allowed).toBe(true);
    expect(canMutateFinances('viewer').allowed).toBe(false);
  });
});

