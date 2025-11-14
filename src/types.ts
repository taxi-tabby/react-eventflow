/**
 * 이벤트 데이터 기본 타입
 */
export interface EventData {
  /** 이벤트 타입 (pageview, click, navigation 등) */
  type: string;
  /** 타임스탬프 */
  timestamp: number;
  /** 이벤트 추가 데이터 */
  payload?: Record<string, any>;
}

/**
 * 페이지뷰 이벤트 데이터
 */
export interface PageViewEvent extends EventData {
  type: 'pageview';
  payload: {
    /** 페이지 URL */
    url: string;
    /** 페이지 제목 */
    title?: string;
    /** Referrer */
    referrer?: string;
    /** 사용자 에이전트 */
    userAgent?: string;
  };
}

/**
 * 네비게이션 이벤트 데이터
 */
export interface NavigationEvent extends EventData {
  type: 'navigation';
  payload: {
    /** 이전 URL */
    from: string;
    /** 이동할 URL */
    to: string;
  };
}

/**
 * 커스텀 이벤트 데이터
 */
export interface CustomEvent extends EventData {
  type: 'custom' | 'mouse-moving' | 'mouse-click' | 'pageview' | 'navigation' | 'scroll';
  payload: Record<string, any>;
}

/**
 * 이벤트 전송 콜백 함수
 */
export type EventCallback = (event: EventData) => void | Promise<void>;

/**
 * EventFlow 설정 옵션
 */
export interface EventFlowConfig {
  /** 이벤트 전송 콜백 함수 */
  onEvent: EventCallback;
  
  /** 페이지뷰 자동 추적 활성화 (기본: true) */
  trackPageViews?: boolean;
  
  /** 네비게이션 자동 추적 활성화 (기본: true) */
  trackNavigation?: boolean;
  
  /** 디버그 모드 (기본: false) */
  debug?: boolean;
  
  /** 이벤트 배칭 활성화 (기본: false) */
  enableBatching?: boolean;
  
  /** 배칭 간격(ms) - enableBatching이 true일 때만 적용 (기본: 1000) */
  batchInterval?: number;
}

/**
 * EventFlow Context 값
 */
export interface EventFlowContextValue {
  /** 설정 */
  config: EventFlowConfig;
  
  /** 커스텀 이벤트 전송 */
  trackEvent: (type: string, payload?: Record<string, any>) => void;
  
  /** 페이지뷰 수동 전송 */
  trackPageView: (url?: string, title?: string) => void;
}
