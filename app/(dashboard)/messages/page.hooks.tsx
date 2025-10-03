"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getConversationsAction,
  getMessagesAction,
  sendMessageAction,
  replyToMessageAction,
  markAsReadAction,
} from "./page.actions";
import { authClient } from "@/lib/auth-client";

export function useMessages() {
  const queryClient = useQueryClient();
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await authClient.getSession();
      return data;
    },
  });

  const {
    data: conversations,
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useQuery({
    queryKey: ["conversations", session?.user?.id],
    queryFn: () => {
      const userId = session?.user?.id;
      if (!userId) throw new Error("User ID is required");
      return getConversationsAction(userId);
    },
    enabled: !!session?.user?.id,
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({
      recipientId,
      subject,
      content,
    }: {
      recipientId: string;
      subject: string;
      content: string;
    }) => sendMessageAction(recipientId, subject, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({
      messageId,
      content,
    }: {
      messageId: string;
      content: string;
    }) => replyToMessageAction(messageId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.messageId],
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (messageId: string) => markAsReadAction(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return {
    conversations,
    conversationsLoading,
    conversationsError,
    sendMessage: sendMessageMutation.mutate,
    sendMessageLoading: sendMessageMutation.isPending,
    reply: replyMutation.mutate,
    replyLoading: replyMutation.isPending,
    markAsRead: markAsReadMutation.mutate,
  };
}

export function useConversation(conversationId: string | null) {
  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessagesAction(conversationId!),
    enabled: !!conversationId,
  });

  return {
    messages,
    messagesLoading: isLoading,
  };
}
