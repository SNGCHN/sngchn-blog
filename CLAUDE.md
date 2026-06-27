# 작업 지침

## 프로젝트
개인 기술 블로그. 현재 글 ~3개 규모. Next 16(App Router) · React 19 · velite(MDX) · Tailwind v4 · Upstash Redis(좋아요) · biome. 콘텐츠는 빌드타임(velite) 기반 정적 위주.

## 핵심 원칙: 규모에 맞게

이 저장소는 소규모 개인 기술 블로그다. 새 구조, 새 의존성, 새 추상화는 현재 문제를 실제로 줄일 때만 추가한다.

- 먼저 기존 구조와 패턴을 확인한다.
- 표준 API, Next/React/Velite 기본 기능, 이미 있는 유틸로 해결 가능한지 먼저 본다.
- 구현은 작게 하되 타입 안정성, 접근성, 오류 상태, 빌드 가능성은 포기하지 않는다.
- 구현이 하나뿐인 인터페이스, 미래를 위한 config, 불필요한 폴더 분리는 피한다.
- 의도적으로 단순화한 부분은 `// NOTE(yagni):`로 한계와 재검토 조건을 남긴다.

## 구조와 코드 분리

- `page.tsx`는 라우트의 고유 UI를 정의하는 파일이다. 가능하면 데이터 조회, 메타데이터, 주요 컴포넌트 조립에 집중한다.
- Next 15+ 방식에 맞춰 Page/Layout의 `params`와 Page의 `searchParams`는 Promise로 보고 `await`해서 사용한다.
- UI가 길어지거나 상태/이벤트/반복 렌더링이 섞이면 `src/components/{domain}` 아래로 분리한다.
- 한 파일을 나누는 기준은 줄 수가 아니라 책임이다. 데이터 가공, 화면 조각, 상호작용, 서버 액션/라우트 핸들러가 섞이면 분리한다.
- 같은 UI/로직이 두 번 이상 나오거나 이름을 붙였을 때 의미가 선명하면 재사용 컴포넌트/유틸로 뺀다.
- 한 번만 쓰는 작은 JSX나 prop 타입을 억지로 공용화하지 않는다.
- Server Component를 기본값으로 둔다. `use client`는 hook, event handler, browser API, portal처럼 클라이언트가 필요한 곳에만 붙인다.
- `use client`는 Client Component 경계(entry point)를 만드는 지시문이다. 모든 하위 파일에 반복해서 붙이지 않는다.
- Server Component에서 Client Component로 넘기는 props는 직렬화 가능한 값만 사용한다. 함수, 클래스 인스턴스, 무거운 원본 객체를 넘기지 않는다.
- 큰 데이터(`code`, `toc`, `raw`, 전체 `Post`)를 Client Component로 넘기지 않는다. 필요한 필드만 골라서 넘긴다.
- 전역 `layout`에는 모든 페이지에서 반드시 필요한 것만 둔다. layout은 navigation 중 재사용될 수 있으므로 최신 `searchParams`/pathname이 필요하면 Page prop이나 Client Component hook을 사용한다.
- 검색 모달, 외부 라이브러리, 큰 Client Component처럼 초기 렌더에 필요 없는 코드는 lazy loading을 검토한다. Server Component는 기본적으로 code split되므로, 실제 코드 스플리팅 대상은 주로 Client Component와 외부 라이브러리다.

## 타입과 안전성

- 도메인 원천 타입은 가능하면 `#site/content`의 `Post`처럼 실제 데이터 소스에서 파생한다.
- Velite content 타입은 스키마에서 생성되는 출력 타입을 원천으로 삼는다. 중복 타입을 새로 쓰기보다 `Post["field"]`, `Pick`, `Omit`, `NonNullable`로 필요한 형태를 만든다.
- 여러 컴포넌트에서 공유하는 타입만 `src/types`에 둔다. 한 컴포넌트 전용 props 타입은 해당 파일 근처에 둔다.
- `Pick`, `Omit`, `NonNullable`, indexed access type(`Post["series"]`)으로 원천 타입과 중복 선언을 줄인다.
- `any`는 사용하지 않는다. 외부 입력이나 파싱 결과처럼 타입을 모르면 `unknown`으로 받고 검증한 뒤 좁힌다.
- `as` 타입 단언은 마지막 수단이다. DOM API, 외부 라이브러리, JSON 파싱 경계처럼 불가피한 곳에서는 런타임 체크와 함께 최소 범위로 사용한다.
- `as any`, non-null assertion(`!`), 넓은 타입 캐스팅(`as Post`)은 피한다. 필요하면 왜 안전한지 코드로 검증한다.
- optional 값은 `?.`, `??`, 조건문, `NonNullable` 등으로 다룬다.
- JSON/fetch 결과는 성공 여부(`res.ok`)와 실패 상태를 분리해서 처리한다.
- React props/state는 직접 mutate하지 않는다. 새 값으로 만들어 전달하거나 setter로 갱신한다.

