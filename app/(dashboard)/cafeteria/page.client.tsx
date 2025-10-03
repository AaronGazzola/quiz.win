"use client";

import { useState } from "react";
import { useCafeteria } from "./page.hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, UtensilsCrossed, ChevronLeft, ChevronRight } from "lucide-react";
import { MenuDialog } from "./MenuDialog";
import type { CafeteriaMenu } from "@prisma/client";

export function CafeteriaClient() {
  const {
    currentWeekMenu,
    isLoading,
    hasAdminAccess,
    createMenuMutation,
    updateMenuMutation,
    deleteMenuMutation,
    currentWeekStart,
    navigateWeek,
  } = useCafeteria();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<CafeteriaMenu | null>(null);

  const handleCreateMenu = () => {
    setSelectedMenu(null);
    setIsDialogOpen(true);
  };

  const handleEditMenu = (menu: CafeteriaMenu) => {
    setSelectedMenu(menu);
    setIsDialogOpen(true);
  };

  const handleDeleteMenu = (menuId: string) => {
    if (confirm("Are you sure you want to delete this menu?")) {
      deleteMenuMutation.mutate(menuId);
    }
  };

  const formatWeekRange = (weekStart: Date) => {
    const start = new Date(weekStart);
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 4);

    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  const getDayMenu = (dayOfWeek: string) => {
    return currentWeekMenu?.find((menu) => menu.dayOfWeek === dayOfWeek);
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  if (isLoading) {
    return <div className="p-6">Loading menu...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cafeteria Menu</h1>
          <p className="text-muted-foreground">
            Weekly meal schedule and dietary information
          </p>
        </div>
        {hasAdminAccess && (
          <Button onClick={handleCreateMenu}>
            <Plus className="mr-2 h-4 w-4" />
            Add Menu Item
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <UtensilsCrossed className="mr-2 h-5 w-5" />
              Week of {formatWeekRange(currentWeekStart)}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek(-1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateWeek(0)}>
                Current Week
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateWeek(1)}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {days.map((day) => {
              const menu = getDayMenu(day);
              return (
                <Card key={day}>
                  <CardHeader>
                    <CardTitle className="text-base">{day}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {menu ? (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          {Array.isArray(menu.menuItems) ? (
                            menu.menuItems.map((item: unknown, index: number) => (
                              <div
                                key={index}
                                className="text-sm"
                              >
                                {typeof item === "string"
                                  ? item
                                  : JSON.stringify(item)}
                              </div>
                            ))
                          ) : (
                            <div className="text-sm">
                              {JSON.stringify(menu.menuItems)}
                            </div>
                          )}
                        </div>
                        {menu.specialNotes && (
                          <Badge variant="secondary" className="text-xs">
                            {menu.specialNotes}
                          </Badge>
                        )}
                        {hasAdminAccess && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditMenu(menu)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteMenu(menu.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="py-4 text-center text-sm text-muted-foreground">
                        No menu available
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {hasAdminAccess && (
        <MenuDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          menu={selectedMenu}
          weekStartDate={currentWeekStart}
          onSubmit={(data) => {
            if (selectedMenu) {
              updateMenuMutation.mutate({ menuId: selectedMenu.id, data });
            } else {
              createMenuMutation.mutate(data);
            }
            setIsDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}
