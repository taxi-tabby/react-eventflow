/**
 * 이벤트 데이터 기본 타입
 */
export interface EventData {
  /** 이벤트 타입 (pageview, click, navigation 등) */
  type: string;
  /** 타임스탬프 */
  timestamp: number;
  /** 사용자 식별 fingerprint */
  fingerprint: string;
  /** 이벤트 추가 데이터 */
  payload?: Record<string, any>;
}

/**
 * 배치 이벤트용 경량화된 이벤트 데이터 (fingerprint 제외)
 */
export interface BatchEventData {
  /** 이벤트 타입 (pageview, click, navigation 등) */
  type: string;
  /** 타임스탬프 */
  timestamp: number;
  /** 이벤트 추가 데이터 */
  payload?: Record<string, any>;
}

/**
 * 배치로 전송되는 이벤트 묶음
 */
export interface BatchedEvents {
  /** 사용자 식별 fingerprint (배치 전체에 공통) */
  fingerprint: string;
  /** 이벤트 배열 */
  events: BatchEventData[];
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
 * 마우스 이동 이벤트 데이터
 */
export interface MouseMovingEvent extends EventData {
  type: 'mouse-moving';
  payload: {
    /** X 좌표 */
    x: number;
    /** Y 좌표 */
    y: number;
    /** 페이지 내 X 좌표 */
    pageX?: number;
    /** 페이지 내 Y 좌표 */
    pageY?: number;
  };
}

/**
 * 마우스 클릭 이벤트 데이터
 */
export interface MouseClickEvent extends EventData {
  type: 'mouse-click';
  payload: {
    /** X 좌표 */
    x: number;
    /** Y 좌표 */
    y: number;
    /** 클릭한 요소의 태그명 */
    target?: string;
    /** 클릭한 요소의 클래스 */
    targetClass?: string;
    /** 클릭한 요소의 ID */
    targetId?: string;
    /** 버튼 종류 (0: 왼쪽, 1: 휠, 2: 오른쪽) */
    button?: number;
  };
}

/**
 * 스크롤 이벤트 데이터
 */
export interface ScrollEvent extends EventData {
  type: 'scroll';
  payload: {
    /** 세로 스크롤 위치 */
    scrollY: number;
    /** 가로 스크롤 위치 */
    scrollX: number;
    /** 스크롤 깊이 (%) */
    scrollDepth?: number;
    /** 문서 전체 높이 */
    documentHeight?: number;
  };
}

/**
 * 유입 경로 추적 이벤트 데이터
 */
export interface ReferralEvent extends EventData {
  type: 'referral';
  payload: {
    /** 현재 페이지 URL */
    currentUrl: string;
    /** Referrer URL (어디서 왔는지) */
    referrer: string;
    /** Referrer 도메인 */
    referrerDomain?: string;
    /** 유입 소스 타입 (direct, external, internal, social, search, etc.) */
    sourceType: 'direct' | 'external' | 'internal' | 'social' | 'search' | 'email' | 'unknown';
    /** UTM 파라미터들 */
    utm?: {
      /** 캠페인 소스 (예: google, newsletter) */
      source?: string;
      /** 캠페인 매체 (예: cpc, banner, email) */
      medium?: string;
      /** 캠페인 이름 */
      campaign?: string;
      /** 캠페인 용어 (유료 검색 키워드) */
      term?: string;
      /** 캠페인 콘텐츠 (A/B 테스트용) */
      content?: string;
    };
    /** 모든 URL 파라미터 */
    queryParams?: Record<string, string>;
    /** 브라우저 히스토리 정보 */
    navigation?: {
      /** 히스토리 엔트리 개수 */
      historyLength: number;
      /** 뒤로가기로 접근했는지 여부 */
      isBackNavigation: boolean;
      /** 네비게이션 타입 */
      navigationType?: string;
    };
  };
}

/**
 * 이벤트 전송 콜백 함수
 */
export type EventCallback = (event: EventData | BatchedEvents) => void | Promise<void>;

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
  
  /** 유입 경로 자동 추적 활성화 (기본: true) */
  trackReferral?: boolean;
  
  /** 마우스 클릭 자동 추적 활성화 (기본: false) */
  trackMouseClick?: boolean;
  
  /** 마우스 이동 자동 추적 활성화 (기본: false) */
  trackMouseMoving?: boolean;
  
  /** 마우스 이동 쓰로틀링 간격(ms) (기본: 100) */
  mouseMovingThrottle?: number;
  
  /** 스크롤 자동 추적 활성화 (기본: false) */
  trackScroll?: boolean;
  
  /** 스크롤 쓰로틀링 간격(ms) (기본: 200) */
  scrollThrottle?: number;
  
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
  
  /** 페이지뷰 수동 전송 */
  trackPageView: (url?: string, title?: string) => void;
}
