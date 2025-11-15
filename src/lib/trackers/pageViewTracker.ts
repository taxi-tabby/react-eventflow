import type { PageViewEvent } from '../../types';

/**
 * 페이지뷰 이벤트 생성
 */
export const createPageViewEvent = (
  url?: string,
  title?: string
): PageViewEvent => {
  // 브라우저 환경 체크
  if (typeof window === 'undefined') {
    throw new Error('PageView tracking is only available in browser environment');
  }

  return {
    type: 'pageview',
    timestamp: Date.now(),
    fingerprint: '', // Provider에서 설정됨
    payload: {
      url: url || window.location.href,
      title: title || (typeof document !== 'undefined' ? document.title : ''),
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    },
  };
};

/**
 * 페이지뷰 추적 함수
 */
export const trackPageView = (
  sendEvent: (event: PageViewEvent) => void,
  url?: string,
  title?: string
) => {
  try {
    const event = createPageViewEvent(url, title);
    sendEvent(event);
  } catch (error) {
    console.warn('[EventFlow] PageView tracking error:', error);
  }
};
