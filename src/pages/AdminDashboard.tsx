import { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getAllRedemptions, 
  updateRedemptionStatus 
} from "@/services/benefitService";
import { 
  Redemption, 
  RedemptionStatus 
} from "@/models/types";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  AlertCircle, 
  Calendar, 
  Check, 
  Clock, 
  ListTodo, 
  Loader2, 
  Search,
  Users, 
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [filteredRedemptions, setFilteredRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    const loadRedemptions = async () => {
      try {
        const data = await getAllRedemptions();
        setRedemptions(data);
        setFilteredRedemptions(data);
      } catch (error) {
        console.error("Error loading redemptions:", error);
        toast.error("Erro ao carregar resgates");
      } finally {
        setLoading(false);
      }
    };

    loadRedemptions();

    // Refresh data every 30 seconds
    const interval = setInterval(loadRedemptions, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Filter redemptions based on search query and active tab
    const filtered = redemptions.filter(redemption => {
      const matchesSearch = 
        redemption.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        redemption.benefitTitle.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (activeTab === "all") return matchesSearch;
      return matchesSearch && redemption.status === activeTab;
    });
    
    setFilteredRedemptions(filtered);
  }, [redemptions, searchQuery, activeTab]);

  const handleStatusUpdate = async (redemptionId: string, newStatus: RedemptionStatus) => {
    try {
      setProcessingIds(prev => ({ ...prev, [redemptionId]: true }));
      
      // Update status
      const updatedRedemption = await updateRedemptionStatus(redemptionId, newStatus);
      
      // Update local state
      setRedemptions(prev => 
        prev.map(r => r.id === redemptionId ? updatedRedemption : r)
      );
      
      toast.success(`Resgate ${newStatus === RedemptionStatus.COMPLETED ? "completado" : "cancelado"} com sucesso`);
    } catch (error) {
      console.error("Error updating redemption status:", error);
      toast.error("Erro ao atualizar status do resgate");
    } finally {
      setProcessingIds(prev => ({ ...prev, [redemptionId]: false }));
    }
  };

  const getPendingCount = () => {
    return redemptions.filter(r => r.status === RedemptionStatus.PENDING).length;
  };

  const getRedemptionsCountByCategory = () => {
    const counts: Record<string, number> = {};
    
    filteredRedemptions.forEach(redemption => {
      if (redemption.status === RedemptionStatus.PENDING) {
        counts[redemption.category] = (counts[redemption.category] || 0) + 1;
      }
    });
    
    return counts;
  };

  const getCategoryLabel = (category: string) => {
    const categoriesMap: Record<string, string> = {
      "analysis": "Análise de Time",
    };
    
    return categoriesMap[category] || category;
  };

  const statusLabels: Record<RedemptionStatus, string> = {
    [RedemptionStatus.PENDING]: "Pendente",
    [RedemptionStatus.COMPLETED]: "Completado",
    [RedemptionStatus.CANCELLED]: "Cancelado"
  };

  const statusColors: Record<RedemptionStatus, string> = {
    [RedemptionStatus.PENDING]: "bg-amber-100 text-amber-800",
    [RedemptionStatus.COMPLETED]: "bg-green-100 text-green-800",
    [RedemptionStatus.CANCELLED]: "bg-red-100 text-red-800"
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold animate-fade-in">Painel do Streamer</h1>
          <p className="text-muted-foreground animate-fade-in animate-delay-100">
            Gerencie os benefícios e resgates do seu canal
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="glass-card p-6 rounded-xl shadow-md animate-fade-in animate-delay-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-twitch/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-twitch" />
              </div>
              <div>
                <h2 className="font-medium">Total de Resgates</h2>
                <p className="text-xl font-semibold">
                  {redemptions.length}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl shadow-md animate-fade-in animate-delay-300">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-twitch/10 p-3 rounded-full">
                <ListTodo className="h-6 w-6 text-twitch" />
              </div>
              <div>
                <h2 className="font-medium">Resgates Pendentes</h2>
                <p className="text-xl font-semibold">
                  {getPendingCount()}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl shadow-md animate-fade-in animate-delay-400">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-twitch/10 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-twitch" />
              </div>
              <div>
                <h2 className="font-medium">Último Resgate</h2>
                <p className="text-sm text-muted-foreground">
                  {redemptions.length > 0 
                    ? formatDistanceToNow(new Date(redemptions[0].timestamp), {
                        addSuffix: true,
                        locale: ptBR
                      })
                    : "Nenhum resgate ainda"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 animate-fade-in animate-delay-500">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-semibold">
              Fila de Resgates
            </h2>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuário..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Tabs 
            defaultValue="pending" 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full md:w-auto bg-muted/50">
              <TabsTrigger value="pending" className="relative">
                Pendentes
                {getPendingCount() > 0 && (
                  <Badge className="ml-1.5 bg-twitch hover:bg-twitch-dark">
                    {getPendingCount()}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="completed">Completados</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
              <TabsTrigger value="all">Todos</TabsTrigger>
            </TabsList>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 text-twitch animate-spin" />
              </div>
            ) : (
              <>
                {/* Display category sections for pending items */}
                {activeTab === "pending" && (
                  <div className="mt-8">
                    {Object.entries(getRedemptionsCountByCategory()).map(([category, count]) => (
                      <div key={category} className="mb-8">
                        <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                          <span className="bg-accent/50 px-2 py-1 rounded-md text-accent-foreground">
                            {getCategoryLabel(category)}
                          </span>
                          <Badge variant="outline">{count}</Badge>
                        </h3>
                        
                        <div className="glass-card rounded-xl shadow-md overflow-hidden">
                          <div className="divide-y divide-border">
                            {filteredRedemptions
                              .filter(r => r.status === RedemptionStatus.PENDING && r.category === category)
                              .map(redemption => (
                                <div key={redemption.id} className="p-4 animate-fade-in">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                      <Avatar className="h-10 w-10 border border-border">
                                        <AvatarImage src={redemption.userAvatar} />
                                        <AvatarFallback>{redemption.username.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      
                                      <div>
                                        <p className="font-medium">{redemption.username}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {redemption.benefitTitle}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {format(new Date(redemption.timestamp), "dd/MM/yyyy HH:mm")}
                                          {" · "}
                                          {formatDistanceToNow(new Date(redemption.timestamp), {
                                            addSuffix: true,
                                            locale: ptBR
                                          })}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      {processingIds[redemption.id] ? (
                                        <Loader2 className="h-5 w-5 text-twitch animate-spin" />
                                      ) : (
                                        <>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleStatusUpdate(redemption.id, RedemptionStatus.CANCELLED)}
                                          >
                                            <X className="h-4 w-4 mr-1" />
                                            <span>Recusar</span>
                                          </Button>
                                          
                                          <Button 
                                            size="sm"
                                            className="bg-twitch hover:bg-twitch-dark"
                                            onClick={() => handleStatusUpdate(redemption.id, RedemptionStatus.COMPLETED)}
                                          >
                                            <Check className="h-4 w-4 mr-1" />
                                            <span>Completar</span>
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {Object.keys(getRedemptionsCountByCategory()).length === 0 && (
                      <div className="text-center py-12">
                        <div className="mb-4">
                          <Clock className="h-12 w-12 mx-auto text-muted-foreground/50" />
                        </div>
                        <p className="text-muted-foreground">
                          Não há resgates pendentes no momento.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Other tabs */}
                {(activeTab === "completed" || activeTab === "cancelled" || activeTab === "all") && (
                  <TabsContent value={activeTab} className="mt-6">
                    {filteredRedemptions.length > 0 ? (
                      <div className="glass-card rounded-xl shadow-md overflow-hidden">
                        <div className="divide-y divide-border">
                          {filteredRedemptions.map(redemption => (
                            <div key={redemption.id} className="p-4 animate-fade-in">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                  <Avatar className="h-10 w-10 border border-border">
                                    <AvatarImage src={redemption.userAvatar} />
                                    <AvatarFallback>{redemption.username.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium">{redemption.username}</p>
                                      <div className={`px-2 py-0.5 rounded-full text-xs ${statusColors[redemption.status]}`}>
                                        {statusLabels[redemption.status]}
                                      </div>
                                    </div>
                                    
                                    <p className="text-sm">
                                      {redemption.benefitTitle}
                                      <span className="text-xs text-muted-foreground ml-2">
                                        ({getCategoryLabel(redemption.category)})
                                      </span>
                                    </p>
                                    
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {format(new Date(redemption.timestamp), "dd/MM/yyyy HH:mm")}
                                      {" · "}
                                      {formatDistanceToNow(new Date(redemption.timestamp), {
                                        addSuffix: true,
                                        locale: ptBR
                                      })}
                                    </p>
                                    
                                    {redemption.completedAt && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Completado: {format(new Date(redemption.completedAt), "dd/MM/yyyy HH:mm")}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Allow changing completed to cancelled and vice versa */}
                                {redemption.status !== RedemptionStatus.PENDING && (
                                  <div>
                                    {processingIds[redemption.id] ? (
                                      <Loader2 className="h-5 w-5 text-twitch animate-spin" />
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleStatusUpdate(
                                          redemption.id, 
                                          redemption.status === RedemptionStatus.COMPLETED 
                                            ? RedemptionStatus.CANCELLED 
                                            : RedemptionStatus.COMPLETED
                                        )}
                                      >
                                        {redemption.status === RedemptionStatus.COMPLETED ? (
                                          <span className="flex items-center gap-1">
                                            <X className="h-4 w-4" />
                                            Marcar como cancelado
                                          </span>
                                        ) : (
                                          <span className="flex items-center gap-1">
                                            <Check className="h-4 w-4" />
                                            Marcar como completado
                                          </span>
                                        )}
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        {searchQuery ? (
                          <>
                            <div className="mb-4">
                              <Search className="h-12 w-12 mx-auto text-muted-foreground/50" />
                            </div>
                            <p className="text-muted-foreground">
                              Nenhum resultado encontrado para "{searchQuery}".
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="mb-4">
                              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/50" />
                            </div>
                            <p className="text-muted-foreground">
                              Não há resgates {activeTab === "all" ? "" : activeTab === "completed" ? "completados" : "cancelados"}.
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </TabsContent>
                )}
              </>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
