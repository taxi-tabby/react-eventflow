import type { MouseClickEvent } from '../../types';

/**
 * 마우스 클릭 이벤트 생성
 */
export const createMouseClickEvent = (
  x: number,
  y: number,
  target?: string,
  targetClass?: string,
  targetId?: string,
  button?: number
): MouseClickEvent => {
  return {
    type: 'mouse-click',
    timestamp: Date.now(),
    fingerprint: '', // Provider에서 설정됨
    payload: {
      x,
      y,
      target,
      targetClass,
      targetId,
      button,
    },
  };
};

/**
 * 마우스 클릭 추적 설정
 */
export const setupMouseClickTracking = (
  sendEvent: (event: MouseClickEvent) => void,
  enabled: boolean = true
): (() => void) => {
  if (!enabled) {
    return () => {};
  }

  const handleClick = (e: MouseEvent) => {
    try {
      const target = e.target as HTMLElement;
      
      const event = createMouseClickEvent(
        e.clientX,
        e.clientY,
        target.tagName?.toLowerCase(),
        target.className,
        target.id,
        e.button
      );
      
      sendEvent(event);
    } catch (error) {
      // 에러 발생 시 조용히 무시 (다른 라이브러리 충돌 방지)
      console.warn('[EventFlow] Mouse click tracking error:', error);
    }
  };

  // passive: false, capture: true로 설정하여 다른 핸들러와 충돌 방지
  window.addEventListener('click', handleClick, { capture: true, passive: true });

  // Cleanup 함수 반환
  return () => {
    window.removeEventListener('click', handleClick, { capture: true } as EventListenerOptions);
  };
};
