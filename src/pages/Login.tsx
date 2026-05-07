import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error("Email ou senha incorretos");
      return;
    }
    toast.success("Login realizado");
    navigate("/");
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@exemplo.com"
                  autoFocus
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  required
                />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? "Entrando…" : "Entrar"}
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
