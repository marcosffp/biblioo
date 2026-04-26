"use client";

import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { useCommunityMessages } from "@/hooks/useCommunityMessages";
import { CommunityChatPanel } from "./CommunityChatPanel";
import { CommunityInfoPanel } from "./CommunityInfoPanel";
import type { Community } from "../../hooks/useCommunity";

export interface CommunityChatViewProps {
  community: Community;
  onBack: () => void;
  onUpdateCommunity: (community: Community) => void;
}

export function CommunityChatView({ community, onBack, onUpdateCommunity }: Readonly<CommunityChatViewProps>) {
  const [isInfoOpen, setIsInfoOpen] = React.useState(false);
  const {
    messages,
    members,
    currentUserId,
    isLoadingMessages,
    isSendingMessage,
    isConnected,
    messageError,
    sendMessage,
  } = useCommunityMessages(community.id);

  const isOwner = community.ownerId != null && community.ownerId === currentUserId;

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]">
      <TopHeader />
      <Sidebar />
      <main className="w-full pl-64 pt-16">
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="flex h-[calc(100vh-4rem)] border-x border-border bg-card">
            <div className="min-w-0 flex-1">
              <CommunityChatPanel
                community={community}
                messages={messages}
                isLoadingMessages={isLoadingMessages}
                isSendingMessage={isSendingMessage}
                isConnected={isConnected}
                messageError={messageError}
                onSendMessage={sendMessage}
                onBack={onBack}
                onOpenInfo={() => setIsInfoOpen((current) => !current)}
              />
            </div>

            {isInfoOpen ? (
              <CommunityInfoPanel
                community={community}
                members={members}
                canEdit={isOwner}
                onSaveCommunity={onUpdateCommunity}
                onClose={() => setIsInfoOpen(false)}
              />
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

export default CommunityChatView;
