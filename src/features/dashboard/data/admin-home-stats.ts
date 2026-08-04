/**
 * 관리자 홈에서 보여줄 임시 통계 데이터
 *
 * 지금은 1단계라 서버 API 없이 화면 구조만
 * 다음 단계에서 NestJS에 GET /admin/dashboard API 만들면
 * 이 파일을 실제 fetch 함수로 교체
 */
export const adminHomeStats = [
  {
    label: '전체 유저',
    value: '1,248',
    change: '+12 오늘',
    description: '가입 완료된 전체 사용자 수',
  },
  {
    label: '전체 게시글',
    value: '8,420',
    change: '+38 오늘',
    description: '삭제되지 않은 전체 게시글 수',
  },
  {
    label: '전체 댓글',
    value: '24,918',
    change: '+116 오늘',
    description: '사용자가 작성한 전체 댓글 수',
  },
  {
    label: '읽지 않은 알림',
    value: '532',
    change: '운영 지표',
    description: '사용자에게 남아있는 미확인 알림 수',
  },
] as const;
