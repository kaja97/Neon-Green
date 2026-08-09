# AgriFarm AI — Frontend Rules

## 1. Tech Stack (Fixed — Do Not Change)

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 14 App Router | `app/` directory, not `pages/` |
| Language | TypeScript | Strict mode. No `any` without justification |
| Styling | Tailwind CSS | Utility-first. No plain CSS files except `globals.css` |
| Components | shadcn/ui | Build on top of these, don't reinvent |
| Charts | Recharts | Weather, soil radar, market price, activity completion |
| Maps | Leaflet.js | Farm location picker only |
| Server State | React Query (TanStack v5) | All API data fetching/caching |
| Client State | Zustand | Auth state, offline queue, UI state (theme, locale) |
| PWA | next-pwa | Service Worker, offline caching |
| HTTP Client | Axios | Instance in `lib/api.ts` with JWT interceptors |

## 2. App Router Structure (Exact Paths)

```
app/
├── layout.tsx                        ← Root: fonts, metadata, QueryProvider
├── globals.css                       ← Tailwind base only
├── (auth)/                           ← Route group, no main nav
│   ├── login/page.tsx
│   ├── register/
│   │   ├── request-otp/page.tsx
│   │   └── verify/page.tsx
│   └── forgot-password/
│       ├── request-otp/page.tsx
│       └── verify/page.tsx
├── (admin)/                          ← Admin backoffice shell
│   ├── layout.tsx                    ← Admin Sidebar + TopBar
│   ├── dashboard/page.tsx            ← System stats
│   ├── users/page.tsx                ← User management & roles
│   └── projects/page.tsx             ← Global project oversight
└── (app)/                            ← Route group, has TopBar + BottomNav
    ├── layout.tsx                    ← AppShell wrapper
    ├── dashboard/page.tsx            ← Project cards list
    ├── profile/
    │   ├── page.tsx                  ← Profile overview
    │   └── settings/page.tsx         ← Settings (edit profile, password, livestock)
    ├── notifications/page.tsx
    └── projects/
        ├── new/page.tsx              ← 5-step create wizard
        └── [id]/
            ├── page.tsx              ← Project dashboard (THE core page)
            ├── edit/page.tsx         ← Edit/Delete project & services toggle
            ├── weather/page.tsx
            ├── soil/page.tsx
            ├── plan/page.tsx         ← Full activity timeline
            ├── disease/page.tsx
            ├── market/page.tsx
            └── ai/page.tsx           ← AI Chat (free Gemini)
```

## 3. Component Directory Structure

```
components/
├── ui/                    ← shadcn/ui base (Button, Card, Dialog, Sheet, etc.)
├── layout/
│   ├── TopBar.tsx         ← Project title + notifications bell + profile avatar
│   ├── BottomNav.tsx      ← Mobile 4-tab navigation
│   └── AppShell.tsx       ← Layout wrapper with TopBar + BottomNav
├── dashboard/
│   ├── ProjectCard.tsx    ← Progress bar + crop icon + stage + task count
│   ├── QuickActions.tsx   ← "New Project" FAB
│   └── EmptyState.tsx     ← First-time empty dashboard state
├── profile/
│   ├── ProfileEditForm.tsx   ← Edit name, language, method
│   ├── LivestockManager.tsx  ← Add/Edit/Delete livestock
│   └── AccountSettings.tsx   ← Change password, update email/phone
├── project/
│   ├── FarmingCircle.tsx  ← SVG ring: all growth stages with progress indicator
│   ├── StageIndicator.tsx ← Single stage dot on the ring
│   ├── DayCounter.tsx     ← "Day 45 of 90 · 50%"
│   ├── ProgressRing.tsx   ← Circular progress %
│   └── ProjectSettings.tsx ← Edit project, delete project, toggle services
├── blocks/                ← Dashboard service cards (horizontal scroll on mobile)
│   ├── WeatherBlock.tsx   ← Current temp + 5-day mini forecast
│   ├── SoilBlock.tsx      ← pH + N/P/K status badges
│   ├── ActivityBlock.tsx  ← Today's tasks with Done/Skip buttons
│   ├── DiseaseBlock.tsx   ← Active issues count
│   ├── MarketBlock.tsx    ← Price + trend arrow
│   ├── AISummaryBlock.tsx ← Latest AI summary + Refresh button
│   └── AlertBanner.tsx    ← Red/yellow strip for weather or disease alerts
├── activities/
│   ├── ActivityCard.tsx   ← Expandable task card
│   ├── ActivityTimeline.tsx ← Vertical timeline
│   ├── DoneButton.tsx     ← Checkmark with optional notes
│   └── SkipDialog.tsx     ← Skip with required reason
├── ai/
│   ├── AIChatWindow.tsx   ← Chat messages UI
│   ├── AISummaryCard.tsx  ← Formatted summary display
│   ├── AICostBadge.tsx    ← Shows "$0.00" + remaining calls
│   └── ChatInput.tsx      ← Text input + send
├── forms/
│   ├── ProjectWizard.tsx  ← Multi-step wizard (5 steps)
│   ├── SoilTestForm.tsx   ← Lab result entry form
│   ├── IssueReportForm.tsx ← Symptom selector + report
│   └── LocationPicker.tsx ← Leaflet map-based picker
└── charts/
    ├── PriceTrendChart.tsx        ← 30-day line chart
    ├── WeatherForecastChart.tsx   ← 5-day bar chart
    ├── SoilRadarChart.tsx         ← Nutrient radar
    └── ActivityCompletionChart.tsx ← Weekly pie chart
```

