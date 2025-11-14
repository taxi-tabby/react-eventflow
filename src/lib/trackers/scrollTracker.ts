import type { ScrollEvent } from '../../types';

/**
 * 스크롤 이벤트 생성
 */
export const createScrollEvent = (): ScrollEvent => {
  const scrollY = window.scrollY || window.pageYOffset;
  const scrollX = window.scrollX || window.pageXOffset;
  const documentHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrollDepth = documentHeight > 0 ? Math.round((scrollY / documentHeight) * 100) : 0;

  return {
    type: 'scroll',
    timestamp: Date.now(),
    fingerprint: '', // Provider에서 설정됨
    payload: {
      scrollY,
      scrollX,
      scrollDepth,
      documentHeight: document.documentElement.scrollHeight,
    },
  };
};

/**
 * 스크롤 추적 설정
 */
export const setupScrollTracking = (
  sendEvent: (event: ScrollEvent) => void,
  enabled: boolean = true,
  throttleMs: number = 200
): (() => void) => {
  if (!enabled) {
    return () => {};
  }

  let lastSendTime = 0;
  let maxScrollDepth = 0;

  const handleScroll = () => {
    try {
      const now = Date.now();
      
      // 쓰로틀링: throttleMs 간격으로만 이벤트 전송
      if (now - lastSendTime < throttleMs) {
        return;
      }

      lastSendTime = now;
      
      const event = createScrollEvent();
      
      // 최대 스크롤 깊이 추적
      const currentDepth = event.payload.scrollDepth || 0;
      if (currentDepth > maxScrollDepth) {
        maxScrollDepth = currentDepth;
        sendEvent(event);
      }
    } catch (error) {
      // 에러 발생 시 조용히 무시 (다른 라이브러리 충돌 방지)
      console.warn('[EventFlow] Scroll tracking error:', error);
    }
  };

  // passive: true로 설정하여 스크롤 성능 최적화
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Cleanup 함수 반환
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};
