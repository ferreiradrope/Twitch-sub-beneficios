
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  username: string;
  avatar: string;
  isSubscriber: boolean;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  loginAsAdmin: () => void;
  loginAsSubscriber: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real app, this would verify a token with Twitch API
        const storedUser = localStorage.getItem("twitchUser");
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Redirect to appropriate dashboard based on user role
          if (parsedUser.isAdmin) {
            navigate("/admin");
          } else if (parsedUser.isSubscriber) {
            navigate("/dashboard");
          }
        }
      } catch (error) {
        console.error("Authentication error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Login as subscriber (regular user)
  const loginAsSubscriber = async () => {
    try {
      setLoading(true);
      
      const mockUser: User = {
        id: "12345",
        username: "twitchUser",
        avatar: "https://static-cdn.jtvnw.net/jtv_user_pictures/ad9b44c9-afb5-4df7-b8ff-acc103ef42b6-profile_image-300x300.png",
        isSubscriber: true,
        isAdmin: false
      };
      
      setUser(mockUser);
      localStorage.setItem("twitchUser", JSON.stringify(mockUser));
      
      toast({
        title: "Login successful",
        description: "Logged in as subscriber"
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  // Login as admin (streamer)
  const loginAsAdmin = async () => {
    try {
      setLoading(true);
      
      const mockAdmin: User = {
        id: "admin123",
        username: "streamer",
        avatar: "https://static-cdn.jtvnw.net/jtv_user_pictures/ad9b44c9-afb5-4df7-b8ff-acc103ef42b6-profile_image-300x300.png",
        isSubscriber: true,
        isAdmin: true
      };
      
      setUser(mockAdmin);
      localStorage.setItem("twitchUser", JSON.stringify(mockAdmin));
      
      toast({
        title: "Login successful",
        description: "Logged in as Streamer (Admin)"
      });
      
      navigate("/admin");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  // Regular login (defaults to admin for testing)
  const login = async () => {
    // For testing purposes, we'll default to admin login
    await loginAsAdmin();
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("twitchUser");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginAsAdmin, loginAsSubscriber, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
