import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { handleAuthError, determineErrorContext } from '../authErrorHandler';

// Enums for internship request status
export enum InternshipRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Main interface for internship request
export interface InternshipRequest {
  id: string;
  specialty: string;
  studentCount: number;
  period: string;
  startDate: string;
  endDate: string;
  description: string;
  requirements: string;
  skills: string[];
  location: string;
  isRemote: boolean;
  status: InternshipRequestStatus;
  createdAt: string;
  updatedAt: string;
  university: {
    id: string;
    name: string;
    user: {
      email: string;
    };
  };
  // Optional fields for company responses
  companyResponses?: CompanyResponse[];
  selectedCompany?: {
    id: string;
    name: string;
    contactEmail: string;
  };
}

// Company response to internship request
export interface CompanyResponse {
  id: string;
  companyId: string;
  companyName: string;
  contactEmail: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  respondedAt: string;
  internshipRequestId: string;
}

// DTO for creating internship request
export interface CreateInternshipRequestDto {
  specialty: string;
  studentCount: number;
  period: string;
  startDate: string;
  endDate: string;
  description: string;
  requirements: string;
  skills: string[];
  location: string;
  isRemote: boolean;
}

// DTO for updating internship request
export interface UpdateInternshipRequestDto {
  specialty?: string;
  studentCount?: number;
  period?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  requirements?: string;
  skills?: string[];
  location?: string;
  isRemote?: boolean;
  status?: InternshipRequestStatus;
}

