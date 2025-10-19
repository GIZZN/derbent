import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вакансии - ТЕХНОПОЛИС МОСКВА | Найди работу мечты",
  description: "Более 50,000 актуальных вакансий от лучших компаний. Найди идеальную работу с помощью умного поиска и персональных рекомендаций.",
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
