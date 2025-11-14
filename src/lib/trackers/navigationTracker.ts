import type { NavigationEvent } from '../../types';

/**
 * 네비게이션 이벤트 생성
 */
export const createNavigationEvent = (
  from: string,
  to: string
): NavigationEvent => {
  return {
    type: 'navigation',
    timestamp: Date.now(),
    payload: {
      from,
      to,
    },
  };
};

/**
 * 네비게이션 추적 함수
 */
export const trackNavigation = (
  sendEvent: (event: NavigationEvent) => void,
  from: string,
  to: string
) => {
  const event = createNavigationEvent(from, to);
  sendEvent(event);
};

/**
 * URL 변경 감지 및 네비게이션 추적 설정
 */
export const setupNavigationTracking = (
  sendEvent: (event: NavigationEvent) => void,
  enabled: boolean = true
): (() => void) => {
  if (!enabled) {
    return () => {};
  }

  let currentUrl = window.location.href;

  const handleUrlChange = () => {
    const newUrl = window.location.href;
    if (newUrl !== currentUrl) {
      trackNavigation(sendEvent, currentUrl, newUrl);
      currentUrl = newUrl;
    }
  };

  // History API 감지
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;

  window.history.pushState = function (...args) {
    originalPushState.apply(this, args);
    handleUrlChange();
  };

  window.history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    handleUrlChange();
  };

  // popstate 이벤트 감지 (뒤로가기/앞으로가기)
  window.addEventListener('popstate', handleUrlChange);

  // Cleanup 함수 반환
  return () => {
    window.history.pushState = originalPushState;
    window.history.replaceState = originalReplaceState;
    window.removeEventListener('popstate', handleUrlChange);
  };
};
