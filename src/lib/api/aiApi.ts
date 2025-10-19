import { API_CONFIG } from '../../config/api';
import { Resume } from './resumesApi';

export interface AIChatRequest {
  message: string;
  model?: string;
}

export interface AIChatResponse {
  success: boolean;
  data?: {
    response: string;
  };
  error?: string;
  processingTime: number;
}

export interface ResumeAnalysisRequest {
  resumeText: string;           // ОБЯЗАТЕЛЬНО - Текст резюме для анализа
  model?: string;               // ОПЦИОНАЛЬНО - Модель AI (по умолчанию 'gemma3:latest')
}

export interface ResumeAnalysisResponse {
  success: boolean;
  data?: {
    overall_score: number;                   // Общая оценка резюме от 1 до 10
    strengths: string[];                     // Сильные стороны резюме
    weaknesses: string[];                   // Слабые стороны резюме
    improvements: string[];                 // Предложения по улучшению
    structure_recommendations: string[];     // Рекомендации по структуре
    content_recommendations: string[];       // Советы по содержанию
    keywords_to_add: string[];              // Ключевые слова для добавления
  };
  error?: string;
  processingTime: number;
}

/**
 * Отправляет сообщение в AI чат
 * @param message - Текст сообщения для AI
 * @param model - Модель AI (по умолчанию 'gemma3:latest')
 * @returns Promise с ответом AI
 */
export async function sendAIChatMessage(
  message: string, 
  model: string = 'gemma3:latest'
): Promise<AIChatResponse> {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/ai-test/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        model
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AIChatResponse = await response.json();
    return data;
  } catch (error) {
    console.error('AI Chat API Error:', error);
    
    // Возвращаем ошибку в том же формате, что ожидает компонент
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      processingTime: 0
    };
  }
}

/**
 * Конвертирует данные резюме в текстовый формат для анализа
 * @param resume - Объект резюме
 * @returns Текстовое представление резюме
 */
