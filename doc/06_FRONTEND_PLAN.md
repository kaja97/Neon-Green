# AgriFarm AI — Frontend Plan

## Tech Stack
Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Recharts · Zustand · React Query

**Current:** Web App (PWA, mobile-first)
**Future:** Flutter (Android, iOS, Desktop) — same API, different frontend

---

## Design Principles
1. **Mobile-first** — Farmers use phones, not desktops. Primary viewport: 375px–430px
2. **Card-based UI** — Each service is a block/card. Scannable at a glance
3. **Visual progress first** — Charts, progress rings, status icons over text lists
4. **Fast** — SSR for initial page load, React Query for live data
5. **Offline-ready** — PWA caching for daily plan (works without internet)
6. **Bilingual** — English + Sinhala/Tamil via i18next
7. **Simple** — Farmers with varying digital literacy must find it intuitive

---

## App Router File Structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/
│   │   ├── request-otp/page.tsx      ← Step 1: Request OTP
│   │   └── verify/page.tsx           ← Step 2: Verify OTP & Create
│   └── forgot-password/
│       ├── request-otp/page.tsx      ← Step 1: Request OTP
│       └── verify/page.tsx           ← Step 2: Verify OTP & Reset
├── (admin)/                          ← Admin backoffice shell
│   ├── layout.tsx                    ← Admin Sidebar + TopBar
│   ├── dashboard/page.tsx            ← System stats
│   ├── users/page.tsx                ← User management & roles
│   └── projects/page.tsx             ← Global project oversight
├── (app)/
│   ├── layout.tsx                    ← Main shell (TopBar + BottomNav)
│   ├── dashboard/page.tsx            ← Landing: project list + quick actions
│   ├── profile/
│   │   ├── page.tsx                  ← Farmer profile overview
│   │   └── settings/page.tsx         ← Edit profile, email/phone, password, livestock
│   ├── notifications/page.tsx        ← Notification center
│   └── projects/
│       ├── new/page.tsx              ← Create project wizard (step-by-step)
│       └── [id]/
│           ├── page.tsx              ← Project dashboard (Farming Circle + blocks)
│           ├── edit/page.tsx         ← Edit project details, delete project, manage services
│           ├── weather/page.tsx      ← Weather detail
│           ├── soil/page.tsx         ← Soil analysis detail
│           ├── plan/page.tsx         ← Full activity plan timeline
│           ├── disease/
│           │   ├── page.tsx          ← Disease watch
│           │   └── report/page.tsx   ← Report problem flow
│           ├── market/page.tsx       ← Market prices + revenue calculator
│           └── ai/page.tsx           ← AI Chat (free Gemini)


