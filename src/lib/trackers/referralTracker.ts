import type { ReferralEvent } from '../../types';

/**
 * URL에서 쿼리 파라미터 추출
 */
const parseQueryParams = (url: string): Record<string, string> => {
  const params: Record<string, string> = {};
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
  } catch (e) {
    // URL 파싱 실패 시 빈 객체 반환
  }
  return params;
};

/**
 * UTM 파라미터 추출
 */
const extractUtmParams = (queryParams: Record<string, string>) => {
  const utm: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  } = {};

  if (queryParams.utm_source) utm.source = queryParams.utm_source;
  if (queryParams.utm_medium) utm.medium = queryParams.utm_medium;
  if (queryParams.utm_campaign) utm.campaign = queryParams.utm_campaign;
  if (queryParams.utm_term) utm.term = queryParams.utm_term;
  if (queryParams.utm_content) utm.content = queryParams.utm_content;

  return Object.keys(utm).length > 0 ? utm : undefined;
};

/**
 * URL에서 도메인 추출
 */
const extractDomain = (url: string): string | undefined => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return undefined;
  }
};

/**
 * 소셜 미디어 도메인 목록
 */
const SOCIAL_DOMAINS = [
  'facebook.com',
  'twitter.com',
  'x.com',
  'instagram.com',
  'linkedin.com',
  'pinterest.com',
  'reddit.com',
  'youtube.com',
  'tiktok.com',
  'snapchat.com',
  't.co',
  'fb.me',
];

/**
 * 검색 엔진 도메인 목록
 */
const SEARCH_DOMAINS = [
  'google.',
  'bing.com',
  'yahoo.com',
  'duckduckgo.com',
  'naver.com',
  'daum.net',
  'baidu.com',
  'yandex.com',
];

/**
 * 유입 소스 타입 판별
 */
const determineSourceType = (
  referrer: string,
  referrerDomain: string | undefined,
  currentDomain: string
): ReferralEvent['payload']['sourceType'] => {
  // Direct 접근 (referrer 없음)
  if (!referrer || referrer === '') {
    return 'direct';
  }

  // 도메인을 파싱할 수 없는 경우
  if (!referrerDomain) {
    return 'unknown';
  }

  // Internal 접근 (같은 도메인)
  if (referrerDomain === currentDomain) {
    return 'internal';
  }

  // 이메일에서 접근
  if (referrer.includes('mail.') || referrerDomain.includes('mail')) {
    return 'email';
  }

  // 소셜 미디어에서 접근
  if (SOCIAL_DOMAINS.some(domain => referrerDomain.includes(domain))) {
    return 'social';
  }

  // 검색 엔진에서 접근
  if (SEARCH_DOMAINS.some(domain => referrerDomain.includes(domain))) {
    return 'search';
  }

  // 외부 사이트에서 접근
  return 'external';
};

/**
 * 네비게이션 타입 가져오기
 */
const getNavigationType = (): string | undefined => {
  if (typeof performance !== 'undefined' && performance.navigation) {
    const navType = performance.navigation.type;
    switch (navType) {
      case 0:
        return 'navigate'; // 일반 탐색
      case 1:
        return 'reload'; // 새로고침
      case 2:
        return 'back_forward'; // 뒤로/앞으로 가기
      case 255:
        return 'reserved';
      default:
        return 'unknown';
    }
  }
  
  // PerformanceNavigationTiming API 사용 (최신 브라우저)
  if (typeof performance !== 'undefined' && performance.getEntriesByType) {
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length > 0) {
      return navEntries[0].type;
    }
  }

  return undefined;
};

/**
 * 유입 경로 추적 이벤트 생성
 */
export const createReferralEvent = (): ReferralEvent => {
  // 브라우저 환경 체크
  if (typeof window === 'undefined') {
    throw new Error('Referral tracking is only available in browser environment');
  }

  const currentUrl = window.location.href;
  const referrer = typeof document !== 'undefined' ? document.referrer : '';
  const currentDomain = window.location.hostname;
  const referrerDomain = extractDomain(referrer);
  const queryParams = parseQueryParams(currentUrl);
  const utm = extractUtmParams(queryParams);
  const sourceType = determineSourceType(referrer, referrerDomain, currentDomain);
  const navigationType = getNavigationType();
  const isBackNavigation = navigationType === 'back_forward';

  return {
    type: 'referral',
    timestamp: Date.now(),
    fingerprint: '', // Provider에서 설정됨
    payload: {
      currentUrl,
      referrer,
      referrerDomain,
      sourceType,
      utm,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      navigation: {
        historyLength: typeof window !== 'undefined' && window.history ? window.history.length : 0,
        isBackNavigation,
        navigationType,
      },
    },
  };
};

/**
 * 유입 경로 추적 함수
 */
export const trackReferral = (sendEvent: (event: ReferralEvent) => void) => {
  try {
    const event = createReferralEvent();
    sendEvent(event);
  } catch (error) {
    console.warn('[EventFlow] Referral tracking error:', error);
  }
};
