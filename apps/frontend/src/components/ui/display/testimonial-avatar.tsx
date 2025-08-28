"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestimonialAvatarProps {
  src: string;
  alt: string;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showBorder?: boolean;
}

export const TestimonialAvatar: React.FC<TestimonialAvatarProps> = ({
  src,
  alt,
  name,
  size = "md",
  className,
  showBorder = true
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const sizeClasses = {
    sm: "w-10 h-10 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base"
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <motion.div
      className={cn(
        "relative rounded-full overflow-hidden",
        sizeClasses[size],
        showBorder && "ring-2 ring-primary/20",
        className
      )}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
    >
      {!imageError ? (
        <>
          {/* Loading state */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
              <User className="w-1/2 h-1/2 text-muted-foreground" />
            </div>
          )}
          
          {/* Real image */}
          <motion.img
            src={src}
            alt={alt}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
          />
        </>
      ) : (
        /* Fallback initials */
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
          <span className="font-semibold text-primary">
            {getInitials(name)}
          </span>
        </div>
      )}
      
      {/* Hover effect */}
      <motion.div
        className="absolute inset-0 bg-primary/10 opacity-0 hover:opacity-100 transition-opacity duration-200"
        whileHover={{ opacity: 0.1 }}
      />
    </motion.div>
  );
};
