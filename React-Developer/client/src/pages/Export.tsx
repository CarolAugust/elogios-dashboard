import { useState } from "react";
import { useExportElogios } from "@/hooks/use-elogios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, Search, Loader2 } from "lucide-react";

export default function Export() {
  const [filters, setFilters] = useState({
    type: "interno",
    motorista: "",
    cidade: "",
    start: "",
    end: ""
  });

  const [isExporting, setIsExporting] = useState(false);

  // We manually fetch in the handler to simulate download
const handleExport = async () => {
  setIsExporting(true);

  try {
    const params = new URLSearchParams();

    // Se você quiser manter tipo no front (mesmo que o backend ignore),
    // ok, mas o ideal é o backend também filtrar.
    // params.append("type", filters.type);

    if (filters.motorista) params.append("motorista", filters.motorista);
    if (filters.cidade) params.append("cidade", filters.cidade);

    // ⚠️ Só mande start/end se o backend suportar.
    // if (filters.start) params.append("start", filters.start);
    // if (filters.end) params.append("end", filters.end);

    const res = await fetch(`/api/elogios/export/xlsx?${params.toString()}`, {
      method: "GET",
    });

    if (!res.ok) throw new Error("Export failed");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `elogios-${new Date().toISOString().split("T")[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Export failed", error);
  } finally {
    setIsExporting(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Exportação de Dados</h2>
        <p className="text-muted-foreground mt-1">Gere relatórios detalhados para análise externa.</p>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle>Filtros de Exportação</CardTitle>
          <CardDescription>Selecione os critérios para filtrar os dados antes de baixar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Tipo de Relatório</Label>
              <Select value={filters.type} onValueChange={(val) => setFilters(prev => ({ ...prev, type: val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  sideOffset={8}
                  className="z-50 bg-popover text-popover-foreground border border-border shadow-xl rounded-xl"
                >
                  <SelectItem value="interno">Elogios Internos</SelectItem>
                  <SelectItem value="estrada">Elogios Estrada</SelectItem>
                  <SelectItem value="gestao">Gestão</SelectItem>
                </SelectContent>

              </Select>
            </div>

            <div className="space-y-2">
              <Label>Motorista (Opcional)</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Nome do motorista..." 
                  className="pl-9"
                  value={filters.motorista}
                  onChange={(e) => setFilters(prev => ({ ...prev, motorista: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cidade (Opcional)</Label>
              <Input 
                placeholder="Ex: São Paulo" 
                value={filters.cidade}
                onChange={(e) => setFilters(prev => ({ ...prev, cidade: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input 
                  type="date" 
                  value={filters.start}
                  onChange={(e) => setFilters(prev => ({ ...prev, start: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input 
                  type="date" 
                  value={filters.end}
                  onChange={(e) => setFilters(prev => ({ ...prev, end: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button 
              size="lg" 
              onClick={handleExport} 
              disabled={isExporting}
              className="bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando Arquivo...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-5 w-5" />
                  Baixar Relatório
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