export function convertResumeToText(resume: Resume): string {
  let text = '';
  
  // Заголовок и основная информация
  text += `${resume.title}\n`;
  if (resume.summary) {
    text += `\nКРАТКОЕ ОПИСАНИЕ:\n${resume.summary}\n`;
  }
  if (resume.objective) {
    text += `\nЦЕЛЬ:\n${resume.objective}\n`;
  }
  
  // Опыт работы
  if (resume.experiences && resume.experiences.length > 0) {
    text += '\nОПЫТ РАБОТЫ:\n';
    resume.experiences.forEach((exp, index) => {
      text += `${index + 1}. ${exp.position} в ${exp.company}`;
      if (exp.startDate) {
        text += ` (${exp.startDate}`;
        if (exp.endDate) {
          text += ` - ${exp.endDate}`;
        } else if (exp.isCurrent) {
          text += ' - настоящее время';
        }
        text += ')';
      }
      text += '\n';
      
      if (exp.description) {
        text += `   ${exp.description}\n`;
      }
      
      if (exp.achievements && exp.achievements.length > 0) {
        text += '   Достижения:\n';
        exp.achievements.forEach(achievement => {
          text += `   - ${achievement}\n`;
        });
      }
      
      if (exp.technologies && exp.technologies.length > 0) {
        text += `   Технологии: ${exp.technologies.join(', ')}\n`;
      }
      text += '\n';
    });
  }
  
  // Навыки
  if (resume.skills && resume.skills.length > 0) {
    text += 'НАВЫКИ:\n';
    resume.skills.forEach(skill => {
      text += `- ${skill.name}`;
      if (skill.level) {
        text += ` (уровень: ${skill.level}/5)`;
      }
      if (skill.category) {
        text += ` [${skill.category}]`;
      }
      text += '\n';
    });
    text += '\n';
  }
  
  // Образование
  if (resume.educations && resume.educations.length > 0) {
    text += 'ОБРАЗОВАНИЕ:\n';
    resume.educations.forEach((edu, index) => {
      text += `${index + 1}. ${edu.degree} по специальности "${edu.field}"`;
      if (edu.institution) {
        text += ` в ${edu.institution}`;
      }
      if (edu.startDate) {
        text += ` (${edu.startDate}`;
        if (edu.endDate) {
          text += ` - ${edu.endDate}`;
        } else if (edu.isCurrent) {
          text += ' - настоящее время';
        }
        text += ')';
      }
      if (edu.gpa) {
        text += `, GPA: ${edu.gpa}`;
      }
      text += '\n';
      
      if (edu.description) {
        text += `   ${edu.description}\n`;
      }
    });
    text += '\n';
  }
  
  // Проекты
  if (resume.projects && resume.projects.length > 0) {
    text += 'ПРОЕКТЫ:\n';
    resume.projects.forEach((project, index) => {
      text += `${index + 1}. ${project.name}`;
      if (project.startDate) {
        text += ` (${project.startDate}`;
        if (project.endDate) {
          text += ` - ${project.endDate}`;
        } else if (project.isCurrent) {
          text += ' - настоящее время';
        }
        text += ')';
      }
      text += '\n';
      
      if (project.description) {
        text += `   ${project.description}\n`;
      }
      
      if (project.technologies && project.technologies.length > 0) {
        text += `   Технологии: ${project.technologies.join(', ')}\n`;
      }
      
      if (project.url) {
        text += `   Ссылка: ${project.url}\n`;
      }
      if (project.githubUrl) {
        text += `   GitHub: ${project.githubUrl}\n`;
      }
      text += '\n';
    });
  }
  
  // Достижения
  if (resume.achievements && resume.achievements.length > 0) {
    text += 'ДОСТИЖЕНИЯ:\n';
    resume.achievements.forEach((achievement, index) => {
      text += `${index + 1}. ${achievement.title}`;
      if (achievement.date) {
        text += ` (${achievement.date})`;
      }
      text += '\n';
      if (achievement.description) {
        text += `   ${achievement.description}\n`;
      }
      if (achievement.category) {
        text += `   Категория: ${achievement.category}\n`;
      }
      text += '\n';
    });
  }
  
  // Языки
  if (resume.languages && resume.languages.length > 0) {
    text += 'ЯЗЫКИ:\n';
    resume.languages.forEach(lang => {
      text += `- ${lang.name} (${lang.level})`;
      if (lang.certification) {
        text += ` - ${lang.certification}`;
      }
      text += '\n';
    });
    text += '\n';
  }
  
  // Сертификаты
  if (resume.certifications && resume.certifications.length > 0) {
    text += 'СЕРТИФИКАТЫ:\n';
    resume.certifications.forEach((cert, index) => {
      text += `${index + 1}. ${cert.name}`;
      if (cert.issuer) {
        text += ` от ${cert.issuer}`;
      }
      if (cert.date) {
        text += ` (${cert.date})`;
      }
      if (cert.credentialId) {
        text += `, ID: ${cert.credentialId}`;
      }
      text += '\n';
      
      if (cert.url) {
        text += `   Ссылка: ${cert.url}\n`;
      }
    });
  }
  
  return text.trim();
}

/**
 * Анализирует резюме с помощью AI
 * @param resumeText - Текст резюме для анализа
 * @param model - Модель AI (по умолчанию 'gemma3:latest')
 * @returns Promise с результатом анализа
 */
export async function analyzeResume(
  resumeText: string,
  model: string = 'gemma3:latest'
): Promise<ResumeAnalysisResponse> {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/ai-public/analyze-resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeText,
        model
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ResumeAnalysisResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Resume Analysis API Error:', error);
    
    // Возвращаем ошибку в том же формате, что ожидает компонент
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка',
      processingTime: 0
    };
  }
}

/**
 * Проверяет доступность AI сервиса
 * @returns Promise<boolean> - true если сервис доступен
 */
export async function checkAIServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/ai-test/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'test'
      }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('AI Service Health Check Failed:', error);
    return false;
  }
}

