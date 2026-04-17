import { PricingResult } from "@/lib/pricing";
import { formatCurrency, formatPercent } from "@/lib/pricing";

interface PriceChartProps {
  result: PricingResult;
  costValue: number;
  taxType: string;
  taxPercent: number;
  cardPercent: number;
  commissionPercent: number;
  operationalPercent: number;
  profitPercent: number;
}

const ITEM_COLORS: Record<string, string> = {
  Custo: "#6366f1",
  Imposto: "#ef4444",
  "Taxa Cartão": "#f97316",
  Comissão: "#ec4899",
  "Op. Fixo": "#f59e0b",
  Lucro: "#10b981",
};

export function PriceChart({
  result,
  costValue,
  taxType,
  taxPercent,
  cardPercent,
  commissionPercent,
  operationalPercent,
  profitPercent,
}: PriceChartProps) {
  if (!result.isValid || result.sellingPrice <= 0) {
    return (
      <div className="flex items-center justify-center h-[48px] text-muted-foreground/50 text-xs font-medium border border-dashed rounded-lg">
        Preencha os dados para visualizar
      </div>
    );
  }

  const effectiveTaxPercent = taxType === "simples" ? taxPercent : 0;

  const data = [
    { name: "Custo", value: result.costPercent, amount: costValue },
    ...(effectiveTaxPercent > 0 ? [{ name: "Imposto", value: effectiveTaxPercent, amount: result.taxAmount }] : []),
    ...(cardPercent > 0 ? [{ name: "Taxa Cartão", value: cardPercent, amount: result.sellingPrice * cardPercent / 100 }] : []),
    ...(commissionPercent > 0 ? [{ name: "Comissão", value: commissionPercent, amount: result.sellingPrice * commissionPercent / 100 }] : []),
    ...(operationalPercent > 0 ? [{ name: "Op. Fixo", value: operationalPercent, amount: result.operationalAmount }] : []),
    ...(profitPercent > 0 ? [{ name: "Lucro", value: profitPercent, amount: result.profitAmountChart }] : []),
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-2">
      {/* Single stacked bar */}
      <div className="flex h-5 rounded-md overflow-hidden w-full gap-px">
        {data.map((item) => (
          <div
            key={item.name}
            style={{ width: `${item.value}%`, backgroundColor: ITEM_COLORS[item.name] }}
            title={`${item.name}: ${formatPercent(item.value)} · ${formatCurrency(item.amount)}`}
            className="flex-shrink-0"
          />
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: ITEM_COLORS[item.name] }}
            />
            <span className="text-[10px] font-semibold text-muted-foreground">
              {item.name} <span className="tabular-nums">{item.value.toFixed(1)}%</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
