
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/api/patientApi";
import { useRole } from "@/contexts/RoleContext";
import { useUser } from "@/contexts/UserContext"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "doctor" | "pharmacist" | "patient">("patient");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setRole: setGlobalRole } = useRole();
  const { setName: setUserName, setSurname: setUserSurname } = useUser();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Call the login API with role included
      const response = await login({ username: email, password, role });
      // Update the global role state
      setGlobalRole(role);
      setUserName(response.name);
      setUserSurname(response.surname);

      toast({
        title: "Logged in successfully",
        description: `Welcome to HealthHub EHR System ${role + " "+ response.name + " " + response.surname}`,
      });
      
      // Redirect based on role
      switch (role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "doctor":
          navigate("/doctor/dashboard");
          break;
        case "pharmacist":
          navigate("/pharmacist/dashboard");
          break;
        case "patient":
          navigate("/patient/dashboard");
          break;
        default:
          navigate("/dashboard"); // Fallback route
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error instanceof Error ? error.message : "Invalid credentials");
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle demo quick access logins
  const handleQuickAccess = (selectedRole: "admin" | "doctor" | "pharmacist" | "patient") => {
    setGlobalRole(selectedRole);
    
    toast({
      title: `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Login`,
      description: `Logged in as ${selectedRole}`,
    });

    // Redirect based on role
    switch (selectedRole) {
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "doctor":
        navigate("/doctor/dashboard");
        break;
      case "pharmacist":
        navigate("/pharmacist/dashboard");
        break;
      case "patient":
        navigate("/patient/dashboard");
        break;
      default:
        navigate("/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-health-50 to-health-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            HealthHub Login
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the system
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Login Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-health-600 hover:text-health-700 dark:text-health-400 dark:hover:text-health-300"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={(value: any) => setRole(value)} defaultValue={role}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="pharmacist">Pharmacist</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full bg-health-600 hover:bg-health-700" 
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </Button>
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-health-600 hover:text-health-700 dark:text-health-400 dark:hover:text-health-300"
              >
                Contact administrator
              </Link>
            </div>
            {/* Quick access buttons for demo */}
            <div className="border-t pt-4 space-y-2">
              <p className="text-sm text-center text-muted-foreground">
                Demo Quick Access
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickAccess("admin")}
                >
                  Admin
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickAccess("doctor")}
                >
                  Doctor
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickAccess("pharmacist")}
                >
                  Pharmacist
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickAccess("patient")}
                >
                  Patient
                </Button>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
