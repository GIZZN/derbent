import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { handleAuthError, determineErrorContext } from '../authErrorHandler';

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  FREELANCE = 'FREELANCE',
  INTERNSHIP = 'INTERNSHIP'
}

export enum ExperienceLevel {
  NO_EXPERIENCE = 'NO_EXPERIENCE',
  JUNIOR = 'JUNIOR',
  MIDDLE = 'MIDDLE',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD'
}

export interface Job {
  id: string;
  hrId: string;
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  location: string;
  type: JobType;
  status: string;
  experienceLevel: ExperienceLevel;
  remote: boolean;
  publishedAt?: string;
  deadline?: string;
  views: number;
  applicationsCount: number;
  moderationStatus: string;
  moderatedAt?: string;
  moderatorId?: string;
  moderationNotes?: string;
  createdAt: string;
  updatedAt: string;
  hr: {
    company: string;
    firstName: string;
    lastName: string;
  };
  skills: Skill[];
  applications: Application[];
  // Application status fields
  hasApplied?: boolean;
  applicationStatus?: string | null;
  appliedAt?: string | null;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  hrId: string;
  status: string;
  resumeId: string;
  appliedAt: string;
  updatedAt: string;
}

// Detailed application interface for HR view
export interface DetailedApplication {
  id: string;
  status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED' | 'INTERVIEW_SCHEDULED' | 'HIRED' | 'WITHDRAWN';
  coverLetter?: string;
  resumeUrl?: string;
  appliedAt: string;
  notes?: string;
  job: {
    id: string;
    title: string;
    description: string;
    location: string;
    type: JobType;
    status: string;
    hr: {
      id: string;
      company: string;
    };
  };
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profile: {
      skills: string[];
      experience: string;
      education: string;
    };
  };
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface PopularSkill {
  skill: {
    id: string;
    name: string;
    category: string;
  };
  candidateCount: number;
  studentCount: number;
  totalCount: number;
}

// DTO for skill creation - matches curl format exactly
export interface CreateSkillDto {
  name: string;
  category: string;
  description: string;
}

// DTOs for job operations - matches curl format exactly
export interface CreateJobDto {
  title: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  location: string;
  type: JobType;
  experienceLevel: ExperienceLevel;
  remote: boolean;
  deadline?: string;
  skillIds: string[];
}

// DTO for application creation - simplified version (only jobId required)
export interface CreateApplicationDto {
  jobId: string;
}

export interface UpdateJobDto {
  title?: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  location?: string;
  type?: JobType;
  experienceLevel?: ExperienceLevel;
  remote?: boolean;
  deadline?: string;
  skillIds?: string[];
}

// Query parameters - matches curl format exactly
export interface JobQueryDto {
  search?: string;
  location?: string;
  type?: string;
  page?: number;
  skills?: string;
  remote?: boolean;
}

// Response types - matches curl format exactly
export interface JobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Base URL helper
const getBaseUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://smartmatch-three.vercel.app/';
  return backendUrl.replace(/\/$/, '');
};

