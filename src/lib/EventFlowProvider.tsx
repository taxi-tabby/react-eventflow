import React, { createContext, useEffect, useRef, ReactNode } from 'react';
import type { EventFlowConfig, EventFlowContextValue, EventData } from '../types';
import { fingerprintService } from './fingerprintClass';
import { EventBatcher } from './batching';
import { 
  trackPageView as pageViewTracker,
  setupNavigationTracking,
  setupMouseMovingTracking,
  setupMouseClickTracking,
  setupScrollTracking,
  trackReferral
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
  
  // Fingerprint 준비 완료 여부
  const fingerprintReadyRef = useRef<boolean>(false);
  
  // Fingerprint 대기 중인 이벤트 큐
  const pendingEventsRef = useRef<EventData[]>([]);
  
  // EventBatcher 인스턴스
  const eventBatcherRef = useRef<EventBatcher | null>(null);

  // Fingerprint 초기화
  useEffect(() => {
    const initFingerprint = async () => {
      try {
        fingerPrintValueRef.current = await fingerprintService.getFingerprint();
        fingerprintReadyRef.current = true;
        debugLog(config.debug || false, 'Fingerprint initialized:', fingerPrintValueRef.current);
        
        // 대기 중인 이벤트들 처리
        if (pendingEventsRef.current.length > 0) {
          debugLog(config.debug || false, 'Processing pending events:', pendingEventsRef.current.length);
          
          pendingEventsRef.current.forEach(event => {
            const eventWithFingerprint: EventData = {
              ...event,
              fingerprint: fingerPrintValueRef.current!,
            };
            
            if (config.enableBatching && eventBatcherRef.current) {
              eventBatcherRef.current.addEvent(eventWithFingerprint);
            } else {
              config.onEvent(eventWithFingerprint);
            }
          });
          
          pendingEventsRef.current = [];
        }
      } catch (error) {
        console.error('[EventFlow] Fingerprint initialization error:', error);
      }
    };
    initFingerprint();
  }, [config.debug, config.enableBatching, config.onEvent]);

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
    // fingerprint가 아직 준비되지 않았으면 큐에 추가
    if (!fingerprintReadyRef.current || !fingerPrintValueRef.current) {
      debugLog(config.debug || false, 'Event queued (fingerprint not ready):', event.type);
      pendingEventsRef.current.push(event);
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
    // 브라우저 환경에서만 실행
    if (typeof window === 'undefined') return;
    
    if (config.trackPageViews !== false) {
      trackPageView();
      debugLog(config.debug || false, 'Initial pageview tracked');
    }
  }, [config.trackPageViews, config.debug]);

  // 유입 경로 추적 (최초 마운트 시 한 번만)
  useEffect(() => {
    // 브라우저 환경에서만 실행
    if (typeof window === 'undefined') return;
    
    if (config.trackReferral !== false) {
      trackReferral(sendEvent);
      debugLog(config.debug || false, 'Referral tracked');
    }
  }, [config.trackReferral, config.debug]);

  // 네비게이션 추적 (URL 변경 감지)
  useEffect(() => {
    // 브라우저 환경에서만 실행
    if (typeof window === 'undefined') return;
    
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

  // 마우스 클릭 추적
  useEffect(() => {
    // 브라우저 환경에서만 실행
    if (typeof window === 'undefined') return;
    
    if (config.trackMouseClick !== true) {
      return;
    }

    const cleanup = setupMouseClickTracking(sendEvent, true);
    debugLog(config.debug || false, 'Mouse click tracking initialized');

    return cleanup;
  }, [config.trackMouseClick, config.debug]);

  // 마우스 이동 추적
  useEffect(() => {
    // 브라우저 환경에서만 실행
    if (typeof window === 'undefined') return;
    
    if (config.trackMouseMoving !== true) {
      return;
    }

    const cleanup = setupMouseMovingTracking(
      sendEvent,
      true,
      config.mouseMovingThrottle || 100
    );
    debugLog(config.debug || false, 'Mouse moving tracking initialized');

    return cleanup;
  }, [config.trackMouseMoving, config.mouseMovingThrottle, config.debug]);

  // 스크롤 추적
  useEffect(() => {
    // 브라우저 환경에서만 실행
    if (typeof window === 'undefined') return;
    
    if (config.trackScroll !== true) {
      return;
    }

    const cleanup = setupScrollTracking(
      sendEvent,
      true,
      config.scrollThrottle || 200
    );
    debugLog(config.debug || false, 'Scroll tracking initialized');

    return cleanup;
  }, [config.trackScroll, config.scrollThrottle, config.debug]);

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
