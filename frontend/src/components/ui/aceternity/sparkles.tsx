"use client";
import { cn } from "@/lib/utils";
import React from "react";

export const Sparkles = ({
  children,
  className,
  background,
}: {
  children: React.ReactNode;
  className?: string;
  background?: string;
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className={cn("group relative inline-block", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className={cn(
          "relative z-10 inline-block transition-all duration-300",
          isHovered && "scale-110"
        )}
      >
        {children}
      </span>
      <div
        className={cn(
          "absolute inset-0 -z-10 rounded-lg opacity-0 transition-opacity duration-300",
          background || "bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20",
          isHovered && "opacity-100"
        )}
      />
      <div
        className={cn(
          "absolute inset-0 -z-20 rounded-lg blur-xl opacity-0 transition-opacity duration-300",
          background || "bg-gradient-to-r from-blue-600/40 via-purple-600/40 to-pink-600/40",
          isHovered && "opacity-100"
        )}
      />
    </div>
  );
};
