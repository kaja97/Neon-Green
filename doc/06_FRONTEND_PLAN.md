# AgriFarm AI — Frontend Plan

## Tech Stack
Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Recharts · Zustand · React Query

---

## Design Principles
1. **Mobile-first** — Farmers use phones, not desktops. Primary viewport: 375px–430px
2. **Card-based UI** — Each service is a block/card. Scannable at a glance.
3. **Visual progress first** — Charts, progress rings, status icons over text lists
4. **Fast** — SSR for initial page load, React Query for live data
5. **Offline-ready** — PWA caching for daily plan (works without internet)
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
│   ├── layout.tsx                    ← Main shell (TopBar + BottomNav)
│   ├── dashboard/page.tsx            ← Landing: project list
│   ├── profile/page.tsx              ← Farmer profile settings
│   ├── notifications/page.tsx        ← Notification center
│   └── projects/
│       ├── new/page.tsx              ← Create project wizard (6 steps)
│       └── [id]/
│           ├── page.tsx              ← Project dashboard (main view)
│           ├── weather/page.tsx      ← Weather detail
│           ├── soil/page.tsx         ← Soil analysis detail
│           ├── plan/page.tsx         ← Full activity plan
│           ├── disease/page.tsx      ← Disease watch + report
│           ├── market/page.tsx       ← Market prices + revenue
│           ├── ai/page.tsx           ← AI Chat
│           └── report-issue/page.tsx ← Report problem flow

components/
├── ui/                               ← shadcn/ui base components
├── layout/
│   ├── TopBar.tsx                    ← Title + notifications + menu
│   ├── BottomNav.tsx                 ← Mobile bottom navigation tabs
│   └── AppShell.tsx                  ← Layout wrapper
├── dashboard/
│   ├── ProjectCard.tsx               ← Project card (progress + stage + tasks)
│   ├── ProjectGrid.tsx               ← Grid/list of project cards
│   └── DailyAlertsBar.tsx            ← Urgent alerts across all projects
├── project/
│   ├── FarmingCircle.tsx             ← ⭐ Key visual: radial stage progress ring
│   ├── StageIndicator.tsx            ← Current stage badge + day count
│   ├── TodayActionItems.tsx          ← Today's task notification blocks
│   └── ServiceBlockList.tsx          ← Scrollable list of service blocks
├── services/
│   ├── ServiceBlock.tsx              ← Reusable block wrapper (title + alert badge + content)
│   ├── WeatherBlock.tsx              ← Weather summary block
│   ├── SoilBlock.tsx                 ← Soil status summary block
│   ├── ActivityPlanBlock.tsx         ← Today's activities block
│   ├── DiseaseWatchBlock.tsx         ← Current disease risk block
│   ├── MarketBlock.tsx               ← Current price + trend block
│   └── AIChatBlock.tsx               ← AI chat entry point block
├── activities/
│   ├── ActivityCard.tsx              ← Single activity with done/skip actions
│   ├── ActivityCalendar.tsx          ← Month/week calendar view
│   └── ActivityDetails.tsx           ← Expanded activity details modal
├── soil/
│   ├── NutrientRadarChart.tsx        ← Radar chart: actual vs optimal nutrients
│   ├── SoilTestForm.tsx              ← Soil test data entry form
│   └── RecommendationCard.tsx        ← Prioritized recommendation card
├── disease/
│   ├── RiskCalendar.tsx              ← Heatmap of high-risk periods
│   ├── DiseaseCard.tsx               ← Disease info accordion card
│   ├── ReportIssueFlow.tsx           ← Multi-step issue reporting
│   └── DiagnosisResult.tsx           ← Matched disease + solutions display
├── market/
│   ├── PriceChart.tsx                ← 30-day price line chart
│   └── RevenueCalculator.tsx         ← Yield × price = revenue estimator
├── ai/
│   ├── ChatBubble.tsx                ← Message bubble (farmer/AI)
│   ├── SuggestedPrompts.tsx          ← Quick-tap prompt chips
│   └── ThinkingAnimation.tsx         ← AI thinking dots animation
└── notifications/
    ├── NotificationBell.tsx          ← Bell icon + unread badge
    └── NotificationList.tsx          ← Grouped notifications list
