import { useEffect, useState } from "react";
import { useUsers, useCreateUser, useDeleteUser, useUpdateUser } from "@/hooks/use-users";
import { useWeights, useUpdateWeights } from "@/hooks/use-settings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Trash2, Edit2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

function UsersTab() {
  const { data: users, isLoading } = useUsers();
  const deleteMutation = useDeleteUser();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  const { toast } = useToast();

  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "votante",
      isManager: false,
    },
  });

  const onSubmit = (data: InsertUser) => {
    // EDITAR
    if (editingUser) {
      const payload: any = {
        id: editingUser.id,
        username: data.username,
        role: data.role,
        isManager: data.isManager,
        ...(data.password ? { password: data.password } : {}), // só envia se digitou
      };

      updateMutation.mutate(payload, {
        onSuccess: () => {
          setOpen(false);
          setEditingUser(null);
          form.reset();
          toast({ title: "Sucesso", description: "Usuário atualizado com sucesso!" });
        },
        onError: () => {
          toast({
            title: "Erro",
            description: "Falha ao atualizar usuário",
            variant: "destructive",
          });
        },
      });

      return;
    }

    // CRIAR
    createMutation.mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        toast({ title: "Sucesso", description: "Usuário criado com sucesso!" });
      },
      onError: () => {
        toast({
          title: "Erro",
          description: "Falha ao criar usuário",
          variant: "destructive",
        });
      },
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast({ title: "Sucesso", description: "Usuário removido." }),
      });
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    form.reset({
      username: user.username,
      password: "", // senha opcional no editar
      role: user.role,
      isManager: user.isManager ?? false,
    });
    setOpen(true);
  };

  if (isLoading) return <Loader2 className="animate-spin" />;

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
        <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>Controle de acesso e permissões do sistema</CardDescription>
        </div>

        <Dialog
          open={open}
          onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
              setEditingUser(null);
              form.reset();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingUser(null);
                form.reset({
                  username: "",
                  password: "",
                  role: "votante",
                  isManager: false,
                });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? "Editar Usuário" : "Criar Novo Usuário"}</DialogTitle>
              <DialogDescription>Preencha os dados do usuário e clique em salvar.</DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome de Usuário</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="Ex: joao.silva" autoComplete="username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={editingUser ? "Deixe em branco para não alterar" : "Digite uma senha"}
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Função</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="votante">Votante (Padrão)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isManager"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>É Gestor?</FormLabel>
                        <p className="text-xs text-muted-foreground">Gestores têm peso de voto maior</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {createMutation.isPending || updateMutation.isPending
                      ? "Salvando..."
                      : editingUser
                        ? "Salvar Alterações"
                        : "Salvar"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Função</TableHead>

              {/* ✅ Ajuste: largura + centralizado pra dar respiro no Switch */}
              <TableHead className="w-[140px] text-center">Gestor</TableHead>

              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users?.map((user) => (
              <TableRow
                key={user.id}
                // ✅ Hover na linha toda
                className="transition-colors hover:bg-muted/40"
              >
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell className="capitalize">{user.role}</TableCell>

                {/* ✅ Switch com mais espaço + hover via group (funciona mesmo disabled) */}
                <TableCell className="py-4 text-center">
                  <div className="inline-flex items-center justify-center group">
                    <Switch
                      checked={user.isManager || false}
                      disabled
                      className="
                        pointer-events-none
                        data-[state=checked]:bg-orange-500
                        data-[state=unchecked]:bg-muted
                        group-hover:data-[state=checked]:bg-orange-600
                        group-hover:data-[state=unchecked]:bg-muted/80
                      "
                    />
                  </div>
                </TableCell>

                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(user)}
                    className="hover:bg-orange-50 hover:text-orange-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>

                  <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} className="hover:bg-red-50">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function SettingsTab() {
  const { data: weights, isLoading } = useWeights();
  const updateMutation = useUpdateWeights();
  const { toast } = useToast();

  const [values, setValues] = useState({ interno: 0, gestao: 0, externo: 0, estrada: 0 });

  useEffect(() => {
    if (weights) {
      setValues((prev) => ({
        ...prev,
        interno: (weights as any).interno ?? 0,
        gestao: (weights as any).gestao ?? 0,
        externo: (weights as any).externo ?? 0,
        // estrada mantém o valor atual
      }));
    }
  }, [weights]);

  const handleSave = () => {
    updateMutation.mutate(values as any, {
      onSuccess: () => toast({ title: "Configurações salvas!" }),
      onError: () => toast({ title: "Erro ao salvar", variant: "destructive" }),
    });
  };

  if (isLoading) return <Loader2 className="animate-spin" />;

  return (
    <Card className="border-none shadow-md">
      <CardHeader>
        <CardTitle>Configuração de Pesos</CardTitle>
        <CardDescription>Defina quantos pontos cada tipo de elogio vale.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Interno</Label>
            <Input
              type="number"
              value={values.interno}
              onChange={(e) => setValues((prev) => ({ ...prev, interno: parseInt(e.target.value) || 0 }))}
            />
            <p className="text-xs text-muted-foreground">Elogios Internos</p>
          </div>

          <div className="space-y-2">
            <Label>Gestão</Label>
            <Input
              type="number"
              value={values.gestao}
              onChange={(e) => setValues((prev) => ({ ...prev, gestao: parseInt(e.target.value) || 0 }))}
            />
            <p className="text-xs text-muted-foreground">Elogios vindos da gerência/supervisão.</p>
          </div>

          <div className="space-y-2">
            <Label>Externo - Estrada</Label>
            <Input
              type="number"
              value={values.externo}
              onChange={(e) => setValues((prev) => ({ ...prev, externo: parseInt(e.target.value) || 0 }))}
            />
            <p className="text-xs text-muted-foreground">Elogio estrada</p>
          </div>

          <div className="space-y-2">
            <Label>Cliente</Label>
            <Input
              type="number"
              value={values.estrada}
              onChange={(e) => setValues((prev) => ({ ...prev, estrada: parseInt(e.target.value) || 0 }))}
            />
            <p className="text-xs text-muted-foreground">Ocorrências positivas em rota.</p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Admin() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Administração</h2>
        <p className="text-muted-foreground mt-1">Gerencie usuários e configurações do sistema.</p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersTab />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}