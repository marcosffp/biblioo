// ─── Shared primitives ────────────────────────────────────────────────────────

export type BackendReadingStatus =
  | "WANT_TO_READ"
  | "READING"
  | "REREADING"
  | "COMPLETED"
  | "ABANDONED";

/** @alias BackendReadingStatus — kept for backwards compatibility */
export type ReadingStatus = BackendReadingStatus;

// ─── Books ────────────────────────────────────────────────────────────────────

export interface BackendBookResponse {
  id: number;
  title: string;
  authors: string[];
  coverUrl?: string | null;
  pageCount?: number | null;
  averageRating?: number | null;
  description?: string | null;
  synopsis?: string | null;
  readerCount?: number | null;
}

/** @alias BackendBookResponse — kept for backwards compatibility */
export type BookResponse = BackendBookResponse;

export interface BackendBookSuggestResponse {
  id: number;
  title: string;
  authors: string[];
  coverUrl?: string | null;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export type UserProfileResponse = {
  id: number;
  username: string;
  email?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  isPrivate: boolean;
  restricted: boolean;
  createdAt?: string | null;
};

export type UserSummaryResponse = {
  id: number;
  username: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
};

export type FollowPageResponse = {
  users: UserSummaryResponse[];
  page: number;
  size: number;
  hasMore: boolean;
};

export type FollowActionResult = "following" | "requested";

// ─── Shelves & Collections ────────────────────────────────────────────────────

export type ShelfSummaryResponse = {
  id: number;
  name: string;
  description?: string | null;
  itemCount: number;
  coverPreview: string[];
};

export interface BackendShelfSummaryResponse {
  id: number;
  name: string;
  itemCount: number;
  coverPreview: string[];
}

export interface BackendShelfResponse {
  id: number;
  name: string;
  description?: string | null;
  itemCount: number;
  coverPreview: string[];
}

export interface BackendShelfItemSummaryResponse {
  id: number;
  bookId: number;
  bookTitle: string;
  bookCoverUrl?: string | null;
  status: BackendReadingStatus;
  progressPercent?: number | null;
}

/** @alias BackendShelfItemSummaryResponse — kept for backwards compatibility */
export type ShelfItemSummaryResponse = BackendShelfItemSummaryResponse;

export interface BackendShelfItemResponse {
  id: number;
  shelfId: number;
  bookId: number;
  bookTitle: string;
  bookCoverUrl?: string | null;
  status: BackendReadingStatus;
  currentPage?: number | null;
  totalPages?: number | null;
  progressPercent?: number | null;
}

export interface BackendCollectionSummaryResponse {
  id: number;
  name: string;
  shelfCount: number;
  shelfPreviews: BackendCollectionShelfPreview[];
}

export interface BackendCollectionShelfPreview {
  id: number;
  name: string;
  itemCount: number;
  firstBookCoverUrl?: string | null;
}

export interface BackendCollectionResponse {
  id: number;
  name: string;
  description?: string | null;
  shelfCount: number;
  shelfPreviews: BackendCollectionShelfPreview[];
}

export interface BackendCollectionStatisticsResponse {
  collectionId: number;
  totalBooks: number;
  booksCompleted: number;
  booksReading: number;
  booksRereading: number;
  booksWantToRead: number;
  booksAbandoned: number;
  totalPages: number;
  pagesRead: number;
}

// ─── Reviews & Posts ──────────────────────────────────────────────────────────

export interface BackendReviewResponse {
  id: number;
  userId: number;
  bookId: number;
  text?: string | null;
  images: string[];
  gifUrl?: string | null;
  tags: string[];
  hasSpoiler?: boolean | null;
  rating: number;
  commentCount: number;
  likeCount: number;
}

export interface BackendFeedPostResponse {
  id: number;
  userId: number;
  text: string;
  images: string[];
  gifUrl?: string | null;
  tags?: string[];
  hasSpoiler?: boolean;
  commentCount: number;
  likeCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export type UserReviewResponse = {
  id: number;
  userId: number;
  bookId: number;
  rating: number;
};

// ─── DNA Literário ────────────────────────────────────────────────────────────

export type ThemeEntry = {
  theme: string;
  percentage: number;
};

export type DnaResponse = {
  userId: number;
  status: "COMPUTED";
  booksReadCount: number;
  complexityScore: number | null;
  complexityLabel: string | null;
  avgDaysPerBook: number | null;
  rereadRate: number;
  rereadCount: number;
  abandonedCount: number;
  centralThemes: ThemeEntry[];
  dominantArchetype: string | null;
  dominantArchetypeLabel: string | null;
  secondaryArchetypes: string[];
  mostAbandonedGenre: string | null;
  avgTimePerBookDays: number | null;
  totalPagesRead: number;
  pagesByYear: Record<string, number>;
  calculatedAt: string | null;
};

export type DnaProgressResponse = {
  booksRead: number;
  booksRequired: number;
  message: string;
};

// ─── Feed ─────────────────────────────────────────────────────────────────────

export interface FeedEmbeddedContent {
  id: number;
  userId: number;
  text?: string | null;
  images: string[];
  gifUrl?: string | null;
  tags: string[];
  hasSpoiler?: boolean | null;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  bookId?: number | null;
  rating?: number | null;
  bookTitle?: string | null;
  bookAuthors?: string[] | null;
  bookCoverUrl?: string | null;
}

export interface FeedItem {
  contentId: number;
  contentType: "REVIEW" | "POST";
  authorId: number;
  authorUsername?: string | null;
  authorAvatarUrl?: string | null;
  score: number;
  createdAt: string;
  content: FeedEmbeddedContent;
}

export interface FeedPage {
  items: FeedItem[];
  nextCursor?: string | null;
  hasMore: boolean;
}

export interface CommentData {
  id: number;
  userId: number;
  parentId: number;
  text: string;
  likeCount: number;
  createdAt: string;
  authorUsername?: string | null;
  authorAvatarUrl?: string | null;
  deleted?: boolean;
}

export interface CommentPage {
  content: CommentData[];
  totalElements: number;
  totalPages: number;
  last: boolean;
  number: number;
  size: number;
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export interface ActivityPost {
  type: "POST";
  id: number;
  userId: number;
  bookId: number | null;
  text: string | null;
  images: string[];
  gifUrl: string | null;
  tags: string[];
  hasSpoiler: boolean;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  likedByCurrentUser: boolean;
}

export interface ActivityReview {
  type: "REVIEW";
  id: number;
  userId: number;
  bookId: number | null;
  text: string | null;
  rating: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  likedByCurrentUser: boolean;
}

export type ActivityItem = ActivityPost | ActivityReview;

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType =
  | "USER_FOLLOW_REQUESTED"
  | "USER_FOLLOWED"
  | "COMMENT_REPLIED"
  | "REVIEW_LIKED"
  | "COMMUNITY_INVITE"
  | "COMMUNITY_JOIN_REQUEST"
  | "COMMUNITY_JOIN_APPROVED";

export interface NotificationSummary {
  id: string;
  type: NotificationType;
  actorId: number | null;
  actorUsername: string | null;
  actorAvatarUrl: string | null;
  entityId: number | null;
  communityId: number | null;
  read: boolean;
  createdAt: string;
}

// ─── Communities ──────────────────────────────────────────────────────────────

export type BackendCommunityType = "PUBLIC" | "PRIVATE";

export interface BackendCommunityResponse {
  id: number;
  name: string;
  description?: string | null;
  type: BackendCommunityType;
  bookId: number;
  ownerId: number;
  memberCount: number;
  createdAt: string;
}

export interface PendingCommunityInviteResponse {
  id: number;
  communityId: number;
  communityName: string;
  inviterId: number;
  inviterUsername: string;
  status: string;
  createdAt: string;
}

export interface PendingCommunityJoinRequestResponse {
  id: number;
  userId: number;
  username: string | null;
  avatarUrl: string | null;
  status: string;
  createdAt: string;
}

export interface CreateCommunityPayload {
  name: string;
  description?: string;
  type: BackendCommunityType;
  bookId: number;
}

export interface CommunityActionResult {
  success: true;
}

// ─── Community Messages ───────────────────────────────────────────────────────

export interface BackendCommunityMessage {
  id: number;
  clientMessageId?: string | null;
  communityId: number;
  authorId?: number | null;
  content?: string | null;
  parentMessageId?: number | null;
  tags?: string[] | null;
  images?: string[] | null;
  gifUrl?: string | null;
  hasSpoiler: boolean;
  heartCount: number;
  deleted: boolean;
  type?: string | null;
  createdAt?: string | null;
  editedAt?: string | null;
}

export interface BackendMessageEventPayload {
  eventType: "MESSAGE_CREATED" | "MESSAGE_UPDATED" | "MESSAGE_DELETED" | "REACTION_UPDATED" | "ERROR";
  data: BackendCommunityMessage;
}

export interface MessageMediaUploadResponse {
  images: string[];
  gifUrl?: string | null;
}

export interface BackendCommunityMember {
  userId: number;
  username?: string | null;
  avatarUrl?: string | null;
  role: "OWNER" | "MODERATOR" | "MEMBER";
  joinedAt?: string | null;
}

// ─── Voting ───────────────────────────────────────────────────────────────────

export type VotingStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "APPROVED" | "REJECTED";
export type TieBreakRule = "RANDOM_DRAW" | "ADMIN_CHOICE";

export interface VotingOptionResponse {
  id: number;
  bookId: number;
  bookTitle: string;
  bookCoverUrl: string | null;
  voteCount: number;
}

export interface VotingResponse {
  id: number;
  communityId: number;
  title: string;
  status: VotingStatus;
  tieBreakRule: TieBreakRule;
  startsAt: string;
  endsAt: string;
  closedAt: string | null;
  winnerOptionId: number | null;
  rejectionReason: string | null;
  createdBy: number;
  createdAt: string;
  options: VotingOptionResponse[];
  myVotedOptionId: number | null;
}

export interface VotingPage {
  content: VotingResponse[];
  totalElements: number;
  last: boolean;
}

export interface VotingEventPayload {
  eventType: "VOTING_CREATED" | "VOTE_UPDATED" | "VOTING_CLOSED" | "VOTING_APPROVED" | "VOTING_REJECTED";
  data: VotingResponse;
}

export interface CreateVotingRequest {
  title: string;
  tieBreakRule: TieBreakRule;
  startsAt: string;
  endsAt: string;
  options: { bookId: number }[];
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export interface RecommendedBook {
  id: number;
  title: string;
  description?: string | null;
  pageCount?: number | null;
  readerCount?: number | null;
  averageRating?: number | null;
  coverUrl?: string | null;
  score?: number;
}

export interface DiceRollBook {
  id: number;
  title: string;
  description?: string | null;
  pageCount?: number | null;
  readerCount?: number | null;
  averageRating?: number | null;
  coverUrl?: string | null;
}

export interface BecauseYouReadData {
  seedBookTitle: string;
  books: RecommendedBook[];
}

export interface FavoriteGenreNowData {
  topGenres: string[];
  books: RecommendedBook[];
}

export interface TrendingInCommunitiesData {
  books: RecommendedBook[];
}

export interface CatalogSurpriseData {
  books: RecommendedBook[];
}

export interface SimilarAuthorsData {
  books: RecommendedBook[];
}

export interface RereadWorthItData {
  books: RecommendedBook[];
}

// ─── Preferences ─────────────────────────────────────────────────────────────

export interface GenreResponse {
  original: string;
  translated: string;
}

export interface UserPreferenceResponse {
  userId: number;
  genres: string[];
  bookIds: number[];
  createdAt: string;
  updatedAt: string;
}

// ─── Assistant ────────────────────────────────────────────────────────────────

export interface AssistantChatRequest {
  message: string;
  conversationId?: string | null;
}

export interface AssistantChatResponse {
  reply: string;
  conversationId: string;
}

export interface AssistantConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}