```

---

## PAGE 1: Authentication

### Register Flow (4 Steps)
```
Step 1: Credentials
  - Email + Phone + Password (with strength indicator)
  - Google OAuth option

Step 2: Identity
  - Full name, district (dropdown), province
  - GPS location picker (Leaflet map) or manual entry

Step 3: Farming Background
  - Years of experience (slider)
  - Farming method preference (Organic / Conventional / Integrated)
  - Primary language (English / Sinhala / Tamil)

Step 4: Quick Start (Optional)
  - "Create your first project now" or "Skip for later"
```

---

## PAGE 2: Main Dashboard (Project List)

```
┌──────────────────────────────────────┐
│  🌾 AgriFarm          [🔔3] [👤]     │
├──────────────────────────────────────┤
│  Good morning, Nimal! ☀️ Saturday    │
│  You have 2 active projects          │
├──────────────────────────────────────┤
│  ⚡ URGENT ALERTS                   │
│  🌧️ Rain expected tomorrow          │
│  → Tomato Farm: Skip watering        │
├──────────────────────────────────────┤
│  YOUR PROJECTS                       │
│  ┌────────────────┐ ┌───────────────┐│
│  │ 🍅 Tomatoes   │ │ 🫘 Beans      ││
│  │ 1 Acre        │ │ 0.5 Acre      ││
│  │ ●●●○○○        │ │ ●●●●●○        ││
│  │ Flowering     │ │ Harvest       ││
│  │ Day 45 / 90   │ │ Day 75 / 90   ││
│  │ 3 tasks today │ │ 1 task        ││
│  └────────────────┘ └───────────────┘│
│  ┌────────────────┐                  │
│  │  + New Project │                  │
│  └────────────────┘                  │
└──────────────────────────────────────┘
```

### ProjectCard Component Props
```typescript
interface ProjectCardProps {
  project: Project;
  currentStage: PlantStage;
  daysFromPlanting: number;
  totalDays: number;
  progressPct: number;
  todayTaskCount: number;
  alertCount: number;
}
```

---

## PAGE 3: Create Project Wizard

```
Step 1: SELECT CROP
  - Search bar (fuzzy: "tom" → "Tomato, Cherry Tomato, Roma Tomato")
  - Grid of crop cards with image, growth duration, difficulty rating
  - "Tomato" card: 🍅 | 90 days | Medium difficulty | Best season: Yala

