import { describe, it, expect } from 'vitest';
import {
  calculateRecommendedCategoryBudgets,
  generateHybridItinerary,
} from '@/lib/presets/jawa-tengah';

describe('Module 3: trip-onboarding Hybrid Central Java Generator', () => {
  it('allocates category budgets that sum exactly to total target budget', () => {
    const total = 8000000;
    const budgets = calculateRecommendedCategoryBudgets(total, 'kuliner', 'mobil_pribadi');
    const sum = Object.values(budgets).reduce((a, b) => a + b, 0);
    expect(sum).toBe(total);
    expect(budgets.food).toBeGreaterThan(budgets.tickets);
  });

  it('generates day-by-day Central Java schedule including transit slots and wishlist items', () => {
    const items = generateHybridItinerary({
      tripId: 'trip-jateng-1',
      creatorMemberId: 'm1',
      startDate: '2026-12-10',
      endDate: '2026-12-12', // 3 days
      answers: {
        clusters: ['Dieng', 'Magelang', 'Semarang'],
        vibe: 'alam',
        pace: 'seimbang',
        transport: 'mobil_pribadi',
        vibeScores: { alam: 90, kuliner: 75, heritage: 80, relax: 70 },
        categoryBudgetPlan: {
          transport: 2000000,
          lodging: 2500000,
          food: 2000000,
          tickets: 1000000,
          shopping: 250000,
          other: 250000,
        },
      },
    });

    const scheduled = items.filter((i) => i.status === 'scheduled');
    const transits = items.filter((i) => i.item_type === 'transit');
    const wishlists = items.filter((i) => i.status === 'wishlist');

    expect(scheduled.length).toBeGreaterThan(0);
    expect(transits.length).toBeGreaterThan(0);
    expect(wishlists.length).toBeGreaterThan(0);
  });
});

