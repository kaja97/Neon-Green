# AgriFarm AI — Notification System & Offline-First Architecture

## Overview
This document details two critical user experience systems:
1. **Smart Notification Routing** — notifications that deep-link to the exact UI block and trigger highlight animations
2. **Offline-First Architecture** — how the PWA and future Flutter apps work without internet

Both features are essential for farmers in rural Sri Lanka where internet connectivity is spotty.

---

## Part 1: Smart Notification System

### Notification Types

| Type | Trigger | Priority | Example |
|------|---------|----------|---------|
| `activity_reminder` | Celery Beat, 5:30 AM daily | Normal | "💧 Water plants — 180L needed today" |
| `weather_alert` | Weather check detects danger | High | "⛈️ Heavy rain tomorrow — postpone fertilizer!" |
| `disease_risk` | Humidity + temp combo detected | High | "🦠 Blight risk HIGH — inspect leaves today" |
| `market_alert` | Price change > 15% | Normal | "📈 Tomato price rose 18% in Colombo!" |
| `stage_transition` | Crop enters new growth stage | Normal | "🌸 Your crop entered the Flowering stage!" |
| `ai_insight` | Weekly AI summary generated | Low | "📊 Your weekly crop report is ready" |
| `harvest_ready` | Crop reaches harvest stage | High | "🌾 Your tomatoes are ready to harvest!" |
| `soil_recommendation` | New soil test analyzed | Normal | "🧪 Nitrogen is LOW — action needed" |

### Notification Data Model

```python
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID, primary_key=True, default=uuid4)
    farmer_id = Column(UUID, ForeignKey("farmer_profiles.id"))
    project_id = Column(UUID, ForeignKey("projects.id"), nullable=True)
    
    # Content
    type = Column(String(50))             # activity_reminder, weather_alert, etc.
    title = Column(String(255))           # Short title for push notification
    message = Column(Text)                # Full message body
    icon = Column(String(50))             # Emoji or icon identifier
    
    # Deep Link Routing
    deep_link = Column(String(500))       # e.g., "/projects/uuid?tab=plan&highlight=activity_uuid"
    target_block = Column(String(50))     # Which service block to highlight: "weather", "soil", "plan"
    target_entity_id = Column(UUID)       # Specific activity, alert, or issue to highlight
    
    # State
    is_read = Column(Boolean, default=False)
    is_pushed = Column(Boolean, default=False)  # Whether Web Push was sent
    scheduled_for = Column(DateTime)      # When to deliver (for scheduled notifications)
    
    created_at = Column(DateTime, default=func.now())
```

### Deep Link Routing Strategy

When a notification requires action, tapping it navigates to the exact location in the app:

```python
def create_notification_with_deep_link(
    farmer_id, project_id, type, title, message,
    target_block=None, target_entity_id=None
):
    """
    Create a notification with intelligent deep linking.
    """
    # Build deep link URL
    base_url = f"/projects/{project_id}"
    
    if type == "activity_reminder":
        deep_link = f"{base_url}?tab=plan&highlight={target_entity_id}"
        target_block = "activities"
    elif type == "weather_alert":
        deep_link = f"{base_url}?tab=weather&alert={target_entity_id}"
        target_block = "weather"
    elif type == "disease_risk":
        deep_link = f"{base_url}?tab=disease&alert={target_entity_id}"
        target_block = "disease"
    elif type == "soil_recommendation":
        deep_link = f"{base_url}?tab=soil&highlight={target_entity_id}"
        target_block = "soil"
    elif type == "market_alert":
        deep_link = f"{base_url}?tab=market"
        target_block = "market"
    elif type == "ai_insight":
        deep_link = f"{base_url}?tab=ai"
        target_block = "ai"
    else:
        deep_link = base_url
    
    notification = Notification(
        farmer_id=farmer_id,
        project_id=project_id,
        type=type,
        title=title,
        message=message,
        deep_link=deep_link,
        target_block=target_block,
        target_entity_id=target_entity_id,
        is_pushed=False
    )
    db.add(notification)
    db.commit()
    return notification
```

### Frontend: Notification → Block Highlight Animation