components/
├── ui/                               ← shadcn/ui base components
├── layout/
│   ├── TopBar.tsx                    ← Title + notifications bell + profile
│   ├── BottomNav.tsx                 ← Mobile bottom tab navigation
│   └── AppShell.tsx                  ← Layout wrapper
├── dashboard/
│   ├── ProjectCard.tsx               ← Project card (progress bar + crop icon)
│   ├── QuickActions.tsx              ← Floating: "New Project", "Report Issue"
│   └── EmptyState.tsx                ← First-time user empty dashboard
├── profile/
│   ├── ProfileEditForm.tsx           ← Edit name, language, method
│   ├── LivestockManager.tsx          ← Add/Edit/Delete livestock
│   └── AccountSettings.tsx           ← Change password, update email/phone
├── project/
│   ├── FarmingCircle.tsx             ← Visual ring showing all growth stages
│   ├── StageIndicator.tsx            ← Single stage dot on the circle
│   ├── DayCounter.tsx                ← "Day 45 of 90" display
│   ├── ProgressRing.tsx              ← Circular progress (% complete)
│   └── ProjectSettings.tsx           ← Edit project, delete project, toggle services
├── blocks/
│   ├── WeatherBlock.tsx              ← Weather summary card
│   ├── SoilBlock.tsx                 ← Soil status card
│   ├── ActivityBlock.tsx             ← Today's activities card
│   ├── DiseaseBlock.tsx              ← Disease watch status card
│   ├── MarketBlock.tsx               ← Current price + trend card
│   ├── AISummaryBlock.tsx            ← Latest AI summary card
│   └── AlertBanner.tsx               ← Weather/disease alert strip
├── activities/
│   ├── ActivityCard.tsx              ← Individual task card
│   ├── ActivityTimeline.tsx          ← Vertical timeline of past/future activities
│   ├── DoneButton.tsx                ← Checkmark: mark task complete
│   └── SkipDialog.tsx                ← Skip with reason dialog
├── ai/
│   ├── AIChatWindow.tsx              ← Chat interface with messages
│   ├── AISummaryCard.tsx             ← Formatted AI summary display
│   ├── AICostBadge.tsx               ← Shows "$0.00" + "8 calls remaining"
│   └── ChatInput.tsx                 ← Text input + send button
├── forms/
│   ├── ProjectWizard.tsx             ← Multi-step project creation
│   ├── SoilTestForm.tsx              ← Soil test result entry
│   ├── IssueReportForm.tsx           ← Report disease/pest problem
│   └── LocationPicker.tsx            ← Map-based location selector
└── charts/
    ├── PriceTrendChart.tsx           ← 30-day price line chart
    ├── WeatherForecastChart.tsx      ← 5-day weather bar chart
    ├── SoilRadarChart.tsx            ← Nutrient levels radar
    └── ActivityCompletionChart.tsx   ← Weekly task completion pie

lib/
├── api.ts                           ← Axios instance, interceptors, token refresh
├── auth.ts                          ← JWT storage, login/logout helpers
├── hooks/
│   ├── useProjects.ts               ← React Query: fetch projects
│   ├── useDashboard.ts              ← React Query: fetch dashboard data
│   ├── useActivities.ts             ← React Query: today's activities
│   ├── useWeather.ts                ← React Query: weather data
│   ├── useAISummary.ts              ← React Query: AI summary
│   └── useNotifications.ts          ← React Query: notifications
├── stores/
│   ├── authStore.ts                 ← Zustand: user auth state
│   ├── offlineStore.ts              ← Zustand: offline-cached daily plan
│   └── uiStore.ts                   ← Zustand: sidebar state, theme, locale
└── utils/
    ├── dateUtils.ts                 ← Date formatting, "days since planting"
    ├── stageUtils.ts                ← Calculate current stage from planting date
    └── formatters.ts                ← Number/currency formatting
