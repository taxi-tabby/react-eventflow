# HMAC 서명 검증 가이드

## 개요

HMAC (Hash-based Message Authentication Code)는 이벤트 데이터의 무결성을 보장하고, 서버에서 이벤트가 신뢰할 수 있는 출처에서 왔는지 검증하는 데 사용됩니다.

## 작동 원리

1. **클라이언트**: 전체 이벤트 데이터(type, timestamp, fingerprint, payload)를 비밀 키로 HMAC 서명 생성
2. **전송**: 이벤트와 함께 서명을 서버로 전송
3. **서버**: 동일한 비밀 키와 동일한 데이터로 서명을 재생성하여 비교
4. **검증**: 서명이 일치하면 이벤트가 유효하고 변조되지 않았음을 보장

## 클라이언트 설정

### 기본 사용법

```tsx
import { EventFlowProvider } from '@taxi_tabby/react-eventflow';

function App() {
  return (
    <EventFlowProvider
      config={{
        onEvent: handleEvents,
        
        // HMAC 활성화
        enableHmac: true,
        hmacSecretKey: process.env.REACT_APP_HMAC_SECRET,
        
        // 선택적 옵션 (기본값 사용 권장)
        hmacAlgorithm: 'sha256',  // 기본값
        hmacEncoding: 'hex',       // 기본값
      }}
    >
      <YourApp />
    </EventFlowProvider>
  );
}
```

### 환경 변수 설정

`.env` 파일:
```bash
REACT_APP_HMAC_SECRET=your-super-secret-key-here-make-it-long-and-random
```

**주의사항:**
- 절대로 비밀 키를 코드에 하드코딩하지 마세요
- 버전 관리 시스템(Git)에 비밀 키를 커밋하지 마세요
- 프로덕션과 개발 환경에서 다른 키를 사용하세요

## 이벤트 형식

### 단일 이벤트

```typescript
{
  type: 'pageview',
  timestamp: 1699999999999,
  fingerprint: 'abc123def456',
  hmac: 'e8a5f2c9d1b7...',  // 전체 이벤트 데이터의 HMAC 서명
  payload: {
    url: '/home',
    title: 'Home Page'
  }
}
```

### 배치 이벤트

```typescript
{
  fingerprint: 'abc123def456',
  hmac: 'e8a5f2c9d1b7...',  // 전체 배치 데이터의 HMAC 서명
  events: [
    {
      type: 'pageview',
      timestamp: 1699999999999,
      payload: { url: '/home' }
    },
    {
      type: 'click',
      timestamp: 1700000000000,
      payload: { x: 100, y: 200 }
    }
  ]
}
```

## 서버 검증

### Node.js / Express 예제

```typescript
import crypto from 'crypto';
import express from 'express';

const app = express();
app.use(express.json());

// HMAC 검증 함수 - 전체 이벤트 데이터 검증
function verifyEventHmac(
  event: any,
  secretKey: string,
  algorithm: string = 'sha256'
): boolean {
  const { hmac, ...eventData } = event;
  
  // hmac를 제외한 이벤트 데이터를 정규화된 JSON으로 변환
  const normalizedData = JSON.stringify(eventData);
  
  const expectedSignature = crypto
    .createHmac(algorithm, secretKey)
    .update(normalizedData)
    .digest('hex');
  
  // Timing-safe 비교로 타이밍 공격 방지
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hmac),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

// 배치 이벤트 검증 함수
function verifyBatchHmac(
  batch: any,
  secretKey: string,
  algorithm: string = 'sha256'
): boolean {
  const { hmac, ...batchData } = batch;
  
  // hmac를 제외한 배치 데이터를 정규화된 JSON으로 변환
  const normalizedData = JSON.stringify(batchData);
  
  const expectedSignature = crypto
    .createHmac(algorithm, secretKey)
    .update(normalizedData)
    .digest('hex');
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hmac),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

// 단일 이벤트 처리
app.post('/api/events', (req, res) => {
  const event = req.body;
  
  // HMAC 검증 - 전체 이벤트 데이터 검증
  if (!verifyEventHmac(event, process.env.HMAC_SECRET!)) {
    return res.status(401).json({ error: 'Invalid HMAC signature' });
  }
  
  // 이벤트 처리
  console.log('Valid event received:', event.type);
  // DB에 저장, 분석 등...
  
  res.json({ success: true });
});

// 배치 이벤트 처리
app.post('/api/events/batch', (req, res) => {
  const batch = req.body;
  
  // HMAC 검증 - 전체 배치 데이터 검증
  if (!verifyBatchHmac(batch, process.env.HMAC_SECRET!)) {
    return res.status(401).json({ error: 'Invalid HMAC signature' });
  }
  
  // 배치 이벤트 처리
  console.log('Valid batch received:', batch.events.length, 'events');
  // DB에 일괄 저장, 분석 등...
  
  res.json({ success: true });
});

app.listen(3000);
```

