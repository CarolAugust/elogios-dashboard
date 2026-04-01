import React from "react";
import { Redirect } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { isGestor } from "@/lib/permissions";

type Props = {
  children: React.ReactNode;
  allow: "anyLogged" | "gestorOnly";
};

export default function ProtectedRoute({ children, allow }: Props) {
  const { user, isLoading } = useAuth() as any;

  // se seu AuthContext não tiver isLoading, pode apagar esse bloco
  if (isLoading) return null;

  if (!user) {
    // se você tem rota de login, troca aqui
    return <Redirect to="/" />;
  }

  const gestor = isGestor(user);

  if (allow === "anyLogged") return <>{children}</>;
  if (allow === "gestorOnly" && gestor) return <>{children}</>;

  // não-gestor tentando acessar área restrita
  return <Redirect to="/elogios/votacao" />;
}
