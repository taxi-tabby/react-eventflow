import React, { createContext, useEffect, useRef, ReactNode } from 'react';
import type { EventFlowConfig, EventFlowContextValue, EventData } from '../types';
import { fingerprintService } from './fingerprintClass';
import { EventBatcher } from './batching';
import { 
  trackPageView as pageViewTracker,
  setupNavigationTracking,
  setupMouseMovingTracking,
  setupMouseClickTracking,
  setupScrollTracking
} from './trackers';
import { debugLog } from './utils';

/**
 * EventFlow Context
 */
export const EventFlowContext = createContext<EventFlowContextValue | null>(null);

/**
 * EventFlowProvider Props
 */
export interface EventFlowProviderProps {
  /** EventFlow 설정 */
  config: EventFlowConfig;
  /** Children 컴포넌트 */
  children: ReactNode;
}

/**
 * EventFlowProvider - 이벤트 추적 Provider 컴포넌트
 */
export const EventFlowProvider = ({ config, children }: EventFlowProviderProps) => {

  // Fingerprint 값 저장
  const fingerPrintValueRef = useRef<string | null>(null);
  
  // EventBatcher 인스턴스
  const eventBatcherRef = useRef<EventBatcher | null>(null);

  // Fingerprint 초기화
  useEffect(() => {
    const initFingerprint = async () => {
      fingerPrintValueRef.current = await fingerprintService.getFingerprint();
      debugLog(config.debug || false, 'Fingerprint initialized:', fingerPrintValueRef.current);
    };
    initFingerprint();
  }, [config.debug]);

  // EventBatcher 초기화
  useEffect(() => {
    if (config.enableBatching) {
      eventBatcherRef.current = new EventBatcher(
        config.onEvent,
        config.batchInterval || 2000,
        config.debug || false
      );

      debugLog(config.debug || false, 'EventBatcher initialized');
    }

    return () => {
      if (eventBatcherRef.current) {
        eventBatcherRef.current.flush();
        eventBatcherRef.current.clear();
      }
    };
  }, [config.enableBatching, config.batchInterval, config.onEvent, config.debug]);

  // 이벤트 전송 로직
  const sendEvent = (event: EventData) => {
    // fingerprint가 없으면 전송하지 않음
    if (!fingerPrintValueRef.current) {
      debugLog(config.debug || false, 'Event skipped: fingerprint not ready');
      return;
    }

    // fingerprint 추가
    const eventWithFingerprint: EventData = {
      ...event,
      fingerprint: fingerPrintValueRef.current,
    };

    debugLog(config.debug || false, 'Event:', eventWithFingerprint);

    // 배칭이 활성화된 경우
    if (config.enableBatching && eventBatcherRef.current) {
      eventBatcherRef.current.addEvent(eventWithFingerprint);
    } else {
      // 즉시 전송
      config.onEvent(eventWithFingerprint);
    }
  };

  // 페이지뷰 추적
  const trackPageView = (url?: string, title?: string) => {
    pageViewTracker(sendEvent, url, title);
  };

  // 초기 페이지뷰 추적 (컴포넌트 마운트 시)
  useEffect(() => {
    if (config.trackPageViews !== false) {
      trackPageView();
      debugLog(config.debug || false, 'Initial pageview tracked');
    }
  }, [config.trackPageViews, config.debug]);

  // 네비게이션 추적 (URL 변경 감지)
  useEffect(() => {
    if (config.trackNavigation === false) {
      return;
    }

    const cleanup = setupNavigationTracking(
      sendEvent,
      true
    );

    debugLog(config.debug || false, 'Navigation tracking initialized');

    return cleanup;
  }, [config.trackNavigation, config.debug]);

  const contextValue: EventFlowContextValue = {
    config,
    trackPageView,
  };

  return (
    <EventFlowContext.Provider value={contextValue}>
      {children}
    </EventFlowContext.Provider>
  );
};
