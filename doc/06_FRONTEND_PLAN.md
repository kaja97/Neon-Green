This document serves as the complete Front-End Page Routing, Layout, and State Management Blueprint for AgriFarm AI. It provides structural blueprints, data dependency trees, interactive state logic, and layout designs optimized to be used directly as design context for AI coding tools within an IDE context.  



PART A — Global Frontend Architecture & Layout ArchitectureA1. Component Design System & Layout TokensViewport Constraints: Optimized for mobile-first progressive web apps (PWAs) with a primary breakpoint of 375px–430px, scale-ready to desktop screens using multi-column configurations.  Color Palette Design:Primary / Brand: Forest Green (#15803d / emerald-700) - Represents growth, plants, and structural items.Secondary / Accents: Amber Gold (#d97706 / amber-600) - Represents warnings, weather deviations, and pending items.  Backgrounds: Soft Clay Neutral (#f8fafc / slate-50) - Base interface panel color.Typography Hierarchy:Headings (h1, h2): Semibold text tailored for clear reading under direct sunlight visibility conditions.Data Labels: Monospace formatting applied strictly to raw figures, area units, volumetric metrics, and currency entries (e.g., 180 LKR/kg, 1.0 acres, 500L).  A2. Shell Configuration ElementsThe interface is split into two distinct layout trees using Next.js 14 route groups:  1. The Global Auth Shell — app/(auth)/layout.tsxVisual Layout Structure: A centering container using a plain background palette. Focuses attention strictly on step-by-step navigation inputs, removing external elements like the main menu navigation header.Error Layer Hook: Mounts a global banner panel at the top of the interface layout to capture structural delivery problems, duplicate credentials, or broken verification codes.  2. The Interactive App Shell — app/(app)/layout.tsxVisual Layout Structure: TopBar Control Frame + Multi-Tab Context Panel Area + Sticky Bottom Navigation Menu Bar.  TopBar Control Frame: Exposes the application name brand logo, a notifications counter badge linked to real-time sync systems, and an account avatar trigger routing to profile variables.  Sticky Bottom Navigation Menu Bar: Exposes four primary access tabs using persistent icon markers: Home (/dashboard), All Projects (/projects), AI Field Assistant (/ai), and Settings Profile (/profile).  PART B — Shared Global State & Synchronous Data LayersAll client-side interactions utilize Zustand for persistent local interface states alongside React Query (TanStack Query) to manage cache lifetimes, backend synchronizations, and query operations.    [User Action: Tap Done] ──→ Update Zustand Optimistic UI Cache ──→ Mutate via React Query
                                                                             │
      ┌──────────────────────────────────────────────────────────────────────┘
      ▼
  [Network Test] ───( Online )───→ Dispatch Axios HTTP Pipeline ──→ Clear Queue
        │
        └───( Offline )──→ Append Payload to Local Storage Buffer ──→ Mount Sync Warning
B1. Local State Matrix — lib/stores/offlineStore.tsManages offline transaction persistence for low-connectivity environments common in remote farming locations.  TypeScriptinterface OfflineMutation {
  id: string;
  type: 'complete_activity' | 'skip_activity' | 'submit_soil_test';
  endpoint: string;
  method: 'PATCH' | 'POST';
  body: Record<string, any>;
  timestamp: number;
}

interface OfflineStore {
  mutations: OfflineMutation[];
  isOnline: boolean;
  addMutation: (mutation: Omit<OfflineMutation, 'id' | 'timestamp'>) => void;
  syncAll: () => Promise<void>;
  setOnline: (online: boolean) => void;
}
B2. State Lifetimes & Invalidation MatrixDashboard Aggregates (useDashboard): Set with a strict lifetime validation duration of 5 minutes (staleTime: 300000). Mutating actions require explicit cache clearing via query keys.  Weather Conditions (useWeather): Locked to a rigid 3-hour runtime expiration rule matching the background update intervals used by the server pipelines.  AI Overview Metrics (useAISummary): Set to evaluate data changes on an hourly interval, using manual trigger bypass options.  PART C — Application Page Structure Mapapp/
├── (auth)/
│   ├── login/
│   │   └── page.tsx                  # User Authentication Entry View
│   ├── register/
│   │   └── page.tsx                  # Multi-Step Account Creation Flow
│   └── forgot-password/
│       └── page.tsx                  # Verification Code & Credential Reset
├── (app)/
│   ├── layout.tsx                    # Shared Shell Nav Engine
│   ├── dashboard/
│   │   └── page.tsx                  # Central Farm Asset Landing Panel
│   ├── profile/
│   │   └── page.tsx                  # User Details, Preferences & Livestock CRUD
│   ├── notifications/
│   │   └── page.tsx                  # Smart Notification Log & Push Registration
│   └── projects/
│       ├── new/
│       │   └── page.tsx              # Multi-Step Project Builder Wizard
│       └── [id]/
│           ├── page.tsx              # Core Farming Circle Dashboard Hub
│           ├── plan/
│           │   └── page.tsx          # Full-Season Production Timeline Grid
│           ├── weather/
│           │   └── page.tsx          # Microclimate 5-Day Forecast Analytics
│           ├── soil/
│           │   └── page.tsx          # Nutrient Gap Visualizations & Lab Results
│           ├── disease/
│           │   └── page.tsx          # Problem Reporter & Solution Database
│           ├── market/
│           │   └── page.tsx          # Price Analytics & Expected Revenue Estimator
│           └── ai/
│               └── page.tsx          # Project-Aware LLM Interface Canvas
└── (admin)/
    ├── dashboard/
    │   └── page.tsx                  # Operational Statistics & Diagnostics View
    ├── users/
    │   └── page.tsx                  # System Account & Access Role Matrix
    └── projects/
        └── page.tsx                  # Global Production Overseer Monitor
PART D — Complete Page Specification Matrix1. Authentication Stack (Public Frame)1.1 User Authentication Entry ViewFile Path: app/(auth)/login/page.tsx  URL Endpoint Path: /login  Access Control Configuration: Public access layer. Detects active user token credentials, executing an immediate automatic reroute step straight to the dashboard area if verified.  Core Data Ingestion Pipelines: Executes standard authentication requests via the network payload layer: POST /auth/login.  ┌────────────────────────────────────────────────────────┐
│                   AgriFarm AI Logo                    │
│                 "Intelligent Growth"                   │
├────────────────────────────────────────────────────────┤
│  [ Input Field: Email Address or Phone Number       ]  │
│  [ Input Field: Password                             ]  │
│                                                        │
│  [ Button: Log In Securely                          ]  │
├────────────────────────────────────────────────────────┤
│  [ Link: Forgot Password? ]   [ Link: Register Account ]│
└────────────────────────────────────────────────────────┘
Action Mechanics & Interactions:Form Validation Checks: Submitting the form checks for minimum required password string lengths, displaying field warning tags directly below invalid form sections.  Global Response Catching: Captures credential errors matching validation code AUTH_LOGIN_INVALID_CREDENTIALS, displaying an interface banner to the user.  Storage Operations: Successfully resolving the login request stores the access token payload directly inside short-term client memory spaces while writing the persistent profile metadata layer to authStore.  Navigation & Transition Flows:Successful credentials transition the current route immediately into the central path: /dashboard.  1.2 Multi-Step Account Creation FlowFile Path: app/(auth)/register/page.tsx  URL Endpoint Path: /register  Access Control Configuration: Public access layer.  Core Data Ingestion Pipelines: Manages step-by-step onboarding sequences via three explicit validation requests:POST /auth/register/request-otp (Triggers the verification sequence).  POST /auth/register/verify (Atomic creation handling profile variables).  GET /farming-methods (Populates the cultivation classification values).  ┌────────────────────────────────────────────────────────┐
│ Onboarding Tracker: [ Step 1 ] -> Step 2 -> Step 3      │
├────────────────────────────────────────────────────────┤
│  PANEL STACK (Swaps dynamically based on Step index):  │
│                                                        │
│  [Step 1 View: Basic Information]                      │
│  - Input Fields: Name, Email, Mobile Contact, Password │
│                                                        │
│  [Step 2 View: Identity Token Input]                   │
│  - Input Field: 6-Digit Verification PIN Entry Block   │
│                                                        │
│  [Step 3 View: Farm Profile Context]                   │
│  - Selector Dropdown: Cultivation Method Options List  │
│  - Input Field: Years of Practical Experience Info     │
├────────────────────────────────────────────────────────┤
│  [ Button: Back ]                 [ Button: Next Step ]│
└────────────────────────────────────────────────────────┘
Action Mechanics & Interactions:Step 1 Verification Switch: Validates basic user details, processing the active form fields through the backend endpoint POST /auth/register/request-otp. If successful, increments the visible workflow tracker to Step 2.  Step 2 Verification Input: Controls an explicit 6-character code input mask, verifying entries against the active session before submitting the registration payload to the main server path.  Step 3 Onboarding Validation: Populates user settings via the endpoint GET /farming-methods, enforcing single-option selection variables before completing the account setup.  Navigation & Transition Flows:Completing the final onboarding step issues access tokens, routing users to their active workspace: /dashboard.  1.3 Verification Code & Credential ResetFile Path: app/(auth)/forgot-password/page.tsx  URL Endpoint Path: /forgot-password  Access Control Configuration: Public access layer.  Core Data Ingestion Pipelines: Links two transactional verification endpoints:POST /auth/forgot-password/request-otp (Issues the validation token to the verified contact address).  POST /auth/forgot-password/verify (Submits and records the new authentication password).  ┌────────────────────────────────────────────────────────┐
│              Account Security Recovery                 │
├────────────────────────────────────────────────────────┤
│  PANEL 1 (Active on initial view):                     │
│  [ Input Field: Account Email or Phone Address       ]  │
│  [ Button: Send Recovery Code                        ]  │
│                                                        │
│  PANEL 2 (Mounts following code issuance):             │
│  [ Input Field: 6-Digit Identity Verification Code   ]  │
│  [ Input Field: New Secure Password String           ]  │
│  [ Button: Confirm Password Change                   ]  │
└────────────────────────────────────────────────────────┘
Action Mechanics & Interactions:Recovery Request Handlers: Submitting the account identifier passes data to the endpoint POST /auth/forgot-password/request-otp. This transition hides Panel 1 and reveals the Panel 2 data fields.  Password Reset Execution: Validates the security code format, passing the update request to the endpoint POST /auth/forgot-password/verify.  Navigation & Transition Flows:Successfully resetting credentials automatically signs the user into the active session block, routing them directly to the main workspace: /dashboard.  2. Core App Shell & Management Hub2.1 Central Farm Asset Landing PanelFile Path: app/(app)/dashboard/page.tsx  URL Endpoint Path: /dashboard  Access Control Configuration: Protected space; requires an authenticated farmer profile context.  Core Data Ingestion Pipelines: Driven by React Query caching hooks: GET /projects?status=active.  ┌────────────────────────────────────────────────────────┐
│  🌱 AgriFarm Assistant                          [🔔 3] │
├────────────────────────────────────────────────────────┤
│  🚜 ACTIVE FARMING PROJECTS (2)                         │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 🍅 Tomato Patch — North Field                    │  │
│  │ [Progress Tracker Bar: 50% Complete | Day 45/90] │  │
│  │ Info Tag: Flowering Phase · 3 Activities Remaining│  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 🌶️ Chili Cultivation — Hillside Ridge             │  │
│  │ [Progress Tracker Bar: 35% Complete | Day 40/115]│  │
│  │ Info Tag: Vegetative Phase · 2 Tasks Pending      │  │
│  └──────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────┤
│  [ + Register New Project Expansion ]                  │
└────────────────────────────────────────────────────────┘
Action Mechanics & Interactions:Real-time Sync Indicators: Evaluates background sync flags using the useOfflineStore model. Mounts a high-visibility status warning ribbon whenever local storage queues contain pending network mutations.  Empty State Handling: Displays an placeholder onboarding block if the active project query returns empty, guiding users with a prominent "Register New Project Expansion" call-to-action.  Navigation & Transition Flows:Tapping an individual project dashboard card routes the application context directly to that instance view: /projects/[project_id].  Tapping the creation action button opens the configuration wizard path: /projects/new.  2.2 Multi-Step Project Builder WizardFile Path: app/(app)/projects/new/page.tsx  URL Endpoint Path: /projects/new  Access Control Configuration: Protected space; requires verified farmer role authentication.  Core Data Ingestion Pipelines: Queries systemic validation values while handling project registration workflows:GET /plants (Fetches master plant profiles).  GET /farmer/locations (Loads saved farm locations).  GET /farmer/land (Loads registered field details).  POST /projects (Triggers backend plan generation workflows).  ┌────────────────────────────────────────────────────────┐
│ Setup Wizard Progress: [Select Crop] -> Details -> Confirm│
├────────────────────────────────────────────────────────┤
│  STEP 1 CONTAINER: CULTIVATION ASSET CAPTURE           │
│  [ Grid: Icon Cards displaying Tomato, Chili, Paddy ]  │
│                                                        │
│  STEP 2 CONTAINER: SPATIAL ENVIRONMENT ASSETS          │
│  [ Dropdown: Choose Registered Farm Site Location    ]  │
│  [ Dropdown: Choose Specific Measured Field Segment  ]  │
│                                                        │
│  STEP 3 CONTAINER: RUNTIME METRICS PARAMETERS          │
│  [ Field Input: Numerical Area Footprint Value        ]  │
│  [ Toggle Option: Organic vs Conventional Inputs     ]  │
│  [ Date Picker: Planting Commencement Date          ]  │
├────────────────────────────────────────────────────────┤
│  [ Button: Backwards ]             [ Button: Build Plan ]│
└────────────────────────────────────────────────────────┘
Action Mechanics & Interactions:Data Verification Checks: The confirmation button remains locked in an inactive layout state until valid inputs are verified across all form fields.  Background Pipeline Dispatch: Submitting the configuration passes the payload variables to the endpoint POST /projects. This structural change updates plan_generation_status to a working state while spinning up backend Celery orchestration tasks.  Navigation & Transition Flows:Successfully executing the post request forwards the current application routing path directly back to the summary space: /dashboard.  2.3 Core Farming Circle Dashboard HubFile Path: app/(app)/projects/[id]/page.tsx  URL Endpoint Path: /projects/[id] (Dynamic instance locator route)  Access Control Configuration: Strict parameter checking; verifies the dynamic project ID context matches the user account permissions.  Core Data Ingestion Pipelines: Powered by the parallel dashboard aggregation utility: GET /projects/{id}/dashboard.  ┌────────────────────────────────────────────────────────┐
│ [← Exit Workspace]    Tomato Patch — North Field   [⚙️] │
├────────────────────────────────────────────────────────┤
│                                                        │
│            ● ─── ● ─── ● ─── ★ ─── ○ ─── ○             │
│           Germ  Seed  Veg  FLOWER Fruit Harv            │
│                 [ Day Count: 45 of 90 ]                │
│                                                        │
├────────────────────────────────────────────────────────┤
│ 🌧️ HEAVY WEATHER DEVIATION ALERT                       │
│ Precipit. > 25mm tomorrow. Postpone fertilization.    │
├────────────────────────────────────────────────────────┤
│ 📋 TODAY'S OPERATIONAL ACTIONS                         │
│ [ ] Drip Irrigation Cycle — Volume: 180L     (6:00 AM) │
│ [ ] Visual Inspection: Check for Leaf Blight (8:00 AM) │
├────────────────────────────────────────────────────────┤
│ SERVICE TILES HORIZONTAL STREAM PANEL:                  │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│ │ Weather  │ │ Soil     │ │ Market   │ │ Diagnostics │ │
│ │ 32°C     │ │ N: LOW   │ │ 180 LKR  │ │ Healthy     │ │
│ └──────────┘ └──────────┘ └──────────┘ └─────────────┘ │
├────────────────────────────────────────────────────────┤
│ 🤖 FIELD ASSISTANT ANALYSIS INTELLIGENCE               │
│ "Humidity levels indicate high risk for Leaf Blight.   │
│  Skip scheduled watering if rain metrics hit tomorrow."│
│                                   [🔄 Request Update]  │
└────────────────────────────────────────────────────────┘
Action Mechanics & Interactions:The Visual Farming Circle Component: Renders the crop's biological growth path using a node tracker line. Completed development phases display fixed markers (●), upcoming phases show placeholder rings (○), and the active runtime phase uses a highlighted gold marker (★).  Inline Operational Actions Task Cards: Checking an execution input triggers immediate optimistic UI state changes, marking items complete via the endpoint PATCH /planner/activities/{id}/complete.  Service Tiles Horizontal Stream Panel: Displays modular sub-service data fields within scannable data card elements. Tapping a card element navigates straight to that specific domain tracking view.  Cache Control Handlers: Tapping the update request control fires a POST request to POST /ai/{project_id}/summary. This method checks context hashes via internal utilities to restrict unnecessary calls, updating the dashboard component view on response.  Navigation & Transition Flows:Tapping sub-service tiles redirects the layout view down deep-linked child tracks: /projects/[id]/weather, /projects/[id]/soil, /projects/[id]/plan, /projects/[id]/disease, /projects/[id]/market, or /projects/[id]/ai.  3. Dedicated Domain Sub-Services3.1 Full-Season Production Timeline GridFile Path: app/(app)/projects/[id]/plan/page.tsx  URL Endpoint Path: /projects/[id]/plan  Access Control Configuration: Protected space; requires active user project group matching validation.  Core Data Ingestion Pipelines: Loaded via the multi-filter timeline query helper: GET /planner/{project_id}/activities.  ┌────────────────────────────────────────────────────────┐
│ [← Back]              Production Action Timeline       │
├────────────────────────────────────────────────────────┤
│ Filter Actions: [ All ] [ Pending ] [ Irrigation ]     │
├────────────────────────────────────────────────────────┤
│  ▼ STAGE 4: FLOWERING DEVELOPMENT (Active)              │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 📅 TUESDAY, JULY 14, 2026                        │  │
│  │ Type: Irrigation  · Time: 06:00 Monospace Metric │  │
│  │ Title: Scheduled Drip Watering Run — 180L        │  │
│  │ [ Button: Record Done ]    [ Button: Skip Action ]│  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 📅 THURSDAY, JULY 16, 2026                       │  │
│  │ Type: Nutrition   · Time: 07:00 Monospace Metric │  │
│  │ Title: Apply MOP Nutrient Fertilizer — 45.0kg    │  │
│  │ Status: Pending Delivery Window                  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
Action Mechanics & Interactions:Task Execution Handler: Tapping "Record Done" executes an interactive state check. If the user is currently offline, the change is saved locally before updating the active layout view.  Action Omission Requests: Tapping "Skip Action" opens an overlay modal, requiring users to input a descriptive skip text string before saving the record change.  Deep-link Highlighting: Captures input URL parameters (e.g., ?highlight=activity_uuid), automatically scrolling the layout viewport straight to the targeted element and flashing a temporary border accent.  Navigation & Transition Flows:Tapping the return header button restores the user context to the central workspace hub: /projects/[id].  3.2 Microclimate 5-Day Forecast AnalyticsFile Path: app/(app)/projects/[id]/weather/page.tsx  URL Endpoint Path: /projects/[id]/weather  Access Control Configuration: Protected space; requires active farmer profile verification checks.  Core Data Ingestion Pipelines: Fed by local caching utilities: GET /weather/{project_id}.  ┌────────────────────────────────────────────────────────┐
│ [← Back]             Microclimate Weather Analytics    │
├────────────────────────────────────────────────────────┤
│  CURRENT WEATHER REPORT DATA CARD:                     │
│  Metric: 32°C Temperature Value | Humidity Level: 72%  │
│  Condition Status: Scattered Cloud Layers Visible      │
├────────────────────────────────────────────────────────┤
│  5-DAY METRIC TREND FORECAST GRAPH PLOT:               │
│  [ Visual Chart Layout: Recharts Daily Temp Bar Plot ] │
│  - Tue: 32°C [  ] | Wed: 29°C [█ ] | Thu: 27°C [██]    │
├────────────────────────────────────────────────────────┤
│  ⚠️ MICROCLIMATE ALERT MONITOR MATRIX                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │ High Humidity Threshold Warning (Blight Risk)   │  │
│  │ [ Button: Acknowledge Condition and Close Alert ]│  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
Action Mechanics & Interactions:Weather Alert Management: Tapping the alert acknowledgment button fires a PATCH request directly to PATCH /weather/alerts/{id}/acknowledge. This clears the tracking entry from the interactive interface layer.  Historical Data Degradation: Renders offline indicators if weather fetches return stale cache items, clearly displaying the time elapsed since the last sync event occurred.  3.3 Nutrient Gap Visualizations & Lab ResultsFile Path: app/(app)/projects/[id]/soil/page.tsx  URL Endpoint Path: /projects/[id]/soil  Access Control Configuration: Protected space.  Core Data Ingestion Pipelines: Driven by analytical laboratory results data streams:GET /soil/tests/{project_id}/latest (Loads active nutrient analytics maps).  POST /soil/tests/{project_id} (Registers raw incoming lab data inputs).  PATCH /soil/recommendations/{id}/applied (Records correction logs).  ┌────────────────────────────────────────────────────────┐
│ [← Back]             Nutrient Soil Composition Analysis│
├────────────────────────────────────────────────────────┤
│  NUTRIENT DEFICIENCY RADAR PLOT DATA CONTAINER:        │
│  [ Visual UI Element: Radar Chart displaying N, P, K ] │
│  Status Readout: pH level: 6.2 · Nitrogen Level: LOW   │
├────────────────────────────────────────────────────────┤
│  🧪 SYSTEM CORRECTION RECOMMENDATIONS LIST             │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Type: Fertilizer Correction Action               │  │
│  │ Title: Apply Organic Compost Blend — Dose: 25.0kg │  │
│  │ [ Button: Mark Amendment Applied to Soil Base ]   │  │
│  └──────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────┤
│  [ + Register Fresh Laboratory Report Entry Form ]     │
└────────────────────────────────────────────────────────┘
Action Mechanics & Interactions:Radar Chart Render Models: Maps multi-axis nutrient data balances against target crop profile levels.  Correction Task Execution Handlers: Tapping the application confirmation button updates the data status using PATCH /soil/recommendations/{id}/applied, removing the item from the dashboard alert view.  Lab Form Overlay Panels: Tapping the logging trigger opens a input sheet component container, enforcing strict value validation rules to ensure numeric inputs are present for target properties.  3.4 Problem Reporter & Solution DatabaseFile Path: app/(app)/projects/[id]/disease/page.tsx  URL Endpoint Path: /projects/[id]/disease  Access Control Configuration: Protected space.  Core Data Ingestion Pipelines: Connects issue logging systems to solution lookups:POST /disease/issues/{project_id} (Registers symptom input profiles).  PATCH /disease/issues/{id}/status (Updates running resolution phases).  ┌────────────────────────────────────────────────────────┐
│ [← Back]               Crop Diagnostic Assistant       │
├────────────────────────────────────────────────────────┤
│ REPORT FRESH FIELD ISSUE SYMPTOM ENTRY FORM:           │
│ [ Input Description: Detail anomalies here...         ]  │
│ Affected Parts Checklist: [x] Leaves  [ ] Fruit  [ ] Stem│
│                                                        │
│ [ Button: Run Diagnostic Database Check              ]  │
├────────────────────────────────────────────────────────┤
│ 🔍 MATCHED CONDITION DIAGNOSTIC RESULT:                 │
│ Condition Identified: Early Blight (Confidence Score: 85%)│
│                                                        │
│ TARGET AMENDMENT RECOMMENDATIONS DATABASE:             │
│ - Organic Management: Bordeaux Mixture Foliar Spray   │
│ - Application Strategy: Apply early morning post-dew   │
└────────────────────────────────────────────────────────┘
Action Mechanics & Interactions:Symptom Form Handlers: Submitting the anomaly description processes the user inputs through full-text matching engines via POST /disease/issues/{project_id}. If calculations yield low confidence metrics, the interface handles an automatic query pass down free LLM evaluation layers.  Dynamic Method Tabs: Automatically filters treatment steps using the active project's farming_method settings, ensuring conventional inputs are hidden from organic farm views.  3.5 Price Analytics & Expected Revenue EstimatorFile Path: app/(app)/projects/[id]/market/page.tsx  URL Endpoint Path: /projects/[id]/market  Access Control Configuration: Protected workspace space.  Core Data Ingestion Pipelines: Connects real-time agricultural price indices:GET /market/prices/{plant_id} (Loads active wholesale metrics).  GET /market/trends/{plant_id} (Loads 30-day index curves).  GET /market/estimate/{project_id} (Loads calculated revenue values).  ┌────────────────────────────────────────────────────────┐
│ [← Back]              Wholesale Price Analytics        │
├────────────────────────────────────────────────────────┤
│ REGIONAL MARKET READOUT INFO CARD:                     │
│ Target Site: Colombo Center Market | Crop type: Tomato │
│ Index Value: 180 LKR/kg Monospace Metric Trend: ↑ 12%  │
├────────────────────────────────────────────────────────┤
│ 💸 PRE-HARVEST REVENUE CALCULATOR ENGINE               │
│ Calculated Field Area Size: 1.0 acres                  │
│ Expected Production Yield: 2,200 kg                    │
│ Care Modifier Applied: +10% Yield Bonus (Good Care)    │
│                                                        │
│ Total Projected Valuation: LKR 396,000                 │
└────────────────────────────────────────────────────────┘
Action Mechanics & Interactions:Revenue Calculation Models: Automatically calculates projected revenues by multiplying the crop profile's historical standard yield data against active location price indexes.  Care Factor Modifiers: Dynamically updates yield expectations based on task completion rates, factoring in penalty reductions whenever project issues remain unresolved.  3.6 Project-Aware LLM Interface CanvasFile Path: app/(app)/projects/[id]/ai/page.tsx  URL Endpoint Path: /projects/[id]/ai  Access Control Configuration: Protected workspace space.  Core Data Ingestion Pipelines: Interfaces with context-aware chat assistants:POST /ai/{project_id}/chat (Dispatches user question payload values).  GET /ai/usage (Loads active user quota details).  ┌────────────────────────────────────────────────────────┐
│ [← Back]           AI Field Assistant       [Quota: 5] │
├────────────────────────────────────────────────────────┤
│ Context Locked: Tomato Patch · Day 45 of 90            │
├────────────────────────────────────────────────────────┤
│ 🤖 Assistant: "Based on your low soil Nitrogen metrics │
│    and tomorrow's heavy rain forecast, do not apply    │
│    Urea inputs now. Wait until Thursday morning."      │
│                                                        │
│ 👤 Farmer: "Why are my bottom leaves yellowing?"        │
├────────────────────────────────────────────────────────┤
│ [ Input Text Field: Type field query here...        ]  │
│ [ Button: Dispatch Query Send Icon                   ]  │
└────────────────────────────────────────────────────────┘
Action Mechanics & Interactions:Chat Canvas Controls: Appends message content elements to an auto-scrolling container view. The input area locks down during runtime generation sequences, rendering an active animated placeholder indicator.  Quota Status Tags: Displays remaining conversation allowances derived from GET /ai/usage, notifying the user before the free-tier request limits are hit.  Regex Intent Limiting: Scans input text using local regular expression checks. Standard inquiries regarding weather details or task schedules automatically swap viewports to the relevant dashboard domain panels, saving network tokens.  4. Personal Configurations & Notifications Log4.1 User Details, Preferences & Livestock CRUDFile Path: app/(app)/profile/page.tsx  URL Endpoint Path: /profile  Access Control Configuration: Protected space; generic authenticated profile check.  Core Data Ingestion Pipelines: Interfaces user variables and asset configurations:GET /farmer/profile (Loads master registration variables).  PUT /farmer/profile (Submits profile configuration updates).  GET /farmer/livestock (Loads livestock array data elements).  POST /farmer/livestock (Appends a fresh asset record).  DELETE /farmer/livestock/{id} (Removes an asset record entry).  ┌────────────────────────────────────────────────────────┐
│ 👤 Profile Configuration Center                       │
├────────────────────────────────────────────────────────┤
│ FARMER PROFILE CONFIGURATION VARIABLES:                │
│ Name Input: [ Nimal Perera                           ] │
│ Primary UI Interface Language Selector: [ English ▼ ]  │
├────────────────────────────────────────────────────────┤
│ 🐄 LIVE STOCK ASSET INVENTORY MANAGEMENT MATRIX         │
│ - Cattle Dairy Production — Count: 12 Assets [ Delete] │
│ - Poultry Layer Facility — Count: 250 Assets [ Delete] │
│                                                        │
│ [ Input Type: Animal ] [ Input Count ] [ + Add Asset ] │
├────────────────────────────────────────────────────────┤
│ [ Button: Deactivate Account Profile and Close Shell]  │
└────────────────────────────────────────────────────────┘
Action Mechanics & Interactions:Livestock Inventory Management: Renders inline deletion buttons beside asset line entries, passing removal requests to the endpoint DELETE /farmer/livestock/{id} via optimistic state mutation steps.  Account Deactivation Actions: Tapping the profile removal trigger opens a secondary authorization validation overlay, passing soft-delete queries through DELETE /auth/account to ensure clean workspace closure.  4.2 Smart Notification Log & Push RegistrationFile Path: app/(app)/notifications/page.tsx  URL Endpoint Path: /notifications  Access Control Configuration: Protected space; general authenticated level.  Core Data Ingestion Pipelines: Connected to messaging controls:GET /notifications (Loads message records).  PATCH /notifications/{id}/read (Clears single item status).  PATCH /notifications/read-all (Performs bulk array updates).  POST /notifications/subscribe (Registers VAPID browser keys).  ┌────────────────────────────────────────────────────────┐
│ Notifications Hub Center                   [Clear All] │
├────────────────────────────────────────────────────────┤
│ 🔔 ACTIVE SYSTEM CHANNELS PUSH REGISTRATION:           │
│ Status: Inactive | [ Button: Allow Device Push Alerts ]│
├────────────────────────────────────────────────────────┤
│ MESSAGE RECORD ACTIVITY STREAM:                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 🌧️ WEATHER DEVIATION ALERT ALERT (Unread)          │ │
│ │ Heavy rain forecast for tomorrow. Plan shifts.     │ │
│ └────────────────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 📋 IRRIGATION TASK ACTION REMINDER                 │ │
│ │ Tomato Drip cycle completed successfully at 06:00  │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
Action Mechanics & Interactions:Browser Push Subscription Handlers: Tapping the device push action utilizes standard browser permission controls, generating security keys sent to POST /notifications/subscribe to activate remote background alerts.  Deep-linked List Navigation: Individual message container elements retain strict deep-link addresses matching structure expectations (e.g., /projects/id?tab=plan&highlight=uuid), automatically routing the viewport layout directly to the target component upon execution.  5. System Administration Platform Stack (Role Lock)5.1 Operational Statistics & Diagnostics ViewFile Path: app/(admin)/dashboard/page.tsx  URL Endpoint Path: /admin/dashboard  Access Control Configuration: Administrative validation hook check; requires an active admin role claim inside verified JWT token variables.  Core Data Ingestion Pipelines: Driven by structural overview metrics: GET /admin/stats.  ┌────────────────────────────────────────────────────────┐
│ 🛡️ Admin Management Operations Control Panel          │
├────────────────────────────────────────────────────────┤
│ SYSTEM METRICS SUMMARY REPORT CARD:                    │
│ Total Registered Platform Profiles: 150 Users         │
│ Total Running Production Instances: 287 Active Projects│
├────────────────────────────────────────────────────────┤
│ 📊 AI API SERVICE FREE-TIER QUOTA MONITORS             │
│ Requests Dispatched Today: 34 API calls                │
│ Global Sliding-Window Current Minute Load: 2 RPM       │
│                                                        │
│ [ Button: Execute System Verification Script Suite ]   │
└────────────────────────────────────────────────────────┘
Action Mechanics & Interactions:Administrative Protection Guardrails: Any network fetch failing authorization parameters via validation response ADMIN_FORBIDDEN triggers automatic application redirections straight back to the landing view: /dashboard.  Platform Integrity Monitors: Tapping the seed verification trigger submits a test POST request to POST /admin/seed/validate, validating stage intervals and configuration data across active database tables.  5.2 System Account & Access Role MatrixFile Path: app/(admin)/users/page.tsx  URL Endpoint Path: /admin/users  Access Control Configuration: Administrative access lock.  Core Data Ingestion Pipelines: Direct management utilities handling account parameters:GET /admin/users (Loads paginated account record objects).  PATCH /admin/users/{id}/deactivate (Deactivates accounts).  PATCH /admin/users/{id}/role (Alters access level values).  ┌────────────────────────────────────────────────────────┐
│ Account Security Level & Operations Matrix             │
├────────────────────────────────────────────────────────┤
│ [ Filter Search Input Field: Search User Profiles... ] │
├────────────────────────────────────────────────────────┤
│ ID: farmer@test.com · Role: Farmer Account            │
│ Status Variable: Active Operational State              │
│ [ Switch Access Role to Admin ]   [ Deactivate Profile]│
│ ────────────────────────────────────────────────────── │
│ ID: supervisor@test.com · Role: System Administrator   │
│ Status Variable: Active Operational State              │
│ [ Switch Access Role to Farmer ]  [ Deactivate Profile]│
└────────────────────────────────────────────────────────┘
Action Mechanics & Interactions:Access Level Operations: Tapping the role swap trigger executes an inline state update payload via PATCH /admin/users/{id}/role, changing permissions instantly.  Account Interdiction Lifecycles: Tapping the account deactivation action dispatches soft-delete requests down path PATCH /admin/users/{id}/deactivate. This interaction automatically wipes all active Redis security keys associated with the target, locking out access.  5.3 Global Production Overseer MonitorFile Path: app/(admin)/projects/page.tsx  URL Endpoint Path: /admin/projects  Access Control Configuration: Administrative access lock.  Core Data Ingestion Pipelines: Global data tracking systems: GET /admin/projects.  ┌────────────────────────────────────────────────────────┐
│ Global Project Oversight Monitor                       │
├────────────────────────────────────────────────────────┤
│ Filter Status: [ All ] [ Active ] [ Harvested ] [ Failed ]│
├────────────────────────────────────────────────────────┤
│ Account Ref: farmer@test.com                           │
│ Crop Asset Name: Tomato Patch — 1.0 acres              │
│ Stage Readout: Stage 4 Flowering Phase · Progress: 50% │
│ [ View Complete Instance Diagnostic History ]          │
└────────────────────────────────────────────────────────┘
Action Mechanics & Interactions:Administrative Override Review Controls: Tapping the historical lookup function executes an override fetch via GET /admin/projects/{id}. This loads complete diagnostic logs bypassing user-level ownership checks.  