## 4. `lib/` Directory

```
lib/
├── api.ts            ← Axios instance: baseURL = NEXT_PUBLIC_API_URL, JWT interceptor, auto-refresh on 401
├── auth.ts           ← Token storage (localStorage), login/logout helpers, auth guard HOC
├── hooks/
│   ├── useProjects.ts       ← useQuery for project list
│   ├── useDashboard.ts      ← useQuery for /projects/{id}/dashboard (staleTime: 5 min)
│   ├── useActivities.ts     ← useQuery for today's activities
│   ├── useWeather.ts        ← useQuery for weather data
│   ├── useAISummary.ts      ← useQuery for AI summary (enabled: false — manual trigger)
│   └── useNotifications.ts  ← useQuery for notifications
├── stores/
│   ├── authStore.ts    ← Zustand: { user, accessToken, login(), logout(), refreshToken() }
│   ├── offlineStore.ts ← Zustand: { todaysActivities, lastSyncedAt, cacheActivities() }
│   └── uiStore.ts      ← Zustand: { sidebarOpen, locale, theme }
└── utils/
    ├── dateUtils.ts    ← Date formatting, "X days since planting" calculation
    ├── stageUtils.ts   ← Determine current growth stage from planting date + stages array
    └── formatters.ts   ← LKR currency formatting, weight/area unit display
```

## 5. State Management Rules

### React Query (Server/API state)
- ALL data that comes from the API must be managed by React Query.
- Use `queryKey` arrays consistently: `['dashboard', projectId]`, `['activities', projectId]`, `['ai-summary', projectId]`.
- Dashboard data: `staleTime: 5 * 60 * 1000` (5 minutes), `refetchInterval: 5 * 60 * 1000`.
- AI Summary: `enabled: false` — only fetch when user explicitly taps "Refresh AI".

### Optimistic Updates (Activity completion)
When a farmer marks a task as done, update the UI immediately before the API confirms:
```typescript
const mutation = useMutation({
  mutationFn: (id) => api.patch(`/planner/activities/${id}/complete`),
  onMutate: async (id) => {
    queryClient.setQueryData(['dashboard', projectId], (old) => ({
      ...old,
      todays_activities: old.todays_activities.map(a =>
        a.id === id ? { ...a, status: 'done' } : a
      )
    }));
  }
});
```

### Zustand (Client state only)
- `authStore` — JWT tokens, user object, login/logout actions.
- `offlineStore` — cache today's activities so they're visible without internet.
- `uiStore` — sidebar visibility, language toggle. Nothing that comes from the API.

## 6. Design Principles

1. **Mobile-first.** Primary viewport: 375px–430px. Design for phone first, then scale up.
2. **Card-based UI.** Every service (weather, soil, AI) is a block/card. Must be scannable at a glance.
3. **Visual progress over text.** Use the FarmingCircle ring, progress bars, and status icons rather than plain text lists.
4. **Fast initial load.** Use Next.js SSR for the first paint. React Query for live updates.
5. **No placeholder data.** If data is loading, show a skeleton. If data is empty, show an empty state component.

