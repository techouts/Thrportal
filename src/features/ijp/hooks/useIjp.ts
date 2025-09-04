import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ijpService } from '../services/IjpService';
import type {
  IjpPosting,
  IjpApplication,
  IjpInterview,
  IjpFeedback,
  IjpOffer,
  IjpSettings,
  PostingFilters,
  IjpStage
} from '../types';
import { useToast } from '@/hooks/use-toast';

// Query Keys
export const ijpKeys = {
  all: ['ijp'] as const,
  postings: () => [...ijpKeys.all, 'postings'] as const,
  posting: (id: string) => [...ijpKeys.postings(), id] as const,
  applications: () => [...ijpKeys.all, 'applications'] as const,
  application: (id: string) => [...ijpKeys.applications(), id] as const,
  myApplications: () => [...ijpKeys.applications(), 'my'] as const,
  teamApplications: () => [...ijpKeys.applications(), 'team'] as const,
  approvals: () => [...ijpKeys.applications(), 'approvals'] as const,
  pipeline: (stage?: string) => [...ijpKeys.applications(), 'pipeline', stage] as const,
  interviews: () => [...ijpKeys.all, 'interviews'] as const,
  feedback: (interviewId: string) => [...ijpKeys.all, 'feedback', interviewId] as const,
  offers: () => [...ijpKeys.all, 'offers'] as const,
  settings: () => [...ijpKeys.all, 'settings'] as const,
  reports: () => [...ijpKeys.all, 'reports'] as const,
};

// Postings hooks
export function usePostings(params: {
  search?: string;
  filters?: PostingFilters;
  tab?: "POSTINGS" | "RECOMMENDED" | "SAVED";
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: [...ijpKeys.postings(), params],
    queryFn: () => ijpService.listPostings(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePosting(id: string) {
  return useQuery({
    queryKey: ijpKeys.posting(id),
    queryFn: () => ijpService.getPosting(id),
    enabled: !!id,
  });
}

export function useSavePosting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, saved }: { id: string; saved: boolean }) =>
      ijpService.savePosting(id, saved),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ijpKeys.postings() });
      toast({
        title: variables.saved ? "Posting saved" : "Posting unsaved",
        description: variables.saved ? "Added to your saved postings" : "Removed from saved postings",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update saved status",
        variant: "destructive",
      });
    },
  });
}

// Applications hooks
export function useMyApplications() {
  return useQuery({
    queryKey: ijpKeys.myApplications(),
    queryFn: () => ijpService.listMyApplications(),
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: ijpKeys.application(id),
    queryFn: () => ijpService.getApplication(id),
    enabled: !!id,
  });
}

export function useCreateApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ijpService.createApplication.bind(ijpService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ijpKeys.applications() });
      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Application failed",
        description: "Failed to submit your application. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useAdvanceApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, to, reasonCode, comment }: {
      id: string;
      to: IjpStage;
      reasonCode?: string;
      comment?: string;
    }) => ijpService.advanceApplication(id, { to, reasonCode, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ijpKeys.applications() });
      toast({
        title: "Application updated",
        description: "Application status has been updated",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update application status",
        variant: "destructive",
      });
    },
  });
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      ijpService.withdrawApplication(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ijpKeys.applications() });
      toast({
        title: "Application withdrawn",
        description: "Your application has been withdrawn",
      });
    },
    onError: () => {
      toast({
        title: "Withdrawal failed",
        description: "Failed to withdraw application",
        variant: "destructive",
      });
    },
  });
}

// Manager approval hooks
export function usePendingApprovals() {
  return useQuery({
    queryKey: ijpKeys.approvals(),
    queryFn: () => ijpService.listPendingApprovals(),
  });
}

export function useApproveApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      ijpService.approveApplication(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ijpKeys.approvals() });
      queryClient.invalidateQueries({ queryKey: ijpKeys.applications() });
      toast({
        title: "Application approved",
        description: "The application has been approved",
      });
    },
    onError: () => {
      toast({
        title: "Approval failed",
        description: "Failed to approve application",
        variant: "destructive",
      });
    },
  });
}

