import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Резюме - Технополис | Создай идеальное резюме',
  description: 'Создай профессиональное резюме с нашим удобным редактором. Заполни информацию о себе, опыте работы и навыках.',
};

export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
