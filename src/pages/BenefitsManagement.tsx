
import { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getAllBenefits, 
  updateBenefit, 
  createBenefit, 
  deleteBenefit 
} from "@/services/benefitService";
import { Benefit } from "@/models/types";
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Loader2, 
  Save,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Switch } from "@/components/ui/switch";

// Form schema for validating benefit data
const benefitFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().min(5, "A descrição deve ter pelo menos 5 caracteres"),
  category: z.string().min(2, "A categoria deve ter pelo menos 2 caracteres"),
  cooldownDays: z.coerce.number().min(1, "O tempo de espera deve ser pelo menos 1 dia"),
  enabled: z.boolean().default(true)
});

type BenefitFormValues = z.infer<typeof benefitFormSchema>;

const BenefitsManagement = () => {
  const { user } = useAuth();
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentBenefit, setCurrentBenefit] = useState<Benefit | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  // Initialize form
  const form = useForm<BenefitFormValues>({
    resolver: zodResolver(benefitFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      cooldownDays: 30,
      enabled: true
    }
  });

  // Load benefits data
  useEffect(() => {
    const loadBenefits = async () => {
      try {
        setLoading(true);
        const data = await getAllBenefits();
        setBenefits(data);
      } catch (error) {
        console.error("Error loading benefits:", error);
        toast.error("Erro ao carregar benefícios");
      } finally {
        setLoading(false);
      }
    };

    loadBenefits();
  }, []);

  // Open edit dialog with benefit data
  const handleEditBenefit = (benefit: Benefit) => {
    setCurrentBenefit(benefit);
    form.reset({
      id: benefit.id,
      title: benefit.title,
      description: benefit.description,
      category: benefit.category,
      cooldownDays: benefit.cooldownDays,
      enabled: benefit.enabled
    });
    setEditDialogOpen(true);
  };

  // Open create dialog
  const handleNewBenefit = () => {
    setCurrentBenefit(null);
    form.reset({
      title: "",
      description: "",
      category: "",
      cooldownDays: 30,
      enabled: true
    });
    setEditDialogOpen(true);
  };

  // Open delete confirmation dialog
  const handleDeleteConfirmation = (benefit: Benefit) => {
    setCurrentBenefit(benefit);
    setDeleteDialogOpen(true);
  };

  // Submit form handler
  const onSubmit = async (values: BenefitFormValues) => {
    try {
      setProcessingAction(true);
      let updatedBenefit: Benefit;
      
      if (values.id) {
        // Update existing benefit
        updatedBenefit = await updateBenefit({
          ...values,
          id: values.id
        } as Benefit);
        
        // Update benefits list
        setBenefits(prev => 
          prev.map(b => b.id === updatedBenefit.id ? updatedBenefit : b)
        );
        
        toast.success("Benefício atualizado com sucesso");
      } else {
        // Create new benefit
        updatedBenefit = await createBenefit({
          ...values,
          id: `benefit-${Date.now()}` // Generate temporary ID
        } as Benefit);
        
        // Add to benefits list
        setBenefits(prev => [updatedBenefit, ...prev]);
        
        toast.success("Benefício criado com sucesso");
      }
      
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error saving benefit:", error);
      toast.error("Erro ao salvar benefício");
    } finally {
      setProcessingAction(false);
    }
  };

  // Delete benefit handler
  const handleDeleteBenefit = async () => {
    if (!currentBenefit) return;
    
    try {
      setProcessingAction(true);
      await deleteBenefit(currentBenefit.id);
      
      // Remove from benefits list
      setBenefits(prev => prev.filter(b => b.id !== currentBenefit.id));
      
      toast.success("Benefício excluído com sucesso");
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting benefit:", error);
      toast.error("Erro ao excluir benefício");
    } finally {
      setProcessingAction(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold animate-fade-in">Gerenciar Benefícios</h1>
          <p className="text-muted-foreground animate-fade-in animate-delay-100">
            Adicione, edite ou remova benefícios para seus inscritos
          </p>
        </header>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Lista de Benefícios</h2>
          <Button 
            onClick={handleNewBenefit}
            className="bg-twitch hover:bg-twitch-dark"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Benefício
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 text-twitch animate-spin" />
          </div>
        ) : (
          <>
            {benefits.length > 0 ? (
              <div className="glass-card rounded-xl shadow-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Tempo de Espera</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {benefits.map(benefit => (
                      <TableRow key={benefit.id}>
                        <TableCell className="font-medium">{benefit.title}</TableCell>
                        <TableCell>{benefit.category}</TableCell>
                        <TableCell>{benefit.cooldownDays} dias</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={benefit.enabled ? 
                              "bg-green-100 text-green-800 hover:bg-green-100" : 
                              "bg-red-100 text-red-800 hover:bg-red-100"
                            }
                          >
                            {benefit.enabled ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditBenefit(benefit)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteConfirmation(benefit)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-border rounded-md">
                <PlusCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Não há benefícios cadastrados.
                </p>
                <Button 
                  onClick={handleNewBenefit}
                  variant="outline" 
                  className="mt-4"
                >
                  Adicionar Benefício
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Edit/Create Benefit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentBenefit ? "Editar Benefício" : "Novo Benefício"}
            </DialogTitle>
            <DialogDescription>
              {currentBenefit 
                ? "Altere as informações do benefício abaixo." 
                : "Preencha as informações para criar um novo benefício."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título do benefício" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nome do benefício que será exibido aos inscritos.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descrição do benefício" 
                        {...field} 
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      Explique detalhadamente o que o benefício oferece.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <Input placeholder="Categoria" {...field} />
                      </FormControl>
                      <FormDescription>
                        Ex: análise, coaching, jogo
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="cooldownDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tempo de Espera (dias)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Intervalo mínimo entre resgates (em dias)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Ativar Benefício
                      </FormLabel>
                      <FormDescription>
                        Quando ativo, os inscritos poderão resgatar este benefício.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-twitch hover:bg-twitch-dark"
                  disabled={processingAction}
                >
                  {processingAction && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o benefício "{currentBenefit?.title}"?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleDeleteBenefit}
              disabled={processingAction}
            >
              {processingAction && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BenefitsManagement;
