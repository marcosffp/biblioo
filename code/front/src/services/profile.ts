import { getAccessToken } from "@/services/auth";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080").replace(/\/$/, "");

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

export type ReadingStatus = "WANT_TO_READ" | "READING" | "REREADING" | "COMPLETED" | "ABANDONED";

export type ShelfSummaryResponse = {
  id: number;
  name: string;
  description?: string | null;
  itemCount: number;
  coverPreview: string[];
};

export type ShelfItemSummaryResponse = {
  id: number;
  bookId: number;
  bookTitle: string;
  bookCoverUrl?: string | null;
  status: ReadingStatus;
  progressPercent?: number | null;
};

export type BookResponse = {
  id: number;
  title: string;
  authors: string[];
  coverUrl?: string | null;
  pageCount?: number | null;
  averageRating?: number | null;
  description?: string | null;
  synopsis?: string | null;
  readerCount?: number | null;
};

export type ProfilePreferences = {
  displayName?: string | null;
  showReadingGoal: boolean;
  showDnaLiterario: boolean;
};

const PROFILE_PREFERENCES_STORAGE_KEY = "biblioo.profile.preferences";

const DEFAULT_PROFILE_PREFERENCES: ProfilePreferences = {
  displayName: null,
  showReadingGoal: true,
  showDnaLiterario: true,
};

function bearerHeaders(token?: string | null, withJson = false): HeadersInit {
  const resolved = token ?? getAccessToken();

  if (!resolved) {
    throw new Error("missing_access_token");
  }

  return {
    ...(withJson ? { "Content-Type": "application/json" } : {}),
    Authorization: `Bearer ${resolved}`,
  };
}

function optionalBearerHeaders(token?: string | null): HeadersInit {
  const resolved = token ?? getAccessToken();
  return resolved ? { Authorization: `Bearer ${resolved}` } : {};
}

export async function getMyProfile(token?: string | null): Promise<UserProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: bearerHeaders(token),
  });

  if (!response.ok) {
    throw new Error("load_me_failed");
  }

  return (await response.json()) as UserProfileResponse;
}

export async function getProfileByUsername(username: string, token?: string | null): Promise<UserProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/users/${username}`, {
    headers: optionalBearerHeaders(token),
  });

  if (!response.ok) {
    throw new Error("load_user_profile_failed");
  }

  return (await response.json()) as UserProfileResponse;
}

export async function updateMyProfile(
  payload: { bio?: string | null; avatarUrl?: string | null; bannerUrl?: string | null },
  token?: string | null,
): Promise<UserProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "PUT",
    headers: bearerHeaders(token, true),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("update_profile_failed");
  }

  return (await response.json()) as UserProfileResponse;
}

export async function updateMyVisibility(isPrivate: boolean, token?: string | null): Promise<UserProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/users/me/visibility`, {
    method: "PUT",
    headers: bearerHeaders(token, true),
    body: JSON.stringify({ isPrivate }),
  });

  if (!response.ok) {
    throw new Error("visibility_request_failed");
  }

  return (await response.json()) as UserProfileResponse;
}

