import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  FileDown,
  Settings,
  LogOut,
  Vote,
  User,
  Menu,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMemo, useState } from "react";

type NavLink = { href: string; label: string; icon: any };

export function Sidebar({ gestor }: { gestor: boolean }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const links: NavLink[] = useMemo(() => {
    // ✅ votante (não-gestor) vê só Votação
    if (!gestor) {
      return [{ href: "/elogios/votacao", label: "Votação", icon: Vote }];
    }

    // ✅ gestor vê tudo normal
    const base: NavLink[] = [
      { href: "/elogios/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/elogios/exportacao", label: "Exportação", icon: FileDown },
      { href: "/elogios/votacao", label: "Votação", icon: Vote },
    ];

    // ✅ admin/contabilizacao vê Admin
    if (user?.role === "admin" || user?.role === "contabilizacao") {
      base.splice(2, 0, { href: "/elogios/admin", label: "Administração", icon: Settings });
    }

    return base;
  }, [gestor, user?.role]);

  const NavItem = ({ link }: { link: NavLink }) => {
    const Icon = link.icon;
    const isActive = location === link.href;

    return (
      <Link
        href={link.href}
        onClick={() => setOpen(false)}
        className={[
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition",
          "outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          isActive
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-foreground hover:bg-muted/60",
        ].join(" ")}
      >
        <div
          className={[
            "flex h-9 w-9 items-center justify-center rounded-lg transition",
            isActive ? "bg-primary-foreground/10" : "bg-muted/40 group-hover:bg-muted/70",
          ].join(" ")}
        >
          <Icon className={["h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground"].join(" ")} />
        </div>

        <span className={["flex-1 text-sm font-medium", isActive ? "text-primary-foreground" : ""].join(" ")}>
          {link.label}
        </span>

        <ChevronRight
          className={[
            "h-4 w-4 transition",
            isActive ? "text-primary-foreground/80" : "text-muted-foreground/60 group-hover:text-muted-foreground",
          ].join(" ")}
        />
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border/60">
        <div className="flex items-center gap-3">
          {/* Se quiser usar a logo do public, descomenta:
              <img src="/elogios/logopizzatto.png" className="h-8 w-auto" alt="Pizzattolog" />
          */}
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Vote className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Pizzattolog
            </h1>
            <p className="text-xs text-muted-foreground">Gestão de Elogios</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 px-4 py-4 overflow-y-auto">
        <p className="px-2 pb-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          Menu
        </p>
        <div className="space-y-2">
          {links.map((link) => (
            <NavItem key={link.href} link={link} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border/60 bg-muted/15">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <User className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user?.username}</p>
            <p className="text-xs text-muted-foreground capitalize truncate">
              {user?.role}
              {gestor ? " • gestor" : ""}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile topbar + drawer */}
      <div className="md:hidden p-4 bg-background border-b flex items-center justify-between sticky top-0 z-50">
        <h1 className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Pizzattolog
        </h1>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="p-0 w-80">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block w-[280px] h-screen sticky top-0">
        <SidebarContent />
      </div>
    </>
  );
}