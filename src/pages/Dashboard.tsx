import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import NavBar from "@/components/NavBar";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Benefit, UserRedemptionHistory } from "@/models/types";
import { 
  getAvailableBenefits, 
  getUserRedemptionHistory, 
  canRedeemBenefit,
  redeemBenefit
} from "@/services/benefitService";
import { AlertCircle, Calendar, CheckCircle, Clock, Shield, Users } from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const Dashboard = () => {
  const { user } = useAuth();
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [history, setHistory] = useState<UserRedemptionHistory[]>([]);
  const [redeemableStatus, setRedeemableStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user) return;
        
        const availableBenefits = await getAvailableBenefits();
        setBenefits(availableBenefits);
        
        const redemptionHistory = await getUserRedemptionHistory(user.id);
        setHistory(redemptionHistory);
        
        const status: Record<string, boolean> = {};
        for (const benefit of availableBenefits) {
          status[benefit.id] = await canRedeemBenefit(user.id, benefit.id);
        }
        setRedeemableStatus(status);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  const handleRedeem = async (benefitId: string) => {
    try {
      if (!user) return;
      
      setRedeeming(prev => ({ ...prev, [benefitId]: true }));
      
      await redeemBenefit(
        user.id,
        user.username,
        user.avatar,
        benefitId
      );
      
      setRedeemableStatus(prev => ({ ...prev, [benefitId]: false }));
      
      const benefit = benefits.find(b => b.id === benefitId);
      if (benefit) {
        setHistory(prev => [
          { benefitId, lastRedeemed: new Date().toISOString() },
          ...prev.filter(h => h.benefitId !== benefitId)
        ]);
      }
      
      toast.success("Benefício resgatado com sucesso!", {
        description: "O streamer receberá sua solicitação."
      });
      
      console.log("TTS notification would play here");
      
      console.log("Chat message would be sent here");
      
    } catch (error) {
      console.error("Error redeeming benefit:", error);
      toast.error("Erro ao resgatar benefício", {
        description: "Por favor, tente novamente mais tarde."
      });
    } finally {
      setRedeeming(prev => ({ ...prev, [benefitId]: false }));
    }
  };

  const getTimeUntilNextRedemption = (benefitId: string) => {
    const benefit = benefits.find(b => b.id === benefitId);
    const lastRedemption = history.find(h => h.benefitId === benefitId);
    
    if (!benefit || !lastRedemption) return null;
    
    const lastRedeemDate = new Date(lastRedemption.lastRedeemed);
    const cooldownEnd = new Date(lastRedeemDate);
    cooldownEnd.setDate(cooldownEnd.getDate() + benefit.cooldownDays);
    
    if (new Date() > cooldownEnd) return null;
    
    return formatDistanceToNow(cooldownEnd, { locale: ptBR, addSuffix: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold animate-fade-in">Benefícios para Inscritos</h1>
            <p className="text-muted-foreground animate-fade-in animate-delay-100">
              Resgate benefícios exclusivos como inscrito do canal
            </p>
          </div>
          
          {user?.isAdmin && (
            <Link to="/admin">
              <Button variant="outline" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Painel do Streamer</span>
              </Button>
            </Link>
          )}
        </header>

        {!user?.isSubscriber && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-4 mb-8 animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <div>
                <h3 className="font-medium">Você não é inscrito</h3>
                <p className="text-sm">
                  Para resgatar benefícios, você precisa ser inscrito do canal. 
                  Inscreva-se para ter acesso a todos os benefícios!
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="glass-card p-6 rounded-xl shadow-md animate-fade-in animate-delay-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-twitch/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-twitch" />
              </div>
              <div>
                <h2 className="font-medium">Status da Inscrição</h2>
                <p className="text-sm text-muted-foreground">
                  {user?.isSubscriber ? "Inscrito" : "Não inscrito"}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl shadow-md animate-fade-in animate-delay-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-twitch/10 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-twitch" />
              </div>
              <div>
                <h2 className="font-medium">Benefícios Disponíveis</h2>
                <p className="text-sm text-muted-foreground">
                  {benefits.filter(b => redeemableStatus[b.id]).length} de {benefits.length}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl shadow-md animate-fade-in animate-delay-400">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-twitch/10 p-3 rounded-full">
                <Clock className="h-6 w-6 text-twitch" />
              </div>
              <div>
                <h2 className="font-medium">Último Resgate</h2>
                <p className="text-sm text-muted-foreground">
                  {history.length > 0 
                    ? formatDistanceToNow(new Date(history[0].lastRedeemed), {
                        addSuffix: true,
                        locale: ptBR
                      })
                    : "Nenhum resgate ainda"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-6 animate-fade-in animate-delay-500">
          Benefícios Disponíveis
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-card/50 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const canRedeem = redeemableStatus[benefit.id] && user?.isSubscriber;
              const timeUntilAvailable = getTimeUntilNextRedemption(benefit.id);
              
              return (
                <div 
                  key={benefit.id} 
                  className={`glass-card p-6 rounded-xl shadow-md overflow-hidden relative ${
                    canRedeem ? 'border-twitch/20' : ''
                  } animate-fade-in card-hover`}
                  style={{ animationDelay: `${(index + 5) * 100}ms` }}
                >
                  {canRedeem && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-accent/80 text-accent-foreground text-xs px-2 py-1 rounded-full">
                        Disponível
                      </div>
                    </div>
                  )}
                  
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {benefit.description}
                  </p>
                  
                  <div className="flex items-center text-xs text-muted-foreground mb-4">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Cooldown: {benefit.cooldownDays} dias</span>
                  </div>
                  
                  {user?.isSubscriber ? (
                    canRedeem ? (
                      <Button 
                        className="w-full bg-twitch hover:bg-twitch-dark"
                        onClick={() => handleRedeem(benefit.id)}
                        disabled={redeeming[benefit.id]}
                      >
                        {redeeming[benefit.id] ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Resgatando...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Resgatar Benefício
                          </span>
                        )}
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Button 
                          className="w-full" 
                          variant="outline" 
                          disabled={true}
                        >
                          Em cooldown
                        </Button>
                        {timeUntilAvailable && (
                          <p className="text-xs text-center text-muted-foreground">
                            Disponível novamente {timeUntilAvailable}
                          </p>
                        )}
                      </div>
                    )
                  ) : (
                    <Button 
                      className="w-full" 
                      variant="outline" 
                      disabled={true}
                    >
                      Apenas para inscritos
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {benefits.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Nenhum benefício disponível no momento.
            </p>
          </div>
        )}
        
        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-6 animate-fade-in">
            Histórico de Resgates
          </h2>
          
          {history.length > 0 ? (
            <div className="glass-card p-6 rounded-xl shadow-md animate-fade-in">
              <ul className="divide-y divide-border">
                {history.map((item, index) => {
                  const benefit = benefits.find(b => b.id === item.benefitId);
                  return (
                    <li key={item.benefitId} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{benefit?.title || item.benefitId}</p>
                          <p className="text-sm text-muted-foreground">
                            Resgatado: {format(new Date(item.lastRedeemed), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </p>
                        </div>
                        {benefit && (
                          <div className="text-sm">
                            {redeemableStatus[item.benefitId] ? (
                              <span className="text-green-600 font-medium">
                                Disponível
                              </span>
                            ) : (
                              <span className="text-amber-600 font-medium">
                                Em cooldown
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="text-center py-12 animate-fade-in">
              <p className="text-muted-foreground">
                Você ainda não resgatou nenhum benefício.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
