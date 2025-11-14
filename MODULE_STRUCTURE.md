# React EventFlow - 모듈 구조

## 📁 프로젝트 구조

```
src/
├── index.ts                      # 메인 엔트리 포인트 (모든 모듈 export)
├── types.ts                      # 타입 정의
└── lib/
    ├── EventFlowProvider.tsx     # React Provider 컴포넌트
    ├── useEventFlow.ts           # React Hook
    ├── fingerprintClass.ts       # Fingerprint 서비스
    ├── batching/                 # 배칭 모듈
    │   ├── index.ts
    │   └── EventBatcher.ts       # 이벤트 배칭 클래스
    ├── trackers/                 # 추적 모듈
    │   ├── index.ts
    │   ├── pageViewTracker.ts    # 페이지뷰 추적
    │   ├── customEventTracker.ts # 커스텀 이벤트 추적
    │   └── navigationTracker.ts  # 네비게이션 추적
    └── utils/                    # 유틸리티 모듈
        ├── index.ts
        └── helpers.ts            # 헬퍼 함수들
```

## 🧩 모듈별 설명

### 1. **Core 모듈**
- `EventFlowProvider.tsx`: React Context Provider
- `useEventFlow.ts`: EventFlow 사용을 위한 Hook
- `fingerprintClass.ts`: 브라우저 fingerprint 생성 서비스

### 2. **Trackers 모듈** (`src/lib/trackers/`)
이벤트 추적 기능을 제공하는 모듈들입니다.

- **pageViewTracker.ts**: 페이지뷰 이벤트 생성 및 추적
- **customEventTracker.ts**: 커스텀 이벤트 생성 및 추적
- **navigationTracker.ts**: URL 변경 감지 및 네비게이션 추적

```typescript
// 사용 예시
import { trackPageView, trackCustomEvent, setupNavigationTracking } from 'react-eventflow';

// 또는 개별 import
import { trackPageView } from 'react-eventflow/lib/trackers/pageViewTracker';
```

### 3. **Batching 모듈** (`src/lib/batching/`)
이벤트 배칭 및 큐 관리 기능을 제공합니다.

- **EventBatcher.ts**: 이벤트를 모아서 일괄 전송하는 클래스

```typescript
// 사용 예시
import { EventBatcher } from 'react-eventflow';

const batcher = new EventBatcher(onFlush, 2000, true);
batcher.addEvent(event);
batcher.flush();
```

### 4. **Utils 모듈** (`src/lib/utils/`)
공통 유틸리티 함수들을 제공합니다.

- **helpers.ts**: 디버그 로깅, 페이지 정보 수집 등

```typescript
// 사용 예시
import { debugLog, getPageInfo, getTimestamp } from 'react-eventflow';
```

## 📦 사용 방법

### 전체 패키지 사용
```typescript
import { 
  EventFlowProvider, 
  useEventFlow,
  EventBatcher,
  trackPageView,
  debugLog 
} from 'react-eventflow';
```

### 모듈별 개별 사용
```typescript
// Trackers만 사용
import { 
  trackPageView, 
  trackCustomEvent 
} from 'react-eventflow/lib/trackers';

// Batching만 사용
import { EventBatcher } from 'react-eventflow/lib/batching';

// Utils만 사용
import { debugLog, getPageInfo } from 'react-eventflow/lib/utils';
```


## 🔧 확장 예시

새로운 tracker 추가:
```typescript
// src/lib/trackers/scrollTracker.ts
export const trackScroll = (sendEvent, scrollData) => {
  // 구현
};

// src/lib/trackers/index.ts
export * from './scrollTracker';
```
