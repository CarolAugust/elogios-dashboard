import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isGestor } from "@/lib/permissions";

export function MainLayout({ children }: { children: ReactNode }) {
  const { user, login, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const gestor = isGestor(user);

  const base = import.meta.env.BASE_URL; // ✅ resolve /elogios/ ou /

  const handleLogin = async () => {
    try {
      if (!username.trim() || !password.trim()) {
        alert("Informe usuário e senha");
        return;
      }
      await login(username.trim(), password.trim());
    } catch (e: any) {
      alert(e?.message ?? "Falha no login");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative"
        style={{ backgroundImage: `url('${base}image.png')` }} // ✅ fundo em client/public/image.png
      >
        <div className="absolute inset-0 bg-black/40" />

        <Card className="relative z-15 w-full max-w-sm shadow-xl border-t-4 border-t-primary">
          <CardHeader className="text-center">
            <div >
              <img
                src={`${base}logopizzatto.png`} // ✅ logo em client/public/logopizzatto.png
                alt="Pizzatto"
                className="mx-auto block h-20 w-full max-w-[220px] object-contain mb-4"
              />
            </div>

            <CardTitle className="text-3xl font-bold">Bem-vindo</CardTitle>
            <p className="text-muted-foreground mt-2">Faça login para continuar</p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Usuário</label>
              <Input
                placeholder="admin ou gestor"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Senha</label>
              <Input
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <Button className="w-full text-base py-4" onClick={handleLogin}>
              Entrar
            </Button>

            <div className="text-xs text-center text-muted-foreground mt-4">
              <p>Rota da Oportunidade - Pizzattolog</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-muted/10">
      <Sidebar gestor={gestor} />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}