```

---

## Key Pages Deep Dive

### 1. Dashboard (Landing Page)
**Route:** `/dashboard`
**API:** `GET /projects?status=active`

```
┌──────────────────────────────────────────────┐
│  [🌱 AgriFarm]              [🔔 3] [👤]      │  ← TopBar
├──────────────────────────────────────────────┤
│                                              │
│  📋 Active Projects (2)                       │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ 🍅 Tomato Farm — 1 Acre              │    │
│  │ ████████████░░░░░░ 50% · Day 45/90   │    │  ← ProjectCard
│  │ Stage: Flowering · 3 tasks today     │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ 🌶️ Chili — 0.5 Acres                 │    │
│  │ ███████░░░░░░░░░░ 35% · Day 40/115   │    │  ← ProjectCard
│  │ Stage: Vegetative · 2 tasks today    │    │
│  └──────────────────────────────────────┘    │
│                                              │
│              [ + New Project ]                │  ← QuickActions
│                                              │
├──────────────────────────────────────────────┤
│  [🏠 Home] [📊 Projects] [🤖 AI] [👤 Profile] │  ← BottomNav
└──────────────────────────────────────────────┘
```

### 2. Project Dashboard (The Core View) ⭐
**Route:** `/projects/[id]`
**API:** `GET /projects/{id}/dashboard`

```
┌──────────────────────────────────────────────┐
│  [← Back]  Tomato Farm — 1 Acre   [⚙️]      │
├──────────────────────────────────────────────┤
│                                              │
│         ╭───────── FARMING CIRCLE ─────────╮ │
│        ( ✓ )─( ✓ )─( ✓ )─( ★ )─( ○ )─( ○ ) │  ← FarmingCircle
│       Germ  Seed  Veg  FLOWER  Fruit  Harv  │
│                                              │
│           📅 Day 45 of 90 · 50%              │  ← DayCounter
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│  ⚠️ ALERTS                                    │
│  ┌──────────────────────────────────────┐    │
│  │ 🌧️ Heavy rain tomorrow — postpone    │    │  ← AlertBanner
│  │    fertilizer application             │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  📋 TODAY'S ACTIVITIES                        │
│  ┌──────────────────────────────────────┐    │
│  │ 💧 Water plants — 180L        [✓ Done]│   │  ← ActivityCard
│  │ 🔍 Check for blight           [✓ Done]│   │
│  │ 🧪 Apply MOP 45kg (due in 2d)  [Skip]│   │
│  └──────────────────────────────────────┘    │
│                                              │
│  📊 SERVICE BLOCKS (Horizontal scroll)        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐        │
│  │☀️ Weather │ │🧪 Soil   │ │💰 Market │       │  ← Blocks
│  │ 32°C    │ │ pH 6.2  │ │ 180 LKR │        │
│  │ Sunny   │ │ N: LOW  │ │ ↑ 12%   │        │
│  └─────────┘ └─────────┘ └─────────┘        │
│                                              │
│  🤖 AI SUMMARY                                │
│  ┌──────────────────────────────────────┐    │
│  │ "Your tomatoes are on track. Watch   │    │  ← AISummaryBlock
│  │  for blight due to humidity. Apply   │    │
│  │  potassium this week for fruit set." │    │
│  │                     [🔄 Refresh AI]  │    │
│  └──────────────────────────────────────┘    │
│                                              │
├──────────────────────────────────────────────┤
│  [🏠 Home] [📊 Projects] [🤖 AI] [👤 Profile] │
└──────────────────────────────────────────────┘
```

### 3. AI Chat Page
**Route:** `/projects/[id]/ai`
**API:** `POST /ai/chat`

```
┌──────────────────────────────────────────────┐
│  [← Back]  AI Assistant           [💡 $0.00] │  ← Shows it's FREE
├──────────────────────────────────────────────┤
│                                              │
│  📎 Context: Tomato Farm — Day 45/90         │  ← Context badge
│  📊 8 AI calls remaining today               │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ 🤖 Here's your daily summary:        │    │
│  │ Your tomato crop is in Flowering     │    │
│  │ stage. Growth looks healthy. Watch   │    │
│  │ for blight due to humidity forecast. │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ 👤 Why are my leaves turning yellow?  │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ 🤖 Based on your soil test (pH 6.2,  │    │
│  │ Nitrogen: LOW), the yellowing is     │    │
│  │ likely nitrogen deficiency. For your │    │
│  │ organic farm: Apply 25kg of compost  │    │
│  │ per acre this week...                │    │
│  └──────────────────────────────────────┘    │
│                                              │
├──────────────────────────────────────────────┤
│  [📷] [Type your question...]     [Send ➤]  │
└──────────────────────────────────────────────┘
```

### 4. Create Project Wizard
**Route:** `/projects/new`
**Steps:** 5-step wizard

```
Step 1: Select Crop
  → Grid of crop cards (Tomato, Chili, Rice, etc.) from GET /plants

Step 2: Select Location
  → List farmer's saved locations from GET /farmer/locations
  → Option to add new location with GPS/map picker

Step 3: Land & Method
  → Select land details from GET /farmer/land
  → Select farming method (Organic / Conventional / Integrated)

Step 4: Set Planting Date & Area
  → Date picker for planting start date
  → Area input (number + unit: acres/hectares)
  → Auto-calculates expected harvest date

