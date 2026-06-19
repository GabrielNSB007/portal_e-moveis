export function formatCurrency(value?: number | string | null) {
  if (value === undefined || value === null || value === "") return "Não informado";

  const numberValue = typeof value === "string" ? Number(value) : value;

  if (Number.isNaN(numberValue)) return "Não informado";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(numberValue);
}

export function formatNumber(value?: number | string | null, suffix = "") {
  if (value === undefined || value === null || value === "") return "Não informado";

  const numberValue = typeof value === "string" ? Number(value) : value;

  if (Number.isNaN(numberValue)) return "Não informado";

  return `${new Intl.NumberFormat("pt-BR").format(numberValue)}${suffix}`;
}

export function percentage(value: number) {
  return `${Math.round(value)}%`;
}