export async function uploadMyAvatar(file: File, token?: string | null): Promise<UserProfileResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/users/me/avatar`, {
    method: "POST",
    headers: bearerHeaders(token),
    body: formData,
  });

  if (!response.ok) {
    throw new Error("avatar_upload_failed");
  }

  return (await response.json()) as UserProfileResponse;
}

export async function listMyShelves(token?: string | null): Promise<ShelfSummaryResponse[]> {
  const response = await fetch(`${API_BASE_URL}/shelves`, {
    headers: bearerHeaders(token),
  });

  if (!response.ok) {
    throw new Error("load_shelves_failed");
  }

  return (await response.json()) as ShelfSummaryResponse[];
}

export async function listShelfItems(shelfId: number, token?: string | null): Promise<ShelfItemSummaryResponse[]> {
  const response = await fetch(`${API_BASE_URL}/shelves/${shelfId}/items`, {
    headers: bearerHeaders(token),
  });

  if (!response.ok) {
    throw new Error("load_shelf_items_failed");
  }

  return (await response.json()) as ShelfItemSummaryResponse[];
}

export async function getBookById(bookId: number, token?: string | null): Promise<BookResponse> {
  const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
    headers: bearerHeaders(token),
  });

  if (!response.ok) {
    throw new Error("load_book_failed");
  }

  return (await response.json()) as BookResponse;
}

async function fetchFollowCount(url: string, token?: string | null): Promise<number> {
  let page = 0;
  const size = 50;
  let count = 0;

  while (true) {
    const response = await fetch(`${url}?page=${page}&size=${size}`, {
      headers: optionalBearerHeaders(token),
    });

    if (!response.ok) {
      throw new Error("load_follow_failed");
    }

    const result = (await response.json()) as FollowPageResponse;
    count += result.users.length;

    if (!result.hasMore) {
      break;
    }

    page += 1;
  }

  return count;
}

export async function getFollowersCount(username: string, token?: string | null): Promise<number> {
  return fetchFollowCount(`${API_BASE_URL}/users/${username}/followers`, token);
}

export async function getFollowingCount(username: string, token?: string | null): Promise<number> {
  return fetchFollowCount(`${API_BASE_URL}/users/${username}/following`, token);
}

async function fetchFollowUsers(url: string, token?: string | null): Promise<UserSummaryResponse[]> {
  let page = 0;
  const size = 50;
  const users: UserSummaryResponse[] = [];

  while (true) {
    const response = await fetch(`${url}?page=${page}&size=${size}`, {
      headers: optionalBearerHeaders(token),
    });

    if (!response.ok) {
      throw new Error("load_follow_users_failed");
    }

    const result = (await response.json()) as FollowPageResponse;
    users.push(...result.users);

    if (!result.hasMore) {
      break;
    }

    page += 1;
  }

  return users;
}

export async function listFollowersByUsername(username: string, token?: string | null): Promise<UserSummaryResponse[]> {
  return fetchFollowUsers(`${API_BASE_URL}/users/${username}/followers`, token);
}

export async function listFollowingByUsername(username: string, token?: string | null): Promise<UserSummaryResponse[]> {
  return fetchFollowUsers(`${API_BASE_URL}/users/${username}/following`, token);
}

export async function listMyFollowing(token?: string | null): Promise<UserSummaryResponse[]> {
  const me = await getMyProfile(token);
  return listFollowingByUsername(me.username, token);
}

export async function searchUsersByUsername(
  query: string,
  token?: string | null,
  page = 0,
  size = 8,
): Promise<UserSummaryResponse[]> {
  const normalized = query.trim();
  if (normalized.length < 2) {
    return [];
  }

  const response = await fetch(
    `${API_BASE_URL}/users?q=${encodeURIComponent(normalized)}&page=${page}&size=${size}`,
    {
      headers: optionalBearerHeaders(token),
    },
  );

  if (!response.ok) {
    throw new Error("search_users_failed");
  }

  const result = (await response.json()) as FollowPageResponse;
  return result.users;
}

export async function followUser(username: string, token?: string | null): Promise<FollowActionResult> {
  const response = await fetch(`${API_BASE_URL}/users/${username}/follow`, {
    method: "POST",
    headers: bearerHeaders(token),
  });

  if (response.status === 202) {
    return "requested";
  }

  if (response.status === 204) {
    return "following";
  }

  if (response.status === 409) {
    return "requested";
  }

  if (!response.ok) {
    throw new Error("follow_user_failed");
  }

  return "following";
}

export async function unfollowUser(username: string, token?: string | null): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${username}/follow`, {
    method: "DELETE",
    headers: bearerHeaders(token),
  });

  if (!response.ok) {
    throw new Error("unfollow_user_failed");
  }
}

export async function listPendingFollowRequests(
  page = 0,
  size = 20,
  token?: string | null,
): Promise<FollowPageResponse> {
  const response = await fetch(`${API_BASE_URL}/users/me/follow-requests?page=${page}&size=${size}`, {
    headers: bearerHeaders(token),
  });

  if (!response.ok) {
    throw new Error("load_pending_follow_requests_failed");
  }

  return (await response.json()) as FollowPageResponse;
}

export async function acceptFollowRequest(requesterUsername: string, token?: string | null): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/me/follow-requests/${encodeURIComponent(requesterUsername)}/accept`, {
    method: "POST",
    headers: bearerHeaders(token),
  });

  if (!response.ok) {
    throw new Error("accept_follow_request_failed");
  }
}

export async function rejectFollowRequest(requesterUsername: string, token?: string | null): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/me/follow-requests/${encodeURIComponent(requesterUsername)}`, {
    method: "DELETE",
    headers: bearerHeaders(token),
  });

  if (!response.ok) {
    throw new Error("reject_follow_request_failed");
  }
}

export function getProfilePreferences(): ProfilePreferences {
  if (typeof globalThis.window === "undefined") {
    return DEFAULT_PROFILE_PREFERENCES;
  }

  try {
    const raw = localStorage.getItem(PROFILE_PREFERENCES_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PROFILE_PREFERENCES;
    }

    const parsed = JSON.parse(raw) as Partial<ProfilePreferences>;

    return {
      displayName: parsed.displayName ?? null,
      showReadingGoal: parsed.showReadingGoal ?? true,
      showDnaLiterario: parsed.showDnaLiterario ?? true,
    };
  } catch {
    return DEFAULT_PROFILE_PREFERENCES;
  }
}

export function saveProfilePreferences(preferences: ProfilePreferences): void {
  if (typeof globalThis.window === "undefined") {
    return;
  }

  localStorage.setItem(PROFILE_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
}
