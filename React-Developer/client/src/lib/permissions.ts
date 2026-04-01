type User = {
  role?: string;
  isManager?: boolean;
};

export function isGestor(user?: User | null) {
  const role = String(user?.role ?? "").toLowerCase();
  return !!user?.isManager || role === "admin" || role === "gestor" || role === "contabilizacao";
}

export function isVotanteOnly(user?: User | null) {
  return !!user && !isGestor(user);
}
