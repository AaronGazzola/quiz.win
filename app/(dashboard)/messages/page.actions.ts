"use server";

import { getAuthenticatedClient } from "@/lib/auth.utils";
import { ActionResponse } from "@/lib/action.utils";
import { validateCampusAccess } from "@/lib/data-access";

export async function getConversationsAction(userId: string) {
  const { db, currentUser } = await getAuthenticatedClient();

  if (currentUser.id !== userId) {
    throw new Error("Unauthorized");
  }

  const campusAccess = await validateCampusAccess(
    currentUser.id,
    currentUser.session.activeOrganizationId!,
    "read"
  );

  if (!campusAccess) {
    throw new Error("Campus access denied");
  }

  const messages = await db.message.findMany({
    where: {
      OR: [{ senderId: userId }, { recipientId: userId }],
      campusId: currentUser.session.activeOrganizationId!,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const conversations = messages.reduce((acc, msg) => {
    const otherId = msg.senderId === userId ? msg.recipientId : msg.senderId;
    const convId = msg.conversationId;

    if (!acc[convId]) {
      acc[convId] = {
        conversationId: convId,
        participantId: otherId,
        lastMessage: msg,
        unreadCount: 0,
      };
    }

    if (!msg.isRead && msg.recipientId === userId) {
      acc[convId].unreadCount++;
    }

    return acc;
  }, {} as Record<string, any>);

  return Object.values(conversations);
}

export async function getMessagesAction(conversationId: string) {
  const { db, currentUser } = await getAuthenticatedClient();

  const messages = await db.message.findMany({
    where: {
      conversationId,
      OR: [
        { senderId: currentUser.id },
        { recipientId: currentUser.id },
      ],
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (messages.length === 0) {
    throw new Error("Conversation not found");
  }

  return messages;
}

export async function sendMessageAction(
  recipientId: string,
  subject: string,
  content: string
) {
  const { db, currentUser } = await getAuthenticatedClient();

  const campusAccess = await validateCampusAccess(
    currentUser.id,
    currentUser.session.activeOrganizationId!,
    "write"
  );

  if (!campusAccess) {
    throw new Error("Campus access denied");
  }

  const conversationId = [currentUser.id, recipientId].sort().join("-");

  const message = await db.message.create({
    data: {
      senderId: currentUser.id,
      recipientId,
      subject,
      content,
      conversationId,
      campusId: currentUser.session.activeOrganizationId!,
    },
  });

  return message;
}

export async function replyToMessageAction(
  messageId: string,
  content: string
) {
  const { db, currentUser } = await getAuthenticatedClient();

  const originalMessage = await db.message.findUnique({
    where: { id: messageId },
  });

  if (!originalMessage) {
    throw new Error("Message not found");
  }

  if (
    originalMessage.senderId !== currentUser.id &&
    originalMessage.recipientId !== currentUser.id
  ) {
    throw new Error("Unauthorized");
  }

  const recipientId =
    originalMessage.senderId === currentUser.id
      ? originalMessage.recipientId
      : originalMessage.senderId;

  const reply = await db.message.create({
    data: {
      senderId: currentUser.id,
      recipientId,
      subject: `Re: ${originalMessage.subject}`,
      content,
      conversationId: originalMessage.conversationId,
      campusId: originalMessage.campusId,
    },
  });

  return reply;
}

export async function markAsReadAction(messageId: string) {
  const { db, currentUser } = await getAuthenticatedClient();

  const message = await db.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new Error("Message not found");
  }

  if (message.recipientId !== currentUser.id) {
    throw new Error("Unauthorized");
  }

  await db.message.update({
    where: { id: messageId },
    data: { isRead: true },
  });

  return { success: true };
}
