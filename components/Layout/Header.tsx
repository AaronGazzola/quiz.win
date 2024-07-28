"use client";
import Image from "next/image";
import { comfortaa } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import UserMenu from "@/components/UserMenu";
import configuration from "@/lib/configuration";
import Link from "next/link";
import { Drawer } from "@/components/Drawer";
import { Direction } from "@/types/util.types";
import { Button } from "@/components/ui/button";
import { Flame, Gem, Heart, Shield, Sparkle, Sparkles } from "lucide-react";

const Header = () => {
  return (
    <>
      <header
        className={cn(
          "sticky top-0 left-0 right-0 w-full min-h-12 flex items-stretch backdrop-blur-lg bg-transparent shadow-md justify-between"
        )}
      >
        <Link
          href={configuration.paths.appHome}
          className="flex items-center gap-2 sm:gap-4 px-2 sm:px-4"
        >
          <Image
            src="/images/logo.png"
            alt="Quiz.Win logo"
            width={738}
            height={738}
            className="w-7"
          />
          <h1
            className={cn(
              "text-gray-100 text-2xl tracking-wider font-black mt-1",
              comfortaa.className
            )}
          >
            Quiz.Win
          </h1>
        </Link>
        <div className="flex-grow relative overflow-hidden">
          <div className="flex items-center absolute top-0 right-0">
            {[
              {
                icon: <Heart className="stroke-[3px]" />,
                className: "dark:text-red-400 bg-red-500/20",
              },
              {
                icon: <Sparkle />,
                className: "dark:text-blue-300 bg-blue-500/20",
              },
              {
                icon: <Gem />,
                className: "dark:text-green-400 bg-green-500/20",
              },
            ].map(({ icon, className }, index) => (
              <Button
                key={index}
                variant="ghost"
                className="p-4 h-12 rounded-tr-none hover:bg-gray-500/50 border-none  dark:hover:text-white outline-none group px-1 sm:px-4"
              >
                <div
                  className={cn(
                    "w-7 h-10 rounded-full flex flex-col items-center justify-center py-1 group-hover:dark:text-white",
                    className
                  )}
                >
                  {icon}
                  <span className="font-bold text-xs">10</span>
                </div>
              </Button>
            ))}

            <Drawer side={Direction.Right} />
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
