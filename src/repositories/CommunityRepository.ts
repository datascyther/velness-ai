import {
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import {
  postsRef,
  postDocRef,
  postCommentsRef,
  postCommentDocRef,
  postReactionsRef,
  postReactionDocRef,
  reportsRef,
  reportDocRef,
} from '@/lib/firestore';
import { docSnapshotToData } from '@/hooks/useRealtimeSubscription';
import { conversationRepository } from '@/repositories/ConversationRepository';
import type { CommunityPost, PostComment, PostReaction, Report } from '@/features/community/types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function ensureRef<T>(ref: T | null, name: string): T {
  if (!ref) throw new Error(`Firestore not initialized (${name})`);
  return ref;
}

export class CommunityRepository {
  async loadFeed(uid: string): Promise<CommunityPost[]> {
    const userConvs = await conversationRepository.getUserConversations(uid);
    const groupIds = userConvs.map((c) => c.id);
    if (groupIds.length === 0) return [];

    const snapshot = await getDocs(
      query(ensureRef(postsRef(), 'postsRef'), orderBy('createdAt', 'desc')),
    );

    const posts = snapshot.docs.map((doc) =>
      docSnapshotToData<CommunityPost>(doc),
    );

    return posts.filter(
      (post) => !post.groupId || groupIds.includes(post.groupId),
    );
  }

  async createPost(
    authorId: string,
    authorName: string,
    content: string,
    groupId?: string,
  ): Promise<string | null> {
    const postId = generateId();
    const now = new Date();
    const post: CommunityPost = {
      id: postId,
      authorId,
      authorName,
      content,
      groupId,
      createdAt: now,
      updatedAt: now,
      reactionCounts: {},
      commentCount: 0,
      isFlagged: false,
    };

    const ref = ensureRef(postDocRef(postId), 'postDocRef');
    await setDoc(ref, { ...post, createdAt: Timestamp.fromDate(now), updatedAt: Timestamp.fromDate(now) });
    return postId;
  }

  async loadPost(postId: string): Promise<CommunityPost | null> {
    const snap = await getDoc(ensureRef(postDocRef(postId), 'postDocRef'));
    if (!snap.exists()) return null;
    return docSnapshotToData<CommunityPost>(snap);
  }

  async deletePost(postId: string, authorId: string): Promise<boolean> {
    const snap = await getDoc(ensureRef(postDocRef(postId), 'postDocRef'));
    if (!snap.exists()) return false;
    const data = snap.data() as Record<string, any>;
    if (data.authorId !== authorId) return false;
    await deleteDoc(ensureRef(postDocRef(postId), 'postDocRef'));
    return true;
  }

  async loadComments(postId: string): Promise<PostComment[]> {
    const snapshot = await getDocs(
      query(
        ensureRef(postCommentsRef(postId), 'postCommentsRef'),
        orderBy('createdAt', 'asc'),
      ),
    );
    return snapshot.docs.map((doc) => docSnapshotToData<PostComment>(doc));
  }

  async addComment(
    postId: string,
    authorId: string,
    authorName: string,
    content: string,
    parentCommentId?: string,
  ): Promise<string | null> {
    const commentId = generateId();
    const now = new Date();
    const comment: PostComment = {
      id: commentId,
      postId,
      authorId,
      authorName,
      content,
      createdAt: now,
      parentCommentId,
    };

    const ref = ensureRef(postCommentDocRef(postId, commentId), 'postCommentDocRef');
    await setDoc(ref, { ...comment, createdAt: Timestamp.fromDate(now) });

    const postRef = ensureRef(postDocRef(postId), 'postDocRef');
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const current = (postSnap.data() as Record<string, any>).commentCount ?? 0;
      await updateDoc(postRef, { commentCount: current + 1, updatedAt: Timestamp.fromDate(now) });
    }

