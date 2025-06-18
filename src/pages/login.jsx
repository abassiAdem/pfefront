import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { login } from "../Store/auth2Slice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"
import { setCurrentUserId } from "../Store/DemandeSlice"
export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, user,token,roles, loading, error: authError } = useSelector((state) => state.auth);
  useEffect(() => {
    if (authError && !authError.includes('Network Error') && !authError.includes('CONNREFUSED')) {
      setError(authError);
    }
  }, [authError]);
  useEffect(() => {
    if (user) {
      dispatch(setCurrentUserId(user.id));
    }
  }, [user, dispatch]);
  useEffect(() => {
    if (isAuthenticated && roles) {
  
      redirectTo();
    }
  }, [isAuthenticated, roles]);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const redirectTo = () => {
    if (!roles || !roles.realmRoles || !roles.clientRoles) return;
  
    if (roles.realmRoles.includes("admin") || roles.clientRoles.includes("admin")) {
      navigate("/dashboard");
    } else if (roles.realmRoles.includes("employe") || roles.clientRoles.includes("employe")) {
      navigate("/employe");
    } else if (roles.realmRoles.includes("responsable") || roles.clientRoles.includes("responsable"))  {
      navigate("/responsable");
    }
    else if (roles.realmRoles.includes("realisateur") || roles.clientRoles.includes("realisateur"))  {
      navigate("/realisateur");
    }else if (roles.realmRoles.includes("chef") || roles.clientRoles.includes("chef"))  {
      navigate("/chef");
    }else if (roles.realmRoles.includes("superuser") || roles.clientRoles.includes("superuser"))  {
      navigate("/superuser");
    }else{
      navigate("/unauthorized");
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Username and password are required");
      return;
    }

    try {
     await dispatch(login({ username, password }));

    } catch (err) {
      setError(err?.payload || "Login failed. Please check your credentials.");
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
    <div className="w-full max-w-md p-6 bg-gray-50">
         <div className="space-y-1 my-4">
          <p className="text-2xl font-bold text-[#00326a] text-center">Connectez-vous</p>
          <p className="text-center">Entrez vos identifiants pour accéder à votre compte</p>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            id="username"
            type="text"
            placeholder="Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            className="w-full rounded-full h-[50px] border border-gray-300 px-4 py-3 focus:outline-none focus:ring-0 focus:border-orange-500 bg-white"
          />
        </div>
        <div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-full border h-[50px] border-gray-300 px-4 py-3 pr-24 focus:outline-none focus:ring-0 focus:border-orange-500 bg-white"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center">
              <button type="button" className="text-amber-500 hover:text-amber-600" onClick={togglePasswordVisibility}>
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
              </button>
            </div>
          </div>
        </div>
        <Button
          type="submit"
          className={`w-full rounded-full h-[50px] py-6 font-medium ${
            username && password
              ? "bg-[#003b7e] hover:bg-[#00326a] text-white"
              : "bg-gray-200 text-gray-500 hover:bg-gray-200 cursor-default"
          }`}
          disabled={loading || !username || !password}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connexion...
            </>
          ) : (
            "Connexion"
          )}
        </Button>
      </form>
    </div>
    </div>
  )
}