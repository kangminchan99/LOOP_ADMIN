export type AdminCommentListItem = {
  id: number;
  postId: number;
  postTitle: string | null;
  authorId: number;
  authorNickname: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminCommentListPage = {
  items: AdminCommentListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
