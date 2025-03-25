
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, Settings, Menu, X, LogOut, 
  Clock, User, ChevronDown, Users, Gift
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface NavLink {
  name: string;
  path: string;
  icon: React.ElementType;
}

const NavBar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userLinks: NavLink[] = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Histórico", path: "/history", icon: Clock },
  ];

  const adminLinks: NavLink[] = [
    { name: "Dashboard", path: "/admin", icon: Home },
    { name: "Inscritos", path: "/admin/subscribers", icon: Users },
    { name: "Benefícios", path: "/admin/benefits", icon: Gift },
    { name: "Configurações", path: "/admin/settings", icon: Settings },
  ];

  const links = user?.isAdmin ? adminLinks : userLinks;

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="w-full glass-card sticky top-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to={user?.isAdmin ? "/admin" : "/dashboard"} className="font-bold text-xl">
            <span className="text-twitch">Twitch</span> Benefícios
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <div className="flex items-center space-x-1">
            {links.map((link) => (
              <Button
                key={link.path}
                variant="ghost"
                className={location.pathname === link.path ? 
                  "bg-accent text-accent-foreground" : 
                  "text-foreground hover:bg-secondary/50"}
                onClick={() => handleNavigation(link.path)}
              >
                <span className="flex items-center gap-2">
                  <link.icon className="h-4 w-4" />
                  {link.name}
                </span>
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-secondary/50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} alt={user?.username} />
                    <AvatarFallback className="bg-muted">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span>{user?.username}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <p className="font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {user?.isAdmin ? "Administrador" : user?.isSubscriber ? "Inscrito" : "Usuário"}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <div className="cursor-pointer" onClick={() => handleNavigation("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={logout}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 rounded-md hover:bg-secondary/50"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-2 pb-3 px-4 space-y-1 animate-fade-in">
          {links.map((link) => (
            <div
              key={link.path}
              className={`block ${location.pathname === link.path 
                ? "bg-accent text-accent-foreground" 
                : "text-foreground hover:bg-secondary/50"} px-3 py-2 rounded-md text-base font-medium transition-smooth cursor-pointer`}
              onClick={() => handleNavigation(link.path)}
            >
              <span className="flex items-center gap-2">
                <link.icon className="h-4 w-4" />
                {link.name}
              </span>
            </div>
          ))}
          <div className="pt-2 mt-2 border-t border-border">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
