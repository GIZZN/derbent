'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { MonthYearSelectProps } from '../../../types';
import styles from './MonthYearSelect.module.css';

export default function MonthYearSelect({ value, onChange, placeholder, disabled }: MonthYearSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const selectRef = useRef<HTMLDivElement>(null);
  
  const today = new Date();
  const selectedDate = useMemo(() => {
    return value ? new Date(value) : null;
  }, [value]);
  
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  useEffect(() => {
    if (selectedDate) {
      setViewDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [selectedDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDisplayValue = () => {
    if (!selectedDate) return placeholder || 'Выберите дату';
    const day = selectedDate.getDate();
    const month = months[selectedDate.getMonth()];
    const year = selectedDate.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(viewDate);
    if (direction === 'next') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setViewDate(newDate);
  };

  const handleDateSelect = (day: number) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth() + 1;
    const formattedMonth = month.toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    onChange(`${year}-${formattedMonth}-${formattedDay}`);
    setIsOpen(false);
  };

  const handleTodayClick = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    onChange(`${year}-${month}-${day}`);
    setViewDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setIsOpen(false);
  };

  const getDaysInMonth = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    // Получаем первый день месяца и количество дней
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Получаем день недели первого дня (0 = воскресенье, нужно преобразовать в понедельник = 0)
    let firstWeekDay = firstDay.getDay();
    firstWeekDay = firstWeekDay === 0 ? 6 : firstWeekDay - 1;
    
    // Создаем массив дней
    const days = [];
    
    // Добавляем пустые ячейки для дней предыдущего месяца
    for (let i = 0; i < firstWeekDay; i++) {
      days.push(null);
    }
    
    // Добавляем дни текущего месяца
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    return (
      viewDate.getFullYear() === today.getFullYear() &&
      viewDate.getMonth() === today.getMonth() &&
      day === today.getDate()
    );
  };

  const isSelected = (day: number | null) => {
    if (!day || !selectedDate) return false;
    return (
      viewDate.getFullYear() === selectedDate.getFullYear() &&
      viewDate.getMonth() === selectedDate.getMonth() &&
      day === selectedDate.getDate()
    );
  };

  return (
    <div className={styles.customSelectContainer} ref={selectRef}>
      <button
        className={`${styles.customSelectButton} ${isOpen ? styles.selectOpen : ''} ${disabled ? styles.disabled : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        type="button"
        disabled={disabled}
      >
        <Calendar size={16} className={styles.calendarIcon} />
        {formatDisplayValue()}
        <ChevronDown 
          className={`${styles.selectArrow} ${isOpen ? styles.selectArrowOpen : ''}`}
          size={16}
        />
      </button>
      {isOpen && !disabled && (
        <div className={styles.fullCalendarDropdown}>
          {/* Header with month/year navigation */}
          <div className={styles.calendarHeader}>
            <button
              onClick={() => navigateMonth('prev')}
              className={styles.navButton}
              type="button"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className={styles.monthYearDisplay}>
              <span className={styles.monthName}>{months[viewDate.getMonth()]}</span>
              <div className={styles.yearControl}>
                <button 
                  className={styles.yearButton}
                  onClick={() => {
                    const newDate = new Date(viewDate);
                    newDate.setFullYear(newDate.getFullYear() - 1);
                    setViewDate(newDate);
                  }}
                  type="button"
                  title="Предыдущий год"
                >
                  −
                </button>
                <span className={styles.yearName}>
                  {viewDate.getFullYear()}
                </span>
                <button 
                  className={styles.yearButton}
                  onClick={() => {
                    const newDate = new Date(viewDate);
                    newDate.setFullYear(newDate.getFullYear() + 1);
                    setViewDate(newDate);
                  }}
                  type="button"
                  title="Следующий год"
                >
                  +
                </button>
              </div>
            </div>
            
            <button
              onClick={() => navigateMonth('next')}
              className={styles.navButton}
              type="button"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Quick Today Button */}
          <div className={styles.todaySection}>
            <button
              onClick={handleTodayClick}
              className={styles.todayButton}
              type="button"
            >
              Сегодня: {today.getDate()} {months[today.getMonth()]}
            </button>
          </div>

          {/* Days of week header */}
          <div className={styles.weekHeader}>
            {weekDays.map((day) => (
              <div key={day} className={styles.weekDay}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className={styles.calendarGrid}>
            {getDaysInMonth().map((day, index) => (
              <button
                key={index}
                className={`${styles.dayButton} ${
                  !day ? styles.emptyDay : ''
                } ${
                  isToday(day) ? styles.todayDay : ''
                } ${
                  isSelected(day) ? styles.selectedDay : ''
                }`}
                onClick={() => day && handleDateSelect(day)}
                type="button"
                disabled={!day}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className={styles.calendarFooter}>
            <button
              onClick={() => setIsOpen(false)}
              className={styles.cancelButton}
              type="button"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
