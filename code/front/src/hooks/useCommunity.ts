export type CommunityVisibility = "PUBLIC" | "PRIVATE";

export interface Community {
  id: string;
  name: string;
  bookId: number;
  bookTitle: string;
  visibility: CommunityVisibility;
  members: number;
  discussions: number;
  isMember: boolean;
  ownerId?: string;
  coverUrl?: string;
  description?: string;
  createdAtLabel?: string;
}

export interface CommunityBookOption {
  id: number;
  title: string;
  author: string;
}

export interface CommunityMember {
  id: string;
  name: string;
  username: string;
  isPro?: boolean;
  isAdmin?: boolean;
}

export interface CommunityChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  time: string;
  isMine?: boolean;
  isSystem?: boolean;
  isSpoiler?: boolean;
}
