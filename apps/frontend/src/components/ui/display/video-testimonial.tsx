"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoTestimonialProps {
  id: number;
  name: string;
  role: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  content: string;
  className?: string;
  onPlay?: (videoData: { id: number; name: string; videoUrl: string }) => void;
}

export const VideoTestimonial: React.FC<VideoTestimonialProps> = ({
  id,
  name,
  role,
  videoUrl,
  thumbnailUrl,
  duration,
  content,
  className,
  onPlay
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handlePlayClick = () => {
    onPlay?.({ id, name, videoUrl });
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <motion.div
      className={cn(
        "group relative bg-card border border-border rounded-2xl overflow-hidden cursor-pointer",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
      onClick={handlePlayClick}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video overflow-hidden">
        {!imageError ? (
          <motion.img
            src={thumbnailUrl}
            alt={`Thumbnail của ${name}`}
            className="w-full h-full object-cover transition-transform duration-500"
            onError={handleImageError}
            loading="lazy"
            whileHover={{ scale: 1.05 }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <User className="w-16 h-16 text-primary/40" />
          </div>
        )}

        {/* Play Button Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
          </motion.div>
        </motion.div>

        {/* Duration Badge */}
        <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {duration}
        </div>

        {/* Hover Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Quote Icon */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xs text-muted-foreground">
            Video Testimonial
          </div>
        </div>

        {/* Content Text */}
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
          {content}
        </p>

        {/* Author Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm">
              {name}
            </div>
            <div className="text-xs text-muted-foreground">
              {role}
            </div>
          </div>
        </div>

        {/* Play Button Text */}
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="inline-flex items-center gap-2 text-primary text-sm font-medium">
            <Play className="w-4 h-4" />
            Xem video
          </div>
        </motion.div>
      </div>

      {/* Hover Border Effect */}
      <motion.div
        className="absolute inset-0 border-2 border-primary/20 rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};
