# @taxi_tabby/react-eventflow

A React-based event tracking library that collects user interactions using the Provider pattern and sends them to your backend.

## Features

- ✅ Built on React Provider pattern
- ✅ Full TypeScript support
- ✅ Automatic pageview tracking
- ✅ Automatic navigation tracking
- ✅ Automatic referral/traffic source tracking
- ✅ UTM parameter tracking for marketing campaigns
- ✅ Mouse movement and click tracking
- ✅ Scroll tracking
- ✅ Event batching support
- ✅ Browser fingerprinting for user identification
- ✅ Lightweight with minimal dependencies

## Installation

```bash
npm install @taxi_tabby/react-eventflow
```

or

```bash
yarn add @taxi_tabby/react-eventflow
```

## Basic Usage

### 1. Setup Provider

Add `EventFlowProvider` at the root of your app:

```tsx
import { EventFlowProvider } from '@taxi_tabby/react-eventflow';

function App() {
  return (
    <EventFlowProvider
      config={{
        onEvent: async (event) => {
          // Send event to your backend
          await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event),
          });
        },
        trackPageViews: true,
        trackNavigation: true,
        debug: process.env.NODE_ENV === 'development',
      }}
    >
      <YourApp />
    </EventFlowProvider>
  );
}
```

### 2. Manual Page View Tracking

Use the `useEventFlow` hook in your components:

```tsx
import { useEventFlow } from '@taxi_tabby/react-eventflow';

function CustomPage() {
  const { trackPageView } = useEventFlow();

  useEffect(() => {
    trackPageView('/custom-page', 'Custom Page Title');
  }, []);

  return <div>...</div>;
}
```

## Configuration Options

```typescript
interface EventFlowConfig {
  /** Event callback function (required) */
  onEvent: (event: EventData | EventData[]) => void | Promise<void>;
  
  /** Enable automatic pageview tracking (default: true) */
  trackPageViews?: boolean;
  
  /** Enable automatic navigation tracking (default: true) */
  trackNavigation?: boolean;
  
  /** Enable automatic referral tracking (default: true) */
  trackReferral?: boolean;
  
  /** Debug mode (default: false) */
  debug?: boolean;
  
  /** Enable event batching (default: false) */
  enableBatching?: boolean;
  
  /** Batching interval in ms (default: 2000) */
  batchInterval?: number;
}
```

## Event Types

All events include a `fingerprint` field for unique user identification.

### PageViewEvent
```typescript
{
  type: 'pageview',
  timestamp: 1699999999999,
  fingerprint: 'unique-browser-id',
  payload: {
    url: '/products',
    title: 'Products Page',
    referrer: 'https://google.com',
    userAgent: 'Mozilla/5.0...'
  }
}
```

### ReferralEvent
```typescript
{
  type: 'referral',
  timestamp: 1699999999999,
  fingerprint: 'unique-browser-id',
  payload: {
    currentUrl: 'https://example.com/products?utm_source=google',
    referrer: 'https://google.com/search?q=products',
    referrerDomain: 'google.com',
    sourceType: 'search', // 'direct' | 'external' | 'internal' | 'social' | 'search' | 'email' | 'unknown'
    utm: {
      source: 'google',
      medium: 'cpc',
      campaign: 'summer_sale',
      term: 'products',
      content: 'ad_variant_a'
    },
    queryParams: {
      utm_source: 'google',
      utm_medium: 'cpc',
      // ... all query parameters
    },
    navigation: {
      historyLength: 5,
      isBackNavigation: false,
      navigationType: 'navigate'
    }
  }
}
```

### NavigationEvent
```typescript
{
  type: 'navigation',
  timestamp: 1699999999999,
  fingerprint: 'unique-browser-id',
  payload: {
    from: '/home',
    to: '/products'
  }
}
```

### MouseMovingEvent
```typescript
{
  type: 'mouse-moving',
  timestamp: 1699999999999,
  fingerprint: 'unique-browser-id',
  payload: {
    x: 100,
    y: 200,
    pageX: 100,
    pageY: 500
  }
}
```

### MouseClickEvent
```typescript
{
  type: 'mouse-click',
  timestamp: 1699999999999,
  fingerprint: 'unique-browser-id',
  payload: {
    x: 100,
    y: 200,
    target: 'button',
    targetClass: 'btn-primary',
    targetId: 'submit-btn',
    button: 0
  }
}
```

### ScrollEvent
```typescript
{
  type: 'scroll',
  timestamp: 1699999999999,
  fingerprint: 'unique-browser-id',
  payload: {
    scrollY: 500,
    scrollX: 0,
    scrollDepth: 25,
    documentHeight: 2000
  }
}
```

## Advanced Features

### Event Batching

Enable batching to reduce network requests:

```tsx
<EventFlowProvider
  config={{
    onEvent: handleEvents,
    enableBatching: true,
    batchInterval: 5000, // Send every 5 seconds
  }}
>
  <App />
</EventFlowProvider>
```

### User Identification

Every event automatically includes a browser fingerprint for user identification:

```typescript
{
  fingerprint: 'abc123def456', // Unique per browser
  type: 'pageview',
  // ...
}
```

This fingerprint is:
- Generated using browser characteristics
- Persistent across sessions
- Privacy-friendly (no personal data)


## License

MIT

## Contributing

Issues and PRs are always welcome!