### Next.js API Route 예제

```typescript
// app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function verifyEventHmac(event: any): boolean {
  const secretKey = process.env.HMAC_SECRET!;
  const { hmac, ...eventData } = event;
  
  const normalizedData = JSON.stringify(eventData);
  
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(normalizedData)
    .digest('hex');
  
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hmac),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const event = await request.json();
  
  // HMAC 검증
  if (!verifyEventHmac(event)) {
    return NextResponse.json(
      { error: 'Invalid HMAC signature' },
      { status: 401 }
    );
  }
  
  // 이벤트 처리
  console.log('Valid event:', event.type);
  
  return NextResponse.json({ success: true });
}
```

### Python / FastAPI 예제

```python
import hmac
import hashlib
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

app = FastAPI()

class Event(BaseModel):
    fingerprint: str
    hmac_signature: str  # 'hmac'는 파이썬 내장 모듈명과 충돌
    type: str
    timestamp: int
    payload: Dict[str, Any]

def verify_event_hmac(event_data: dict, secret_key: str) -> bool:
    hmac_sig = event_data.pop('hmac_signature', None)
    if not hmac_sig:
        return False
    
    # 이벤트 데이터를 정규화된 JSON으로 변환
    normalized_data = json.dumps(event_data, separators=(',', ':'))
    
    expected = hmac.new(
        secret_key.encode(),
        normalized_data.encode(),
        hashlib.sha256
    ).hexdigest()
    
    # Timing-safe 비교
    return hmac.compare_digest(hmac_sig, expected)

@app.post("/api/events")
async def receive_event(event: Event):
    secret_key = "your-secret-key"  # 환경 변수에서 가져오기
    
    event_dict = event.dict()
    # pydantic 필드명을 원래 이름으로 변경
    event_dict['hmac'] = event_dict.pop('hmac_signature')
    
    if not verify_event_hmac(event_dict, secret_key):
        raise HTTPException(status_code=401, detail="Invalid HMAC signature")
    
    print(f"Valid event received: {event.type}")
    # 이벤트 처리...
    
    return {"success": True}
```

## 알고리즘 선택 가이드

### SHA-256 (기본, 권장)
- **사용 시기**: 대부분의 경우
- **장점**: 빠르고 안전하며 널리 지원됨
- **서명 길이**: 64자 (hex), 44자 (base64)

```tsx
hmacAlgorithm: 'sha256'  // 기본값
```

### SHA-512
- **사용 시기**: 최고 수준의 보안이 필요한 경우
- **장점**: 더 강력한 보안
- **단점**: 서명이 더 김 (128자 hex)

```tsx
hmacAlgorithm: 'sha512'
```

### SHA-384
- **사용 시기**: SHA-256과 SHA-512의 중간이 필요한 경우
- **서명 길이**: 96자 (hex)

```tsx
hmacAlgorithm: 'sha384'
```