export const jobsApi = createApi({
  reducerPath: 'jobsApi',
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
  tagTypes: ['Job', 'MyJobs', 'Skill', 'Application'],
  endpoints: (builder) => ({
    // Create new job (HR only)
    createJob: builder.mutation<Job, CreateJobDto>({
      query: (jobData) => ({
        url: '/jobs',
        method: 'POST',
        body: jobData,
      }),
      invalidatesTags: ['Job', 'MyJobs'],
    }),

    // Get all jobs with filtering - matches curl format exactly
    getJobs: builder.query<JobsResponse, JobQueryDto | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        
        // Basic filters
        if (params?.search) searchParams.append('search', params.search);
        if (params?.location) searchParams.append('location', params.location);
        if (params?.type) searchParams.append('type', params.type);
        
        // Skills filter (comma-separated)
        if (params?.skills) searchParams.append('skills', params.skills);
        
        // Remote work filter
        if (params?.remote !== undefined) searchParams.append('remote', params.remote.toString());
        
        // Pagination - only add if valid values
        if (params?.page && params.page > 0) searchParams.append('page', params.page.toString());
        // Removed limit parameter to use API default

        const queryString = searchParams.toString();
        return `/jobs${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Job'],
    }),

    // Get HR's own jobs
    getMyJobs: builder.query<Job[], void>({
      query: () => '/jobs/my',
      providesTags: ['MyJobs'],
    }),

    // Get specific job by ID
    getJobById: builder.query<Job, string>({
      query: (id) => `/jobs/${id}`,
      providesTags: (result, error, id) => [{ type: 'Job', id }],
    }),

    // Update job (HR only) - PATCH /jobs/:id
    updateJob: builder.mutation<Job, { id: string; data: UpdateJobDto }>({
      query: ({ id, data }) => ({
        url: `/jobs/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Job', id },
        'Job',
        'MyJobs',
      ],
    }),

    // Delete job (HR only)
    deleteJob: builder.mutation<void, string>({
      query: (id) => ({
        url: `/jobs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Job', id },
        'Job',
        'MyJobs',
      ],
    }),

    // Get popular skills
    getPopularSkills: builder.query<PopularSkill[], void>({
      query: () => '/skills/popular',
      providesTags: ['Skill'],
    }),

    // Create new skill (HR only)
    createSkill: builder.mutation<Skill, CreateSkillDto>({
      query: (skillData) => ({
        url: '/skills',
        method: 'POST',
        body: skillData,
      }),
      invalidatesTags: ['Skill'],
    }),

    // Create application (CANDIDATE only)
    createApplication: builder.mutation<Application, CreateApplicationDto>({
      query: (applicationData) => ({
        url: '/applications',
        method: 'POST',
        body: applicationData,
      }),
      invalidatesTags: ['Job'],
    }),

    // Publish job (HR only) - change status from DRAFT to ACTIVE
    publishJob: builder.mutation<Job, string>({
      query: (jobId) => ({
        url: `/jobs/${jobId}/publish`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, jobId) => [
        { type: 'Job', id: jobId },
        'Job',
        'MyJobs',
      ],
    }),

    // Update job status (HR only)
    updateJobStatus: builder.mutation<Job, { jobId: string; status: string }>({
      query: ({ jobId, status }) => ({
        url: `/jobs/${jobId}`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { jobId }) => [
        { type: 'Job', id: jobId },
        'Job',
        'MyJobs',
      ],
    }),

    // HR: Get applications for my jobs
    getMyApplications: builder.query<DetailedApplication[], void>({
      query: () => '/applications/my',
      providesTags: ['Application'],
    }),

    // HR: Update application status
    updateApplicationStatus: builder.mutation<DetailedApplication, { 
      applicationId: string; 
      status: 'PENDING' | 'REVIEWED' | 'ACCEPTED' | 'REJECTED' | 'INTERVIEW_SCHEDULED' | 'HIRED' | 'WITHDRAWN';
      notes?: string;
    }>({
      query: ({ applicationId, status, notes }) => ({
        url: `/applications/${applicationId}`,
        method: 'PATCH',
        body: { status, notes },
      }),
      invalidatesTags: (result, error, { applicationId }) => [
        { type: 'Application', id: applicationId },
        'Application',
      ],
    }),

  }),
});

export const {
  useCreateJobMutation,
  useGetJobsQuery,
  useGetMyJobsQuery,
  useGetJobByIdQuery,
  useUpdateJobMutation,
  useDeleteJobMutation,
  useGetPopularSkillsQuery,
  useCreateSkillMutation,
  useCreateApplicationMutation,
  usePublishJobMutation,
  useUpdateJobStatusMutation,
  useGetMyApplicationsQuery,
  useUpdateApplicationStatusMutation,
} = jobsApi;

