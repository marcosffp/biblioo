import { requiredBearerHeaders, jsonBearerHeaders, optionalBearerHeaders } from "@/lib/api-headers";

import { API_BASE_URL } from "@/lib/api-config";

import type {
  UserProfileResponse,
  UserSummaryResponse,
  FollowPageResponse,
  FollowActionResult,
  ShelfSummaryResponse,
  ShelfItemSummaryResponse,
  BookResponse,
  UserReviewResponse,
  DnaResponse,
  DnaProgressResponse,
} from "@/types/api";

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


export async function getMyProfile(token?: string | null): Promise<UserProfileResponse> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: requiredBearerHeaders(token),
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
    headers: jsonBearerHeaders(token),
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
    headers: jsonBearerHeaders(token),
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
    headers: requiredBearerHeaders(token),
    body: formData,
  });

  if (!response.ok) {
    throw new Error("avatar_upload_failed");
  }

  return (await response.json()) as UserProfileResponse;
}

export async function uploadMyBanner(file: File, token?: string | null): Promise<UserProfileResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/users/me/banner`, {
    method: "POST",
    headers: requiredBearerHeaders(token),
    body: formData,
  });

  if (!response.ok) {
    throw new Error("banner_upload_failed");
  }

  return (await response.json()) as UserProfileResponse;
}

export async function listMyShelves(token?: string | null): Promise<ShelfSummaryResponse[]> {
  const response = await fetch(`${API_BASE_URL}/shelves`, {
    headers: requiredBearerHeaders(token),
  });

  if (!response.ok) {
    throw new Error("load_shelves_failed");
  }

  return (await response.json()) as ShelfSummaryResponse[];
}

export async function listShelvesByUserId(userId: number, token?: string | null): Promise<ShelfSummaryResponse[]> {
  const response = await fetch(`${API_BASE_URL}/shelves/user/${userId}`, {
    headers: optionalBearerHeaders(token),
  });

  if (!response.ok) {
    throw new Error("load_user_shelves_failed");
  }

  return (await response.json()) as ShelfSummaryResponse[];
}

export async function listShelfItems(shelfId: number, token?: string | null): Promise<ShelfItemSummaryResponse[]> {
  const response = await fetch(`${API_BASE_URL}/shelves/${shelfId}/items`, {
    headers: requiredBearerHeaders(token),
  });

  if (!response.ok) {
    throw new Error("load_shelf_items_failed");
  }

  return (await response.json()) as ShelfItemSummaryResponse[];
}

export async function listShelfItemsByUserId(
  shelfId: number,
  userId: number,
  token?: string | null,
): Promise<ShelfItemSummaryResponse[]> {
  const response = await fetch(`${API_BASE_URL}/shelves/${shelfId}/items/user/${userId}`, {
    headers: optionalBearerHeaders(token),
  });

  if (!response.ok) {
    throw new Error("load_user_shelf_items_failed");
  }

  return (await response.json()) as ShelfItemSummaryResponse[];
}

export async function getBookById(bookId: number, token?: string | null): Promise<BookResponse> {
  const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
    headers: optionalBearerHeaders(token),
  });

  if (!response.ok) {
    throw new Error("load_book_failed");
  }

  return (await response.json()) as BookResponse;
}

type PageResponse<T> = {
  content: T[];
  totalPages?: number;
  last?: boolean;
  number?: number;
};

export async function listUserReviewsByUserId(
  userId: number,
  token?: string | null,
  pageSize = 100,
): Promise<UserReviewResponse[]> {
  let page = 0;
  const reviews: UserReviewResponse[] = [];

  while (true) {
    const response = await fetch(`${API_BASE_URL}/feed/reviews/user/${userId}?page=${page}&size=${pageSize}`, {
      headers: requiredBearerHeaders(token),
    });

    if (!response.ok) {
      throw new Error("load_user_reviews_failed");
    }

    const result = (await response.json()) as PageResponse<UserReviewResponse>;
    reviews.push(...(result.content ?? []));

    const finishedByFlag = result.last === true;
    const finishedByPageCount =
      typeof result.totalPages === "number" && typeof result.number === "number"
        ? result.number >= result.totalPages - 1
        : false;

    if (finishedByFlag || finishedByPageCount || (result.content?.length ?? 0) === 0) {
      break;
    }

    page += 1;
  }

  return reviews;
}

export async function generateShareCard(type: string, token?: string | null): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/share/card?type=${encodeURIComponent(type)}`, {
    headers: optionalBearerHeaders(token),
  });

  if (!response.ok) {
    throw new Error("generate_share_card_failed");
  }

  return response.blob();
}

export async function getMyDna(token?: string | null): Promise<DnaResponse | DnaProgressResponse> {
  const response = await fetch(`${API_BASE_URL}/dna`, {
    headers: requiredBearerHeaders(token),
  });

  if (!response.ok) {
    throw new Error("load_dna_failed");
  }

  return (await response.json()) as DnaResponse | DnaProgressResponse;
}

export async function getDnaByUserId(
  userId: number,
  token?: string | null,
): Promise<DnaResponse | DnaProgressResponse> {
  const response = await fetch(`${API_BASE_URL}/dna/${userId}`, {
    headers: optionalBearerHeaders(token),
  });

  if (!response.ok) {
    throw new Error("load_dna_failed");
  }

  return (await response.json()) as DnaResponse | DnaProgressResponse;
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
    headers: requiredBearerHeaders(token),
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
    headers: requiredBearerHeaders(token),
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
    headers: requiredBearerHeaders(token),
  });

  if (!response.ok) {
    throw new Error("load_pending_follow_requests_failed");
  }

  return (await response.json()) as FollowPageResponse;
}

export async function acceptFollowRequest(requesterUsername: string, token?: string | null): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/me/follow-requests/${encodeURIComponent(requesterUsername)}/accept`, {
    method: "POST",
    headers: requiredBearerHeaders(token),
  });

  if (!response.ok) {
    throw new Error("accept_follow_request_failed");
  }
}

export async function rejectFollowRequest(requesterUsername: string, token?: string | null): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/me/follow-requests/${encodeURIComponent(requesterUsername)}`, {
    method: "DELETE",
    headers: requiredBearerHeaders(token),
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
