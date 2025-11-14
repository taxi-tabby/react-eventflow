import type { CustomEvent } from '../../types';

/**
 * 커스텀 이벤트 생성
 */
export const createCustomEvent = (
  type: string,
  payload?: Record<string, any>
): CustomEvent => {
  return {
    type: type as CustomEvent['type'],
    timestamp: Date.now(),
    payload: payload || {},
  };
};

/**
 * 커스텀 이벤트 추적 함수
 */
export const trackCustomEvent = (
  sendEvent: (event: CustomEvent) => void,
  type: string,
  payload?: Record<string, any>
) => {
  const event = createCustomEvent(type, payload);
  sendEvent(event);
};