Step 5: Review & Create
  → Summary of all selections
  → "Create Project" button → POST /projects
  → Redirect to project dashboard
  → Shows "Generating your farm plan..." loading state
```

### 5. Settings and Editing Views

**Project Edit (`/projects/[id]/edit`)**:
- Form to update Project details (`PUT /projects/{id}`).
- Toggle individual project services (`PATCH /projects/{id}/services/{type}`).
- Danger Zone: Delete project (`DELETE /projects/{id}`).

**Profile Settings (`/profile/settings`)**:
- Update Profile info (`PUT /farmer/profile`).
- Manage Livestock (`POST/PUT/DELETE /farmer/livestock`).
- Security: Change Password (`PATCH /auth/change-password`), Change Email/Phone (OTP verified).

---

## State Management

### Zustand Stores (Client State)
```typescript
// authStore.ts — Auth state
interface AuthStore {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

// offlineStore.ts — Cached daily plan for offline use
interface OfflineStore {
  todaysActivities: Activity[];
  lastSyncedAt: Date | null;
  cacheActivities: (activities: Activity[]) => void;
}
```

### React Query (Server State)
```typescript
// All API data uses React Query for caching + refetching

// Dashboard data — refetch every 5 minutes
const { data } = useQuery({
  queryKey: ['dashboard', projectId],
  queryFn: () => api.get(`/projects/${projectId}/dashboard`),
  staleTime: 5 * 60 * 1000,
  refetchInterval: 5 * 60 * 1000,
});

// AI Summary — refetch only when requested
const { data, refetch } = useQuery({
  queryKey: ['ai-summary', projectId],
  queryFn: () => api.get(`/ai/summary/${projectId}`),
  staleTime: 60 * 60 * 1000, // Cache for 1 hour
  enabled: false, // Only fetch when refetch() is called
});

// Mark activity done — optimistic update
const mutation = useMutation({
  mutationFn: (id) => api.patch(`/planner/activities/${id}/complete`),
  onMutate: async (id) => {
    // Optimistically mark as done in the UI
    queryClient.setQueryData(['dashboard', projectId], (old) => ({
      ...old,
      todays_activities: old.todays_activities.map(a =>
        a.id === id ? { ...a, status: 'done' } : a
      )
    }));
  }
});
```

---

## PWA Configuration

```javascript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.agrifarm\.app\/api\/v1\/planner\/.*\/today/,
      handler: 'StaleWhileRevalidate',  // Show cached daily plan, update in background
      options: { cacheName: 'daily-plan-cache', expiration: { maxAgeSeconds: 86400 } }
    },
    {
      urlPattern: /^https:\/\/api\.agrifarm\.app\/api\/v1\/weather\//,
      handler: 'CacheFirst',
      options: { cacheName: 'weather-cache', expiration: { maxAgeSeconds: 10800 } }
    }
  ]
});
```

**Offline capability:** Farmer can open the app without internet and still see:
- Today's activity list (cached from last sync)
- Weather forecast (cached, up to 3 hours old)
- Mark tasks as "done" (syncs when internet returns)

---

## Responsive Breakpoints

| Breakpoint | Target | Layout |
|-----------|--------|--------|
| 0-430px | Mobile (primary) | Single column, BottomNav, cards stack vertically |
| 431-768px | Tablet | Two-column grid for service blocks |
| 769px+ | Desktop | Sidebar nav, three-column dashboard |

---

## Future: Flutter Mobile App

When Flutter mobile apps are built, they will:
- Use the **same REST API** endpoints defined in `04_API_CONTRACT.md`
- Implement the **same UI layouts** described above using Flutter widgets
- Add **native features**: camera for disease photo, GPS for auto-location, push notifications via FCM
- Use **Hive** or **SQLite** for offline data caching (richer than PWA cache)
- Share a **design system** (colors, typography, spacing) with the web app