    return commentId;
  }

  async deleteComment(postId: string, commentId: string, authorId: string): Promise<boolean> {
    const ref = ensureRef(postCommentDocRef(postId, commentId), 'postCommentDocRef');
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;
    const data = snap.data() as Record<string, any>;
    if (data.authorId !== authorId) return false;
    await deleteDoc(ref);

    const postRef = ensureRef(postDocRef(postId), 'postDocRef');
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const current = (postSnap.data() as Record<string, any>).commentCount ?? 0;
      await updateDoc(postRef, { commentCount: Math.max(0, current - 1) });
    }

    return true;
  }

  async toggleReaction(postId: string, userId: string, type: string): Promise<boolean> {
    const ref = ensureRef(postReactionDocRef(postId, userId), 'postReactionDocRef');
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const existing = (snap.data() as Record<string, any>).type as string;
      if (existing === type) {
        await deleteDoc(ref);
        await this._decrementReactionCount(postId, type);
        return false;
      }
      await this._decrementReactionCount(postId, existing);
      await setDoc(ref, {
        userId,
        type,
        createdAt: Timestamp.fromDate(new Date()),
      });
      await this._incrementReactionCount(postId, type);
      return true;
    }

    await setDoc(ref, {
      userId,
      type,
      createdAt: Timestamp.fromDate(new Date()),
    });
    await this._incrementReactionCount(postId, type);
    return true;
  }

  async loadUserReaction(postId: string, userId: string): Promise<string | null> {
    const ref = ensureRef(postReactionDocRef(postId, userId), 'postReactionDocRef');
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return (snap.data() as Record<string, any>).type as string;
  }

  async createReport(
    targetType: string,
    targetId: string,
    reporterId: string,
    reason: string,
    description?: string,
  ): Promise<boolean> {
    const reportId = generateId();
    const now = new Date();
    await setDoc(
      ensureRef(reportDocRef(reportId), 'reportDocRef'),
      {
        id: reportId,
        targetType,
        targetId,
        reporterId,
        reason,
        description: description ?? '',
        status: 'pending',
        createdAt: Timestamp.fromDate(now),
      },
    );
    return true;
  }

  async loadReports(status?: string): Promise<Report[]> {
    let q = query(
      ensureRef(reportsRef(), 'reportsRef'),
      orderBy('createdAt', 'desc'),
    );
    if (status) {
      q = query(q, where('status', '==', status));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => docSnapshotToData<Report>(doc));
  }

  async updateReportStatus(reportId: string, status: string, reviewedBy: string): Promise<boolean> {
    const ref = ensureRef(reportDocRef(reportId), 'reportDocRef');
    await updateDoc(ref, {
      status,
      reviewedBy,
      reviewedAt: Timestamp.fromDate(new Date()),
    });
    return true;
  }

  async flagPost(postId: string): Promise<boolean> {
    const ref = ensureRef(postDocRef(postId), 'postDocRef');
    await updateDoc(ref, { isFlagged: true });
    return true;
  }

  async dismissFlags(postId: string): Promise<boolean> {
    const ref = ensureRef(postDocRef(postId), 'postDocRef');
    await updateDoc(ref, { isFlagged: false });
    return true;
  }

  private async _incrementReactionCount(postId: string, type: string): Promise<void> {
    const ref = ensureRef(postDocRef(postId), 'postDocRef');
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const counts: Record<string, number> = (snap.data() as Record<string, any>).reactionCounts ?? {};
    await updateDoc(ref, {
      [`reactionCounts.${type}`]: (counts[type] ?? 0) + 1,
    });
  }

  private async _decrementReactionCount(postId: string, type: string): Promise<void> {
    const ref = ensureRef(postDocRef(postId), 'postDocRef');
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const counts: Record<string, number> = (snap.data() as Record<string, any>).reactionCounts ?? {};
    await updateDoc(ref, {
      [`reactionCounts.${type}`]: Math.max(0, (counts[type] ?? 1) - 1),
    });
  }
}

export const communityRepository = new CommunityRepository();
export default communityRepository;
