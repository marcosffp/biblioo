import React from "react";
import { getAccessToken } from "@/services/auth";
import { followUser, unfollowUser } from "@/services/profile";

export function useFollowToggle() {
  const [followState, setFollowState] = React.useState<Record<string, boolean>>({});
  const [requestedState, setRequestedState] = React.useState<Record<string, boolean>>({});

  const initFollowState = React.useCallback((state: Record<string, boolean>) => {
    setFollowState(state);
  }, []);

  const handleToggleFollow = React.useCallback(
    async (username: string) => {
      const accessToken = getAccessToken();
      if (!accessToken) return;

      const currentlyFollowing = !!followState[username];
      const currentlyRequested = !!requestedState[username];

      if (currentlyFollowing || currentlyRequested) {
        setFollowState((prev) => ({ ...prev, [username]: false }));
        setRequestedState((prev) => ({ ...prev, [username]: false }));
      } else {
        setRequestedState((prev) => ({ ...prev, [username]: true }));
      }

      try {
        if (currentlyFollowing || currentlyRequested) {
          await unfollowUser(username, accessToken);
        } else {
          const result = await followUser(username, accessToken);
          if (result === "following") {
            setFollowState((prev) => ({ ...prev, [username]: true }));
            setRequestedState((prev) => ({ ...prev, [username]: false }));
          } else {
            setFollowState((prev) => ({ ...prev, [username]: false }));
            setRequestedState((prev) => ({ ...prev, [username]: true }));
          }
        }
      } catch {
        setFollowState((prev) => ({ ...prev, [username]: currentlyFollowing }));
        setRequestedState((prev) => ({ ...prev, [username]: currentlyRequested }));
      }
    },
    [followState, requestedState],
  );

  return { followState, requestedState, initFollowState, handleToggleFollow };
}
