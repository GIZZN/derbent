import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Компании - Технополис | Стажировки и карьерные возможности',
  description: 'Найди стажировку мечты в лучших компаниях. Более 1000 актуальных предложений от топовых работодателей для начала твоей карьеры.',
};

export default function CompaniesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
