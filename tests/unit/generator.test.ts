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

  it('injects inter-island return ticket departure (Day 1) and arrival (Final Day) slots for Kapal DLU', () => {
    const items = generateHybridItinerary({
      tripId: 'trip-pontianak-semarang',
      creatorMemberId: 'm-owner',
      startDate: '2026-12-24',
      endDate: '2026-12-27', // 4 days
      answers: {
        clusters: ['Semarang', 'Dieng', 'Magelang'],
        vibe: 'alam',
        pace: 'seimbang',
        transport: 'kapal_laut',
        vibeScores: { alam: 95, kuliner: 80, heritage: 75, relax: 70 },
        categoryBudgetPlan: {
          transport: 4680000,
          lodging: 4500000,
          food: 4000000,
          tickets: 2500000,
          shopping: 1200000,
          other: 1120000,
        },
        budgetInclusion: {
          originCity: 'Pontianak',
          originProvince: 'Kalimantan Barat',
          destinationProvince: 'Jawa Tengah',
          transportSubtype: 'dlu',
          oneWayFarePerPerson: 585000,
          returnTicketFarePerPerson: 1170000,
          includesReturnTicket: true,
          returnTicketEstimate: 1170000 * 4,
          includesLodging: true,
          includesEntranceTickets: true,
          includesEmergencyFund: true,
          vehicleDetails: 'Kapal DLU KM Dharma Ferry II PP',
          participantCount: 4,
        },
      },
    });

    const day1Departure = items.find((i) => i.id.includes('d1-departure-pp'));
    const finalDayReturn = items.find((i) => i.id.includes('d4-return-pp'));

    expect(day1Departure).toBeDefined();
    expect(day1Departure?.title).toContain('Keberangkatan PP: Pontianak');
    expect(day1Departure?.estimated_cost).toBe(585000);
    expect(day1Departure?.transit_mode).toContain('Kapal DLU');

    expect(finalDayReturn).toBeDefined();
    expect(finalDayReturn?.title).toContain('Kepulangan PP');
    expect(finalDayReturn?.estimated_cost).toBe(585000);
  });
});

