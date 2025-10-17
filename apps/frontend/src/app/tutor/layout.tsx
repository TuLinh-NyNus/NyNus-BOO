import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tutor Dashboard - NyNus",
  description: "Bảng điều khiển gia sư - Quản lý buổi học, học sinh và tài liệu",
};

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

