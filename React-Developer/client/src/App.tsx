import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { MainLayout } from "@/components/MainLayout";

import Dashboard from "@/pages/Dashboard";
import Export from "@/pages/Export";
import Admin from "@/pages/Admin";
import Votacao from "@/pages/Votacao";
import NotFound from "@/pages/not-found";

import ProtectedRoute from "@/components/ProtectedRoute";
import { isGestor } from "@/lib/permissions";

function Router() {
  const { user } = useAuth() as any;

  return (
    <MainLayout>
      <Switch>
        <Route path="/">
          {/* ✅ home inteligente */}
          <Redirect to={isGestor(user) ? "/elogios/dashboard" : "/elogios/votacao"} />
        </Route>

        {/* ✅ VOTAÇÃO: qualquer logado */}
        <Route path="/elogios/votacao">
          <ProtectedRoute allow="anyLogged">
            <Votacao />
          </ProtectedRoute>
        </Route>

        {/* ✅ ROTAS DE GESTOR */}
        <Route path="/elogios/dashboard">
          <ProtectedRoute allow="gestorOnly">
            <Dashboard />
          </ProtectedRoute>
        </Route>

        <Route path="/elogios/exportacao">
          <ProtectedRoute allow="gestorOnly">
            <Export />
          </ProtectedRoute>
        </Route>

        <Route path="/elogios/admin">
          <ProtectedRoute allow="gestorOnly">
            <Admin />
          </ProtectedRoute>
        </Route>

        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
