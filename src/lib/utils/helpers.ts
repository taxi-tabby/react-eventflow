/**
 * 디버그 로그 출력
 */
export const debugLog = (debug: boolean, message: string, ...args: any[]): void => {
  if (debug) {
    console.log(`[EventFlow] ${message}`, ...args);
  }
};

/**
 * 현재 페이지 정보 가져오기
 */
export const getPageInfo = () => {
  return {
    url: window.location.href,
    title: document.title,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
  };
};

/**
 * 타임스탬프 생성
 */
export const getTimestamp = (): number => {
  return Date.now();
};
