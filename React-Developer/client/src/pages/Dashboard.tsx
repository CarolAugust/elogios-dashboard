import { useMemo, useState } from "react";
import { useElogiosStats, useElogios } from "@/hooks/use-elogios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Trophy,
  Building2,
  MapPin,
  TrendingUp,
  User,
  Calendar,
  FilterX,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type StatCardColor = "blue" | "indigo" | "amber" | "emerald";

const colorClasses: Record<
  StatCardColor,
  { overlay: string; iconBg: string; iconText: string }
> = {
  blue: {
    overlay: "bg-blue-500",
    iconBg: "bg-blue-100 dark:bg-blue-900/20",
    iconText: "text-blue-600 dark:text-blue-400",
  },
  indigo: {
    overlay: "bg-indigo-500",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/20",
    iconText: "text-indigo-600 dark:text-indigo-400",
  },
  amber: {
    overlay: "bg-amber-500",
    iconBg: "bg-amber-100 dark:bg-amber-900/20",
    iconText: "text-amber-600 dark:text-amber-400",
  },
  emerald: {
    overlay: "bg-emerald-500",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/20",
    iconText: "text-emerald-600 dark:text-emerald-400",
  },
};

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: any;
  color: StatCardColor;
}) {
  const cls = colorClasses[color];

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border-none shadow-md overflow-hidden relative group">
      <div
        className={`absolute inset-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${cls.overlay}`}
      />
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <div className={`p-2 rounded-lg ${cls.iconBg} ${cls.iconText}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="text-3xl font-bold mt-2 font-display">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {value > 0 ? "Dados filtrados pelo período" : "Sem dados no período"}
        </p>
      </CardContent>
    </Card>
  );
}

function rankBadgeClass(index: number) {
  if (index === 0) return "bg-yellow-100 text-yellow-600";
  if (index === 1) return "bg-gray-100 text-gray-600";
  if (index === 2) return "bg-orange-100 text-orange-600";
  return "bg-slate-100 text-slate-600";
}

function TopList({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: Array<{ motorista: string; totalPoints: number; count: number }>;
}) {
  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {data.map((driver, index) => (
            <div
              key={`${driver.motorista}-${index}`}
              className="flex items-center"
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full font-bold mr-4 ${rankBadgeClass(
                  index
                )}`}
              >
                {index + 1}
              </div>

              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {driver.motorista}
                </p>
                <p className="text-xs text-muted-foreground">
                  {driver.count} elogios registrados
                </p>
              </div>

              <div className="font-bold text-lg">{driver.totalPoints} pts</div>
            </div>
          ))}

          {data.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              Nenhum dado disponível
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [filters, setFilters] = useState({ start: "", end: "" });

  const { data: stats, isLoading: statsLoading } = useElogiosStats(filters);

  const { data: recentElogios, isLoading: elogiosLoading } = useElogios({
    limit: 20,
    start: filters.start || undefined,
    end: filters.end || undefined,
  } as any);

  const isLoading = statsLoading || elogiosLoading;


  const appliedPeriodLabel = useMemo(() => {
    const hasStart = !!filters.start;
    const hasEnd = !!filters.end;
    if (!hasStart && !hasEnd) return "Período: Todos";

    const startTxt = hasStart
      ? format(new Date(filters.start), "dd/MM/yyyy", { locale: ptBR })
      : "—";
    const endTxt = hasEnd
      ? format(new Date(filters.end), "dd/MM/yyyy", { locale: ptBR })
      : "—";

    return `Período: ${startTxt} até ${endTxt}`;
  }, [filters.start, filters.end]);

  const chartData = useMemo(() => {
    return [
      {
        name: "Interno",
        points: stats?.byCategory?.interno ?? 0,
        color: "#3b82f6",
      },
      {
        name: "Gestão",
        points: stats?.byCategory?.gestao ?? 0,
        color: "#8b5cf6",
      },
      {
        name: "Externo",
        points: stats?.byCategory?.externo ?? 0,
        color: "#10b981",
      },
    ];
  }, [stats]);

  // ✅ TOP Internos (recente)
  const topInternosRecent = useMemo(() => {
    const map = new Map<string, { totalPoints: number; count: number }>();

    for (const e of recentElogios?.internos?.data ?? []) {
      const nome = String(e.motorista ?? "Sem nome").trim();
      const cur = map.get(nome) ?? { totalPoints: 0, count: 0 };
      cur.totalPoints += Number(e.pontos ?? 0);
      cur.count += 1;
      map.set(nome, cur);
    }

    return Array.from(map.entries())
      .map(([motorista, v]) => ({ motorista, ...v }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10);
  }, [recentElogios]);

  // ✅ TOP Externos (recente)
  const topExternosRecent = useMemo(() => {
    const map = new Map<string, { totalPoints: number; count: number }>();

    for (const e of recentElogios?.motoristas?.data ?? []) {
      const nome = String(e.motorista ?? "Sem nome").trim();
      const cur = map.get(nome) ?? { totalPoints: 0, count: 0 };
      cur.totalPoints += Number(e.pontos ?? 0);
      cur.count += 1;
      map.set(nome, cur);
    }

    return Array.from(map.entries())
      .map(([motorista, v]) => ({ motorista, ...v }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10);
  }, [recentElogios]);

 
// ✅ Atividade Recente (últimos 5, misturado e ordenado por data)
    const recentList = useMemo(() => {
      const list = [
        ...(recentElogios?.internos?.data ?? []).map((e: any) => ({
          ...e,
          __source: "internos" as const,
          // interno já vem correto
          motorista: String(e.motorista ?? "Sem nome").trim(),
        })),

        ...(recentElogios?.motoristas?.data ?? []).map((e: any) => ({
          ...e,
          __source: "motoristas" as const,
          // ✅ aqui é o ajuste: mostrar quem foi elogiado
          motorista: String(e.nome_motorista ?? e.motorista ?? "Sem nome").trim(),
        })),
      ];

  return list
    .sort(
      (a: any, b: any) =>
        new Date(b.data ?? 0).getTime() - new Date(a.data ?? 0).getTime()
    )
    .slice(0, 5);
}, [recentElogios]);



  const clearFilters = () => setFilters({ start: "", end: "" });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header + Filtros */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Visão geral dos elogios e pontuação dos motoristas.
          </p>
        </div>

        <Card className="border-none shadow-md">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 justify-between">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full md:max-w-xl">
                <div className="space-y-2">
                  <Label>Data Inicial</Label>
                  <Input
                    type="date"
                    value={filters.start}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, start: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Data Final</Label>
                  <Input
                    type="date"
                    value={filters.end}
                    onChange={(e) =>
                      setFilters((p) => ({ ...p, end: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 justify-between md:justify-end">
                <Badge variant="secondary" className="px-3 py-1">
                  {appliedPeriodLabel}
                </Badge>

                <Button variant="outline" onClick={clearFilters}>
                  <FilterX className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Pontos"
          value={stats?.totalPoints || 0}
          icon={Trophy}
          color="blue"
        />
        <StatCard
          title="Elogios Internos"
          value={stats?.byCategory?.interno || 0}
          icon={Building2}
          color="indigo"
        />
        <StatCard
          title="Elogios Gestão"
          value={stats?.byCategory?.gestao || 0}
          icon={TrendingUp}
          color="amber"
        />
        <StatCard
          title="Elogios Externos"
          value={stats?.byCategory?.externo || 0}
          icon={MapPin}
          color="emerald"
        />
      </div>

      {/* Gráfico + Tops */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-10">
        <Card className="lg:col-span-4 border-none shadow-md">
          <CardHeader>
            <CardTitle>Pontuação por Categoria</CardTitle>
            <CardDescription>
              Distribuição de pontos entre os tipos de elogios
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    opacity={0.3}
                  />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="points" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          <TopList
            title="Top Internos (recente)"
            description="Interno + Gestão (baseado nos últimos registros)"
            data={topInternosRecent}
          />
        </div>

        <div className="lg:col-span-3">
          <TopList
            title="Top Externos (recente)"
            description="Externo + Estrada (baseado nos últimos registros)"
            data={topExternosRecent}
          />
        </div>
      </div>

      {/* Atividade Recente */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>
                Últimos elogios registrados no sistema (respeita o período acima)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Motorista</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Pontos</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {recentList.map((elogio: any) => (
                <TableRow
                  key={`${elogio.type}-${elogio.id}-${elogio.motorista}-${elogio.data ?? ""}`}
                  className="hover:bg-muted/50"
                >
                  <TableCell className="font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    {String(elogio.motorista ?? "Sem nome").trim()}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={elogio.type === "interno" ? "default" : "secondary"}
                    >
                      {elogio.type}
                    </Badge>
                  </TableCell>

                  <TableCell className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    {elogio.cidade ?? "-"}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Calendar className="w-3 h-3" />
                      {elogio.data
                        ? format(new Date(elogio.data), "dd/MM/yyyy", {
                            locale: ptBR,
                          })
                        : "-"}
                    </div>
                  </TableCell>

                  <TableCell
                    className="max-w-[300px] truncate text-muted-foreground"
                    title={elogio.descricao || ""}
                  >
                    {elogio.descricao || "-"}
                  </TableCell>

                  <TableCell className="text-right font-bold text-primary">
                    +{elogio.pontos}
                  </TableCell>
                </TableRow>
              ))}

              {recentList.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Nenhum elogio encontrado nesse período.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
