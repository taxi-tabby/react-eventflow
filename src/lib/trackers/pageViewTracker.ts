import type { PageViewEvent } from '../../types';

/**
 * 페이지뷰 이벤트 생성
 */
export const createPageViewEvent = (
  url?: string,
  title?: string
): PageViewEvent => {
  return {
    type: 'pageview',
    timestamp: Date.now(),
    payload: {
      url: url || window.location.href,
      title: title || document.title,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
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
  const event = createPageViewEvent(url, title);
  sendEvent(event);
};