Step 2: PROJECT DETAILS
  - Name (auto-filled: "Tomato Farm — June 2025", editable)
  - Location (dropdown from farmer's saved locations, + "Add new")
  - Land (dropdown from farmer's land details, + "Add new")
  - Area + unit (with validation: must not exceed land.total_area)

Step 3: FARMING METHOD
  - Three cards: Organic 🌿 / Conventional ⚗️ / Integrated 🔄
  - Each shows: brief description + what recommendations you'll get

Step 4: SCHEDULE
  - Planting date (calendar picker)
  - Expected harvest (auto-calculated + editable)
  - "Your tomatoes will be ready approximately May 29, 2025"

Step 5: ENABLE SERVICES
  Multiple-select toggles:
  ✅ Activity Planner (recommended, always on)
  ✅ Weather Alerts (recommended)
  ☐ Soil Analysis
  ☐ Market Prices
  ☐ Disease Watch
  ☐ AI Assistant

Step 6: REVIEW & CREATE
  - Summary cards of all selections
  - "What will be auto-generated:" section
  - [Create Project] button
  - Shows animated "Generating your plan..." after tap
```

---

## PAGE 4: Project Dashboard ⭐ (Most Critical Page)

```
┌──────────────────────────────────────────┐
│ ← Tomato Farm — 1 Acre    [⚠️2] [···]  │
├──────────────────────────────────────────┤
│                                          │
│          FARMING CIRCLE                  │
│                                          │
│    ╭──── ○ Germination ────╮             │
│   /  ○                     ○ \           │
│  ○  ○  SEEDLING         FRUITING ○  ○   │
│  ○     ●●VEGETATIVE●●●          ○  ○   │
│  ○  ○  [🍅  Day 45/90  ]    ○  ○       │
│   \  ○  ●● FLOWERING ●●  ○  /           │
│    ╰──── ○ Harvest ────╯                 │
│                                          │
│   Stage: FLOWERING    [50% Complete]     │
│   Critical: Boost K, monitor humidity   │
│                                          │
├──────────────────────────────────────────┤
│  TODAY'S ACTION ITEMS                   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ 🔴 CRITICAL                     │   │
│  │ Apply Muriate of Potash — 45kg   │   │
│  │ Broadcast + water in after       │   │
│  │ [✓ Mark Done]  [See Details]    │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │ 🟡 NORMAL — Water 180L          │   │
│  │ Drip irrigation, ~45 min        │   │
│  │ ⚠️ Rain Day 3 — skip then       │   │
│  │ [✓ Mark Done]  [Skip]           │   │
│  └──────────────────────────────────┘   │
│                                          │
├──────────────────────────────────────────┤
│  SERVICE BLOCKS                         │
│                                          │
│  🌤️ WEATHER ──────────────────────────  │
│  Today: Sunny 32°C  |  Day 3: ☔ 25mm   │
│  ⚡ Skip watering on June 12            │
│  [Full forecast →]                       │
│                                          │
│  🧪 SOIL STATUS ──────────────────────  │
│  pH: 6.2 ✅  Nitrogen: LOW ⚠️           │
│  → Apply 30kg Urea before week 8        │
│  [Full analysis →]                       │
│                                          │
│  📋 ACTIVITY PLAN ────────────────────  │
│  Today: Water 180L · Apply Potash 45kg  │
│  Tomorrow: Pest monitoring check        │
│  [7-day plan →]                          │
│                                          │
│  🦠 DISEASE WATCH ─────────────────────  │
│  ⚠️ HIGH RISK: Late Blight (fungal)     │
│  Humid + warm forecast this week        │
│  Prevention: Spray Mancozeb             │
│  [I see symptoms → Report]              │
│                                          │
│  💰 MARKET PRICES ─────────────────────  │
│  Tomato: Rs. 180/kg ↑ +12%             │
│  Trend: Rising this week               │
│  Revenue est: Rs. 216,000              │
│  [Price detail →]                       │
│                                          │
│  🤖 AI ASSISTANT ──────────────────────  │
│  Ask about your tomato farm...          │
│  [Start Chat →]                          │
│                                          │
└──────────────────────────────────────────┘
```

### FarmingCircle Component
```typescript
// Uses Recharts RadialBarChart + SVG overlay
// Each arc segment = one plant stage
// Arc size = proportional to (stage.end_day - stage.start_day) / total_days
// Colors: completed = #22c55e, current = #3b82f6 (animated pulse), upcoming = #e2e8f0

interface FarmingCircleProps {
  stages: PlantStage[];
  daysFromPlanting: number;
  totalDays: number;
  plantName: string;
  plantEmoji: string;
}
```

### Notification → Service Block Deep Link
```typescript
// URL format: /projects/[id]?scroll=activity_plan&highlight=activity_uuid

useEffect(() => {
  const params = new URLSearchParams(location.search);
  const scrollTo = params.get('scroll');   // e.g., "activity_plan"
  const highlight = params.get('highlight'); // e.g., activity ID

  if (scrollTo) {
    document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth' });
    if (highlight) {
      setHighlightedItem(highlight);  // pulse animation for 3 seconds
      setTimeout(() => setHighlightedItem(null), 3000);
    }
  }
}, []);
```

---

## PAGE 5: Weather Detail

```
- 7-day forecast horizontal card strip
- Today's card: expanded (temp range, humidity, UV, wind)
- Hourly chart: temperature + humidity line chart (Recharts)
- Farm-specific impact list:
  → "June 12: Skip watering (25mm rain)"
  → "June 13: High humidity — monitor for fungal disease"
- Historical rainfall bar chart (past 30 days)
```

---

## PAGE 6: Soil Analysis Detail

```
- Last test summary + "Add New Test" button
- Nutrient Radar Chart (6 axes: pH, N, P, K, Ca, Organic Matter)
  → Optimal range shown as shaded green area
  → Farmer's values plotted as colored line
  → Deficient areas immediately visible (red spike inward)
- Deficiency status badges: N: LOW ⚠️  P: OK ✅  K: LOW ⚠️  pH: OK ✅
- Recommendations list (sorted by priority):
  1. 🔴 Apply 30kg Urea/acre — Nitrogen SEVERELY low
  2. 🟡 Apply 450kg Lime/acre — pH slightly low
- "Upload Soil Test Report" button (PDF → OCR → auto-fill form)
- Test history timeline (all past tests)
```

---

## PAGE 7: Activity Plan Detail

```
- Calendar view toggle: Month | Week
- Week view: Days as columns, activities as cards in each day
- Activity card shows:
  - Type icon (💧 water, 🌿 fertilize, 🔍 monitor, ✂️ prune, 🌾 harvest)
  - Title + quantity
  - Status badge: pending / done / skipped / rescheduled
  - Action buttons: [✓ Done] [Skip] [Reschedule]
- "Today" quick-scroll button (floating)
- Filter chips: All | Watering | Fertilizing | Monitoring | Urgent Only
```

---

## PAGE 8: Disease Watch Detail

```
- Risk level banner: LOW / MEDIUM / HIGH (color coded)
- Risk calendar (week heatmap: red = high risk days)
- Disease watch cards (accordion):
  ┌─────────────────────────────────────┐
  │ ⚠️ Late Blight (Fungal)    HIGH    │
  │ Visual: Brown spots with gray mold  │
  │ Risk period: June 10–17             │
  │ Prevention: Spray Mancozeb 2g/L     │
  │ [View full details ▼]              │
  └─────────────────────────────────────┘
- Active/resolved issues list
- FAB button: "🚨 Report a Problem"
```

### Report Issue Flow (Multi-Step)
```
Step 1: What do you see?
  [Yellowing leaves] [Brown spots] [Wilting] [Insects] [Holes in leaves] [Other]

Step 2: Where on the plant?
  [Leaves] [Stem] [Fruit] [Roots] [Whole plant]

Step 3: Describe briefly
  Text input + voice input option

Step 4: Upload photos (optional)
  Camera or gallery

Step 5: DIAGNOSIS RESULT
  ┌──────────────────────────────────────┐
  │ 🔍 Most likely: Early Blight        │
  │    Confidence: 82%                  │
  │    Caused by: Fungal (Alternaria)   │
  │                                      │
  │  ORGANIC SOLUTIONS:                  │
  │  1. Neem oil spray (2ml/L)           │
  │     Every 5 days, early morning      │
  │  2. Copper fungicide (organic grade) │
  │                                      │
  │  CONVENTIONAL SOLUTIONS:             │
  │  1. Mancozeb 75WP (2g/L)            │
  │     Every 7 days, 3-day wait time   │
  │                                      │
  │ [Not this disease?] [Confirm & Save] │
  └──────────────────────────────────────┘
```

---

## PAGE 9: Market Prices Detail

```
- Big price display: Rs. 180/kg  ↑ +12% from yesterday
- Price by market: Colombo Rs.185 | Dambulla Rs.172 | Jaffna Rs.165
- 30-day price line chart (Recharts LineChart)
- Revenue Calculator:
  Expected yield: [1200] kg/acre  ×  Area: [1] acre  =  [1200 kg]
  Current price: Rs. 180/kg
  Estimated Revenue: Rs. 216,000
  [Adjust yield estimate with slider]
- Best selling window prediction
```

---

## PAGE 10: AI Chat

```
Context bar: "Talking about: Tomato Farm | Day 45 | Flowering Stage"
┌──────────────────────────────────────────┐
│                                          │
│            [AI thinking dots]            │
│  ┌──────────────────────────────────┐   │
│  │ AI: Good morning Nimal! Based on │   │
│  │ your tomato farm at Day 45,      │   │
│  │ today's priority is potassium    │   │
│  │ application before flowering     │   │
│  │ peaks. Here's what to do...      │   │
│  └──────────────────────────────────┘   │
│            [Farmer message bubble]       │
│  My plants have yellow leaves ──────►   │
│                                          │
│  SUGGESTED PROMPTS:                      │
│  [What should I do today?]              │
│  [Yellow leaves — what's wrong?]        │
│  [Best time to harvest?]                │
│  [Current tomato price?]                │
│                                          │
│  [📷] [🎤] [Type a message...]  [Send] │
└──────────────────────────────────────────┘
```

---

## PAGE 11: Notifications

```
Filter tabs: All | Activities | Weather | Market | Issues

TODAY
┌──────────────────────────────────────────┐
│ 💧 Water your tomatoes — 180L          6 AM │
│    No rain expected. Use drip system.        │
│    Tomato Farm  ·  → View                    │
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│ 🌧️ WEATHER ALERT: Rain tomorrow        5 AM │
│    25mm expected on June 12.                 │
│    Watering auto-skipped.                    │
└──────────────────────────────────────────────┘

YESTERDAY
  ... older notifications ...

[Mark all as read]
```

---

## ServiceBlock Component Pattern

```typescript
interface ServiceBlockProps {
  id: string;            // HTML id for scroll targeting
  type: 'weather' | 'soil' | 'activity_plan' | 'disease_watch' | 'market' | 'ai_chat';
  icon: string;          // Emoji icon
  title: string;
  isLoading: boolean;
  hasAlert: boolean;
  alertCount?: number;
  alertSeverity?: 'info' | 'warning' | 'critical';
  children: React.ReactNode;   // Summary content inside block
  onExpand: () => void;        // Navigate to detail page
  isHighlighted?: boolean;     // Pulse animation when navigated from notification
}

// Visual structure:
// ┌── colored top border (each service has unique color)
// │── title bar: [icon] [title] [alert badge]
// │── summary content (2–3 lines max)
// │── [See full details →] link
// └── pulse animation class if isHighlighted=true
```

---

## State Management

```typescript
// Zustand store
interface AppStore {
  // Current context
  currentProjectId: string | null;
  setCurrentProject: (id: string) => void;

  // Deep link behavior
  highlightedServiceBlock: string | null;
  highlightedItemId: string | null;
  setHighlight: (block: string | null, itemId: string | null) => void;

  // Notifications
  unreadCount: number;
  setUnreadCount: (count: number) => void;
}

// React Query keys (consistent caching)
const queryKeys = {
  projects: () => ['projects'],
  project: (id: string) => ['project', id],
  dashboard: (id: string) => ['dashboard', id],
  weather: (id: string) => ['weather', id],
  activities: (id: string, date?: string) => ['activities', id, date],
  todayActivities: (id: string) => ['activities', id, 'today'],
  soil: (id: string) => ['soil', id],
  disease: (id: string) => ['disease', id],
  market: (plantId: string, district?: string) => ['market', plantId, district],
  notifications: () => ['notifications'],
  notificationCount: () => ['notifications', 'count'],
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
      urlPattern: /\/api\/planner\/today/,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'daily-plan' }
    },
    {
      urlPattern: /\/api\/weather/,
      handler: 'NetworkFirst',
      options: { cacheName: 'weather', expiration: { maxAgeSeconds: 3600 } }
    },
    {
      urlPattern: /\/api\/plants/,
      handler: 'CacheFirst',
      options: { cacheName: 'master-data', expiration: { maxAgeSeconds: 86400 } }
    }
  ]
});
```

---

## Responsive Layout Strategy

| Viewport | Layout |
|----------|--------|
| Mobile (375–430px) | Single column, stacked service blocks, bottom nav |
| Tablet (768px+) | 2-column service block grid, side navigation |
| Desktop (1024px+) | 3-column layout: sidebar nav + main + details panel |

**Rule:** All content designed mobile-first. Desktop is an enhancement, not a requirement.
