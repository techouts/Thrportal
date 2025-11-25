import { ApiService } from '@/services/api';
import type {
  IjpPosting,
  IjpApplication,
  IjpInterview,
  IjpFeedback,
  IjpOffer,
  IjpSettings,
  PostingFilters,
  ApplicationEvent,
  ApiResponse,
  IjpStage
} from '../types';

export class IjpService {
  private static instance: IjpService;

  static getInstance(): IjpService {
    if (!IjpService.instance) {
      IjpService.instance = new IjpService();
    }
    return IjpService.instance;
  }

  async listPostings(params: {
    search?: string;
    filters?: PostingFilters;
    tab?: "POSTINGS" | "RECOMMENDED" | "SAVED";
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<IjpPosting[]>> {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.tab) queryParams.append('tab', params.tab);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(`${key}[]`, v));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    return ApiService.get(`/api/ijp/postings?${queryParams.toString()}`);
  }

  async getPosting(id: string): Promise<ApiResponse<IjpPosting>> {
    return ApiService.get(`/api/ijp/postings/${id}`);
  }

  async savePosting(id: string, saved: boolean): Promise<ApiResponse<{ saved: boolean }>> {
    return ApiService.post(`/api/ijp/postings/${id}/save`, { saved });
  }

  async createApplication(body: {
    postingId: string;
    questionnaireAnswers: any;
    coverLetter?: string;
    attachments?: File[];
    consent: boolean;
    editSnapshot?: any;
  }): Promise<ApiResponse<IjpApplication>> {
    const formData = new FormData();
    formData.append('postingId', body.postingId);
    formData.append('questionnaireAnswers', JSON.stringify(body.questionnaireAnswers));
    formData.append('consent', body.consent.toString());
    
    if (body.coverLetter) {
      formData.append('coverLetter', body.coverLetter);
    }
    
    if (body.editSnapshot) {
      formData.append('editSnapshot', JSON.stringify(body.editSnapshot));
    }
    
    if (body.attachments) {
      body.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    return ApiService.post('/api/ijp/applications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  async listMyApplications(): Promise<ApiResponse<IjpApplication[]>> {
    return ApiService.get('/api/ijp/applications/my');
  }

  async getApplication(id: string): Promise<ApiResponse<IjpApplication>> {
    return ApiService.get(`/api/ijp/applications/${id}`);
  }

  async advanceApplication(id: string, body: {
    to: IjpStage;
    reasonCode?: string;
    comment?: string;
  }): Promise<ApiResponse<IjpApplication>> {
    return ApiService.post(`/api/ijp/applications/${id}/advance`, body);
  }

  async withdrawApplication(id: string, reason?: string): Promise<ApiResponse<IjpApplication>> {
    return ApiService.post(`/api/ijp/applications/${id}/withdraw`, { reason });
  }

  async approveApplication(id: string, comment?: string): Promise<ApiResponse<IjpApplication>> {
    return ApiService.post(`/api/ijp/applications/${id}/approve`, { comment });
  }

  async rejectApplication(id: string, reason: string, comment?: string): Promise<ApiResponse<IjpApplication>> {
    return ApiService.post(`/api/ijp/applications/${id}/reject`, { reason, comment });
  }

  async listTeamApplications(): Promise<ApiResponse<IjpApplication[]>> {
    return ApiService.get('/api/ijp/applications/team');
  }

  async listPendingApprovals(): Promise<ApiResponse<IjpApplication[]>> {
    return ApiService.get('/api/ijp/applications/approvals');
  }

  async listApplicationsByStage(stage?: IjpStage): Promise<ApiResponse<IjpApplication[]>> {
    const params = stage ? `?stage=${stage}` : '';
    return ApiService.get(`/api/ijp/applications/pipeline${params}`);
  }

  async scheduleInterview(body: Partial<IjpInterview> & { applicationId: string }): Promise<ApiResponse<IjpInterview>> {
    return ApiService.post('/api/ijp/interviews', body);
  }

  async updateInterview(id: string, body: Partial<IjpInterview>): Promise<ApiResponse<IjpInterview>> {
    return ApiService.put(`/api/ijp/interviews/${id}`, body);
  }

  async getInterviewSlots(date: string, panelUserIds: string[]): Promise<ApiResponse<{ time: string; available: boolean }[]>> {
    return ApiService.post('/api/ijp/interviews/slots', { date, panelUserIds });
  }

  async submitFeedback(body: IjpFeedback): Promise<ApiResponse<IjpFeedback>> {
    return ApiService.post('/api/ijp/feedback', body);
  }

  async getFeedback(interviewId: string): Promise<ApiResponse<IjpFeedback[]>> {
    return ApiService.get(`/api/ijp/feedback/interview/${interviewId}`);
  }

  async createOffer(body: IjpOffer): Promise<ApiResponse<IjpOffer>> {
    return ApiService.post('/api/ijp/offers', body);
  }

  async updateOffer(id: string, body: Partial<IjpOffer>): Promise<ApiResponse<IjpOffer>> {
    return ApiService.put(`/api/ijp/offers/${id}`, body);
  }

  async recordOfferDecision(id: string, decision: "ACCEPTED" | "DECLINED"): Promise<ApiResponse<IjpOffer>> {
    return ApiService.post(`/api/ijp/offers/${id}/decision`, { decision });
  }

  async getSettings(): Promise<ApiResponse<IjpSettings>> {
    return ApiService.get('/api/ijp/settings');
  }

  async updateSettings(body: Partial<IjpSettings>): Promise<ApiResponse<IjpSettings>> {
    return ApiService.put('/api/ijp/settings', body);
  }

  async getReports(params: {
    startDate?: string;
    endDate?: string;
    type?: string;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.type) queryParams.append('type', params.type);
    
    return ApiService.get(`/api/ijp/reports?${queryParams.toString()}`);
  }

  async exportData(type: 'applications' | 'interviews' | 'offers', format: 'csv' | 'xlsx'): Promise<ApiResponse<{ downloadUrl: string }>> {
    return ApiService.post('/api/ijp/export', { type, format });
  }

  trackEvent(event: string, data: Record<string, any>): void {
    // Track IJP events for analytics
    console.log('IJP Event:', event, data);
    // Implementation would send to analytics service
  }
}

export const ijpService = IjpService.getInstance();