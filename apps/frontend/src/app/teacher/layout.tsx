import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teacher Dashboard - NyNus",
  description: "Bảng điều khiển giáo viên - Quản lý khóa học, học sinh và bài thi",
};

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

