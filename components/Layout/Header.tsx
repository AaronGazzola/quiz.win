"use client";
import Image from "next/image";
import { rubik } from "@/styles/fonts";
import { cn } from "@/lib/utils";

const Header = () => {
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
      </header>
    </>
  );
};

export default Header;
