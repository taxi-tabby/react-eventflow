import React, { createContext, useEffect, useRef, ReactNode } from 'react';
import type { EventFlowConfig, EventFlowContextValue, EventData } from '../types';
import { fingerprintService } from './fingerprintClass'

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

  // ✅ 마운트 시 한 번만 생성, 이후 유지됨
  const fingerPrintValueRef = useRef<string | null>(null);


  const eventQueueRef = useRef<EventData[]>([]);
  const batchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fingerprint 초기화
  useEffect(() => {
    const initFingerprint = async () => {
      fingerPrintValueRef.current = await fingerprintService.getFingerprint();
    };
    initFingerprint();
  }, []);

  
  // 배칭된 이벤트 일괄 전송
  const flushEvents = () => {
    if (eventQueueRef.current.length === 0) return;

    const eventsToSend = [...eventQueueRef.current];
    eventQueueRef.current = [];

    if (config.debug) {
      console.log('[EventFlow] Flushing batch:', eventsToSend.length, 'events');
    }

    // 배칭된 이벤트 전송
    config.onEvent(eventsToSend);
  };

  // 이벤트 전송 로직
  const sendEvent = (event: EventData) => {
    if (config.debug) {
      console.log('[EventFlow]', event);
    }

    // 배칭이 활성화된 경우
    if (config.enableBatching) {
      eventQueueRef.current.push(event);

      // 기존 타이머가 있으면 취소
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
      }

      // 새 타이머 설정 (기본 2초 후 전송)
      const batchInterval = config.batchInterval || 2000;
      batchTimerRef.current = setTimeout(() => {
        flushEvents();
      }, batchInterval);
    } else {
      // 즉시 전송
      config.onEvent(event);
    }
  };

  // TODO: 페이지뷰 추적
  const trackPageView = (url?: string, title?: string) => {
    // TODO: 구현 필요
  };

  // TODO: 커스텀 이벤트 추적
  const trackEvent = (type: string, payload?: Record<string, any>) => {
    // TODO: 구현 필요
  };

  // TODO: 초기 페이지뷰 추적 (컴포넌트 마운트 시)
  useEffect(() => {
    // TODO: 구현 필요
  }, []);

  // TODO: 네비게이션 추적 (URL 변경 감지)
  useEffect(() => {
    // TODO: 구현 필요
  }, []);

  // TODO: 배칭 타이머 정리
  useEffect(() => {
    return () => {
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
      }
    };
  }, []);

  const contextValue: EventFlowContextValue = {
    config,
    trackEvent,
    trackPageView,
  };

  return (
    <EventFlowContext.Provider value={contextValue}>
      {children}
    </EventFlowContext.Provider>
  );
};
