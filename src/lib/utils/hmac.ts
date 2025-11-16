import crypto from 'crypto';
import type { EventData, BatchedEvents } from '../../types';

/**
 * HMAC 서명 생성 옵션
 */
export interface HmacOptions {
  /** HMAC 비밀 키 */
  secretKey: string;
  /** 해시 알고리즘 (기본: 'sha256') */
  algorithm?: 'sha256' | 'sha512' | 'sha384' | 'sha1';
  /** 출력 인코딩 (기본: 'hex') */
  encoding?: 'hex' | 'base64' | 'base64url';
}

/**
 * 데이터에 대한 HMAC 서명 생성
 * @param data - 서명할 데이터
 * @param options - HMAC 옵션
 * @returns HMAC 서명 문자열
 */
export function generateHmac(data: string, options: HmacOptions): string {
  const algorithm = options.algorithm || 'sha256';
  const encoding = options.encoding || 'hex';
  
  const hmac = crypto.createHmac(algorithm, options.secretKey);
  hmac.update(data);
  
  return hmac.digest(encoding);
}

/**
 * 이벤트 데이터의 정규화된 문자열 생성 (HMAC 서명용)
 * @param event - 이벤트 데이터 (hmac 필드 제외)
 * @returns 정규화된 JSON 문자열
 */
function normalizeEventData(event: Omit<EventData, 'hmac'>): string {
  // hmac 필드를 제외한 나머지 데이터를 정렬된 JSON으로 변환
  const { type, timestamp, fingerprint, payload } = event;
  return JSON.stringify({ type, timestamp, fingerprint, payload });
}

/**
 * 배치 이벤트 데이터의 정규화된 문자열 생성 (HMAC 서명용)
 * @param batchData - 배치 이벤트 데이터 (hmac 필드 제외)
 * @returns 정규화된 JSON 문자열
 */
function normalizeBatchData(batchData: Omit<BatchedEvents, 'hmac'>): string {
  // hmac 필드를 제외한 나머지 데이터를 정렬된 JSON으로 변환
  const { fingerprint, events } = batchData;
  return JSON.stringify({ fingerprint, events });
}

/**
 * 이벤트 데이터에 대한 HMAC 서명 생성
 * @param event - 이벤트 데이터 (hmac 필드 제외)
 * @param options - HMAC 옵션
 * @returns HMAC 서명 문자열
 */
export function generateEventHmac(event: Omit<EventData, 'hmac'>, options: HmacOptions): string {
  const normalizedData = normalizeEventData(event);
  return generateHmac(normalizedData, options);
}

/**
 * 배치 이벤트에 대한 HMAC 서명 생성
 * @param batchData - 배치 이벤트 데이터 (hmac 필드 제외)
 * @param options - HMAC 옵션
 * @returns HMAC 서명 문자열
 */
export function generateBatchHmac(batchData: Omit<BatchedEvents, 'hmac'>, options: HmacOptions): string {
  const normalizedData = normalizeBatchData(batchData);
  return generateHmac(normalizedData, options);
}

/**
 * fingerprint에 대한 HMAC 서명 생성 (하위 호환성을 위해 유지)
 * @deprecated Use generateEventHmac instead for better security
 * @param fingerprint - 사용자 fingerprint
 * @param options - HMAC 옵션
 * @returns HMAC 서명 문자열
 */
export function generateFingerprintHmac(fingerprint: string, options: HmacOptions): string {
  return generateHmac(fingerprint, options);
}

/**
 * HMAC 서명 검증
 * @param data - 원본 데이터
 * @param signature - 검증할 서명
 * @param options - HMAC 옵션
 * @returns 서명이 유효한지 여부
 */
export function verifyHmac(data: string, signature: string, options: HmacOptions): boolean {
  const expectedSignature = generateHmac(data, options);
  
  // 타이밍 공격 방지를 위한 constant-time 비교
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

/**
 * 이벤트 데이터의 HMAC 서명 검증
 * @param event - 검증할 이벤트 데이터
 * @param options - HMAC 옵션
 * @returns 서명이 유효한지 여부
 */
export function verifyEventHmac(event: EventData, options: HmacOptions): boolean {
  if (!event.hmac) {
    return false;
  }
  
  const { hmac, ...eventData } = event;
  const normalizedData = normalizeEventData(eventData);
  
  return verifyHmac(normalizedData, hmac, options);
}

/**
 * 배치 이벤트의 HMAC 서명 검증
 * @param batchData - 검증할 배치 이벤트 데이터
 * @param options - HMAC 옵션
 * @returns 서명이 유효한지 여부
 */
export function verifyBatchHmac(batchData: BatchedEvents, options: HmacOptions): boolean {
  if (!batchData.hmac) {
    return false;
  }
  
  const { hmac, ...batch } = batchData;
  const normalizedData = normalizeBatchData(batch);
  
  return verifyHmac(normalizedData, hmac, options);
}
