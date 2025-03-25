
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TwitchLogo } from "@/components/TwitchLogo";
import { Shield, User } from "lucide-react";

const Login = () => {
  const { user, loginAsAdmin, loginAsSubscriber } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        <TwitchLogo className="h-16 w-16 mb-6 text-twitch animate-fade-in" />
        
        <h1 className="text-3xl font-bold mb-2 animate-fade-in animate-delay-100">
          Twitch Subscriber Benefits
        </h1>
        
        <p className="text-muted-foreground mb-10 animate-fade-in animate-delay-200">
          Resgate benefícios exclusivos como inscrito do canal
        </p>
        
        <div className="space-y-4 w-full animate-fade-in animate-delay-300">
          <Button 
            onClick={loginAsSubscriber}
            className="w-full py-6 flex items-center justify-center gap-2 bg-twitch hover:bg-twitch-dark"
          >
            <User className="h-5 w-5" />
            <span>Entrar como Inscrito</span>
          </Button>
          
          <Button 
            onClick={loginAsAdmin}
            className="w-full py-6 flex items-center justify-center gap-2"
            variant="outline"
          >
            <Shield className="h-5 w-5" />
            <span>Entrar como Streamer</span>
          </Button>
          
          <p className="text-xs text-muted-foreground mt-6">
            Em uma aplicação real, a autenticação seria feita através da API da Twitch.
            Este é apenas um exemplo com dados simulados para demonstração.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