### SHA-1 (권장하지 않음)
- **주의**: 보안 취약점이 알려져 있어 레거시 시스템에서만 사용
- **사용 금지**: 새 프로젝트에서는 사용하지 마세요

## 인코딩 선택 가이드

### Hex (기본, 권장)
- **사용 시기**: 대부분의 경우
- **장점**: 모든 시스템에서 호환, 디버깅 쉬움
- **단점**: Base64보다 길이가 김

```tsx
hmacEncoding: 'hex'  // 기본값
```

### Base64
- **사용 시기**: 네트워크 대역폭 절약이 중요한 경우
- **장점**: Hex보다 짧은 서명 (약 33% 감소)

```tsx
hmacEncoding: 'base64'
```

### Base64URL
- **사용 시기**: URL에 서명을 포함해야 하는 경우
- **장점**: URL-safe, Base64와 같은 길이

```tsx
hmacEncoding: 'base64url'
```

## 보안 모범 사례

### 1. 키 관리 - 백엔드 기반 접근 방식 (강력 권장)

**❌ 안전하지 않음: 클라이언트 환경 변수**
```tsx
// 이렇게 하지 마세요! 빌드 시 번들에 포함되어 누구나 볼 수 있습니다
<EventFlowProvider
  config={{
    enableHmac: true,
    hmacSecretKey: process.env.REACT_APP_HMAC_SECRET, // ❌ 위험!
  }}
>
```

**✅ 안전함: 백엔드 키 교환**
```tsx
function App() {
  const [hmacKey, setHmacKey] = useState<string | null>(null);

  useEffect(() => {
    // 백엔드에서 세션별 임시 키 발급
    async function fetchHmacKey() {
      try {
        const response = await fetch('/api/auth/get-hmac-key', {
          credentials: 'include' // 인증 쿠키 포함
        });
        
        if (response.ok) {
          const data = await response.json();
          setHmacKey(data.hmacKey);
        }
      } catch (error) {
        console.error('Failed to fetch HMAC key:', error);
      }
    }
    
    fetchHmacKey();
  }, []);

  if (!hmacKey) {
    return <div>Loading...</div>;
  }

  return (
    <EventFlowProvider
      config={{
        enableHmac: true,
        hmacSecretKey: hmacKey, // ✅ 백엔드에서 받은 안전한 키
      }}
    >
      <YourApp />
    </EventFlowProvider>
  );
}
```

### 2. 백엔드 키 관리 서버 구현

#### Next.js 세션 기반 키 관리

```typescript
// app/api/auth/get-hmac-key/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// 프로덕션에서는 Redis나 데이터베이스 사용 권장
const sessionKeys = new Map<string, {
  key: string;
  expiresAt: number;
}>();

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get('session')?.value;
  
  if (!sessionId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // 기존 키 확인
  const existing = sessionKeys.get(sessionId);
  const now = Date.now();
  
  if (existing && existing.expiresAt > now) {
    return NextResponse.json({ hmacKey: existing.key });
  }
  
  // 새 임시 키 생성
  const masterKey = process.env.HMAC_MASTER_SECRET!;
  const timestamp = Date.now().toString();
  
  // 마스터 키 + 세션 ID + 타임스탬프로 임시 키 생성
  const hmacKey = crypto
    .createHmac('sha256', masterKey)
    .update(`${sessionId}:${timestamp}`)
    .digest('hex');
  
  // 1시간 후 만료
  const expiresAt = now + (60 * 60 * 1000);
  
  sessionKeys.set(sessionId, { key: hmacKey, expiresAt });
  
  // 자동 정리
  setTimeout(() => {
    const entry = sessionKeys.get(sessionId);
    if (entry && entry.expiresAt <= Date.now()) {
      sessionKeys.delete(sessionId);
    }
  }, 60 * 60 * 1000);
  
  return NextResponse.json({ 
    hmacKey,
    expiresAt 
  });
}
```

#### Express.js 세션 기반 키 관리

