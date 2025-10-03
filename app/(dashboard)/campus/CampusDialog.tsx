"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { createCampus, updateCampus } from "./page.actions";
import { Campus } from "@prisma/client";
import { toast } from "sonner";

interface CampusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campus?: Campus;
}

export function CampusDialog({ open, onOpenChange, campus }: CampusDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = !!campus;

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    address: "",
    phone: "",
    principalName: "",
    capacity: "",
    location: "",
  });

  useEffect(() => {
    if (campus) {
      setFormData({
        name: campus.name || "",
        slug: campus.slug || "",
        address: campus.address || "",
        phone: campus.phone || "",
        principalName: campus.principalName || "",
        capacity: campus.capacity?.toString() || "",
        location: campus.location || "",
      });
    } else {
      setFormData({
        name: "",
        slug: "",
        address: "",
        phone: "",
        principalName: "",
        capacity: "",
        location: "",
      });
    }
  }, [campus, open]);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await createCampus({
        ...data,
        capacity: data.capacity ? parseInt(data.capacity) : undefined,
      });
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campuses"] });
      toast.success("Campus created successfully");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create campus");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!campus) throw new Error("No campus to update");
      const response = await updateCampus(campus.id, {
        ...data,
        capacity: data.capacity ? parseInt(data.capacity) : undefined,
      });
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campuses"] });
      toast.success("Campus updated successfully");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update campus");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Campus" : "Create New Campus"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update campus information and details"
              : "Add a new campus to the school system"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campus Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Abraham Lincoln Academy"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                required
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="lagos-campus"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Lagos, Nigeria"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="principalName">Principal Name</Label>
              <Input
                id="principalName"
                value={formData.principalName}
                onChange={(e) =>
                  setFormData({ ...formData, principalName: e.target.value })
                }
                placeholder="Dr. John Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="123 Education Street, Lagos"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+234 123 456 7890"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Student Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: e.target.value })
                }
                placeholder="500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEdit ? "Update Campus" : "Create Campus"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
