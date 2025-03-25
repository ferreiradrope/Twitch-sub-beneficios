
export interface User {
  id: string;
  username: string;
  avatar: string;
  isSubscriber: boolean;
  isAdmin: boolean;
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  category: string;
  cooldownDays: number;
  enabled: boolean;
}

export enum RedemptionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled"
}

export interface Redemption {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  benefitId: string;
  benefitTitle: string;
  category: string;
  timestamp: string;
  status: RedemptionStatus;
  completedAt?: string;
}

export interface UserRedemptionHistory {
  benefitId: string;
  lastRedeemed: string;
}
