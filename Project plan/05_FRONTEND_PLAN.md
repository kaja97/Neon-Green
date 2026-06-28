# AgriFarm AI — Frontend Plan

## Tech: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui

---

## Design Principles
1. **Mobile-first** — most farmers use phones, not desktops
2. **Card-based UI** — each service is a block/card, scannable at a glance
3. **Visual first** — charts, progress rings, status icons over text lists
4. **Fast** — SSR for initial load, React Query for live data
5. **Offline-ready** — PWA, cache daily plan, work without internet
6. **Bilingual** — English + Sinhala/Tamil via i18next

---

## App Router File Structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── forgot-password/page.tsx
├── (app)/
│   ├── layout.tsx                    ← Main app shell (nav, bottom bar)
│   ├── dashboard/page.tsx            ← Landing: project list
│   ├── profile/page.tsx              ← Farmer profile settings
│   ├── projects/
│   │   ├── new/page.tsx              ← Create project wizard
│   │   └── [id]/
│   │       ├── page.tsx              ← Project dashboard
│   │       ├── weather/page.tsx      ← Weather service block detail
│   │       ├── soil/page.tsx         ← Soil service block detail
│   │       ├── plan/page.tsx         ← Activity plan block detail
│   │       ├── disease/page.tsx      ← Disease watch block detail
│   │       ├── market/page.tsx       ← Market price block detail
│   │       ├── ai/page.tsx           ← AI chat block
│   │       └── report-issue/page.tsx ← Report disease/pest
│   └── notifications/page.tsx
├── api/                              ← Next.js API routes (proxies to FastAPI)
│   └── ...
components/
├── ui/                               ← shadcn/ui base
├── layout/
│   ├── BottomNav.tsx
│   ├── TopBar.tsx
│   └── AppShell.tsx
├── dashboard/
│   ├── ProjectCard.tsx
│   ├── ProjectGrid.tsx
│   └── CreateProjectButton.tsx
├── project/
│   ├── FarmingCircle.tsx             ← Visual progress ring (key component)
│   ├── StageIndicator.tsx
│   ├── TodayAlerts.tsx
│   └── ServiceBlockList.tsx
├── services/
│   ├── WeatherBlock.tsx
│   ├── SoilBlock.tsx
│   ├── ActivityPlanBlock.tsx
│   ├── DiseaseWatchBlock.tsx
│   ├── MarketBlock.tsx
│   └── AIChatBlock.tsx
├── activities/
│   ├── ActivityCard.tsx
│   ├── ActivityDetails.tsx
│   └── ActivityCalendar.tsx
├── notifications/
│   ├── NotificationBell.tsx
│   └── NotificationList.tsx
└── common/
    ├── LoadingSpinner.tsx
    ├── EmptyState.tsx
    └── StatusBadge.tsx
```

---

## PAGE 1: Authentication Pages
**Routes:** `/login`, `/register`, `/forgot-password`

### Register Flow
```
Step 1: Email + Password + Phone
Step 2: Full Name + Location (GPS or manual)
Step 3: Farming experience + method preference
Step 4: (Optional) First project quick-start
```

### Components
- Clean minimal form, no sidebar
- Google OAuth option
- Phone-first (many farmers use phone number login)

---

## PAGE 2: Main Dashboard (Project List)
**Route:** `/dashboard`

```
┌──────────────────────────────────────┐
│  🌾 AgriFarm          [🔔] [👤]      │
├──────────────────────────────────────┤
│  Good morning, Nimal! ☀️             │
│  You have 3 active projects          │
├──────────────────────────────────────┤
│  TODAY'S ALERTS (2)                  │
│  🌧️ Rain expected tomorrow — Tomato  │
│  💧 Water your Beans today          │
├──────────────────────────────────────┤
│  YOUR PROJECTS                       │
│                                      │
│  ┌─────────────────┐ ┌────────────┐  │
│  │ 🍅 Tomatoes     │ │🫘 Beans    │  │
│  │ 1 Acre          │ │ 0.5 Acre   │  │
│  │ ●●●○○○ 50%     │ │ ●●●●●○ 83%│  │
│  │ Flowering Stage │ │ Harvest    │  │
│  │ 3 tasks today   │ │ 1 task     │  │
│  └─────────────────┘ └────────────┘  │
│                                      │
│  ┌─────────────────┐                 │
│  │  + New Project  │                 │
│  └─────────────────┘                 │
└──────────────────────────────────────┘
```

### ProjectCard Component
```tsx
interface ProjectCardProps {
  project: Project;
  currentStage: PlantStage;
  progressPct: number;
  todayTaskCount: number;
  alertCount: number;
}

