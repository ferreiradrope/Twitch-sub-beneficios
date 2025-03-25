
import { User } from "@/models/types";

// Mock de usuários inscritos para simulação
const SUBSCRIBERS: User[] = [
  {
    id: "user-1",
    username: "viewer1",
    avatar: "https://static-cdn.jtvnw.net/jtv_user_pictures/ad9b44c9-afb5-4df7-b8ff-acc103ef42b6-profile_image-300x300.png",
    isSubscriber: true,
    isAdmin: false
  },
  {
    id: "user-2",
    username: "viewer2",
    avatar: "https://static-cdn.jtvnw.net/jtv_user_pictures/8a6381c7-d0c1-4882-8c51-8fec7ee5fe0d-profile_image-300x300.png",
    isSubscriber: true,
    isAdmin: false
  },
  {
    id: "user-3",
    username: "viewer3",
    avatar: "https://static-cdn.jtvnw.net/jtv_user_pictures/7d33c7c2-a0b6-4856-8f65-e47a553abdb3-profile_image-300x300.png",
    isSubscriber: true,
    isAdmin: false
  },
  {
    id: "user-4",
    username: "viewer4",
    avatar: "https://static-cdn.jtvnw.net/jtv_user_pictures/3f00c94f-a1c7-4a0d-9fc4-9b0b74e4f341-profile_image-300x300.png",
    isSubscriber: true,
    isAdmin: false
  },
  {
    id: "user-5",
    username: "viewer5",
    avatar: "https://static-cdn.jtvnw.net/jtv_user_pictures/05544e79-0969-4ae7-afaf-6290daf5673c-profile_image-300x300.png",
    isSubscriber: true,
    isAdmin: false
  }
];

// Obter todos os inscritos do canal
export const getAllSubscribers = async (): Promise<User[]> => {
  // Em uma aplicação real, isso buscaria da API da Twitch
  return SUBSCRIBERS;
};

// Obter histórico detalhado de resgates por usuário
export const getUserRedemptionDetails = async (userId: string) => {
  // Importação dentro da função para evitar importação circular
  const { getAllRedemptions } = await import("./benefitService");
  
  // Obter todos os resgates
  const allRedemptions = await getAllRedemptions();
  
  // Filtrar resgates pelo usuário específico
  return allRedemptions.filter(redemption => redemption.userId === userId);
};