```typescript
import express from 'express';
import session from 'express-session';
import crypto from 'crypto';

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: true, 
    httpOnly: true,
    maxAge: 60 * 60 * 1000 // 1시간
  }
}));

app.get('/api/auth/get-hmac-key', (req, res) => {
  if (!req.session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // 세션에 키가 없으면 생성
  if (!req.session.hmacKey) {
    const masterKey = process.env.HMAC_MASTER_SECRET!;
    const sessionId = req.sessionID;
    const timestamp = Date.now().toString();
    
    req.session.hmacKey = crypto
      .createHmac('sha256', masterKey)
      .update(`${sessionId}:${timestamp}`)
      .digest('hex');
  }
  
  res.json({ hmacKey: req.session.hmacKey });
});

// 이벤트 검증
app.post('/api/events', (req, res) => {
  const { fingerprint, hmac, type, payload } = req.body;
  const sessionKey = req.session?.hmacKey;
  
  if (!sessionKey) {
    return res.status(401).json({ error: 'No HMAC key in session' });
  }
  
  // 세션 키로 검증
  const expectedHmac = crypto
    .createHmac('sha256', sessionKey)
    .update(fingerprint)
    .digest('hex');
  
  if (!crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expectedHmac))) {
    return res.status(401).json({ error: 'Invalid HMAC signature' });
  }
  
  // 유효한 이벤트 처리
  console.log('Valid event:', type);
  res.json({ success: true });
});
```

#### Redis를 사용한 확장 가능한 키 관리

```typescript
import Redis from 'ioredis';
import crypto from 'crypto';

const redis = new Redis(process.env.REDIS_URL);

// 키 발급
export async function issueHmacKey(sessionId: string): Promise<string> {
  // 기존 키 확인
  const existingKey = await redis.get(`hmac:${sessionId}`);
  if (existingKey) {
    return existingKey;
  }
  
  // 새 키 생성
  const masterKey = process.env.HMAC_MASTER_SECRET!;
  const timestamp = Date.now().toString();
  
  const hmacKey = crypto
    .createHmac('sha256', masterKey)
    .update(`${sessionId}:${timestamp}`)
    .digest('hex');
  
  // Redis에 저장 (1시간 TTL)
  await redis.setex(`hmac:${sessionId}`, 3600, hmacKey);
  
  return hmacKey;
}

// 키 검증
export async function getHmacKey(sessionId: string): Promise<string | null> {
  return await redis.get(`hmac:${sessionId}`);
}

// 키 무효화
export async function revokeHmacKey(sessionId: string): Promise<void> {
  await redis.del(`hmac:${sessionId}`);
}
```

### 3. 강력한 비밀 키 생성

**마스터 키 생성 (서버에만 저장)**
```bash
# 강력한 비밀 키 생성 (최소 32바이트)
openssl rand -base64 64

# 또는 Node.js로
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

**환경별 키 분리**
```bash
# .env.development (개발용)
HMAC_MASTER_SECRET=dev-master-key-12345...
SESSION_SECRET=dev-session-secret-67890...