// Shows:
// - Crop emoji + name
// - Area
// - Progress ring (Recharts RadialBarChart)
// - Stage name
// - Task count badge
// - Alert badge
```

---

## PAGE 3: Create Project Wizard
**Route:** `/projects/new`

```
Step 1: Select Crop
  - Search crops (fuzzy search from plants table)
  - Show crop image, growth duration, difficulty

Step 2: Project Details
  - Project name (auto-filled: "Tomato Farm - June 2025")
  - Select location (from farmer's saved locations)
  - Select land (from farmer's land details)
  - Area + unit

Step 3: Farming Method
  - Organic / Conventional / Integrated
  - (Each shows brief description)

Step 4: Schedule
  - Planting date (date picker)
  - Expected harvest date (auto-calculated + editable)

Step 5: Services (multi-select)
  - ✅ Weather Alerts (recommended)
  - ✅ Activity Planner (recommended)
  - ☐ Soil Analysis
  - ☐ Market Prices
  - ☐ Disease Watch
  - ☐ AI Assistant

Step 6: Review + Create
  - Summary of all choices
  - "Create Project" button
  - Shows what will be generated automatically
```

---

## PAGE 4: Project Dashboard ⭐ (Most Important Page)
**Route:** `/projects/[id]`

### Layout
```
┌──────────────────────────────────────────┐
│ ← Tomato Farm — 1 Acre    [⚠️2] [···]   │
├──────────────────────────────────────────┤
│                                          │
│         FARMING CIRCLE                   │
│    ┌─────────────────────┐               │
│    │      ○ Seed         │               │
│    │   ●                 │               │
│    │  ●  [🍅 TOMATO]    ●│               │
│    │   ●   Day 45/90    ● │               │
│    │      ●●● Flower   ● │               │
│    │        ○ Harvest    │               │
│    └─────────────────────┘               │
│    Stage: Flowering  [50% Complete]      │
│                                          │
├──────────────────────────────────────────┤
│  TODAY'S ACTION ITEMS                    │
│  ┌──────────────────────────────────┐    │
│  │ 🔴 URGENT — Water 180L today     │    │
│  │    Tomorrow has no rain ↗        │    │
│  └──────────────────────────────────┘    │
│  ┌──────────────────────────────────┐    │
│  │ 🟡 Apply Potassium fertilizer    │    │
│  │    See details below ↓           │    │
│  └──────────────────────────────────┘    │
├──────────────────────────────────────────┤
│  SERVICE BLOCKS                          │
│                                          │
│  ┌── 🌤️ WEATHER ──────────────────┐     │
│  │  Today: Sunny 32°C              │     │
│  │  Tomorrow: Partly cloudy        │     │
│  │  Day 3: RAIN ☔ 25mm             │     │
│  │  ⚡ Skip watering Day 3         │     │
│  │  [See full forecast →]          │     │
│  └─────────────────────────────────┘     │
│                                          │
│  ┌── 🧪 SOIL STATUS ──────────────┐     │
│  │  Last test: 2 weeks ago         │     │
│  │  pH: 6.2 ✅ Nitrogen: LOW ⚠️   │     │
│  │  Recommendation: +15kg Urea     │     │
│  │  [View full analysis →]         │     │
│  └─────────────────────────────────┘     │
│                                          │
│  ┌── 📋 ACTIVITY PLAN ────────────┐     │
│  │  Today:                         │     │
│  │  • Water 180L [✓ Done] [Skip]  │     │
│  │  • Apply Potassium 12kg        │     │
│  │    ↳ Product: Muriate of Potash │     │
│  │    ↳ Method: Broadcast + water  │     │
│  │  Tomorrow: Monitor for pests    │     │
│  │  [See 7-day plan →]            │     │
│  └─────────────────────────────────┘     │
│                                          │
│  ┌── 🦠 DISEASE WATCH ────────────┐     │
│  │  ⚠️ HIGH RISK: Blight (fungal) │     │
│  │  Condition: High humidity week  │     │
│  │  Prevention: Spray Mancozeb    │     │
│  │  [I see symptoms → Report]     │     │
│  └─────────────────────────────────┘     │
│                                          │
│  ┌── 💰 MARKET PRICES ────────────┐     │
│  │  Tomato (Colombo Market)        │     │
│  │  Today: Rs. 180/kg ↑+12%       │     │
│  │  Trend: Rising this week        │     │
│  │  Best sell window: 2 weeks      │     │
│  └─────────────────────────────────┘     │
│                                          │
│  ┌── 🤖 AI ASSISTANT ─────────────┐     │
│  │  "Ask me anything about your   │     │
│  │   tomato farm..."              │     │
│  │  [Start Chat →]                │     │
│  └─────────────────────────────────┘     │
│                                          │
└──────────────────────────────────────────┘
```

### FarmingCircle Component (Key Visual)
```tsx
// Uses Recharts RadialBarChart + SVG overlay
// Shows plant stages as arcs around a circle
// Current day marked with a position indicator
// Stages colored: completed=green, current=blue, upcoming=gray

interface FarmingCircleProps {
  stages: PlantStage[];
  currentDay: number;
  totalDays: number;
  plantName: string;
  plantEmoji: string;
}
```

### Notification → Deep Link → Service Block Scroll
```tsx
// When user taps notification, URL gets fragment:
// /projects/[id]?scroll=activity_plan&highlight=activity_123

// On load:
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const scrollTo = params.get('scroll');
  const highlight = params.get('highlight');
  
  if (scrollTo) {
    const el = document.getElementById(scrollTo);
    el?.scrollIntoView({ behavior: 'smooth' });
    
    if (highlight) {
      setHighlightedItem(highlight);  // pulse animation
      setTimeout(() => setHighlightedItem(null), 3000);
    }
  }
}, []);
```

---

## PAGE 5: Weather Service Detail
**Route:** `/projects/[id]/weather`

```
- 7-day forecast card strip (horizontal scroll)
- Hourly forecast chart (line chart: temp + humidity)
- Farm-specific alerts section
- Weather impact on activities (rule-based list)
- Historical rainfall for this location (bar chart)
```

---

## PAGE 6: Soil Analysis Detail
**Route:** `/projects/[id]/soil`

```
- Last test date + "Add new test" button
- Nutrient status radar chart (N, P, K, pH, etc.)
  - Shows actual vs optimal range for this crop
