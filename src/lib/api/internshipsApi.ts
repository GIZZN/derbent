import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { handleAuthError, determineErrorContext } from '../authErrorHandler';

// Enums for internship status
export enum InternshipStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Main interface for internship
export interface Internship {
  id: string;
  companyId?: string;
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  location: string;
  isRemote: boolean;
  startDate: string;
  endDate: string;
  duration: number; // in days
  maxParticipants: number;
  deadline?: string;
  status: InternshipStatus;
  applicationsCount: number;
  moderationStatus?: string;
  createdAt: string;
  updatedAt: string;
  company?: {
    id: string;
    name: string;
    logo?: string;
    description?: string;
  };
  skills?: string[];
  tags?: string[];
  applications?: InternshipApplication[];
  _count?: {
    applications: number;
    participants: number;
  };
  // Поля для отображения статуса заявки пользователя
  hasApplied?: boolean;
  applicationStatus?: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  appliedAt?: string;
  applicationId?: string;
  applicationCoverLetter?: string;
  applicationNotes?: string | null;
}

// Internship application
export interface InternshipApplication {
  id: string;
  internshipId: string;
  studentId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  appliedAt: string;
  updatedAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    university: string;
    resume?: {
      id: string;
      title: string;
    };
  };
}

// DTO for creating internship
export interface CreateInternshipDto {
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  benefits: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  location: string;
  isRemote: boolean;
  startDate: string;
  endDate: string;
  duration: number;
  maxParticipants: number;
  deadline: string;
  skills: string[];
  tags: string[];
}

// DTO for updating internship
export interface UpdateInternshipDto {
  title?: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  location?: string;
  isRemote?: boolean;
  startDate?: string;
  endDate?: string;
  duration?: number;
  maxParticipants?: number;
  deadline?: string;
  skills?: string[];
  tags?: string[];
  status?: InternshipStatus;
}

// Query parameters for filtering internships
export interface InternshipQueryDto {
  search?: string;
  location?: string;
  isRemote?: boolean;
  skills?: string;
  tags?: string;
  salaryMin?: number;
  salaryMax?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Response type for paginated internships
export interface InternshipsResponse {
  internships: Internship[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// DTO for applying to internship
export interface ApplyToInternshipDto {
  internshipId: string;
  coverLetter: string;
}

// Base URL helper
const getBaseUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://smartmatch-three.vercel.app/';
  return backendUrl.replace(/\/$/, '');
};

export const internshipsApi = createApi({
  reducerPath: 'internshipsApi',
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
  tagTypes: ['Internship', 'InternshipApplication'],
  endpoints: (builder) => ({
    // Create new internship (COMPANY only)
    createInternship: builder.mutation<Internship, CreateInternshipDto>({
      query: (internshipData) => ({
        url: '/internships',
        method: 'POST',
        body: internshipData,
      }),
      invalidatesTags: ['Internship'],
    }),

    // Get all internships with filtering
    getInternships: builder.query<InternshipsResponse, InternshipQueryDto | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        
        // Basic filters
        if (params?.search) searchParams.append('search', params.search);
        if (params?.location) searchParams.append('location', params.location);
        if (params?.isRemote !== undefined) searchParams.append('isRemote', params.isRemote.toString());
        if (params?.skills) searchParams.append('skills', params.skills);
        if (params?.tags) searchParams.append('tags', params.tags);
        if (params?.salaryMin) searchParams.append('salaryMin', params.salaryMin.toString());
        if (params?.salaryMax) searchParams.append('salaryMax', params.salaryMax.toString());
        
        // Pagination
        if (params?.page && params.page > 0) searchParams.append('page', params.page.toString());
        if (params?.limit && params.limit > 0) searchParams.append('limit', params.limit.toString());
        
        // Sorting
        if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

        const queryString = searchParams.toString();
        return `/internships${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Internship'],
    }),

    // Get company's own internships
    getMyInternships: builder.query<InternshipsResponse, void>({
      query: () => '/internships/my',
      providesTags: ['Internship'],
    }),

    // Get specific internship by ID
    getInternshipById: builder.query<Internship, string>({
      query: (id) => `/internships/${id}`,
      providesTags: (result, error, id) => [{ type: 'Internship', id }],
    }),

    // Update internship (COMPANY only)
    updateInternship: builder.mutation<Internship, { id: string; data: UpdateInternshipDto }>({
      query: ({ id, data }) => ({
        url: `/internships/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Internship', id },
        'Internship',
      ],
    }),

    // Delete internship (COMPANY only)
    deleteInternship: builder.mutation<void, string>({
      query: (id) => ({
        url: `/internships/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Internship', id },
        'Internship',
      ],
    }),

    // Update internship status
    updateInternshipStatus: builder.mutation<Internship, { 
      id: string; 
      status: InternshipStatus; 
    }>({
      query: ({ id, status }) => ({
        url: `/internships/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Internship', id },
        'Internship',
      ],
    }),

    // Apply to internship (STUDENT only)
    applyToInternship: builder.mutation<InternshipApplication, ApplyToInternshipDto>({
      query: (applicationData) => ({
        url: '/internships/apply',
        method: 'POST',
        body: applicationData,
      }),
      invalidatesTags: ['InternshipApplication', 'Internship'],
    }),

    // Get internship applications (COMPANY only)
    getInternshipApplications: builder.query<InternshipApplication[], string>({
      query: (internshipId) => `/internships/${internshipId}/applications`,
      providesTags: (result, error, internshipId) => [
        { type: 'InternshipApplication', id: internshipId }
      ],
    }),

    // Update application status (COMPANY only)
    updateApplicationStatus: builder.mutation<InternshipApplication, {
      internshipId: string;
      applicationId: string;
      status: 'ACCEPTED' | 'REJECTED';
    }>({
      query: ({ internshipId, applicationId, status }) => ({
        url: `/internships/${internshipId}/applications/${applicationId}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { internshipId }) => [
        { type: 'InternshipApplication', id: internshipId },
        'InternshipApplication',
      ],
    }),

    // Get student's applications
    getMyApplications: builder.query<InternshipApplication[], void>({
      query: () => '/internships/my-applications',
      providesTags: ['InternshipApplication'],
    }),
  }),
});

export const {
  useCreateInternshipMutation,
  useGetInternshipsQuery,
  useGetMyInternshipsQuery,
  useGetInternshipByIdQuery,
  useUpdateInternshipMutation,
  useDeleteInternshipMutation,
  useUpdateInternshipStatusMutation,
  useApplyToInternshipMutation,
  useGetInternshipApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useGetMyApplicationsQuery,
} = internshipsApi;
