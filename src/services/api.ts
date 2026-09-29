import axios from 'axios';
import type {
  Resume,
  ResumeUpdate,
  SearchProfile,
  SearchProfileCreate,
  Job,
  DirectMatchRequest,
  Application,
  ReviewItem,
  UserProfile,
  AppSettings,
  DashboardStats,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Resumes
  getResumes: async (search?: string, role?: string): Promise<Resume[]> => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (role) params.role = role;
    const res = await apiClient.get<Resume[]>('/resumes', { params });
    return res.data;
  },

  getResume: async (id: string): Promise<Resume> => {
    const res = await apiClient.get<Resume>(`/resumes/${id}`);
    return res.data;
  },

  uploadResumes: async (files: File[], onProgress?: (percent: number) => void): Promise<Resume[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const res = await apiClient.post<Resume[]>('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    return res.data;
  },

  updateResume: async (id: string, data: ResumeUpdate): Promise<Resume> => {
    const res = await apiClient.put<Resume>(`/resumes/${id}`, data);
    return res.data;
  },

  deleteResume: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/resumes/${id}`);
    return res.data;
  },

  reparseResume: async (id: string): Promise<Resume> => {
    const res = await apiClient.post<Resume>(`/resumes/${id}/reparse`);
    return res.data;
  },

  replaceResume: async (id: string, file: File): Promise<Resume> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<Resume>(`/resumes/${id}/replace`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Search Profiles
  getSearchProfiles: async (): Promise<SearchProfile[]> => {
    const res = await apiClient.get<SearchProfile[]>('/search-profiles');
    return res.data;
  },

  createSearchProfile: async (data: SearchProfileCreate): Promise<SearchProfile> => {
    const res = await apiClient.post<SearchProfile>('/search-profiles', data);
    return res.data;
  },

  updateSearchProfile: async (id: string, data: Partial<SearchProfileCreate>): Promise<SearchProfile> => {
    const res = await apiClient.put<SearchProfile>(`/search-profiles/${id}`, data);
    return res.data;
  },

  deleteSearchProfile: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/search-profiles/${id}`);
    return res.data;
  },

  runSearchProfile: async (id: string): Promise<{ profile_name: string; total_found: number; new_jobs_added: number; duplicates_skipped: number }> => {
    const res = await apiClient.post(`/search-profiles/${id}/run`);
    return res.data;
  },

  // Jobs
  getJobs: async (params?: { search?: string; company?: string; status?: string; location?: string; search_profile_id?: string; exclude_applied?: boolean }): Promise<Job[]> => {
    const res = await apiClient.get<Job[]>('/jobs', { params });
    return res.data;
  },

  clearAllJobs: async (): Promise<{ message: string; count: number }> => {
    const res = await apiClient.delete<{ message: string; count: number }>('/jobs/clear');
    return res.data;
  },

  getJob: async (id: string): Promise<Job> => {
    const res = await apiClient.get<Job>(`/jobs/${id}`);
    return res.data;
  },

  analyzeJob: async (id: string): Promise<Job> => {
    const res = await apiClient.post<Job>(`/jobs/${id}/analyze`);
    return res.data;
  },

  matchJob: async (id: string): Promise<Job> => {
    const res = await apiClient.post<Job>(`/jobs/${id}/match`);
    return res.data;
  },

  matchDirect: async (req: DirectMatchRequest): Promise<any> => {
    const res = await apiClient.post('/jobs/match-direct', req);
    return res.data;
  },

  // Applications
  getApplications: async (): Promise<Application[]> => {
    const res = await apiClient.get<Application[]>('/applications');
    return res.data;
  },

  getApplication: async (id: string): Promise<Application> => {
    const res = await apiClient.get<Application>(`/applications/${id}`);
    return res.data;
  },

  prepareApplication: async (req: { job_id: string; resume_id?: string; mode?: string }): Promise<Application> => {
    const res = await apiClient.post<Application>('/applications/prepare', req);
    return res.data;
  },

  applyJob: async (req: { job_id: string; resume_id?: string }): Promise<Application> => {
    const res = await apiClient.post<Application>('/applications/apply', req);
    return res.data;
  },

  submitApplication: async (id: string): Promise<Application> => {
    const res = await apiClient.post<Application>(`/applications/${id}/submit`);
    return res.data;
  },

  // Review Queue
  getReviewQueue: async (): Promise<ReviewItem[]> => {
    const res = await apiClient.get<ReviewItem[]>('/review-queue');
    return res.data;
  },

  answerReviewQuestion: async (questionId: string, answerText: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.post(`/review-queue/${questionId}/answer`, { answer_text: answerText });
    return res.data;
  },

  // Profile & Settings
  getProfile: async (): Promise<UserProfile> => {
    const res = await apiClient.get<UserProfile>('/profile');
    return res.data;
  },

  updateProfile: async (data: UserProfile): Promise<UserProfile> => {
    const res = await apiClient.put<UserProfile>('/profile', data);
    return res.data;
  },

  getSettings: async (): Promise<AppSettings> => {
    const res = await apiClient.get<AppSettings>('/settings');
    return res.data;
  },

  updateSettings: async (data: AppSettings): Promise<AppSettings> => {
    const res = await apiClient.put<AppSettings>('/settings', data);
    return res.data;
  },

  openDiceLogin: async (): Promise<{ status: string; message: string; login_url?: string; cloud_mode?: boolean }> => {
    const res = await apiClient.post<{ status: string; message: string; login_url?: string; cloud_mode?: boolean }>('/settings/open-dice-login');
    return res.data;
  },

  importDiceSession: async (data: { cookie_string?: string; cookies?: any[]; username?: string }): Promise<{
    status: string;
    message: string;
    cookies_count?: number;
    username?: string;
  }> => {
    const res = await apiClient.post('/settings/import-dice-session', data);
    return res.data;
  },

  getDiceStatus: async (checkLive: boolean = false): Promise<{
    is_connected: boolean;
    username?: string;
    cookies_count?: number;
    last_verified?: string;
  }> => {
    const res = await apiClient.get('/settings/dice-status', { params: { check_live: checkLive } });
    return res.data;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await apiClient.get<DashboardStats>('/dashboard/stats');
    return res.data;
  },

  getHealth: async (): Promise<{ status: string; database: string }> => {
    const res = await apiClient.get<{ status: string; database: string }>('/health');
    return res.data;
  },
};
