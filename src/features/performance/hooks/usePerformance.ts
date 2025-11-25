import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { performanceApi } from '../api/client';
import { 
  PerformanceCycleDTO, 
  GoalDTO, 
  ReviewDTO, 
  MeetingDTO, 
  FeedbackRequestDTO, 
  PIPDTO,
  CalibrationPoolDTO,
  PerformanceFilters 
} from '../api/dtos';
import { toast } from 'sonner';

// Query Keys
export const performanceKeys = {
  all: ['performance'] as const,
  cycles: () => [...performanceKeys.all, 'cycles'] as const,
  cycle: (id: string) => [...performanceKeys.cycles(), id] as const,
  goals: (filters?: PerformanceFilters) => [...performanceKeys.all, 'goals', filters] as const,
  goal: (id: string) => [...performanceKeys.all, 'goals', id] as const,
  reviews: (cycleId?: string) => [...performanceKeys.all, 'reviews', cycleId] as const,
  review: (id: string) => [...performanceKeys.all, 'reviews', id] as const,
  meetings: (empId?: string) => [...performanceKeys.all, 'meetings', empId] as const,
  feedback: () => [...performanceKeys.all, 'feedback'] as const,
  pips: () => [...performanceKeys.all, 'pips'] as const,
  calibration: (cycleId: string) => [...performanceKeys.all, 'calibration', cycleId] as const,
};

// Performance Cycles
export const usePerformanceCycles = () => {
  return useQuery({
    queryKey: performanceKeys.cycles(),
    queryFn: () => performanceApi.getCycles(),
    select: (data) => data.data,
  });
};

export const usePerformanceCycle = (id: string) => {
  return useQuery({
    queryKey: performanceKeys.cycle(id),
    queryFn: () => performanceApi.getCycle(id),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateCycle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (cycle: Partial<PerformanceCycleDTO>) => 
      performanceApi.createCycle(cycle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.cycles() });
      toast.success('Performance cycle created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create performance cycle');
    },
  });
};

export const useUpdateCycle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, cycle }: { id: string; cycle: Partial<PerformanceCycleDTO> }) => 
      performanceApi.updateCycle(id, cycle),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.cycles() });
      queryClient.invalidateQueries({ queryKey: performanceKeys.cycle(variables.id) });
      toast.success('Performance cycle updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update performance cycle');
    },
  });
};

// Goals
export const useGoals = (filters?: PerformanceFilters) => {
  return useQuery({
    queryKey: performanceKeys.goals(filters),
    queryFn: () => performanceApi.getGoals(filters),
    select: (data) => data.data,
  });
};

export const useGoal = (id: string) => {
  return useQuery({
    queryKey: performanceKeys.goal(id),
    queryFn: () => performanceApi.getGoal(id),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (goal: Partial<GoalDTO>) => 
      performanceApi.createGoal(goal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.goals() });
      toast.success('Goal created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create goal');
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, goal }: { id: string; goal: Partial<GoalDTO> }) => 
      performanceApi.updateGoal(id, goal),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.goals() });
      queryClient.invalidateQueries({ queryKey: performanceKeys.goal(variables.id) });
      toast.success('Goal updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update goal');
    },
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => performanceApi.deleteGoal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.goals() });
      toast.success('Goal deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete goal');
    },
  });
};

// Reviews
export const useReviews = (cycleId?: string) => {
  return useQuery({
    queryKey: performanceKeys.reviews(cycleId),
    queryFn: () => performanceApi.getReviews(cycleId),
    select: (data) => data.data,
  });
};

export const useReview = (id: string) => {
  return useQuery({
    queryKey: performanceKeys.review(id),
    queryFn: () => performanceApi.getReview(id),
    select: (data) => data.data,
    enabled: !!id,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (review: Partial<ReviewDTO>) => 
      performanceApi.createReview(review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.reviews() });
      toast.success('Review created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create review');
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, review }: { id: string; review: Partial<ReviewDTO> }) => 
      performanceApi.updateReview(id, review),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.reviews() });
      queryClient.invalidateQueries({ queryKey: performanceKeys.review(variables.id) });
      toast.success('Review updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update review');
    },
  });
};