- Deficiency indicators (red/yellow/green badges)
- Recommendations list (prioritized)
- Test history timeline
- "Upload soil test report" (PDF → OCR → auto-fill)
```

### Soil Nutrient Radar Chart (Recharts)
```tsx
// Radar chart showing 6 key nutrients
// Each axis shows: optimal range shaded in green
// Farmer's actual values plotted as line
// Deficient areas immediately visible

const nutrients = ['pH', 'Nitrogen', 'Phosphorus', 'Potassium', 'Calcium', 'Organic Matter'];
```

---

## PAGE 7: Activity Plan Detail
**Route:** `/projects/[id]/plan`

```
- Calendar view (month/week toggle)
- Activity list grouped by date
- Each activity card shows:
  - Type icon + title
  - Quantity/details
  - Status (pending/done/skipped)
  - [✓ Done] [Skip] [Reschedule] buttons
- Filter by type (watering/fertilizing/etc.)
- "Today" quick-scroll button
```

---

## PAGE 8: Disease Watch Detail
**Route:** `/projects/[id]/disease`

```
- Risk calendar (heatmap of high-risk periods)
- Current risk level (banner: LOW/MEDIUM/HIGH)
- Known diseases for this crop (accordion cards)
  - Disease name + symptoms
  - Current risk level
  - Prevention actions
