export type TaxType = "simples" | "st";

export interface PricingInputs {
  cost: number;
  taxType: TaxType;
  taxPercent: number;
  cardPercent: number;
  commissionPercent: number;
  operationalPercent: number;
  profitPercent: number;
}

export interface PricingResult {
  sellingPrice: number;
  profitAmount: number;
  profitPercentActual: number;
  markup: number;
  markupPercent: number;
  totalExpensesPercent: number;
  costPercent: number;
  taxAmount: number;
  taxPercent: number;
  taxesAndFeesPercent: number;
  taxesAndFeesAmount: number;
  operationalAmount: number;
  profitAmountChart: number;
  isValid: boolean;
  errorMessage: string | null;
  taxNote: string | null;
}

export function calculatePricing(inputs: PricingInputs): PricingResult {
  const {
    cost,
    taxType,
    taxPercent: rawTaxPercent,
    cardPercent,
    commissionPercent,
    operationalPercent,
    profitPercent,
  } = inputs;

  const taxPercent = taxType === "simples" ? rawTaxPercent : 0;
  const taxNote =
    taxType === "st"
      ? "Imposto ja incluido no custo de aquisicao (ST)"
      : null;

  const totalDeductions =
    taxPercent + cardPercent + commissionPercent + operationalPercent + profitPercent;

  if (totalDeductions >= 100) {
    return {
      sellingPrice: 0,
      profitAmount: 0,
      profitPercentActual: 0,
      markup: 0,
      markupPercent: 0,
      totalExpensesPercent: totalDeductions,
      costPercent: 0,
      taxAmount: 0,
      taxPercent,
      taxesAndFeesPercent: 0,
      taxesAndFeesAmount: 0,
      operationalAmount: 0,
      profitAmountChart: 0,
      isValid: false,
      errorMessage:
        "A soma dos percentuais atingiu ou ultrapassou 100%. Ajuste os valores para um calculo valido.",
      taxNote,
    };
  }

  if (cost <= 0) {
    return {
      sellingPrice: 0,
      profitAmount: 0,
      profitPercentActual: 0,
      markup: 0,
      markupPercent: 0,
      totalExpensesPercent: totalDeductions,
      costPercent: 0,
      taxAmount: 0,
      taxPercent,
      taxesAndFeesPercent: 0,
      taxesAndFeesAmount: 0,
      operationalAmount: 0,
      profitAmountChart: 0,
      isValid: false,
      errorMessage: null,
      taxNote,
    };
  }

  const divisor = 1 - totalDeductions / 100;
  const sellingPrice = cost / divisor;

  const taxAmount = sellingPrice * (taxPercent / 100);
  const taxesAndFeesPercent = taxPercent + cardPercent + commissionPercent;
  const taxesAndFeesAmount = sellingPrice * (taxesAndFeesPercent / 100);
  const operationalAmount = sellingPrice * (operationalPercent / 100);
  const profitAmountChart = sellingPrice * (profitPercent / 100);
  const profitAmount = sellingPrice - cost - taxesAndFeesAmount - operationalAmount;
  const profitPercentActual = (profitAmount / sellingPrice) * 100;
  const markup = sellingPrice / cost;
  const markupPercent = (markup - 1) * 100;
  const costPercent = (cost / sellingPrice) * 100;

  return {
    sellingPrice,
    profitAmount,
    profitPercentActual,
    markup,
    markupPercent,
    totalExpensesPercent: totalDeductions,
    costPercent,
    taxAmount,
    taxPercent,
    taxesAndFeesPercent,
    taxesAndFeesAmount,
    operationalAmount,
    profitAmountChart,
    isValid: true,
    errorMessage: null,
    taxNote,
  };
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatMarkupPercent(markupPercent: number): string {
  return `${markupPercent.toFixed(2)}%`;
}