export const useSubmitReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => performanceApi.submitReview(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.reviews() });
      queryClient.invalidateQueries({ queryKey: performanceKeys.review(variables) });
      toast.success('Review submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit review');
    },
  });
};

// Meetings
export const useMeetings = (empId?: string) => {
  return useQuery({
    queryKey: performanceKeys.meetings(empId),
    queryFn: () => performanceApi.getMeetings(empId),
    select: (data) => data.data,
  });
};

export const useCreateMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (meeting: Partial<MeetingDTO>) => 
      performanceApi.createMeeting(meeting),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.meetings() });
      toast.success('Meeting scheduled successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to schedule meeting');
    },
  });
};

export const useUpdateMeeting = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, meeting }: { id: string; meeting: Partial<MeetingDTO> }) => 
      performanceApi.updateMeeting(id, meeting),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.meetings() });
      toast.success('Meeting updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update meeting');
    },
  });
};

// Feedback
export const useFeedbackRequests = () => {
  return useQuery({
    queryKey: performanceKeys.feedback(),
    queryFn: () => performanceApi.getFeedbackRequests(),
    select: (data) => data.data,
  });
};

export const useCreateFeedbackRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: Partial<FeedbackRequestDTO>) => 
      performanceApi.createFeedbackRequest(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.feedback() });
      toast.success('Feedback request sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send feedback request');
    },
  });
};

export const useSubmitFeedbackResponse = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ requestId, content, ratingHint }: { 
      requestId: string; 
      content: string; 
      ratingHint?: number; 
    }) => performanceApi.submitFeedbackResponse(requestId, content, ratingHint),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.feedback() });
      toast.success('Feedback submitted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit feedback');
    },
  });
};

// PIPs
export const usePIPs = () => {
  return useQuery({
    queryKey: performanceKeys.pips(),
    queryFn: () => performanceApi.getPIPs(),
    select: (data) => data.data,
  });
};

export const useCreatePIP = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (pip: Partial<PIPDTO>) => 
      performanceApi.createPIP(pip),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.pips() });
      toast.success('PIP created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create PIP');
    },
  });
};

export const useUpdatePIP = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, pip }: { id: string; pip: Partial<PIPDTO> }) => 
      performanceApi.updatePIP(id, pip),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.pips() });
      toast.success('PIP updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update PIP');
    },
  });
};

// Calibration
export const useCalibrationPools = (cycleId: string) => {
  return useQuery({
    queryKey: performanceKeys.calibration(cycleId),
    queryFn: () => performanceApi.getCalibrationPools(cycleId),
    select: (data) => data.data,
    enabled: !!cycleId,
  });
};

export const useMoveEmployeeRating = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ poolId, empId, toRating, reason }: { 
      poolId: string; 
      empId: string; 
      toRating: string; 
      reason?: string; 
    }) => performanceApi.moveEmployeeRating(poolId, empId, toRating, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.calibration('') });
      toast.success('Employee rating moved successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to move employee rating');
    },
  });
};

export const useLockCalibration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (cycleId: string) => performanceApi.lockCalibration(cycleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.calibration('') });
      toast.success('Calibration locked successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to lock calibration');
    },
  });
};

export const usePublishRatings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (cycleId: string) => performanceApi.publishRatings(cycleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: performanceKeys.cycles() });
      queryClient.invalidateQueries({ queryKey: performanceKeys.reviews() });
      toast.success('Ratings published successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to publish ratings');
    },
  });
};

// Nudge
export const useSendNudge = () => {
  return useMutation({
    mutationFn: ({ empId, type }: { empId: string; type: string }) => 
      performanceApi.sendNudge(empId, type),
    onSuccess: () => {
      toast.success('Nudge sent successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send nudge');
    },
  });
};