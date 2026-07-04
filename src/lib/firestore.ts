import { collection, doc, type DocumentReference, type DocumentData, type CollectionReference } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const MESSAGES_PAGE_SIZE = 50;

export function isFirestoreReady(): boolean {
  return db !== null;
}

export const COLLECTIONS = {
  USERS: 'users',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  PARTICIPANTS: 'participants',
  MOODS: 'moods',
  CHATS: 'chats',
  EXERCISES: 'exercises',
  PROGRAMS: 'programs',
  LESSONS: 'lessons',
  PROGRESS: 'progress',
  RECOMMENDATIONS: 'recommendations',
  STREAKS: 'streaks',
  POSTS: 'posts',
  COMMENTS: 'comments',
  REACTIONS: 'reactions',
  REPORTS: 'reports',
} as const;

export function userDocRef(uid: string): DocumentReference | null {
  if (!db) return null;
  return doc(db, COLLECTIONS.USERS, uid);
}

export function userSubcollectionRef(uid: string, subcollection: string): CollectionReference | null {
  if (!db) return null;
  return collection(db, COLLECTIONS.USERS, uid, subcollection);
}

export function userMoodsRef(uid: string) {
  return userSubcollectionRef(uid, COLLECTIONS.MOODS);
}

export function userChatsRef(uid: string) {
  return userSubcollectionRef(uid, COLLECTIONS.CHATS);
}

export function userExercisesRef(uid: string) {
  return userSubcollectionRef(uid, COLLECTIONS.EXERCISES);
}

export function userExerciseDocRef(uid: string, exerciseId: string): DocumentReference | null {
  if (!db) return null;
  return doc(db, COLLECTIONS.USERS, uid, COLLECTIONS.EXERCISES, exerciseId);
}

export function userConversationsRef(uid: string) {
  return userSubcollectionRef(uid, COLLECTIONS.CONVERSATIONS);
}

export function userConversationDocRef(uid: string, conversationId: string): DocumentReference | null {
  if (!db) return null;
  return doc(db, COLLECTIONS.USERS, uid, COLLECTIONS.CONVERSATIONS, conversationId);
}

export function userProgressDocRef(uid: string): DocumentReference | null {
  if (!db) return null;
  return doc(db, COLLECTIONS.USERS, uid, COLLECTIONS.PROGRESS, 'journey');
}

export function userRecommendationsRef(uid: string): CollectionReference | null {
  return userSubcollectionRef(uid, COLLECTIONS.RECOMMENDATIONS);
}

export function userRecommendationDocRef(uid: string, recId: string): DocumentReference | null {
  if (!db) return null;
  return doc(db, COLLECTIONS.USERS, uid, COLLECTIONS.RECOMMENDATIONS, recId);
}

export function userStreaksRef(uid: string): CollectionReference | null {
  return userSubcollectionRef(uid, COLLECTIONS.STREAKS);
}

export function userStreakDocRef(uid: string, year: string): DocumentReference | null {
  if (!db) return null;
  return doc(db, COLLECTIONS.USERS, uid, COLLECTIONS.STREAKS, year);
}

export function conversationsRef(): CollectionReference | null {
  if (!db) return null;
  return collection(db, COLLECTIONS.CONVERSATIONS);
}

export function conversationDocRef(conversationId: string): DocumentReference | null {
  if (!db) return null;
  return doc(db, COLLECTIONS.CONVERSATIONS, conversationId);
}

export function conversationMessagesRef(conversationId: string): CollectionReference | null {
  if (!db) return null;
  return collection(db, COLLECTIONS.CONVERSATIONS, conversationId, COLLECTIONS.MESSAGES);
}

export function conversationMessageDocRef(conversationId: string, messageId: string): DocumentReference | null {
  if (!db) return null;
  return doc(db, COLLECTIONS.CONVERSATIONS, conversationId, COLLECTIONS.MESSAGES, messageId);
}

export function conversationParticipantsRef(conversationId: string): CollectionReference | null {
  if (!db) return null;
  return collection(db, COLLECTIONS.CONVERSATIONS, conversationId, COLLECTIONS.PARTICIPANTS);
}

export function conversationParticipantDocRef(
  conversationId: string,
  participantId: string,
): DocumentReference | null {
  if (!db) return null;
  return doc(db, COLLECTIONS.CONVERSATIONS, conversationId, COLLECTIONS.PARTICIPANTS, participantId);
}

export function programsRef(): CollectionReference | null {
  if (!db) return null;
  return collection(db, COLLECTIONS.PROGRAMS);
}

export function programDocRef(programId: string): DocumentReference | null {
  if (!db) return null;
  return doc(db, COLLECTIONS.PROGRAMS, programId);
}

export function programLessonsRef(programId: string): CollectionReference | null {
  if (!db) return null;
  return collection(db, COLLECTIONS.PROGRAMS, programId, COLLECTIONS.LESSONS);
}

export function programLessonDocRef(programId: string, lessonId: string): DocumentReference | null {
  if (!db) return null;
  return doc(db, COLLECTIONS.PROGRAMS, programId, COLLECTIONS.LESSONS, lessonId);
}

export function exercisesRef(): CollectionReference | null {
  if (!db) return null;
  return collection(db, COLLECTIONS.EXERCISES);
}

export function exerciseDocRef(exerciseId: string): DocumentReference | null {
  if (!db) return null;
  return doc(db, COLLECTIONS.EXERCISES, exerciseId);
}

// ─── Community: Posts ─────────────────────────────────────────────────

export function postsRef(): CollectionReference | null {
  if (!db) return null;
  return collection(db, COLLECTIONS.POSTS);
}

export function postDocRef(postId: string): DocumentReference | null {
  if (!db) return null;
  return doc(db, COLLECTIONS.POSTS, postId);
}

export function postCommentsRef(postId: string): CollectionReference | null {
  if (!db) return null;
  return collection(db, COLLECTIONS.POSTS, postId, COLLECTIONS.COMMENTS);
}

export function postCommentDocRef(postId: string, commentId: string): DocumentReference | null {
  if (!db) return null;
  return doc(db, COLLECTIONS.POSTS, postId, COLLECTIONS.COMMENTS, commentId);
}

export function postReactionsRef(postId: string): CollectionReference | null {
  if (!db) return null;
  return collection(db, COLLECTIONS.POSTS, postId, COLLECTIONS.REACTIONS);
}

export function postReactionDocRef(postId: string, userId: string): DocumentReference | null {
  if (!db) return null;
  return doc(db, COLLECTIONS.POSTS, postId, COLLECTIONS.REACTIONS, userId);
}

// ─── Community: Reports ───────────────────────────────────────────────

export function reportsRef(): CollectionReference | null {
  if (!db) return null;
  return collection(db, COLLECTIONS.REPORTS);
}

export function reportDocRef(reportId: string): DocumentReference | null {
  if (!db) return null;
  return doc(db, COLLECTIONS.REPORTS, reportId);
}
