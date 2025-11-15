import crypto from 'crypto';

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
 * fingerprint에 대한 HMAC 서명 생성
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
