export interface Resume {
  id: string;
  file_name: string;
  file_type: "pdf" | "docx" | string;
  file_size: number;
  file_path: string;
  display_name: string;
  target_role: string;
  skills: string[];
  experience_years: string;
  summary: string;
  raw_text: string;
  custom_fields?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ResumeUpdate {
  display_name?: string;
  target_role?: string;
  skills?: string[];
  experience_years?: string;
  summary?: string;
  custom_fields?: Record<string, any>;
}

export interface SearchProfile {
  id: string;
  name: string;
  keywords: string[];
  location: string;
  radius?: number;
  work_settings?: string[]; // Remote, Hybrid, On-Site
  employment_types?: string[]; // FULLTIME, CONTRACTS, THIRD_PARTY, PARTTIME
  easy_apply_only?: boolean;
  posted_within: string; // ONE, THREE, SEVEN, ANY
  experience_levels?: string[];
  is_remote: boolean;
  job_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SearchProfileCreate {
  name: string;
  keywords: string[];
  location?: string;
  radius?: number;
  work_settings?: string[];
  employment_types?: string[];
  easy_apply_only?: boolean;
  posted_within?: string;
  experience_levels?: string[];
  is_remote?: boolean;
  job_type?: string;
  is_active?: boolean;
}

export interface JDStructuredData {
  role: string;
  required_skills: string[];
  preferred_skills: string[];
  experience: string;
  responsibilities: string[];
  education?: string;
  certifications: string[];
  cloud: string[];
  tools: string[];
  domain?: string;
}

export interface AlternativeMatch {
  resume_id: string;
  display_name: string;
  file_name?: string;
  match_percentage: number;
}

export interface JobMatchResult {
  recommended_resume_id: string;
  recommended_resume_name: string;
  recommended_resume_file_name?: string;
  match_percentage: number;
  matched_skills: string[];
  partial_matches: string[];
  missing_skills: string[];
  reason: string;
  alternatives: AlternativeMatch[];
  created_at?: string;
}

export interface Job {
  id: string;
  external_job_id: string;
  title: string;
  company: string;
  location: string;
  work_setting?: string; // Remote, Hybrid, On-Site
  salary?: string;
  employment_type?: string;
  posted_date?: string;
  is_easy_apply?: boolean;
  job_url: string;
  application_url?: string;
  application_wizard_url?: string;
  description_raw: string;
  description_structured?: JDStructuredData;
  match_result?: JobMatchResult;
  status: "DISCOVERED" | "ANALYZED" | "MATCHED" | "APPLIED" | "SKIPPED" | "FAILED" | "REVIEW" | string;
  failure_reason?: string;
  search_profile_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DirectMatchRequest {
  title?: string;
  company?: string;
  description_raw: string;
}

export interface ApplicationAnswer {
  id?: string;
  question_text: string;
  field_name?: string;
  options: string[];
  answer_text?: string;
  is_answered: boolean;
  created_at?: string;
  answered_at?: string;
}

export interface Application {
  id: string;
  job_id: string;
  resume_id: string;
  company: string;
  job_title: string;
  application_url: string;
  resume_name?: string;
  status: "DISCOVERED" | "MATCHED" | "READY" | "REVIEW" | "APPLYING" | "APPLIED" | "SKIPPED" | "FAILED" | string;
  mode: "ANALYZE" | "PREPARE" | "APPLY" | string;
  progress_steps: string[];
  failure_reason?: string;
  applied_at?: string;
  pending_questions?: ApplicationAnswer[];
  created_at: string;
  updated_at: string;
}

export interface ReviewItem {
  id: string;
  application_id: string;
  company: string;
  job_title: string;
  question_text: string;
  field_name?: string;
  options: string[];
  answer_text?: string;
  is_answered: boolean;
  created_at: string;
}

export interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  zip_code: string;
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  years_of_experience: string;
  work_authorization: string;
  willing_to_relocate: boolean;
  custom_answers?: Record<string, string>;
}

export interface AppSettings {
  max_jobs_per_search: number;
  max_applications_per_run: number;
  default_mode: string;
  headless_browser?: boolean;
}

export interface DashboardStats {
  resumes_count: number;
  profiles_count: number;
  jobs_count: number;
  jobs_matched: number;
  apps_count: number;
  apps_ready: number;
  apps_applied: number;
  review_count: number;
  recent_applications: Array<{
    id: string;
    company: string;
    job_title: string;
    status: string;
    resume_name: string;
    updated_at: string;
  }>;
}
