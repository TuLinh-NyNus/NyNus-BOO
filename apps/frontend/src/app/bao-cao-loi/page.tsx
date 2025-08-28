import { Metadata } from "next";
import { BugReportForm } from "./bug-report-form";

export const metadata: Metadata = {
  title: "Báo cáo lỗi - NyNus",
  description: "Báo cáo lỗi hoặc vấn đề gặp phải khi sử dụng NyNus để chúng tôi có thể khắc phục nhanh chóng.",
  keywords: "báo cáo lỗi, bug report, hỗ trợ kỹ thuật, NyNus, lỗi",
  openGraph: {
    title: "Báo cáo lỗi - NyNus",
    description: "Báo cáo lỗi để cải thiện trải nghiệm sử dụng NyNus",
    type: "website",
  }
};

export default function BugReportPage() {
  return <BugReportForm />;
}
