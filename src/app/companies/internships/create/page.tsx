'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import InternshipForm from '@/app/Components/InternshipForm';
import styles from './create.module.css';

const CreateInternshipPage: React.FC = () => {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/companies/internships');
  };

  const handleCancel = () => {
    router.push('/companies/internships');
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Создание стажировки</h1>
          <p className={styles.subtitle}>
            Создайте предложение стажировки для привлечения талантливых студентов
          </p>
        </div>
      </div>

      <InternshipForm 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CreateInternshipPage;
