import type { EventData, EventCallback, BatchedEvents, BatchEventData } from '../../types';
import { generateBatchHmac, type HmacOptions } from '../utils/hmac';

/**
 * 이벤트 배칭 관리 클래스
 */
export class EventBatcher {
  private eventQueue: EventData[] = [];
  private batchTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly batchInterval: number;
  private readonly onFlush: EventCallback;
  private readonly debug: boolean;
  private readonly hmacOptions?: HmacOptions;

  constructor(
    onFlush: EventCallback,
    batchInterval: number = 2000,
    debug: boolean = false,
    hmacOptions?: HmacOptions
  ) {
    this.onFlush = onFlush;
    this.batchInterval = batchInterval;
    this.debug = debug;
    this.hmacOptions = hmacOptions;
  }

  /**
   * 이벤트를 큐에 추가
   */
  addEvent(event: EventData): void {
    this.eventQueue.push(event);

    if (this.debug) {
      console.log('[EventBatcher] Event added to queue:', event.type);
    }

    // 기존 타이머 취소
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    // 새 타이머 설정
    this.batchTimer = setTimeout(() => {
      this.flush();
    }, this.batchInterval);
  }

  /**
   * 큐의 모든 이벤트 전송
   */
  flush(): void {
    if (this.eventQueue.length === 0) {
      return;
    }

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    if (this.debug) {
      console.log('[EventBatcher] Flushing batch:', eventsToSend.length, 'events');
    }

    // fingerprint를 한 번만 포함하는 배치 형식으로 변환
    const fingerprint = eventsToSend[0]?.fingerprint || '';
    const batchEvents: BatchEventData[] = eventsToSend.map(event => ({
      type: event.type,
      timestamp: event.timestamp,
      payload: event.payload,
    }));

    const batchedEvents: BatchedEvents = {
      fingerprint,
      events: batchEvents,
    };

    // HMAC 서명 추가
    if (this.hmacOptions) {
      batchedEvents.hmac = generateBatchHmac(batchedEvents, this.hmacOptions);
      
      if (this.debug) {
        console.log('[EventBatcher] HMAC signature added to batch');
      }
    }

    this.onFlush(batchedEvents);
  }

  /**
   * 타이머 정리
   */
  clear(): void {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
  }

  /**
   * 큐에 있는 이벤트 수 반환
   */
  getQueueSize(): number {
    return this.eventQueue.length;
  }
}
