export interface DashboardMetrics {
  totalQuizzes: number;
  completedToday: number;
  teamMembers: number;
  activeInvites: number;
}

export interface ProcessInvitationData {
  organizationId: string;
  role: string;
}