- Reported issues history
- "Report new problem" FAB button
```

### Report Issue Flow
```
1. Select what farmer sees:
   - Yellowing leaves / Brown spots / Wilting / Insects / Holes in leaves / Other
2. Select affected parts: leaves / stem / fruit / roots / whole plant
3. Describe briefly (text or voice)
4. Upload photos (optional)
5. System matches disease/pest → shows diagnosis + solutions
6. Farmer confirms or says "not this one"
7. System shows solution steps (organic/conventional)
```

---

## PAGE 9: Market Prices Detail
**Route:** `/projects/[id]/market`

```
- Current price (big number, color-coded)
- Price change from yesterday (arrow + %)
- 30-day price chart (line chart)
- Price by market/district comparison
- Estimated revenue calculator:
  - [Expected yield: __kg/acre] × [Area] × [Current price] = Rs. ___
  - Slider to adjust yield estimate
- Best selling time prediction
- Competitor crop comparison
```

---

## PAGE 10: AI Chat
**Route:** `/projects/[id]/ai`

```
- Chat interface (WhatsApp-style bubbles)
- AI avatar with "thinking" animation
- Suggested prompts (quick chips):
  - "What should I do today?"
  - "My plants have yellow leaves"
  - "When is the best time to harvest?"
  - "Is the price good to sell now?"
- Voice input button (mobile)
- Image attachment (for disease diagnosis)
- Context bar at top: "Talking about: Tomato Farm, Day 45, Flowering Stage"
```

---

## PAGE 11: Notifications Page
**Route:** `/notifications`

```
- Grouped by: Today / Yesterday / Earlier
- Each notification:
  - Icon (weather/activity/disease/market)
  - Title + short description
  - "→ View" deep-link to project+service block
  - Timestamp
- "Mark all read" button
- Filter tabs: All / Activities / Weather / Market / Issues
```

---

## Component: ServiceBlock (Reusable Pattern)
```tsx
interface ServiceBlockProps {
  id: string;           // for scroll targeting
  type: ServiceType;    // 'weather' | 'soil' | 'plan' | 'disease' | 'market' | 'ai'
  title: string;
  icon: string;
  isLoading: boolean;
  hasAlert: boolean;
  alertCount?: number;
  summaryContent: React.ReactNode;  // compact summary shown in block
  onExpand: () => void;  // navigate to detail page
}

// All service blocks follow same visual pattern:
// - Colored top border (each service has a color)
// - Title bar with icon + alert badge
// - Summary content (2-3 lines)
// - "See more →" link
// - Highlighted with pulse animation when navigated to from notification
```

---

## State Management

```tsx
// stores/projectStore.ts (Zustand)
interface ProjectStore {
  currentProjectId: string | null;
  setCurrentProject: (id: string) => void;
  
  highlightedServiceBlock: string | null;
  setHighlightedBlock: (id: string | null) => void;
  
  notificationCount: number;
  setNotificationCount: (count: number) => void;
}

// React Query keys
const queryKeys = {
  projects: () => ['projects'],
  project: (id: string) => ['project', id],
  dashboard: (id: string) => ['dashboard', id],
  weather: (id: string) => ['weather', id],
  activities: (id: string, date?: string) => ['activities', id, date],
  soil: (id: string) => ['soil', id],
  market: (plantId: string) => ['market', plantId],
  notifications: () => ['notifications'],
};
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
      urlPattern: /api\/planner\/today/,
      handler: 'StaleWhileRevalidate',  // Today's plan available offline
    },
    {
      urlPattern: /api\/weather/,
      handler: 'NetworkFirst',
      options: { cacheName: 'weather-cache', expiration: { maxAgeSeconds: 3600 } }
    }
  ]
});
```

---

## Responsive Breakpoints

```css
/* Mobile first (primary target: 375px–430px) */
/* Tablet: 768px+ (wider service blocks, 2-col grid) */
/* Desktop: 1024px+ (sidebar navigation, 3-col layout) */

/* Key rule: service blocks stack vertically on mobile, 2-col on tablet */
```
