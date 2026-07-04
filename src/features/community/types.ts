export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  groupId?: string;
  groupName?: string;
  createdAt: Date;
  updatedAt: Date;
  reactionCounts: Record<string, number>;
  commentCount: number;
  isFlagged: boolean;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
  parentCommentId?: string;
}

export interface PostReaction {
  userId: string;
  type: 'like' | 'love' | 'support' | 'insightful';
  createdAt: Date;
}

export interface Report {
  id: string;
  targetType: 'post' | 'comment';
  targetId: string;
  reporterId: string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}
