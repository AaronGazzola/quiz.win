"use client";
import Image from "next/image";
import { comfortaa } from "@/styles/fonts";
import { cn } from "@/lib/utils";
import UserMenu from "@/components/UserMenu";
import configuration from "@/lib/configuration";
import Link from "next/link";

const Header = () => {
  return (
    <>
      <header className="sticky top-0 left-0 right-0 w-full min-h-12 px-4 py-2 bg-black/50 flex items-center justify-between">
        <Link
          href={configuration.paths.appHome}
          className="flex items-center gap-4 "
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
              "text-gray-100 text-2xl tracking-wider font-black",
              comfortaa.className
            )}
          >
            Quiz.Win
          </h1>
        </Link>
        <UserMenu />
      </header>
    </>
  );
};

export default Header;
