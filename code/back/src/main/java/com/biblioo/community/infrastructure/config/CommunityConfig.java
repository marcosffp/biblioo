package com.biblioo.community.infrastructure.config;

import com.biblioo.community.domain.port.in.CommunityMessageUseCase;
import com.biblioo.community.domain.port.in.CommunityUseCase;
import com.biblioo.community.domain.port.out.CommunityBookLookupPort;
import com.biblioo.community.domain.port.out.CommunityEventPublisherPort;
import com.biblioo.community.domain.port.out.CommunityUserLookupPort;
import com.biblioo.community.domain.port.out.MessageBroadcastPort;
import com.biblioo.community.domain.port.out.MessageCachePort;
import com.biblioo.community.domain.service.CommunityMessageService;
import com.biblioo.community.domain.service.CommunityService;
import com.biblioo.community.infrastructure.persistence.CommunityInviteRepository;
import com.biblioo.community.infrastructure.persistence.CommunityJoinRequestRepository;
import com.biblioo.community.infrastructure.persistence.CommunityMemberRepository;
import com.biblioo.community.infrastructure.persistence.CommunityMembershipCache;
import com.biblioo.community.infrastructure.persistence.CommunityMessageRepository;
import com.biblioo.community.infrastructure.persistence.CommunityRepository;
import com.biblioo.community.infrastructure.persistence.MessageReactionRepository;
import com.biblioo.feed.domain.port.out.FeedImagePort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class CommunityConfig {

  @Bean
  CommunityUseCase communityUseCase(
      CommunityRepository communityRepository,
      CommunityMemberRepository memberRepository,
      CommunityMembershipCache membershipCache,
      CommunityInviteRepository inviteRepository,
      CommunityJoinRequestRepository joinRequestRepository,
      CommunityUserLookupPort userLookup,
      CommunityBookLookupPort bookLookup,
      CommunityEventPublisherPort eventPublisher) {
    return new CommunityService(
        communityRepository,
        memberRepository,
        membershipCache,
        inviteRepository,
        joinRequestRepository,
        userLookup,
        bookLookup,
        eventPublisher);
  }

  @Bean
  CommunityMessageUseCase communityMessageUseCase(
      CommunityMessageRepository messageRepository,
      MessageReactionRepository reactionRepository,
      CommunityMemberRepository memberRepository,
      CommunityMembershipCache membershipCache,
      MessageBroadcastPort broadcastPort,
      MessageCachePort cachePort,
      FeedImagePort feedImagePort,
      org.springframework.transaction.support.TransactionTemplate transactionTemplate,
      org.springframework.context.ApplicationEventPublisher eventPublisher) {
    return new CommunityMessageService(
        messageRepository,
        reactionRepository,
        memberRepository,
        membershipCache,
        broadcastPort,
        cachePort,
        feedImagePort,
        transactionTemplate,
        eventPublisher);
  }

}