## 구현 품질 체크

- 로딩, 빈 상태, 오류 상태를 구분한다. 실패를 빈 결과처럼 숨기지 않는다.
- 사용자에게 결과가 나온 이유가 보이게 한다. 예: 본문 검색은 snippet/highlight를 제공한다.
- 정렬/랭킹은 복잡하게 시작하지 말고 실제 UX 문제가 보이면 단순 점수화부터 도입한다.
- 접근성 기본값을 지킨다. interactive element에는 이름, 키보드 동작, focus 흐름을 확인한다.
- 날짜, slug, URL, 검색 인덱스처럼 빌드 산출물에 영향을 주는 코드는 정적 빌드에서 동작해야 한다.
- React Compiler가 켜져 있으므로 `useMemo`, `useCallback`, `memo`는 기본값으로 남발하지 않는다. 실제 비용이 있거나 참조 안정성이 API 계약일 때만 사용한다.
- Tailwind class는 빌드 시 정적으로 감지 가능한 완전한 문자열로 둔다. `bg-${color}-500`처럼 조합하지 말고 variant map으로 전체 class 문자열을 매핑한다.
- Upstash Redis/RateLimit은 Route Handler, Server Action, 서버 전용 유틸에서 사용한다. 토큰/URL 같은 비밀 값은 `NEXT_PUBLIC_`로 노출하지 않는다.
- Biome suppression은 최소 범위로 쓰고 `// biome-ignore lint/rule: reason`처럼 이유를 남긴다.
- 변경 범위 밖의 파일 포맷, 줄바꿈, 대량 정렬은 건드리지 않는다.

## 하지 말 것

- 새 폴더/레이어를 먼저 만들고 거기에 코드를 맞추지 않는다.
- “나중에 쓸 수 있음”만으로 config, registry, factory, adapter, interface를 만들지 않는다.
- Server Component에서 가능한 일을 Client Component로 올리지 않는다.
- Client Component에 Velite 원본 객체 전체를 넘기지 않는다.
- 타입 에러를 `as`, `any`, `!`로 덮지 않는다.
- 검색/목록/상세 페이지에 route segment config를 습관적으로 붙이지 않는다. Next 16은 Cache Components 사용 여부에 따라 지원 옵션이 달라질 수 있으므로, 런타임 개인화, 요청 시점 데이터, 명시적 캐시 정책이 필요할 때만 공식 문서 기준으로 선택한다.
- 작은 블로그 규모에서 검색 엔진, 상태 관리 라이브러리, 데이터 패칭 라이브러리를 먼저 도입하지 않는다.
- `NEXT_PUBLIC_` 환경변수에 서버 비밀 값을 넣지 않는다. 브라우저 번들에 들어가도 되는 공개 값에만 사용한다.
- Tailwind class를 런타임 문자열 조합에 의존하지 않는다.

## 보류하는 것

- Pagefind 같은 검색 엔진: 글 수가 많아져 `/search-index.json`이 부담될 때 재검토한다.
- 복잡한 검색 랭킹: 검색 결과 품질 문제가 실제로 보일 때 단순 점수화부터 도입한다.
- AST 기반 검색 텍스트 추출: regex 추출이 실제 콘텐츠에서 문제가 될 때 재검토한다.

## 검증

- 타입 체크: `pnpm exec tsc --noEmit`
- 린트/포맷 체크: `pnpm lint`
- Biome CI 모드가 필요한 환경: `pnpm exec biome ci .`
- 빌드: `pnpm build`
