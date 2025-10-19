import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { handleAuthError, determineErrorContext } from '../authErrorHandler';

// Интерфейс для навыка в резюме
export interface ResumeSkill {
  name: string;
  level: number; // 1-5
  category?: string;
}

// Интерфейс для опыта работы
export interface ResumeExperience {
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  achievements?: string[];
  technologies?: string[];
}

// Интерфейс для образования
export interface ResumeEducation {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  gpa?: number;
  description?: string;
}

// Интерфейс для проектов
export interface ResumeProject {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  technologies: string[];
  url?: string;
  githubUrl?: string;
}

// Интерфейс для достижений
export interface ResumeAchievement {
  title: string;
  description: string;
  date: string;
  category: string;
}

// Интерфейс для языков
export interface ResumeLanguage {
  name: string;
  level: 'Basic' | 'Elementary' | 'Intermediate' | 'Upper-Intermediate' | 'Advanced' | 'Fluent' | 'Native';
  certification?: string;
}

// Интерфейс для сертификатов
export interface ResumeCertification {
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
  url?: string;
}

// Интерфейс для создания резюме
export interface CreateResumeDto {
  title: string;
  summary?: string;
  objective?: string;
  skills?: ResumeSkill[];
  experiences?: ResumeExperience[];
  educations?: ResumeEducation[];
  projects?: ResumeProject[];
  achievements?: ResumeAchievement[];
  languages?: ResumeLanguage[];
  certifications?: ResumeCertification[];
  isDefault?: boolean;
  isPublic?: boolean;
}

// Интерфейс для обновления резюме
export interface UpdateResumeDto {
  title?: string;
  summary?: string;
  objective?: string;
  skills?: ResumeSkill[];
  experiences?: ResumeExperience[];
  educations?: ResumeEducation[];
  projects?: ResumeProject[];
  achievements?: ResumeAchievement[];
  languages?: ResumeLanguage[];
  certifications?: ResumeCertification[];
  isDefault?: boolean;
  isPublic?: boolean;
}

// Интерфейс для резюме
export interface Resume {
  id: string;
  candidateId: string;
  title: string;
  summary?: string;
  objective?: string;
  skills?: ResumeSkill[];
  experiences?: ResumeExperience[];
  educations?: ResumeEducation[];
  projects?: ResumeProject[];
  achievements?: ResumeAchievement[];
  languages?: ResumeLanguage[];
  certifications?: ResumeCertification[];
  isDefault: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

// Интерфейс для запроса списка резюме
export interface GetResumesQuery {
  page?: number;
  limit?: number;
  search?: string;
  isDefault?: boolean;
  isPublic?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// Интерфейс для ответа списка резюме
export interface ResumesResponse {
  resumes: Resume[];
  total: number;
  page: number;
  limit: number;
}

// Базовый URL
const getBaseUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://smartmatch-three.vercel.app/';
  return backendUrl.replace(/\/$/, '');
};

export const resumesApi = createApi({
  reducerPath: 'resumesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      return headers;
    },
    credentials: 'include', // For httpOnly cookies auth
    fetchFn: async (input, init) => {
      const response = await fetch(input, init);
      
      // Логирование для отладки (только в development)
      if (process.env.NODE_ENV === 'development') {
        console.log('API Request:', {
          url: input,
          method: init?.method,
          status: response.status,
          statusText: response.statusText
        });
      }
      
      // Обработка ошибок авторизации с контекстом
      if (!response.ok) {
        const errorText = await response.text();
        const url = typeof input === 'string' ? input : input.url;
        const context = determineErrorContext(errorText, url);
        
        handleAuthError(response.status, response, context);
      }
      
      return response;
    },
  }),
  tagTypes: ['Resume'],
  endpoints: (builder) => ({
    // Создать новое резюме
    createResume: builder.mutation<Resume, CreateResumeDto>({
      query: (resumeData) => ({
        url: '/resumes',
        method: 'POST',
        body: resumeData,
      }),
      invalidatesTags: ['Resume'],
    }),

    // Получить список резюме с пагинацией и фильтрами
    getResumes: builder.query<ResumesResponse, GetResumesQuery | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.search) searchParams.append('search', params.search);
        if (params?.isDefault !== undefined) searchParams.append('isDefault', params.isDefault.toString());
        if (params?.isPublic !== undefined) searchParams.append('isPublic', params.isPublic.toString());
        if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
        
        const queryString = searchParams.toString();
        return `/resumes${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: ResumesResponse) => {
        // API возвращает объект с полями resumes, total, page, limit
        return response;
      },
      providesTags: ['Resume'],
    }),

    // Получить резюме по ID
    getResumeById: builder.query<Resume, string>({
      query: (id) => `/resumes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Resume', id }],
    }),

    // Обновить резюме (PUT)
    updateResume: builder.mutation<Resume, { id: string; data: UpdateResumeDto }>({
      query: ({ id, data }) => ({
        url: `/resumes/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Resume', id },
        'Resume',
      ],
    }),

    // Удалить резюме
    deleteResume: builder.mutation<void, string>({
      query: (id) => ({
        url: `/resumes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Resume', id },
        'Resume',
      ],
    }),

    // Получить основное резюме
    getDefaultResume: builder.query<Resume, void>({
      query: () => '/resumes/default',
      providesTags: ['Resume'],
    }),

    // Установить основное резюме
    setDefaultResume: builder.mutation<Resume, string>({
      query: (id) => ({
        url: `/resumes/${id}/set-default`,
        method: 'POST',
      }),
      invalidatesTags: ['Resume'],
    }),

    // Дублировать резюме
    duplicateResume: builder.mutation<Resume, { id: string; title: string }>({
      query: ({ id, title }) => ({
        url: `/resumes/${id}/duplicate`,
        method: 'POST',
        body: { title },
      }),
      invalidatesTags: ['Resume'],
    }),
  }),
});

export const {
  useCreateResumeMutation,
  useGetResumesQuery,
  useGetResumeByIdQuery,
  useUpdateResumeMutation,
  useDeleteResumeMutation,
  useGetDefaultResumeQuery,
  useSetDefaultResumeMutation,
  useDuplicateResumeMutation,
} = resumesApi;