# .env.production (프로덕션용 - 절대 버전 관리 시스템에 커밋하지 말 것!)
HMAC_MASTER_SECRET=prod-master-key-abcdef...
SESSION_SECRET=prod-session-secret-ghijkl...
```
### 4. 키 로테이션 전략

**정기적 키 로테이션**
정기적으로 비밀 키를 변경하세요:
- 주기: 3-6개월마다
- 방법: 새 키로 점진적 마이그레이션
- 과도기: 구 키와 신 키 동시 검증

```typescript
// 다중 키 검증 (키 로테이션 중)
function verifyHmacWithRotation(
  fingerprint: string,
  signature: string
): boolean {
  const currentKey = process.env.HMAC_CURRENT_KEY!;
  const previousKey = process.env.HMAC_PREVIOUS_KEY; // 선택적
  
  // 현재 키로 검증
  if (verifyHmac(fingerprint, signature, currentKey)) {
    return true;
  }
  
  // 이전 키로도 검증 (과도기 동안)
  if (previousKey && verifyHmac(fingerprint, signature, previousKey)) {
    return true;
  }
  
  return false;
}
```

### 5. HTTPS 필수
HMAC은 전송 중 변조를 방지하지만, HTTPS 없이는 중간자 공격에 취약합니다.

**프로덕션 체크리스트:**
- ✅ HTTPS/TLS 사용
- ✅ Secure 쿠키 사용
- ✅ CORS 적절히 설정
- ✅ 환경 변수로 키 관리
- ✅ 키를 버전 관리에 커밋하지 않기

### 6. 실전 보안 아키텍처

```
┌─────────────┐                 ┌─────────────┐
│   Client    │                 │   Server    │
│  (Browser)  │                 │  (Backend)  │
└─────────────┘                 └─────────────┘
       │                               │
       │  1. Request Session           │
       │─────────────────────────────>│
       │                               │
       │  2. Session ID (Cookie)       │
       │<─────────────────────────────│
       │                               │
       │  3. Request HMAC Key          │
       │─────────────────────────────>│
       │     (with session cookie)     │
       │                               │
       │  4. Temporary HMAC Key        │
       │    (derived from master)      │
       │<─────────────────────────────│
       │                               │
       │  5. Events with HMAC          │
       │─────────────────────────────>│
       │     (signed with temp key)    │
       │                               │
       │  6. Verify with Session Key   │
       │<─────────────────────────────│
       │       (Success/Failure)       │
       │                               │

Master Key: 서버에만 존재, 절대 노출 안 됨
Temp Key:   세션마다 다름, 1시간 후 자동 만료
```

## 클라이언트 환경 변수의 위험성

### 문제점

React/Next.js의 클라이언트 환경 변수는 **빌드 시점에 JavaScript 번들에 포함**됩니다:

```javascript
// 빌드 후 실제 번들 내용
var config = {
  hmacSecretKey: "my-super-secret-key-12345" // ❌ 누구나 볼 수 있음!
};
```

개발자 도구에서 쉽게 확인 가능:
1. F12 (개발자 도구)
2. Sources 탭
3. JavaScript 파일 검색
4. 키 발견!

### 해결책: 백엔드 키 관리

```typescript
// ❌ 나쁜 예
const SECRET = process.env.NEXT_PUBLIC_SECRET; // 번들에 포함됨

// ✅ 좋은 예
const SECRET = await fetch('/api/get-secret').then(r => r.json()); // 서버에서 가져옴
```

## 문제 해결

### 서명이 일치하지 않음
```typescript
// 클라이언트와 서버의 설정이 동일한지 확인
{
  hmacSecretKey: 'same-secret',
  hmacAlgorithm: 'sha256',  // 양쪽 동일
  hmacEncoding: 'hex',       // 양쪽 동일
}
```

### 타이밍 공격 방지
항상 `crypto.timingSafeEqual()` 사용:
```typescript
// ❌ 안전하지 않음
if (signature === expectedSignature) { ... }

// ✅ 안전함
if (crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(expectedSignature)
)) { ... }
```

### 디버깅
```typescript
// 개발 환경에서만 HMAC 값 로깅
if (process.env.NODE_ENV === 'development') {
  console.log('HMAC signature:', event.hmac);
  console.log('Fingerprint:', event.fingerprint);
}
```

## 성능 고려사항

- HMAC 생성은 매우 빠름 (밀리초 미만)
- 배치 이벤트 사용 시 서명은 한 번만 생성
- 서버 검증도 밀리초 미만으로 완료
- 대규모 트래픽에서도 성능 영향 미미

## 참고 자료

- [HMAC RFC 2104](https://tools.ietf.org/html/rfc2104)
- [Node.js Crypto API](https://nodejs.org/api/crypto.html)
- [OWASP HMAC](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
