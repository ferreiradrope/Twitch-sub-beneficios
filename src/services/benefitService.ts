
import { Benefit, Redemption, RedemptionStatus, UserRedemptionHistory } from "@/models/types";

// Mock data for benefits
let BENEFITS: Benefit[] = [
  {
    id: "benefit-team-analysis",
    title: "Análise de Time",
    description: "Solicite uma análise detalhada do seu time pelo streamer.",
    category: "analysis",
    cooldownDays: 31,
    enabled: true
  }
];

// Mock data for redemptions
let REDEMPTIONS: Redemption[] = [
  {
    id: "redemption-1",
    userId: "user-1",
    username: "viewer1",
    userAvatar: "https://static-cdn.jtvnw.net/jtv_user_pictures/ad9b44c9-afb5-4df7-b8ff-acc103ef42b6-profile_image-300x300.png",
    benefitId: "benefit-team-analysis",
    benefitTitle: "Análise de Time",
    category: "analysis",
    timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
    status: RedemptionStatus.COMPLETED,
    completedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString() // 11 days ago
  },
  {
    id: "redemption-2",
    userId: "user-2",
    username: "viewer2",
    userAvatar: "https://static-cdn.jtvnw.net/jtv_user_pictures/ad9b44c9-afb5-4df7-b8ff-acc103ef42b6-profile_image-300x300.png",
    benefitId: "benefit-team-analysis",
    benefitTitle: "Análise de Time",
    category: "analysis",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    status: RedemptionStatus.PENDING
  }
];

// Get all benefits (including disabled ones)
export const getAllBenefits = async (): Promise<Benefit[]> => {
  // In a real app, this would fetch from API
  return [...BENEFITS];
};

// Get all available benefits
export const getAvailableBenefits = async (): Promise<Benefit[]> => {
  // In a real app, this would fetch from API
  return BENEFITS.filter(benefit => benefit.enabled);
};

// Create a new benefit
export const createBenefit = async (benefit: Benefit): Promise<Benefit> => {
  // In a real app, this would save to database
  const newBenefit = {
    ...benefit,
    id: benefit.id || `benefit-${Date.now()}`
  };
  
  BENEFITS.push(newBenefit);
  
  return newBenefit;
};

// Update an existing benefit
export const updateBenefit = async (benefit: Benefit): Promise<Benefit> => {
  // Find benefit index
  const benefitIndex = BENEFITS.findIndex(b => b.id === benefit.id);
  if (benefitIndex === -1) {
    throw new Error("Benefit not found");
  }
  
  // Update benefit
  BENEFITS[benefitIndex] = benefit;
  
  return benefit;
};

// Delete a benefit
export const deleteBenefit = async (benefitId: string): Promise<void> => {
  // Find benefit index
  const benefitIndex = BENEFITS.findIndex(b => b.id === benefitId);
  if (benefitIndex === -1) {
    throw new Error("Benefit not found");
  }
  
  // Remove benefit
  BENEFITS.splice(benefitIndex, 1);
};

// Get user redemption history
export const getUserRedemptionHistory = async (userId: string): Promise<UserRedemptionHistory[]> => {
  // In a real app, this would fetch from API
  // Here we extract redemptions grouped by benefit
  
  const userRedemptions = REDEMPTIONS
    .filter(r => r.userId === userId && r.status !== RedemptionStatus.CANCELLED)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  const history: UserRedemptionHistory[] = [];
  
  // Group by benefitId and take the most recent for each
  const benefitIds = new Set(userRedemptions.map(r => r.benefitId));
  
  benefitIds.forEach(benefitId => {
    const mostRecent = userRedemptions
      .filter(r => r.benefitId === benefitId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    
    if (mostRecent) {
      history.push({
        benefitId: mostRecent.benefitId,
        lastRedeemed: mostRecent.timestamp
      });
    }
  });
  
  return history;
};

// Check if user can redeem a benefit
export const canRedeemBenefit = async (userId: string, benefitId: string): Promise<boolean> => {
  // Get the benefit to check cooldown period
  const benefit = BENEFITS.find(b => b.id === benefitId);
  if (!benefit || !benefit.enabled) return false;
  
  // Get user redemption history
  const history = await getUserRedemptionHistory(userId);
  const lastRedemption = history.find(h => h.benefitId === benefitId);
  
  if (!lastRedemption) return true; // Never redeemed before
  
  // Check if cooldown has passed
  const lastRedeemDate = new Date(lastRedemption.lastRedeemed);
  const cooldownEnd = new Date(lastRedeemDate);
  cooldownEnd.setDate(cooldownEnd.getDate() + benefit.cooldownDays);
  
  return new Date() > cooldownEnd;
};

// Redeem a benefit
export const redeemBenefit = async (
  userId: string, 
  username: string,
  userAvatar: string,
  benefitId: string
): Promise<Redemption> => {
  // Check if can redeem
  const canRedeem = await canRedeemBenefit(userId, benefitId);
  if (!canRedeem) {
    throw new Error("Cannot redeem benefit: cooldown period has not passed");
  }
  
  // Get benefit details
  const benefit = BENEFITS.find(b => b.id === benefitId);
  if (!benefit) {
    throw new Error("Benefit not found");
  }
  
  // Create redemption
  const redemption: Redemption = {
    id: `redemption-${Date.now()}`,
    userId,
    username,
    userAvatar,
    benefitId,
    benefitTitle: benefit.title,
    category: benefit.category,
    timestamp: new Date().toISOString(),
    status: RedemptionStatus.PENDING
  };
  
  // In a real app, this would save to database
  REDEMPTIONS.push(redemption);
  
  return redemption;
};

// Get all redemptions (admin only)
export const getAllRedemptions = async (): Promise<Redemption[]> => {
  // In a real app, this would fetch from API
  return [...REDEMPTIONS].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

// Update redemption status (admin only)
export const updateRedemptionStatus = async (
  redemptionId: string, 
  status: RedemptionStatus
): Promise<Redemption> => {
  // Find redemption
  const redemptionIndex = REDEMPTIONS.findIndex(r => r.id === redemptionId);
  if (redemptionIndex === -1) {
    throw new Error("Redemption not found");
  }
  
  // Update status
  const updatedRedemption = {
    ...REDEMPTIONS[redemptionIndex],
    status,
    ...(status === RedemptionStatus.COMPLETED ? { completedAt: new Date().toISOString() } : {})
  };
  
  REDEMPTIONS[redemptionIndex] = updatedRedemption;
  
  return updatedRedemption;
};
