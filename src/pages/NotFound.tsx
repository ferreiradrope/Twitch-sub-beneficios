
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-accent/20 px-4">
      <div className="w-full max-w-md mx-auto p-8 glass rounded-xl shadow-xl animate-fade-in text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-twitch/10 rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-twitch" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-xl text-muted-foreground mb-6">Página não encontrada</p>
        
        <div className="mb-8 bg-accent/50 rounded-lg p-4 text-sm text-accent-foreground">
          <p>A página que você está tentando acessar não existe ou foi movida.</p>
        </div>
        
        <Button asChild className="bg-twitch hover:bg-twitch-dark transition-smooth">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao início
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
