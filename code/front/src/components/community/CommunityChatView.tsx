"use client";

import React from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopHeader } from "@/components/TopHeader";
import { useCommunityMessages } from "@/hooks/useCommunityMessages";
import { changeCommunityMemberRole, deleteCommunity, leaveCommunity, removeCommunityMember } from "@/services/community";
import { CommunityChatPanel } from "./CommunityChatPanel";
import { CommunityInfoPanel } from "./CommunityInfoPanel";
import type { Community } from "../../hooks/useCommunity";

export interface CommunityChatViewProps {
  community: Community;
  onBack: () => void;
  onUpdateCommunity: (community: Community) => void;
  onInviteUser: (communityId: string, inviteeId: number) => Promise<void>;
}

export function CommunityChatView({
  community,
  onBack,
  onUpdateCommunity,
  onInviteUser,
}: Readonly<CommunityChatViewProps>) {
  const [isInfoOpen, setIsInfoOpen] = React.useState(false);
  const {
    messages,
    members,
    currentUserId,
    isLoadingMessages,
    isSendingMessage,
    isConnected,
    messageError,
    typingUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    toggleHeartReaction,
    refreshMembers,
    publishTyping,
  } = useCommunityMessages(community.id);

  const isOwner = community.ownerId != null && community.ownerId === currentUserId;

  const handleRemoveMember = async (memberId: string) => {
    await removeCommunityMember(Number(community.id), Number(memberId));
    await refreshMembers();
  };

  const handleLeaveGroup = async () => {
    await leaveCommunity(Number(community.id));
    onBack();
  };

  const handleChangeMemberRole = async (memberId: string, role: "MODERATOR" | "MEMBER") => {
    await changeCommunityMemberRole(Number(community.id), Number(memberId), role);
    await refreshMembers();
  };

  const handleDeleteCommunity = async () => {
    await deleteCommunity(Number(community.id));
    onBack();
  };

  return (
    <div className="min-h-screen bg-white">
      <TopHeader />
      <Sidebar />
      <main className="w-full pl-64 pt-16">
        <div className="h-[calc(100vh-4rem)] w-full bg-[#f6f9f8] p-4">
          <div className="flex h-full overflow-hidden rounded-2xl border border-border/80 bg-white shadow-[0_6px_28px_rgba(16,24,40,0.06)]">
            <div className="min-w-0 flex-1">
              <CommunityChatPanel
                community={community}
                messages={messages}
                isLoadingMessages={isLoadingMessages}
                isSendingMessage={isSendingMessage}
                isConnected={isConnected}
                messageError={messageError}
                onSendMessage={sendMessage}
                onEditMessage={editMessage}
                onDeleteMessage={deleteMessage}
                onToggleHeartReaction={toggleHeartReaction}
                onBack={onBack}
                onOpenInfo={() => setIsInfoOpen((current) => !current)}
                typingUsers={typingUsers}
                onTyping={publishTyping}
              />
            </div>

            {isInfoOpen ? (
              <CommunityInfoPanel
                community={community}
                members={members}
                canEdit={isOwner}
                currentUserId={currentUserId}
                onSaveCommunity={onUpdateCommunity}
                onInviteUser={onInviteUser}
                onRemoveMember={isOwner ? handleRemoveMember : undefined}
                onLeaveGroup={!isOwner ? handleLeaveGroup : undefined}
                onChangeMemberRole={isOwner ? handleChangeMemberRole : undefined}
                onDeleteCommunity={isOwner ? handleDeleteCommunity : undefined}
                onRefreshMembers={refreshMembers}
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
