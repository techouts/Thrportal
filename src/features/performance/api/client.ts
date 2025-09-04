import { 
  PerformanceCycleDTO, 
  GoalDTO, 
  ReviewDTO, 
  MeetingDTO, 
  FeedbackRequestDTO, 
  PIPDTO,
  CalibrationPoolDTO,
  CalibrationMoveDTO,
  ApiResponse, 
  PaginatedResponse,
  AppError,
  PerformanceFilters
} from './dtos';

// Environment configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const AUTH_TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'auth_token';

class PerformanceApiClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = 30000; // 30 seconds
  }

  private getAuthToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        throw new AppError('Authentication required', 'UNAUTHORIZED');
      }

      if (!response.ok) {
        let errorMessage = `Request failed: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // Use default error message if parsing fails
        }
        throw new AppError(errorMessage, `HTTP_${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof AppError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new AppError('Request timeout', 'TIMEOUT');
        }
        throw new AppError(error.message, 'NETWORK_ERROR');
      }
      
      throw new AppError('Unknown error occurred', 'UNKNOWN_ERROR');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<TIn, TOut>(endpoint: string, data: TIn): Promise<TOut> {
    return this.request<TOut>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async patch<TIn, TOut>(endpoint: string, data: TIn): Promise<TOut> {
    return this.request<TOut>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async del<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Performance Cycles
  async getCycles(): Promise<ApiResponse<PerformanceCycleDTO[]>> {
    return this.get<ApiResponse<PerformanceCycleDTO[]>>('/performance/cycles');
  }

  async getCycle(id: string): Promise<ApiResponse<PerformanceCycleDTO>> {
    return this.get<ApiResponse<PerformanceCycleDTO>>(`/performance/cycles/${id}`);
  }

  async createCycle(cycle: Partial<PerformanceCycleDTO>): Promise<ApiResponse<PerformanceCycleDTO>> {
    return this.post<Partial<PerformanceCycleDTO>, ApiResponse<PerformanceCycleDTO>>('/performance/cycles', cycle);
  }

  async updateCycle(id: string, cycle: Partial<PerformanceCycleDTO>): Promise<ApiResponse<PerformanceCycleDTO>> {
    return this.patch<Partial<PerformanceCycleDTO>, ApiResponse<PerformanceCycleDTO>>(`/performance/cycles/${id}`, cycle);
  }

  // Goals
  async getGoals(filters?: PerformanceFilters): Promise<PaginatedResponse<GoalDTO>> {
    const params = new URLSearchParams();
    if (filters?.goalType) params.set('type', filters.goalType);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.search) params.set('search', filters.search);
    
    const query = params.toString();
    return this.get<PaginatedResponse<GoalDTO>>(`/performance/goals${query ? `?${query}` : ''}`);
  }

  async getGoal(id: string): Promise<ApiResponse<GoalDTO>> {
    return this.get<ApiResponse<GoalDTO>>(`/performance/goals/${id}`);
  }

  async createGoal(goal: Partial<GoalDTO>): Promise<ApiResponse<GoalDTO>> {
    return this.post<Partial<GoalDTO>, ApiResponse<GoalDTO>>('/performance/goals', goal);
  }

  async updateGoal(id: string, goal: Partial<GoalDTO>): Promise<ApiResponse<GoalDTO>> {
    return this.patch<Partial<GoalDTO>, ApiResponse<GoalDTO>>(`/performance/goals/${id}`, goal);
  }

  async deleteGoal(id: string): Promise<ApiResponse<void>> {
    return this.del<ApiResponse<void>>(`/performance/goals/${id}`);
  }

  // Reviews
  async getReviews(cycleId?: string): Promise<PaginatedResponse<ReviewDTO>> {
    const params = cycleId ? `?cycleId=${cycleId}` : '';
    return this.get<PaginatedResponse<ReviewDTO>>(`/performance/reviews${params}`);
  }

  async getReview(id: string): Promise<ApiResponse<ReviewDTO>> {
    return this.get<ApiResponse<ReviewDTO>>(`/performance/reviews/${id}`);
  }

  async createReview(review: Partial<ReviewDTO>): Promise<ApiResponse<ReviewDTO>> {
    return this.post<Partial<ReviewDTO>, ApiResponse<ReviewDTO>>('/performance/reviews', review);
  }

  async updateReview(id: string, review: Partial<ReviewDTO>): Promise<ApiResponse<ReviewDTO>> {
    return this.patch<Partial<ReviewDTO>, ApiResponse<ReviewDTO>>(`/performance/reviews/${id}`, review);
  }

  async submitReview(id: string): Promise<ApiResponse<ReviewDTO>> {
    return this.post<{}, ApiResponse<ReviewDTO>>(`/performance/reviews/${id}/submit`, {});
  }

  // Meetings
  async getMeetings(empId?: string): Promise<PaginatedResponse<MeetingDTO>> {
    const params = empId ? `?empId=${empId}` : '';
    return this.get<PaginatedResponse<MeetingDTO>>(`/performance/meetings${params}`);
  }

  async createMeeting(meeting: Partial<MeetingDTO>): Promise<ApiResponse<MeetingDTO>> {
    return this.post<Partial<MeetingDTO>, ApiResponse<MeetingDTO>>('/performance/meetings', meeting);
  }

  async updateMeeting(id: string, meeting: Partial<MeetingDTO>): Promise<ApiResponse<MeetingDTO>> {
    return this.patch<Partial<MeetingDTO>, ApiResponse<MeetingDTO>>(`/performance/meetings/${id}`, meeting);
  }

  // Feedback
  async getFeedbackRequests(): Promise<PaginatedResponse<FeedbackRequestDTO>> {
    return this.get<PaginatedResponse<FeedbackRequestDTO>>('/performance/feedback-requests');
  }

  async createFeedbackRequest(request: Partial<FeedbackRequestDTO>): Promise<ApiResponse<FeedbackRequestDTO>> {
    return this.post<Partial<FeedbackRequestDTO>, ApiResponse<FeedbackRequestDTO>>('/performance/feedback-requests', request);
  }

  async submitFeedbackResponse(requestId: string, content: string, ratingHint?: number): Promise<ApiResponse<void>> {
    return this.post<{ content: string; ratingHint?: number }, ApiResponse<void>>(
      `/performance/feedback-requests/${requestId}/responses`, 
      { content, ratingHint }
    );
  }

  // PIPs
  async getPIPs(): Promise<PaginatedResponse<PIPDTO>> {
    return this.get<PaginatedResponse<PIPDTO>>('/performance/pips');
  }

  async createPIP(pip: Partial<PIPDTO>): Promise<ApiResponse<PIPDTO>> {
    return this.post<Partial<PIPDTO>, ApiResponse<PIPDTO>>('/performance/pips', pip);
  }

  async updatePIP(id: string, pip: Partial<PIPDTO>): Promise<ApiResponse<PIPDTO>> {
    return this.patch<Partial<PIPDTO>, ApiResponse<PIPDTO>>(`/performance/pips/${id}`, pip);
  }

  // Calibration
  async getCalibrationPools(cycleId: string): Promise<ApiResponse<CalibrationPoolDTO[]>> {
    return this.get<ApiResponse<CalibrationPoolDTO[]>>(`/performance/cycles/${cycleId}/calibration/pools`);
  }

  async moveEmployeeRating(poolId: string, empId: string, toRating: string, reason?: string): Promise<ApiResponse<CalibrationMoveDTO>> {
    return this.post<{ empId: string; toRating: string; reason?: string }, ApiResponse<CalibrationMoveDTO>>(
      `/performance/calibration/pools/${poolId}/moves`,
      { empId, toRating, reason }
    );
  }

  async lockCalibration(cycleId: string): Promise<ApiResponse<void>> {
    return this.post<{}, ApiResponse<void>>(`/performance/cycles/${cycleId}/calibration/lock`, {});
  }

  async publishRatings(cycleId: string): Promise<ApiResponse<void>> {
    return this.post<{}, ApiResponse<void>>(`/performance/cycles/${cycleId}/publish`, {});
  }

  // Notifications
  async sendNudge(empId: string, type: string): Promise<ApiResponse<void>> {
    return this.post<{ type: string }, ApiResponse<void>>(`/performance/nudge/${empId}`, { type });
  }
}

export const performanceApi = new PerformanceApiClient();
export { PerformanceApiClient };