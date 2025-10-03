"use client";

import { useState } from "react";
import { useMessages, useConversation } from "./page.hooks";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Send } from "lucide-react";

export function MessagesClient() {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await authClient.getSession();
      return data;
    },
  });
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [replyContent, setReplyContent] = useState("");

  const {
    conversations,
    conversationsLoading,
    sendMessage,
    sendMessageLoading,
    reply,
    replyLoading,
    markAsRead,
  } = useMessages();

  const { messages, messagesLoading } = useConversation(
    selectedConversationId
  );

  const handleSendMessage = () => {
    sendMessage(
      { recipientId, subject, content },
      {
        onSuccess: () => {
          setNewMessageOpen(false);
          setRecipientId("");
          setSubject("");
          setContent("");
        },
      }
    );
  };

  const handleReply = () => {
    if (messages && messages.length > 0) {
      reply(
        { messageId: messages[0].id, content: replyContent },
        {
          onSuccess: () => {
            setReplyContent("");
          },
        }
      );
    }
  };

  const handleConversationClick = (conversationId: string, lastMessageId: string, isRead: boolean) => {
    setSelectedConversationId(conversationId);
    if (!isRead) {
      markAsRead(lastMessageId);
    }
  };

  if (conversationsLoading) {
    return <div className="p-6">Loading conversations...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Messages</h1>
        <Dialog open={newMessageOpen} onOpenChange={setNewMessageOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send New Message</DialogTitle>
              <DialogDescription>
                Send a message to a teacher or parent
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipient">Recipient ID</Label>
                <Input
                  id="recipient"
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  placeholder="Enter recipient user ID"
                />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Message subject"
                />
              </div>
              <div>
                <Label htmlFor="content">Message</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your message..."
                  rows={5}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={sendMessageLoading || !recipientId || !subject || !content}
                className="w-full"
              >
                Send Message
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-2">
          <h2 className="text-lg font-semibold mb-4">Conversations</h2>
          {conversations && conversations.length === 0 && (
            <p className="text-sm text-muted-foreground">No conversations yet</p>
          )}
          {conversations?.map((conv: {
            conversationId: string;
            lastMessage: {
              id: string;
              subject: string;
              content: string;
              senderId: string;
              isRead: boolean;
              createdAt: Date;
            };
            unreadCount: number;
          }) => (
            <Card
              key={conv.conversationId}
              className={`p-4 cursor-pointer hover:bg-accent ${selectedConversationId === conv.conversationId ? "bg-accent" : ""
                }`}
              onClick={() =>
                handleConversationClick(conv.conversationId, conv.lastMessage.id, conv.lastMessage.isRead || conv.lastMessage.senderId === session?.user?.id)
              }
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span className="font-medium text-sm">
                      {conv.lastMessage.subject}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {conv.lastMessage.content}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {conv.unreadCount}
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>

        <div className="col-span-2">
          {selectedConversationId ? (
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">
                  {messages?.[0]?.subject}
                </h2>
              </div>

              {messagesLoading ? (
                <div>Loading messages...</div>
              ) : (
                <>
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {messages?.map((msg: {
                      id: string;
                      senderId: string;
                      content: string;
                      createdAt: Date;
                    }) => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-lg ${msg.senderId === session?.user?.id
                            ? "bg-primary text-primary-foreground ml-12"
                            : "bg-muted mr-12"
                          }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <Label htmlFor="reply">Reply</Label>
                    <Textarea
                      id="reply"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write your reply..."
                      rows={3}
                      className="mt-2"
                    />
                    <Button
                      onClick={handleReply}
                      disabled={replyLoading || !replyContent}
                      className="mt-2"
                    >
                      Send Reply
                    </Button>
                  </div>
                </>
              )}
            </Card>
          ) : (
            <Card className="p-6 h-full flex items-center justify-center">
              <p className="text-muted-foreground">
                Select a conversation to view messages
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
