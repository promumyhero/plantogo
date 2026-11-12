# Capability Map: PlanToGo (Collaborative Itinerary & Split-Bill Web App)

| Module id | Responsibility | Depends on |
|---|---|---|
| `core-db-auth` | PostgreSQL schema, scalable RLS policies, 4-member hard-cap trigger, financial audit log triggers, Demo Auth switcher + Supabase Auth foundation | — |
| `ui-shell-landing` | Minimalist-modern design system, responsive shell (mobile bottom nav, tablet/desktop sidebar), Landing Page, Home Dashboard, Framer Motion page transitions, Skeleton loaders, and Sonner toast system | `core-db-auth` |
| `trip-onboarding` | Multi-step interactive onboarding questionnaire (destination, dates, vibe, budget, companions) + Hybrid template & Central Java recommendation generator | `core-db-auth`, `ui-shell-landing` |
| `itinerary-collab` | Detailed day-by-day schedule, transit buffer slots, wishlist/proposal column, item lock mechanism, and 4-member RBAC (`owner`, `editor`, `viewer`) enforcement | `trip-onboarding` |
| `finance-splitbill` | Budget Plan vs. Actual dashboard, 1-click expense logging from itinerary items, Split-Bill & Debt Simplification engine, settlement tracker, and audit log viewer | `itinerary-collab` |

Build order: `core-db-auth` → `ui-shell-landing` → `trip-onboarding` → `itinerary-collab` → `finance-splitbill`

