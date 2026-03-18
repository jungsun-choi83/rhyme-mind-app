# Replicate 음악 생성 진단

## 원인 파악용 테스트

20번 이상 시도해도 3초만 나온다면, **Replicate API 자체**가 원인인지 확인하세요.

### 실행 방법

```bash
npm run test:replicate
```

또는

```bash
node scripts/test-replicate.js
```

### 확인할 것

1. **성공 시**: 오디오 URL이 출력됩니다. 브라우저에서 열어 재생해보세요.
   - **8초 재생** → Replicate는 정상. 문제는 앱/Vercel 쪽.
   - **3초 재생** → Replicate가 3초만 반환. Replicate/모델 이슈.

2. **실패 시**: 에러 메시지를 확인하세요.
   - `REPLICATE_API_TOKEN is not set` → .env.local 확인
   - 그 외 → Replicate 대시보드에서 크레딧/API 상태 확인