### Responsive Breakpoints
| Range | Device | Layout |
|-------|--------|--------|
| 0–430px | Mobile (primary) | Single column, BottomNav, cards stack vertically |
| 431–768px | Tablet | Two-column grid for service blocks |
| 769px+ | Desktop | Sidebar nav, three-column dashboard |

## 7. Offline-First PWA Architecture (Master Plan Alignment)

Configured via `next-pwa` in `next.config.js`. Designed for rural areas with spotty internet connectivity.

### Caching Strategy
- **Daily plan** (`/api/v1/planner/*/today`): `StaleWhileRevalidate`, 24-hour cache
- **Weather** (`/api/v1/weather/*`): `CacheFirst`, 3-hour cache
- **Static Assets:** Cached aggressively via Service Worker.

### Offline Behavior & Background Sync
1. The farmer MUST be able to open the app and see today's cached dashboard (activities, weather).
2. **Optimistic Updates:** When marking a task as "done", store the mutation in `offlineStore` (backed by `idb-keyval` for IndexedDB storage).
3. **Background Sync:** The Service Worker syncs the mutation queue with the server immediately upon regaining internet connectivity.
4. Show an "Offline Mode" indicator in the TopBar when `navigator.onLine` is false.

## 8. API Communication

All API calls go through `lib/api.ts` (Axios instance):
- `baseURL`: `process.env.NEXT_PUBLIC_API_URL` (set to `http://localhost:8000/api/v1` in dev)
- JWT interceptor: automatically adds `Authorization: Bearer <token>` to all requests
- Auto-refresh: on `401` response, call `/auth/refresh`, retry original request once
- On failed refresh: clear tokens, redirect to `/login`

## 9. The Project Dashboard Page (`/projects/[id]`)

This is the most important page. It calls `GET /projects/{id}/dashboard` which returns ALL blocks in one request. The page renders:
1. `FarmingCircle` — visual ring with all stages
2. `DayCounter` — "Day X of Y"
3. `AlertBanner` — if active weather/disease alerts exist
4. `ActivityBlock` — today's tasks with Done/Skip (id: `activity-block`)
5. Horizontal scroll of service blocks: `WeatherBlock` (id: `weather-block`), `SoilBlock` (id: `soil-block`), `MarketBlock` (id: `market-block`)
6. `AISummaryBlock` — cached AI summary with "Refresh AI" button (id: `ai-block`)

Do NOT make separate API calls for each block. Use the single dashboard aggregation endpoint.

### Notification Routing & Highlighting
When a farmer taps a push notification (e.g., "Fertilizer due"), the app routes them to the dashboard using hash routing based on the `Notification.target_block` property (e.g., `/projects/123#activity-block`). 
- The UI MUST automatically scroll to the targeted block.
- Apply a CSS keyframe animation to temporarily highlight (flash) the block so the farmer immediately knows what requires attention.

## 10. Create Project Wizard (`/projects/new`)

5-step wizard. Do not allow skipping steps. Wizard state is managed locally in the component (not Zustand):
1. **Select Crop** → `GET /plants` → grid of crop cards
2. **Select Location** → `GET /farmer/locations` → list + option to add new with Leaflet
3. **Land & Method** → `GET /farmer/land` + select farming method (Organic / Conventional / Integrated)
4. **Planting Date & Area** → date picker + area input + auto-calculated harvest date display
5. **Review & Create** → summary → `POST /projects` → redirect to new project dashboard → show "Generating your farm plan..." loading state

## 11. AI Chat Page (`/projects/[id]/ai`)

Key UI elements:
- Context badge: `"Tomato Farm — Day 45/90"` (always visible)
- Remaining calls counter: `"8 AI calls remaining today"`
- `"$0.00"` cost badge (prominent — this is a selling point)
- Chat message bubbles (farmer messages right-aligned, AI messages left-aligned)
- Loading indicator during AI generation
- If rate limited: show `"AI summary temporarily unavailable — showing smart summary"` and display deterministic fallback
