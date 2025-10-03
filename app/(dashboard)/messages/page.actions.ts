"use server";

import { getAuthenticatedClient } from "@/lib/auth.utils";
import { validateCampusAccess } from "@/lib/data-access";

export async function getConversationsAction(userId: string) {
  const { db, user, session } = await getAuthenticatedClient();

  if (!user || !session?.session?.activeOrganizationId) throw new Error("Unauthorized");

  if (user.id !== userId) {
    throw new Error("Unauthorized");
  }

  const campusAccess = await validateCampusAccess(
    user.id,
    session.session.activeOrganizationId,
    "read"
  );

  if (!campusAccess) {
    throw new Error("Campus access denied");
  }

  const messages = await db.message.findMany({
    where: {
      OR: [{ senderId: userId }, { recipientId: userId }],
      campusId: session.session.activeOrganizationId,
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
      (acc[convId] as { unreadCount: number }).unreadCount++;
    }

    return acc;
  }, {} as Record<string, { conversationId: string; participantId: string; lastMessage: typeof messages[0]; unreadCount: number }>);

  return Object.values(conversations);
}

export async function getMessagesAction(conversationId: string) {
  const { db, user } = await getAuthenticatedClient();

  if (!user) throw new Error("Unauthorized");

  const messages = await db.message.findMany({
    where: {
      conversationId,
      OR: [
        { senderId: user.id },
        { recipientId: user.id },
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
  const { db, user, session } = await getAuthenticatedClient();

  if (!user || !session?.session?.activeOrganizationId) throw new Error("Unauthorized");

  const campusAccess = await validateCampusAccess(
    user.id,
    session.session.activeOrganizationId,
    "write"
  );

  if (!campusAccess) {
    throw new Error("Campus access denied");
  }

  const conversationId = [user.id, recipientId].sort().join("-");

  const message = await db.message.create({
    data: {
      senderId: user.id,
      recipientId,
      subject,
      content,
      conversationId,
      campusId: session.session.activeOrganizationId,
    },
  });

  return message;
}

export async function replyToMessageAction(
  messageId: string,
  content: string
) {
  const { db, user } = await getAuthenticatedClient();

  if (!user) throw new Error("Unauthorized");

  const originalMessage = await db.message.findUnique({
    where: { id: messageId },
  });

  if (!originalMessage) {
    throw new Error("Message not found");
  }

  if (
    originalMessage.senderId !== user.id &&
    originalMessage.recipientId !== user.id
  ) {
    throw new Error("Unauthorized");
  }

  const recipientId =
    originalMessage.senderId === user.id
      ? originalMessage.recipientId
      : originalMessage.senderId;

  const reply = await db.message.create({
    data: {
      senderId: user.id,
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
  const { db, user } = await getAuthenticatedClient();

  if (!user) throw new Error("Unauthorized");

  const message = await db.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new Error("Message not found");
  }

  if (message.recipientId !== user.id) {
    throw new Error("Unauthorized");
  }

  await db.message.update({
    where: { id: messageId },
    data: { isRead: true },
  });

  return { success: true };
}
