# 관리자 웹에 Next.js를 사용한다

## 상태

승인됨

## 배경

Loop는 Flutter 모바일 앱과 NestJS 서버로 구성되어 있다. 서비스 운영을 위해 별도 관리자 웹이 필요하며, 관리자 화면은 테이블, 검색, 필터, 인증, 권한, 대시보드 같은 웹 UI가 중심이다.

## 결정

관리자 웹은 Next.js App Router와 TypeScript, Tailwind CSS를 사용한다.

## 대안

- Flutter Web: 기존 Flutter 경험을 재사용할 수 있지만, 관리자 웹 생태계와 채용/협업 범용성은 React/Next.js가 더 높다.
- React + Vite: 단순 SPA 관리자 페이지에는 충분하지만, Next.js의 파일 기반 라우팅, Server Component, 서버 렌더링, Route Handler 확장성을 학습하고 적용하기 위해 선택하지 않았다.

## 결과

장점:

- React/Next.js 실무 스택 경험을 얻는다.
- App Router 기반 파일 라우팅을 사용할 수 있다.
- Server Component로 초기 화면의 클라이언트 JS를 줄일 수 있다.
- 추후 BFF, HttpOnly Cookie 인증, 관리자 전용 API 프록시로 확장할 수 있다.

비용과 위험:

- Flutter/Dart와 다른 TypeScript/React 학습 비용이 있다.
- Next.js 최신 버전의 변경 사항을 공식 문서 기준으로 확인해야 한다.

후속 작업:

- 관리자 로그인 방식 결정
- 관리자 API fetcher 작성
- 대시보드 API 연결

