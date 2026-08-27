export type AdminPostListItem = {
  id: number;
  title: string;
  contentPreview: string;
  authorId: number;
  authorNickname: string | null;
  summaryStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  createdAt: string;
  updatedAt: string;
};

export type AdminPostListPage = {
  items: AdminPostListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
