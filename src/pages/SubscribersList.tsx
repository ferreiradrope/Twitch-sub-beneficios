
import { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";
import { getAllSubscribers, getUserRedemptionDetails } from "@/services/subscriberService";
import { User, Redemption } from "@/models/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { 
  Search, 
  Users, 
  Calendar, 
  Clock, 
  User as UserIcon,
  Loader2,
  ArrowUpDown,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const SubscribersList = () => {
  const { user } = useAuth();
  const [subscribers, setSubscribers] = useState<User[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userRedemptions, setUserRedemptions] = useState<Redemption[]>([]);
  const [userRedemptionsLoading, setUserRedemptionsLoading] = useState(false);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const loadSubscribers = async () => {
      try {
        const data = await getAllSubscribers();
        setSubscribers(data);
        setFilteredSubscribers(data);
      } catch (error) {
        console.error("Error loading subscribers:", error);
        toast.error("Erro ao carregar inscritos");
      } finally {
        setLoading(false);
      }
    };

    loadSubscribers();
  }, []);

  useEffect(() => {
    // Filter subscribers based on search query
    const filtered = subscribers.filter(subscriber => 
      subscriber.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredSubscribers(filtered);
  }, [subscribers, searchQuery]);

  const loadUserRedemptions = async (userId: string) => {
    setUserRedemptionsLoading(true);
    try {
      const redemptions = await getUserRedemptionDetails(userId);
      setUserRedemptions(redemptions);
    } catch (error) {
      console.error("Error loading user redemptions:", error);
      toast.error("Erro ao carregar histórico de resgates");
    } finally {
      setUserRedemptionsLoading(false);
    }
  };

  const handleUserSelect = (subscriber: User) => {
    setSelectedUser(subscriber);
    loadUserRedemptions(subscriber.id);
  };

  const handleSort = () => {
    const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    setSortDirection(newDirection);
    
    const sorted = [...filteredSubscribers].sort((a, b) => {
      if (newDirection === 'asc') {
        return a.username.localeCompare(b.username);
      } else {
        return b.username.localeCompare(a.username);
      }
    });
    
    setFilteredSubscribers(sorted);
  };

  const getCategoryLabel = (category: string) => {
    const categoriesMap: Record<string, string> = {
      "analysis": "Análise de Time",
    };
    
    return categoriesMap[category] || category;
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold animate-fade-in">Lista de Inscritos</h1>
          <p className="text-muted-foreground animate-fade-in animate-delay-100">
            Gerencie os inscritos do seu canal e visualize o histórico de resgates
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="glass-card p-6 rounded-xl shadow-md animate-fade-in animate-delay-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-twitch/10 p-3 rounded-full">
                <Users className="h-6 w-6 text-twitch" />
              </div>
              <div>
                <h2 className="font-medium">Total de Inscritos</h2>
                <p className="text-xl font-semibold">
                  {subscribers.length}
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
                <h2 className="font-medium">Resgates Totais</h2>
                <p className="text-xl font-semibold">
                  {/* Isso seria calculado em uma aplicação real */}
                  12
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
                <h2 className="font-medium">Inscritos Ativos</h2>
                <p className="text-xl font-semibold">
                  {/* Isso seria calculado em uma aplicação real */}
                  {subscribers.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 animate-fade-in animate-delay-500">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-semibold">
              Inscritos do Canal
            </h2>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar inscrito..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 text-twitch animate-spin" />
            </div>
          ) : (
            <>
              {filteredSubscribers.length > 0 ? (
                <div className="glass-card rounded-xl shadow-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Perfil</TableHead>
                        <TableHead className="cursor-pointer" onClick={handleSort}>
                          <div className="flex items-center">
                            Nome de Usuário
                            {sortDirection === 'asc' ? 
                              <ChevronUp className="ml-1 h-4 w-4" /> : 
                              <ChevronDown className="ml-1 h-4 w-4" />
                            }
                          </div>
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubscribers.map(subscriber => (
                        <TableRow key={subscriber.id}>
                          <TableCell>
                            <Avatar className="h-10 w-10 border border-border">
                              <AvatarImage src={subscriber.avatar} />
                              <AvatarFallback>{subscriber.username.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">{subscriber.username}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                              Inscrito
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Sheet>
                              <SheetTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleUserSelect(subscriber)}
                                >
                                  Ver detalhes
                                </Button>
                              </SheetTrigger>
                              <SheetContent className="w-[400px] sm:w-[540px]">
                                {selectedUser && (
                                  <SheetHeader className="mb-6">
                                    <div className="flex items-center gap-4">
                                      <Avatar className="h-16 w-16 border border-border">
                                        <AvatarImage src={selectedUser.avatar} />
                                        <AvatarFallback>{selectedUser.username.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <SheetTitle>{selectedUser.username}</SheetTitle>
                                        <SheetDescription>
                                          ID: {selectedUser.id}
                                        </SheetDescription>
                                      </div>
                                    </div>
                                  </SheetHeader>
                                )}
                                
                                <div className="space-y-6">
                                  <div>
                                    <h3 className="text-lg font-medium mb-4">Histórico de Resgates</h3>
                                    
                                    {userRedemptionsLoading ? (
                                      <div className="flex justify-center py-8">
                                        <Loader2 className="h-8 w-8 text-twitch animate-spin" />
                                      </div>
                                    ) : (
                                      <>
                                        {userRedemptions.length > 0 ? (
                                          <div className="space-y-4">
                                            {userRedemptions.map((redemption) => (
                                              <div key={redemption.id} className="border border-border rounded-md p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                  <div>
                                                    <h4 className="font-medium">{redemption.benefitTitle}</h4>
                                                    <p className="text-xs text-muted-foreground">
                                                      {getCategoryLabel(redemption.category)}
                                                    </p>
                                                  </div>
                                                  <Badge
                                                    className={
                                                      redemption.status === "completed" 
                                                        ? "bg-green-100 text-green-800"
                                                        : redemption.status === "cancelled"
                                                          ? "bg-red-100 text-red-800" 
                                                          : "bg-amber-100 text-amber-800"
                                                    }
                                                  >
                                                    {redemption.status === "completed" 
                                                      ? "Completado" 
                                                      : redemption.status === "cancelled" 
                                                        ? "Cancelado" 
                                                        : "Pendente"}
                                                  </Badge>
                                                </div>
                                                <div className="text-sm">
                                                  <p className="text-muted-foreground">
                                                    Data do resgate: {format(new Date(redemption.timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                                  </p>
                                                  {redemption.completedAt && (
                                                    <p className="text-muted-foreground">
                                                      Completado em: {format(new Date(redemption.completedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="text-center py-8 border border-dashed border-border rounded-md">
                                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                            <p className="text-muted-foreground">
                                              Nenhum resgate encontrado para este usuário.
                                            </p>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </SheetContent>
                            </Sheet>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-border rounded-md">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  {searchQuery ? (
                    <p className="text-muted-foreground">
                      Nenhum inscrito encontrado para "{searchQuery}".
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      Não há inscritos cadastrados.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default SubscribersList;