```typescript
// Frontend: Handle deep link on project dashboard

// 1. Read URL params on page load
const searchParams = useSearchParams();
const highlightBlock = searchParams.get("tab");
const highlightId = searchParams.get("highlight") || searchParams.get("alert");

// 2. Auto-scroll to the target block
useEffect(() => {
  if (highlightBlock) {
    const blockElement = document.getElementById(`block-${highlightBlock}`);
    if (blockElement) {
      blockElement.scrollIntoView({ behavior: "smooth", block: "center" });
      
      // 3. Flash highlight animation
      blockElement.classList.add("notification-highlight");
      setTimeout(() => {
        blockElement.classList.remove("notification-highlight");
      }, 3000);
    }
  }
}, [highlightBlock]);

// 4. If a specific entity (activity, alert) is targeted, expand it
useEffect(() => {
  if (highlightId) {
    const entityElement = document.getElementById(`entity-${highlightId}`);
    if (entityElement) {
      entityElement.classList.add("expanded", "notification-highlight");
    }
  }
}, [highlightId]);
```

```css
/* Notification highlight animation */
.notification-highlight {
  animation: highlight-pulse 3s ease-in-out;
  border: 2px solid #f59e0b; /* Amber border */
}

@keyframes highlight-pulse {
  0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); }
  40% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0.3); }
  70% { box-shadow: 0 0 0 15px rgba(245, 158, 11, 0); }
  100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
}
```

### Web Push Implementation

```python
# backend/modules/notification/push.py
from pywebpush import webpush, WebPushException
import json

async def send_web_push(farmer_id: str, title: str, body: str, deep_link: str):
    """Send push notification via Web Push API."""
    subscriptions = get_push_subscriptions(farmer_id)

    for sub in subscriptions:
        try:
            webpush(
                subscription_info=json.loads(sub.subscription_json),
                data=json.dumps({
                    "title": title,
                    "body": body,
                    "icon": "/icons/icon-192.png",
                    "badge": "/icons/badge-96.png",
                    "data": { "url": deep_link },
                    "actions": [
                        {"action": "open", "title": "View Details"},
                        {"action": "dismiss", "title": "Dismiss"}
                    ]
                }),
                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                vapid_claims={"sub": f"mailto:{settings.VAPID_EMAIL}"}
            )
        except WebPushException as e:
            if e.response and e.response.status_code in (404, 410):
                # Subscription expired — remove it
                delete_subscription(sub.id)
```

---

## Part 2: Offline-First Architecture

### Why This Matters
Rural Sri Lankan farmers often have:
- Slow 2G/3G connections
- Intermittent connectivity (signal drops in fields)
- Limited data plans

The app must work **without internet** for core daily operations.

### What Works Offline (PWA)

| Feature | Offline Capability | How |
|---------|-------------------|-----|
| View today's activities | ✅ Full | Service Worker caches daily plan |
| Mark task as "Done" | ✅ Full | Stored locally, synced when online |
| View weather forecast | ⚠️ Partial | Shows cached forecast (up to 3 hours old) |
| View Farming Circle | ✅ Full | Progress calculated from planting date (local) |
| Ask AI question | ❌ No | Requires internet (Google API) |
| Submit soil test | ⚠️ Queued | Form stored locally, submitted when online |
| View notifications | ✅ Full | Cached from last sync |

### Service Worker Caching Strategy

```javascript
// next.config.js — PWA caching rules
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    // Daily activities — StaleWhileRevalidate (show cached, update in background)
    {
      urlPattern: /\/api\/v1\/planner\/.*\/today/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'daily-activities',
        expiration: { maxAgeSeconds: 86400 }  // 24 hours
      }
    },
    // Dashboard — StaleWhileRevalidate
    {
      urlPattern: /\/api\/v1\/projects\/.*\/dashboard/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'dashboard-data',
        expiration: { maxAgeSeconds: 3600 }  // 1 hour
      }
    },
    // Weather — CacheFirst (weather doesn't change every minute)
    {
      urlPattern: /\/api\/v1\/weather\//,
      handler: 'CacheFirst',
      options: {
        cacheName: 'weather-data',
        expiration: { maxAgeSeconds: 10800 }  // 3 hours
      }
    },
    // Plant images — CacheFirst
    {
      urlPattern: /\/crops\//,
      handler: 'CacheFirst',
      options: {
        cacheName: 'crop-images',
        expiration: { maxEntries: 50 }
      }
    },
    // AI endpoints — NetworkOnly (requires internet)
    {
      urlPattern: /\/api\/v1\/ai\//,
      handler: 'NetworkOnly'
    }
  ]
});
```

### Offline Mutation Queue (Zustand)

