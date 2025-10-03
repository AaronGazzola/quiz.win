"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CafeteriaMenu, DayOfWeek } from "@prisma/client";

interface MenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menu: CafeteriaMenu | null;
  weekStartDate: Date;
  onSubmit: (data: {
    dayOfWeek: DayOfWeek;
    menuItems: Record<string, unknown>;
    specialNotes?: string;
  }) => void;
}

export function MenuDialog({
  open,
  onOpenChange,
  menu,
  weekStartDate,
  onSubmit,
}: MenuDialogProps) {
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>("Monday");
  const [menuItemsText, setMenuItemsText] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");

  useEffect(() => {
    if (menu) {
      setDayOfWeek(menu.dayOfWeek);
      setMenuItemsText(
        Array.isArray(menu.menuItems)
          ? (menu.menuItems as string[]).join("\n")
          : JSON.stringify(menu.menuItems, null, 2),
      );
      setSpecialNotes(menu.specialNotes || "");
    } else {
      setDayOfWeek("Monday");
      setMenuItemsText("");
      setSpecialNotes("");
    }
  }, [menu, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const items = menuItemsText.split("\n").filter((item) => item.trim());
    onSubmit({
      dayOfWeek,
      menuItems: { items },
      specialNotes: specialNotes || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{menu ? "Edit Menu" : "Add Menu"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dayOfWeek">Day of Week</Label>
            <Select
              value={dayOfWeek}
              onValueChange={(value) => setDayOfWeek(value as DayOfWeek)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Monday">Monday</SelectItem>
                <SelectItem value="Tuesday">Tuesday</SelectItem>
                <SelectItem value="Wednesday">Wednesday</SelectItem>
                <SelectItem value="Thursday">Thursday</SelectItem>
                <SelectItem value="Friday">Friday</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="menuItems">Menu Items (one per line)</Label>
            <Textarea
              id="menuItems"
              value={menuItemsText}
              onChange={(e) => setMenuItemsText(e.target.value)}
              placeholder="Main Dish: Chicken Rice&#10;Side: Steamed Vegetables&#10;Drink: Fresh Juice"
              rows={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialNotes">Special Notes (Optional)</Label>
            <Input
              id="specialNotes"
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="e.g., Contains nuts, Vegetarian option available"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{menu ? "Update" : "Add"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
