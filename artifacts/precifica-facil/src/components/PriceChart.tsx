import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
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
      <div className="flex items-center justify-center h-[80px] text-muted-foreground/50 text-xs font-medium">
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

  const chartHeight = Math.max(data.length * 28 + 8, 80);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 56, bottom: 0, left: 0 }}
        barCategoryGap={6}
      >
        <XAxis type="number" domain={[0, 100]} hide />
        <YAxis
          type="category"
          dataKey="name"
          width={72}
          tick={{ fontSize: 11, fontWeight: 600, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted)/0.4)" }}
          formatter={(value: number, _name: string, props: { payload?: { amount: number } }) => [
            `${formatPercent(value)} · ${formatCurrency(props.payload?.amount ?? 0)}`,
            "",
          ]}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid hsl(var(--border))",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07)",
            fontSize: "12px",
            fontWeight: 600,
            padding: "6px 10px",
            backgroundColor: "hsl(var(--card))",
            color: "hsl(var(--foreground))",
          }}
          labelStyle={{ display: "none" }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={16}>
          <LabelList
            dataKey="value"
            position="right"
            formatter={(v: number) => `${v.toFixed(1)}%`}
            style={{ fontSize: 11, fontWeight: 700, fill: "hsl(var(--foreground))" }}
          />
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={ITEM_COLORS[entry.name] ?? "#6366f1"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