```typescript
// lib/stores/offlineStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OfflineMutation {
  id: string;
  type: 'complete_activity' | 'skip_activity' | 'submit_soil_test';
  endpoint: string;
  method: 'PATCH' | 'POST';
  body: Record<string, unknown>;
  timestamp: number;
}

interface OfflineStore {
  mutations: OfflineMutation[];
  isOnline: boolean;
  
  addMutation: (mutation: Omit<OfflineMutation, 'id' | 'timestamp'>) => void;
  syncAll: () => Promise<void>;
  setOnline: (online: boolean) => void;
}

export const useOfflineStore = create<OfflineStore>()(
  persist(
    (set, get) => ({
      mutations: [],
      isOnline: navigator.onLine,
      
      addMutation: (mutation) => {
        set((state) => ({
          mutations: [...state.mutations, {
            ...mutation,
            id: crypto.randomUUID(),
            timestamp: Date.now()
          }]
        }));
      },
      
      syncAll: async () => {
        const { mutations } = get();
        const synced: string[] = [];
        
        for (const mutation of mutations) {
          try {
            await api[mutation.method.toLowerCase()](mutation.endpoint, mutation.body);
            synced.push(mutation.id);
          } catch (error) {
            console.error(`Sync failed for ${mutation.id}:`, error);
            break; // Stop on first failure to preserve order
          }
        }
        
        // Remove successfully synced mutations
        set((state) => ({
          mutations: state.mutations.filter(m => !synced.includes(m.id))
        }));
      },
      
      setOnline: (online) => set({ isOnline: online })
    }),
    { name: 'offline-mutations' } // Persists to localStorage
  )
);

// Auto-sync when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useOfflineStore.getState().setOnline(true);
    useOfflineStore.getState().syncAll();
  });
  window.addEventListener('offline', () => {
    useOfflineStore.getState().setOnline(false);
  });
}
```

### Offline Activity Completion

```typescript
// When farmer marks a task "Done" offline:

const completeActivity = async (activityId: string, notes?: string) => {
  const { isOnline, addMutation } = useOfflineStore.getState();
  
  // 1. Optimistically update local UI immediately
  queryClient.setQueryData(['dashboard', projectId], (old) => ({
    ...old,
    todays_activities: old.todays_activities.map(a =>
      a.id === activityId ? { ...a, status: 'done', completed_at: new Date().toISOString() } : a
    )
  }));
  
  if (isOnline) {
    // 2a. Online: send directly to API
    try {
      await api.patch(`/planner/activities/${activityId}/complete`, { notes });
    } catch {
      // API failed — queue for retry
      addMutation({
        type: 'complete_activity',
        endpoint: `/planner/activities/${activityId}/complete`,
        method: 'PATCH',
        body: { notes }
      });
    }
  } else {
    // 2b. Offline: queue mutation for later sync
    addMutation({
      type: 'complete_activity',
      endpoint: `/planner/activities/${activityId}/complete`,
      method: 'PATCH',
      body: { notes }
    });
  }
};
```

### Offline Status Indicator

```
┌──────────────────────────────────────────────┐
│  ⚠️ You're offline                            │
│  Your changes will sync when internet returns │
│  📤 2 pending updates                         │
└──────────────────────────────────────────────┘
```

---

## Part 3: Future — Flutter Offline Architecture

When Flutter mobile apps are built (v2.0), the offline capability is significantly richer:

| Feature | PWA (v1.0) | Flutter (v2.0) |
|---------|-----------|----------------|
| Cache storage | Service Worker (limited) | Hive/SQLite (unlimited) |
| Background sync | Limited | WorkManager (runs even when app closed) |
| Offline data | Last-fetched JSON | Full local database replica |
| Photo upload queue | Not supported | Queue photos, upload when online |
| GPS tracking | Limited | Full native GPS access |

```dart
// Flutter offline architecture (v2.0 — planned)
// Uses Hive for fast key-value storage
// Full project data cached locally
// Background sync via WorkManager

class OfflineManager {
  final Box<Map> activityCache;
  final Box<Map> pendingMutations;
  
  Future<void> markActivityDone(String activityId, {String? notes}) async {
    // 1. Update local cache immediately
    await activityCache.put(activityId, {
      'status': 'done',
      'completed_at': DateTime.now().toIso8601String()
    });
    
    // 2. Queue mutation for background sync
    await pendingMutations.put(activityId, {
      'endpoint': '/planner/activities/$activityId/complete',
      'method': 'PATCH',
      'body': {'notes': notes},
      'queued_at': DateTime.now().toIso8601String()
    });
    
    // 3. Trigger background sync if online
    if (await hasInternet()) {
      await syncPendingMutations();
    }
  }
}
```
