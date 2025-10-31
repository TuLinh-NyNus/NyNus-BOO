import React from "react";

export const metadata = {
  title: "Focus Room - NyNus",
  description: "Không gian học tập tập trung với Pomodoro Timer",
};

/**
 * Focus Room Layout
 * Layout wrapper cho tất cả focus room pages
 */
export default function FocusRoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {children}
    </div>
  );
}


