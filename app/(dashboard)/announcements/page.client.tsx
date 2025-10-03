"use client";

import { useState } from "react";
import { useAnnouncements } from "./page.hooks";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Megaphone, Pin, Trash2 } from "lucide-react";
import { TargetAudience } from "@prisma/client";

export function AnnouncementsClient() {
  const [newAnnouncementOpen, setNewAnnouncementOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetAudience, setTargetAudience] = useState<TargetAudience>(
    "AllParents"
  );
  const [grade, setGrade] = useState("");
  const [classroomId, setClassroomId] = useState("");
  const [isPinned, setIsPinned] = useState(false);

  const {
    announcements,
    announcementsLoading,
    createAnnouncement,
    createLoading,
    deleteAnnouncement,
    pinAnnouncement,
    hasAdminAccess,
  } = useAnnouncements();

  const canManage = hasAdminAccess;

  const handleCreate = () => {
    createAnnouncement(
      {
        title,
        content,
        targetAudience,
        grade: targetAudience === "Grade" ? grade : undefined,
        classroomId: targetAudience === "Classroom" ? classroomId : undefined,
        isPinned,
      },
      {
        onSuccess: () => {
          setNewAnnouncementOpen(false);
          setTitle("");
          setContent("");
          setTargetAudience("AllParents");
          setGrade("");
          setClassroomId("");
          setIsPinned(false);
        },
      }
    );
  };

  if (announcementsLoading) {
    return <div className="p-6">Loading announcements...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Announcements</h1>
        {canManage && (
          <Dialog
            open={newAnnouncementOpen}
            onOpenChange={setNewAnnouncementOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Megaphone className="mr-2 h-4 w-4" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription>
                  Share important information with your campus community
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Announcement title"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Announcement content..."
                    rows={5}
                  />
                </div>
                <div>
                  <Label htmlFor="audience">Target Audience</Label>
                  <Select
                    value={targetAudience}
                    onValueChange={(value) =>
                      setTargetAudience(value as TargetAudience)
                    }
                  >
                    <SelectTrigger id="audience">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AllParents">All Parents</SelectItem>
                      <SelectItem value="AllTeachers">All Teachers</SelectItem>
                      <SelectItem value="Grade">Specific Grade</SelectItem>
                      <SelectItem value="Classroom">
                        Specific Classroom
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {targetAudience === "Grade" && (
                  <div>
                    <Label htmlFor="grade">Grade</Label>
                    <Input
                      id="grade"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="e.g., Grade 5"
                    />
                  </div>
                )}
                {targetAudience === "Classroom" && (
                  <div>
                    <Label htmlFor="classroom">Classroom ID</Label>
                    <Input
                      id="classroom"
                      value={classroomId}
                      onChange={(e) => setClassroomId(e.target.value)}
                      placeholder="Enter classroom ID"
                    />
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="pinned"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="pinned">Pin to top</Label>
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={createLoading || !title || !content}
                  className="w-full"
                >
                  Create Announcement
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {announcements && announcements.length === 0 && (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              No announcements yet
            </p>
          </Card>
        )}
        {announcements?.map((announcement) => (
          <Card key={announcement.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">{announcement.title}</h3>
                  {announcement.isPinned && (
                    <Badge variant="secondary">
                      <Pin className="h-3 w-3 mr-1" />
                      Pinned
                    </Badge>
                  )}
                  <Badge variant="outline">{announcement.targetAudience}</Badge>
                </div>
                <p className="text-muted-foreground mb-4">
                  {announcement.content}
                </p>
                <p className="text-xs text-muted-foreground">
                  Published {new Date(announcement.publishedAt).toLocaleString()}
                </p>
              </div>
              {canManage && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => pinAnnouncement(announcement.id)}
                  >
                    <Pin className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteAnnouncement(announcement.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
