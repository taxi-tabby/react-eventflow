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
  };

  window.addEventListener('click', handleClick);

  // Cleanup 함수 반환
  return () => {
    window.removeEventListener('click', handleClick);
  };
};