// ===== HR AI ANALYSIS API =====

export interface JobCandidateAnalysis {
  candidateId: string;
  applicationId: string;
  overallScore: number;           // 1-10
  matchScore: number;             // 0-100%
  fitLevel: 'low' | 'medium' | 'high';
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  aiNotes: string;
}

export interface JobAnalysisResponse {
  success: boolean;
  data?: {
    jobId: string;
    totalApplications: number;
    topCandidates: JobCandidateAnalysis[];
    analysisSummary: string;
    processingTime: number;
  };
  error?: string;
  message?: string;
}

export interface HealthCheckResponse {
  success: boolean;
  data?: {
    healthy: boolean;
    message: string;
  };
  error?: string;
}

export interface JobAnalysisRequest {
  jobId: string;
}

/**
 * Анализирует всех кандидатов на вакансию с помощью AI
 * @param jobId - ID вакансии для анализа
 * @param hrToken - Bearer token для авторизации HR
 * @returns Promise с результатами анализа кандидатов
 */
export async function analyzeJobCandidates(jobId: string, hrToken?: string): Promise<JobAnalysisResponse> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Добавляем Bearer token если предоставлен
    if (hrToken) {
      headers['Authorization'] = `Bearer ${hrToken}`;
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/hr-ai/analyze-job-candidates`, {
      method: 'POST',
      headers,
      credentials: 'include', // Для авторизации через cookies как fallback
      body: JSON.stringify({ jobId }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      // Обработка специфичных ошибок согласно документации
      switch (response.status) {
        case 400:
          errorMessage = 'Неверные параметры запроса';
          break;
        case 403:
          errorMessage = 'Нет прав доступа к вакансии';
          break;
        case 404:
          errorMessage = 'Вакансия не найдена';
          break;
        case 500:
          errorMessage = 'Ошибка AI сервиса';
          break;
        default:
          errorMessage += `, message: ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data: JobAnalysisResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Job Candidates Analysis API Error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка',
    };
  }
}

/**
 * Получает результаты анализа вакансии
 * @param jobId - ID вакансии
 * @param hrToken - Bearer token для авторизации HR
 * @returns Promise с результатами анализа
 */
export async function getJobAnalysisResults(jobId: string, hrToken?: string): Promise<JobAnalysisResponse> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Добавляем Bearer token если предоставлен
    if (hrToken) {
      headers['Authorization'] = `Bearer ${hrToken}`;
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/hr-ai/job/${jobId}/analysis`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      // Обработка специфичных ошибок согласно документации
      switch (response.status) {
        case 400:
          errorMessage = 'Неверные параметры запроса';
          break;
        case 403:
          errorMessage = 'Нет прав доступа к вакансии';
          break;
        case 404:
          errorMessage = 'Вакансия не найдена';
          break;
        case 500:
          errorMessage = 'Ошибка AI сервиса';
          break;
        default:
          errorMessage += `, message: ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data: JobAnalysisResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Get Job Analysis Results API Error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка',
    };
  }
}

/**
 * Проверяет доступность HR AI сервиса
 * @param hrToken - Bearer token для авторизации HR
 * @returns Promise с результатом проверки
 */
export async function checkHRAIServiceHealth(hrToken?: string): Promise<HealthCheckResponse> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Добавляем Bearer token если предоставлен
    if (hrToken) {
      headers['Authorization'] = `Bearer ${hrToken}`;
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/hr-ai/health`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      // Обработка специфичных ошибок согласно документации
      switch (response.status) {
        case 400:
          errorMessage = 'Неверные параметры запроса';
          break;
        case 403:
          errorMessage = 'Нет прав доступа';
          break;
        case 500:
          errorMessage = 'Ошибка AI сервиса';
          break;
        default:
          errorMessage += `, message: ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data: HealthCheckResponse = await response.json();
    return data;
  } catch (error) {
    console.error('HR AI Service Health Check Failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка'
    };
  }
}