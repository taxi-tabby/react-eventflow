# @taxi_tabby/react-eventflow

A React-based event tracking library that collects user interactions using the Provider pattern and sends them to your backend.

```
2025년에도 여전히 웹의 황제 자리를 꽉 잡고 있는 React.
여기 소개할 방법은 React에서 구현할 수 있는 가장 심플하고 매력적인 사용자 추적 방식입니다.

사실 통계나 추적이라는 게 기술적으로 100% 정확할 수는 없어요. 우회 방법이 넘쳐나거든요.
뭐, 인터넷 실명제를 할 것도 아니고 당신의 집에 글로벌 라우터가 있는 것도 아니시겠죠
그냥 빨리 포기하고 현실적인 방법을 찾는 게 속 편합니다.

제가 개발하면서 느낀 “진짜 필요한 정보”는 딱 이 정도였습니다:
- 어디서 들어왔는지
- 지금 어디를 보고 있는지
- 어디로 이동하려 하는지
- 클릭 여부 + 클릭 위치
- 스크롤 여부 + 스크롤 위치
- 마우스가 어디서 어디로 이동했는지
- 좌클릭/우클릭/휠 클릭 여부
- 어딜 보고 있는가 (화면 스크린샷 정보 개발 예정)
- 그리고 가장 중요한 것: 사용자가 누군지는 몰라도, 모든 행동이 한 사용자에게 연결되고 있는가

말했듯 완벽하게 정확할 순 없지만, 사용자 행동의 흐름을 이어주는 것까지는 충분히 가능합니다.
그래서 이벤트 발생 시간과 함께 ‘나름~ 고유한 지문 데이터’를 제공하는 방식으로 정리했습니다.

물론 더 깊게 추적할 수도 있겠지만, 굳이 무거울 필요는 없죠. ip 찾고 dns 조회하고 트래킹하고 국가 위치니 어쩌니 찾고 어휴 무거워.. 
단순하게 여기서 수집한 핵심 데이터만 백엔드로 툭 던져줍시다 
거기서 알아서 잘 처리하겠죠 뭐. 우리는 필요한 건 이미 넘겼으니까요.

로그인 사용자나 더욱 개인을 특정하고자 한다면 onEvent 에서 값 얻어 불러와서 쏴주면 되고 쉽다 쉬워
굳이 무겁게 하려면 백엔드 서버에서 알아서 하시길 권장! 


* 주의 *
trackReferral 기능은 불안정합니다! 잘 동작한다고 생각한다면 따봉


```

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
        trackReferral: true,
        trackMouseClick: true,     // Enable click tracking
        trackMouseMoving: false,   // Enable mouse movement tracking (can be noisy)
        trackScroll: true,         // Enable scroll tracking
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
  
  /** Enable automatic mouse click tracking (default: false) */
  trackMouseClick?: boolean;
  
  /** Enable automatic mouse moving tracking (default: false) */
  trackMouseMoving?: boolean;
  
  /** Mouse moving throttle interval in ms (default: 100) */
  mouseMovingThrottle?: number;
  
  /** Enable automatic scroll tracking (default: false) */
  trackScroll?: boolean;
  
  /** Scroll throttle interval in ms (default: 200) */
  scrollThrottle?: number;
  
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

### Interaction Tracking

Enable different types of user interaction tracking:

```tsx
<EventFlowProvider
  config={{
    onEvent: handleEvents,
    // Basic tracking (enabled by default)
    trackPageViews: true,
    trackNavigation: true,
    trackReferral: true,
    
    // Interaction tracking (disabled by default)
    trackMouseClick: true,        // Track all click events
    trackMouseMoving: true,       // Track mouse movements (can generate many events)
    mouseMovingThrottle: 100,     // Send mouse move event every 100ms
    trackScroll: true,            // Track scroll depth
    scrollThrottle: 200,          // Send scroll event every 200ms
  }}
>
  <App />
</EventFlowProvider>
```

**Note on Performance:**
- Mouse moving tracking can generate a lot of events. Use `mouseMovingThrottle` to control frequency.
- Scroll tracking only sends events when scroll depth increases.
- All trackers use `passive` event listeners to avoid blocking the main thread.
- Error handling prevents conflicts with other libraries.

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


## Eaxample
`next.js`
```javascript
'use client';

import { EventFlowProvider as BaseEventFlowProvider } from '@taxi_tabby/react-eventflow';
import { ReactNode } from 'react';

interface EventFlowWrapperProps {
  children: ReactNode;
}

export function EventFlowProvider({ children }: EventFlowWrapperProps) {
  return (
    <BaseEventFlowProvider
      config={{
        trackPageViews: true,
        trackNavigation: true,
        trackReferral: true,
        trackMouseClick: true,
        trackMouseMoving: true,
        trackScroll: true,

        enableBatching: true,
        batchInterval: 5000,
        mouseMovingThrottle: 1000,
        scrollThrottle: 1000,

        debug: false,
        onEvent: async (event) => {
          if (Array.isArray(event)) {
            // Handle array of events
            console.log(JSON.stringify(event));
          } else {
            console.log(event.fingerprint, event.timestamp, event.type);
          }
        },
      }}
    >
      {children}
    </BaseEventFlowProvider>
  );
}
```

## License

MIT

## Contributing

Issues and PRs are always welcome!