export function useRejectApplication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, reason, comment }: { id: string; reason: string; comment?: string }) =>
      ijpService.rejectApplication(id, reason, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ijpKeys.approvals() });
      queryClient.invalidateQueries({ queryKey: ijpKeys.applications() });
      toast({
        title: "Application rejected",
        description: "The application has been rejected",
      });
    },
    onError: () => {
      toast({
        title: "Rejection failed",
        description: "Failed to reject application",
        variant: "destructive",
      });
    },
  });
}

// Team applications
export function useTeamApplications() {
  return useQuery({
    queryKey: ijpKeys.teamApplications(),
    queryFn: () => ijpService.listTeamApplications(),
  });
}

// Pipeline hooks
export function usePipeline(stage?: IjpStage) {
  return useQuery({
    queryKey: ijpKeys.pipeline(stage),
    queryFn: () => ijpService.listApplicationsByStage(stage),
  });
}

// Interview hooks
export function useScheduleInterview() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ijpService.scheduleInterview.bind(ijpService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ijpKeys.interviews() });
      queryClient.invalidateQueries({ queryKey: ijpKeys.applications() });
      toast({
        title: "Interview scheduled",
        description: "The interview has been scheduled successfully",
      });
    },
    onError: () => {
      toast({
        title: "Scheduling failed",
        description: "Failed to schedule interview",
        variant: "destructive",
      });
    },
  });
}

export function useInterviewSlots(date: string, panelUserIds: string[]) {
  return useQuery({
    queryKey: [...ijpKeys.interviews(), 'slots', date, panelUserIds],
    queryFn: () => ijpService.getInterviewSlots(date, panelUserIds),
    enabled: !!date && panelUserIds.length > 0,
  });
}

// Feedback hooks
export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ijpService.submitFeedback.bind(ijpService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ijpKeys.all });
      toast({
        title: "Feedback submitted",
        description: "Your feedback has been submitted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Submission failed",
        description: "Failed to submit feedback",
        variant: "destructive",
      });
    },
  });
}

export function useFeedback(interviewId: string) {
  return useQuery({
    queryKey: ijpKeys.feedback(interviewId),
    queryFn: () => ijpService.getFeedback(interviewId),
    enabled: !!interviewId,
  });
}

// Offer hooks
export function useCreateOffer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ijpService.createOffer.bind(ijpService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ijpKeys.offers() });
      queryClient.invalidateQueries({ queryKey: ijpKeys.applications() });
      toast({
        title: "Offer created",
        description: "The offer has been created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Offer creation failed",
        description: "Failed to create offer",
        variant: "destructive",
      });
    },
  });
}

export function useRecordOfferDecision() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: "ACCEPTED" | "DECLINED" }) =>
      ijpService.recordOfferDecision(id, decision),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ijpKeys.offers() });
      queryClient.invalidateQueries({ queryKey: ijpKeys.applications() });
      toast({
        title: "Decision recorded",
        description: `Offer ${variables.decision.toLowerCase()} has been recorded`,
      });
    },
    onError: () => {
      toast({
        title: "Recording failed",
        description: "Failed to record offer decision",
        variant: "destructive",
      });
    },
  });
}

// Settings hooks
export function useIjpSettings() {
  return useQuery({
    queryKey: ijpKeys.settings(),
    queryFn: () => ijpService.getSettings(),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ijpService.updateSettings.bind(ijpService),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ijpKeys.settings() });
      toast({
        title: "Settings updated",
        description: "IJP settings have been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update settings",
        variant: "destructive",
      });
    },
  });
}

// Reports hooks
export function useReports(params: {
  startDate?: string;
  endDate?: string;
  type?: string;
}) {
  return useQuery({
    queryKey: [...ijpKeys.reports(), params],
    queryFn: () => ijpService.getReports(params),
    enabled: !!(params.startDate && params.endDate),
  });
}

export function useExportData() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ type, format }: { type: 'applications' | 'interviews' | 'offers'; format: 'csv' | 'xlsx' }) =>
      ijpService.exportData(type, format),
    onSuccess: (data) => {
      toast({
        title: "Export ready",
        description: "Your data export is ready for download",
      });
      // Could trigger download here
    },
    onError: () => {
      toast({
        title: "Export failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    },
  });
}