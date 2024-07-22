"use client";
import Image from "next/image";
import { rubik } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

const Header = () => {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [userMenuIsOpen, setUserMenuIsOpen] = useState(false);
  const [themeMenuIsOpen, setThemeMenuIsOpen] = useState(false);

  const onUsetMenuOpenChange = (open: boolean) => {
    if (themeMenuIsOpen) return;
    setUserMenuIsOpen(open);
  };

  const onThemeMenuOpenChange = (open: boolean) => {
    setThemeMenuIsOpen(open);
  };

  return (
    <>
      <header className="sticky top-0 left-0 right-0 w-full min-h-12 px-4 py-2 bg-black/50 flex items-center justify-between">
        <div className="flex items-center gap-4 ">
          <Image
            src="/images/logo.png"
            alt="Quiz.Win logo"
            width={738}
            height={738}
            className="w-8"
          />
          <h1
            className={cn(
              "text-gray-100 text-2xl font-medium tracking-wider",
              rubik.className
            )}
          >
            Quiz.Win
          </h1>
        </div>

        <DropdownMenu
          open={userMenuIsOpen}
          onOpenChange={onUsetMenuOpenChange}
          modal={false}
        >
          <DropdownMenuTrigger>
            <Avatar className="w-8 h-8">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>Az</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              Sign out
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <div className="flex items-center w-full justify-between">
                <Switch
                  id="theme"
                  checked={resolvedTheme === "dark"}
                  onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                  }
                />
                <DropdownMenu
                  open={themeMenuIsOpen}
                  onOpenChange={onThemeMenuOpenChange}
                >
                  <DropdownMenuTrigger>
                    <Button
                      variant="outline"
                      size="icon"
                      className="flex justify-center items-center"
                    >
                      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 " />
                      <span className="sr-only">Toggle theme</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      <div className="flex items-center gap-2">
                        Light
                        {theme === "light" && <Check className="w-3" />}
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      <div className="flex items-center gap-2">
                        Dark
                        {theme === "dark" && <Check className="w-3" />}
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                      <div className="flex items-center gap-2">
                        System
                        {theme === "system" && <Check className="w-3" />}
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    </>
  );
};

export default Header;