// Query parameters for filtering internship requests
export interface InternshipRequestQueryDto {
  search?: string;
  specialty?: string;
  location?: string;
  status?: InternshipRequestStatus;
  isRemote?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Response type for paginated internship requests
export interface InternshipRequestsResponse {
  requests: InternshipRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// DTO for company response to internship request
export interface CreateCompanyResponseDto {
  internshipRequestId: string;
  message: string;
  contactEmail: string;
}

// Base URL helper
const getBaseUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://smartmatch-three.vercel.app/';
  return backendUrl.replace(/\/$/, '');
};

export const internshipRequestsApi = createApi({
  reducerPath: 'internshipRequestsApi',
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
  tagTypes: ['InternshipRequest', 'CompanyResponse'],
  endpoints: (builder) => ({
    // Create new internship request (UNIVERSITY only)
    createInternshipRequest: builder.mutation<InternshipRequest, CreateInternshipRequestDto>({
      query: (requestData) => ({
        url: '/internship-requests',
        method: 'POST',
        body: requestData,
      }),
      invalidatesTags: ['InternshipRequest'],
    }),

    // Get all internship requests with filtering
    getInternshipRequests: builder.query<InternshipRequestsResponse, InternshipRequestQueryDto | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        
        // Basic filters
        if (params?.search) searchParams.append('search', params.search);
        if (params?.specialty) searchParams.append('specialty', params.specialty);
        if (params?.location) searchParams.append('location', params.location);
        if (params?.status) searchParams.append('status', params.status);
        if (params?.isRemote !== undefined) searchParams.append('isRemote', params.isRemote.toString());
        
        // Pagination
        if (params?.page && params.page > 0) searchParams.append('page', params.page.toString());
        if (params?.limit && params.limit > 0) searchParams.append('limit', params.limit.toString());
        
        // Sorting
        if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

        const queryString = searchParams.toString();
        return `/internship-requests/catalog${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['InternshipRequest'],
    }),

    // Get university's own internship requests
    getMyInternshipRequests: builder.query<InternshipRequestsResponse, InternshipRequestQueryDto | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.append('status', params.status);
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        if (params?.search) searchParams.append('search', params.search);
        if (params?.specialty) searchParams.append('specialty', params.specialty);
        if (params?.location) searchParams.append('location', params.location);
        if (params?.isRemote !== undefined) searchParams.append('isRemote', params.isRemote.toString());
        if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);
        
        const queryString = searchParams.toString();
        return `/internship-requests/my${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['InternshipRequest'],
    }),

    // Get specific internship request by ID
    getInternshipRequestById: builder.query<InternshipRequest, string>({
      query: (id) => `/internship-requests/${id}`,
      providesTags: (result, error, id) => [{ type: 'InternshipRequest', id }],
    }),

    // Update internship request (UNIVERSITY only)
    updateInternshipRequest: builder.mutation<InternshipRequest, { id: string; data: UpdateInternshipRequestDto }>({
      query: ({ id, data }) => ({
        url: `/internship-requests/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'InternshipRequest', id },
        'InternshipRequest',
      ],
    }),

    // Delete internship request (UNIVERSITY only)
    deleteInternshipRequest: builder.mutation<void, string>({
      query: (id) => ({
        url: `/internship-requests/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'InternshipRequest', id },
        'InternshipRequest',
      ],
    }),

    // Company responds to internship request
    respondToInternshipRequest: builder.mutation<CompanyResponse, CreateCompanyResponseDto>({
      query: (responseData) => ({
        url: '/internship-requests/respond',
        method: 'POST',
        body: responseData,
      }),
      invalidatesTags: ['CompanyResponse', 'InternshipRequest'],
    }),

    // Get company responses for internship request
    getCompanyResponses: builder.query<CompanyResponse[], string>({
      query: (internshipRequestId) => `/internship-requests/${internshipRequestId}/responses`,
      providesTags: (result, error, internshipRequestId) => [
        { type: 'CompanyResponse', id: internshipRequestId }
      ],
    }),

    // University selects company for internship request
    selectCompany: builder.mutation<InternshipRequest, { 
      internshipRequestId: string; 
      companyResponseId: string; 
    }>({
      query: ({ internshipRequestId, companyResponseId }) => ({
        url: `/internship-requests/${internshipRequestId}/select-company`,
        method: 'POST',
        body: { companyResponseId },
      }),
      invalidatesTags: (result, error, { internshipRequestId }) => [
        { type: 'InternshipRequest', id: internshipRequestId },
        'InternshipRequest',
        'CompanyResponse',
      ],
    }),

    // Update internship request status
    updateInternshipRequestStatus: builder.mutation<InternshipRequest, { 
      id: string; 
      status: InternshipRequestStatus; 
    }>({
      query: ({ id, status }) => ({
        url: `/internship-requests/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'InternshipRequest', id },
        'InternshipRequest',
      ],
    }),

    // Get internship requests for companies (public catalog)
    getPublicInternshipRequests: builder.query<InternshipRequestsResponse, InternshipRequestQueryDto | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        
        // Basic filters
        if (params?.search) searchParams.append('search', params.search);
        if (params?.specialty) searchParams.append('specialty', params.specialty);
        if (params?.location) searchParams.append('location', params.location);
        if (params?.isRemote !== undefined) searchParams.append('isRemote', params.isRemote.toString());
        
        // Pagination
        if (params?.page && params.page > 0) searchParams.append('page', params.page.toString());
        if (params?.limit && params.limit > 0) searchParams.append('limit', params.limit.toString());
        
        // Sorting
        if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

        const queryString = searchParams.toString();
        return `/internship-requests/public${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['InternshipRequest'],
    }),

    // HR: Get all company responses for management
    getHRCompanyResponses: builder.query<CompanyResponse[], InternshipRequestQueryDto | void>({
      query: (params) => {
        const searchParams = new URLSearchParams();
        
        if (params?.search) searchParams.append('search', params.search);
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        
        const queryString = searchParams.toString();
        return `/hr/company-responses${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['CompanyResponse'],
    }),

    // HR: Update company response status
    updateCompanyResponseStatus: builder.mutation<CompanyResponse, { 
      id: string; 
      status: 'PENDING' | 'ACCEPTED' | 'REJECTED'; 
    }>({
      query: ({ id, status }) => ({
        url: `/hr/company-responses/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'CompanyResponse', id },
        'CompanyResponse',
        'InternshipRequest',
      ],
    }),

  }),
});

export const {
  useCreateInternshipRequestMutation,
  useGetInternshipRequestsQuery,
  useGetMyInternshipRequestsQuery,
  useGetInternshipRequestByIdQuery,
  useUpdateInternshipRequestMutation,
  useDeleteInternshipRequestMutation,
  useRespondToInternshipRequestMutation,
  useGetCompanyResponsesQuery,
  useSelectCompanyMutation,
  useUpdateInternshipRequestStatusMutation,
  useGetPublicInternshipRequestsQuery,
  useGetHRCompanyResponsesQuery,
  useUpdateCompanyResponseStatusMutation,
} = internshipRequestsApi;
