import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const ADMIN_PASSWORD = "admin123";

const Login = () => {
  const navigate = useNavigate();
  const [loginPwd, setLoginPwd] = useState("");

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (loginPwd === ADMIN_PASSWORD) {
      localStorage.setItem("diario-admin", "1");
      toast.success("Login admin realizado");
      navigate("/");
    } else {
      toast.error("Senha incorreta");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-sm px-4">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-primary">
            Editorial · Política
          </p>
          <h1 className="mt-2 font-serif text-4xl text-foreground">Diário</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Acesso restrito à administração
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl text-center">
              Login Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginPwd}
                  onChange={(e) => setLoginPwd(e.target.value)}
                  placeholder="Digite a senha de administrador"
                  autoFocus
                />
              </div>
              <Button type="submit" size="lg" className="w-full">
                Entrar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => navigate("/")}
              >
                Voltar para o feed
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
