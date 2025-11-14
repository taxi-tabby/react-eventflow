import type { MouseMovingEvent } from '../../types';

/**
 * 마우스 이동 이벤트 생성
 */
export const createMouseMovingEvent = (
  x: number,
  y: number,
  pageX?: number,
  pageY?: number
): MouseMovingEvent => {
  return {
    type: 'mouse-moving',
    timestamp: Date.now(),
    fingerprint: '', // Provider에서 설정됨
    payload: {
      x,
      y,
      pageX,
      pageY,
    },
  };
};

/**
 * 마우스 이동 추적 설정
 */
export const setupMouseMovingTracking = (
  sendEvent: (event: MouseMovingEvent) => void,
  enabled: boolean = true,
  throttleMs: number = 100
): (() => void) => {
  if (!enabled) {
    return () => {};
  }

  let lastSendTime = 0;

  const handleMouseMove = (e: MouseEvent) => {
    try {
      const now = Date.now();
      
      // 쓰로틀링: throttleMs 간격으로만 이벤트 전송
      if (now - lastSendTime < throttleMs) {
        return;
      }

      lastSendTime = now;
      
      const event = createMouseMovingEvent(
        e.clientX,
        e.clientY,
        e.pageX,
        e.pageY
      );
      
      sendEvent(event);
    } catch (error) {
      // 에러 발생 시 조용히 무시 (다른 라이브러리 충돌 방지)
      console.warn('[EventFlow] Mouse moving tracking error:', error);
    }
  };

  // passive: true로 설정하여 성능 향상 및 충돌 방지
  window.addEventListener('mousemove', handleMouseMove, { passive: true });

  // Cleanup 함수 반환
  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
  };
};
