# react-eventflow

React 기반 이벤트 추적 라이브러리 - Provider 패턴으로 사용자 인터랙션을 수집하고 백엔드로 전송합니다.

## 특징

- ✅ React Provider 패턴 기반
- ✅ TypeScript 완전 지원
- ✅ 페이지뷰 자동 추적
- ✅ 네비게이션 자동 추적
- ✅ 커스텀 이벤트 추적
- ✅ 이벤트 배칭 지원
- ✅ Zero dependencies (React만 필요)

## 설치

```bash
npm install react-eventflow
```

또는

```bash
yarn add react-eventflow
```

## 기본 사용법

### 1. Provider 설정

앱의 최상위에 `EventFlowProvider`를 추가합니다:

```tsx
import { EventFlowProvider } from 'react-eventflow';

function App() {
  return (
    <EventFlowProvider
      config={{
        onEvent: async (event) => {
          // 백엔드로 이벤트 전송
          await fetch('/api/analytics', {
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

### 2. 커스텀 이벤트 추적

컴포넌트 내에서 `useEventFlow` 훅을 사용합니다:

```tsx
import { useEventFlow } from 'react-eventflow';

function ProductCard({ productId }: { productId: string }) {
  const { trackEvent } = useEventFlow();

  const handleAddToCart = () => {
    trackEvent('add_to_cart', {
      productId,
      timestamp: Date.now(),
      source: 'product_card',
    });
    
    // 실제 장바구니 로직...
  };

  return (
    <button onClick={handleAddToCart}>
      장바구니에 추가
    </button>
  );
}
```

### 3. 페이지뷰 수동 추적

```tsx
import { useEventFlow } from 'react-eventflow';

function CustomPage() {
  const { trackPageView } = useEventFlow();

  useEffect(() => {
    trackPageView('/custom-page', 'Custom Page Title');
  }, []);

  return <div>...</div>;
}
```

## 설정 옵션

```typescript
interface EventFlowConfig {
  /** 이벤트 전송 콜백 함수 (필수) */
  onEvent: (event: EventData) => void | Promise<void>;
  
  /** 페이지뷰 자동 추적 (기본: true) */
  trackPageViews?: boolean;
  
  /** 네비게이션 자동 추적 (기본: true) */
  trackNavigation?: boolean;
  
  /** 디버그 모드 (기본: false) */
  debug?: boolean;
  
  /** 이벤트 배칭 활성화 (기본: false) */
  enableBatching?: boolean;
  
  /** 배칭 간격(ms) (기본: 1000) */
  batchInterval?: number;
}
```

## 이벤트 타입

### PageViewEvent
```typescript
{
  type: 'pageview',
  timestamp: 1699999999999,
  payload: {
    url: '/products',
    title: 'Products Page',
    referrer: 'https://google.com',
    userAgent: 'Mozilla/5.0...'
  }
}
```

### NavigationEvent
```typescript
{
  type: 'navigation',
  timestamp: 1699999999999,
  payload: {
    from: '/home',
    to: '/products'
  }
}
```

### CustomEvent
```typescript
{
  type: 'custom',
  timestamp: 1699999999999,
  payload: {
    // 사용자 정의 데이터
  }
}
```

## 개발 가이드

### TODO: 구현 필요 사항

`src/lib/EventFlowProvider.tsx` 파일에는 다음 기능들이 TODO로 표시되어 있습니다:

1. **이벤트 배칭 로직** - `enableBatching`이 true일 때 이벤트를 큐에 모았다가 일괄 전송
2. **페이지뷰 추적** - `trackPageView` 함수 구현
3. **커스텀 이벤트 추적** - `trackEvent` 함수 구현
4. **초기 페이지뷰 추적** - 컴포넌트 마운트 시 자동 추적
5. **네비게이션 추적** - URL 변경 감지 및 이벤트 전송

## 라이선스

MIT

## 기여

이슈와 PR은 언제나 환영입니다!
