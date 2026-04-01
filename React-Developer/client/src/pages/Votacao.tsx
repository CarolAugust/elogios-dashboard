"use client";

import { useCreateElogio } from "@/hooks/use-elogios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { InsertElogio } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { z } from "zod";

const elogioUiSchema = z
  .object({
    type: z.enum(["interno", "estrada", "gestao"]),
    motoristaNome: z.string().min(1, "Informe o nome do motorista"),

    matricula: z.string().optional(),
    placaFrota: z.string().optional(),

    // ✅ novos campos
    carreta: z.string().optional(),
    telefone: z.string().optional(),

    cidade: z.string().min(1, "Informe a cidade/unidade"),
    descricao: z.string().min(1, "Descreva o motivo do elogio"),
  })
  .superRefine((data, ctx) => {
    if (data.type === "interno") {
      if (!data.matricula?.trim()) {
        ctx.addIssue({
          path: ["matricula"],
          code: z.ZodIssueCode.custom,
          message: "Informe o ID/Matrícula",
        });
      }
    }

    if (data.type === "estrada") {
      if (!data.placaFrota?.trim()) {
        ctx.addIssue({
          path: ["placaFrota"],
          code: z.ZodIssueCode.custom,
          message: "Informe a placa/frota",
        });
      }

      // ✅ obrigatórios no estrada
      if (!data.carreta?.trim()) {
        ctx.addIssue({
          path: ["carreta"],
          code: z.ZodIssueCode.custom,
          message: "Informe a carreta",
        });
      }

      if (!data.telefone?.trim()) {
        ctx.addIssue({
          path: ["telefone"],
          code: z.ZodIssueCode.custom,
          message: "Informe o telefone",
        });
      }
    }

    if (data.type === "gestao") {
      if (!data.matricula?.trim()) {
        ctx.addIssue({
          path: ["matricula"],
          code: z.ZodIssueCode.custom,
          message: "Informe o ID/Matrícula",
        });
      }
      if (!data.placaFrota?.trim()) {
        ctx.addIssue({
          path: ["placaFrota"],
          code: z.ZodIssueCode.custom,
          message: "Informe a placa/frota",
        });
      }
    }
  });

type ElogioUiForm = z.infer<typeof elogioUiSchema>;

export default function Votacao() {
  const { user } = useAuth();
  const { toast } = useToast();
  const createMutation = useCreateElogio();

  const form = useForm<ElogioUiForm>({
    resolver: zodResolver(elogioUiSchema),
    defaultValues: {
    type: "interno",
    motoristaNome: "",
    matricula: "",
    placaFrota: "",
    carreta: "",     
    telefone: "",    
    cidade: "",
    descricao: "",
  },

  });

  const selectedType = form.watch("type");

  function getPoints(type: ElogioUiForm["type"]) {
    if (type === "gestao") return 2;
    if (type === "estrada") return 1;
    return 1;
  }

const onSubmit = (data: ElogioUiForm) => {
  const descricao =
    data.type === "estrada" || data.type === "gestao"
      ? `[Placa/Frota: ${data.placaFrota || "-"}] ${data.descricao}`
      : data.descricao;

const payload: any = {
  type: data.type,
  motorista: data.motoristaNome,
  cidade: data.cidade,

  descricao,          // ✅ o backend exige isso
  elogio: descricao,  // ✅ opcional: ajuda se o insert estiver usando "elogio"

  status: "ativo",
  matricula: data.matricula ? String(data.matricula).trim() : null,
};

if (data.type === "estrada") {
  payload.frotaId = (data.placaFrota || "").trim();
  payload.carreta = (data.carreta || "").trim();
  payload.telefone = (data.telefone || "").trim();
}


  // ✅ estrada: manda o que o backend exige
  if (data.type === "estrada") {
    payload.frotaId = (data.placaFrota || "").trim();
    payload.carreta = (data.carreta || "").trim();
    payload.telefone = (data.telefone || "").trim();
  }

  console.log("PAYLOAD ->", payload);

  createMutation.mutate(payload, {
    onSuccess: () => {
      toast({
        title: "Elogio registrado!",
        description: "Obrigado pela sua contribuição.",
      });

      form.reset({
      type: "interno",
      motoristaNome: "",
      matricula: "",
      placaFrota: "",
      carreta: "",     
      telefone: "",    
      cidade: "",
      descricao: "",
    });

    },
    onError: (err: any) => {
      toast({
        title: "Erro",
        description: err?.message || "Não foi possível registrar o elogio.",
        variant: "destructive",
      });
    },
  });
};



  const canSeeGestao = user?.role === "admin" || user?.role === "contabilizacao";

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
      <div className="text-center space-y-2 mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
          <Star className="w-8 h-8" />
        </div>

        <h2 className="text-3xl font-bold tracking-tight">Registrar Elogio</h2>
        <p className="text-muted-foreground">
          Reconheça o bom trabalho dos nossos motoristas.
        </p>
      </div>

      <Card className="border-none shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent" />

        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* ✅ LINHA 1: Tipo (esq) + Nome (dir) SEMPRE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Elogio</FormLabel>

                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent
                          position="popper"
                          className="w-[--radix-select-trigger-width] max-h-60 overflow-y-auto"
                        >
                          <SelectItem value="interno">Interno </SelectItem>
                          <SelectItem value="estrada">Estrada </SelectItem>
                          {canSeeGestao && (
                            <SelectItem value="gestao">Gestão (Supervisão)</SelectItem>
                          )}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="motoristaNome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Motorista</FormLabel>
                      <FormControl>
                        <Input placeholder="Quem você quer elogiar?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* ✅ LINHA 2: Campos dinâmicos (sem buracos) */}
              {selectedType === "interno" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="matricula"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID / Matrícula</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 6258" inputMode="numeric" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {selectedType === "estrada" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="placaFrota"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa / Frota</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: ABC1D23" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="carreta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carreta</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: XYZ-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 11999999999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

              {selectedType === "gestao" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="matricula"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID / Matrícula</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 6258" inputMode="numeric" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="placaFrota"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placa / Frota</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: ABC1D23 ou Frota 1020" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade / Unidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Onde ocorreu?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo do Elogio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descreva o que aconteceu de positivo..."
                        className="min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Elogio
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
