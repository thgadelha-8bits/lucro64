import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
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

// Colors derived from the new theme palette
const COLORS = [
  "hsl(243 75% 59%)", // Primary Indigo
  "hsl(172 66% 50%)", // Teal
  "hsl(45 93% 47%)",  // Yellow
  "hsl(280 65% 60%)", // Purple
  "hsl(0 84% 60%)",   // Red/Destructive
];

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  // Adjust radius for donut chart
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
      style={{ textShadow: "0px 1px 2px rgba(0,0,0,0.4)" }}
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
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
      <div className="flex items-center justify-center h-[260px] text-muted-foreground/60 text-sm font-medium border border-dashed rounded-xl">
        Preencha os dados para visualizar o gráfico
      </div>
    );
  }

  const effectiveTaxPercent = taxType === "simples" ? taxPercent : 0;
  const feesPercent = cardPercent + commissionPercent;

  const data = [
    {
      name: "Custo",
      value: result.costPercent,
      amount: costValue,
    },
    ...(effectiveTaxPercent > 0
      ? [
          {
            name: "Imposto",
            value: effectiveTaxPercent,
            amount: result.taxAmount,
          },
        ]
      : []),
    ...(feesPercent > 0
      ? [
          {
            name: "Taxas (Cartão + Comissão)",
            value: feesPercent,
            amount: result.sellingPrice * (feesPercent / 100),
          },
        ]
      : []),
    ...(operationalPercent > 0
      ? [
          {
            name: "Despesas Operacionais",
            value: operationalPercent,
            amount: result.operationalAmount,
          },
        ]
      : []),
    ...(profitPercent > 0
      ? [
          {
            name: "Lucro Bruto",
            value: profitPercent,
            amount: result.profitAmountChart,
          },
        ]
      : []),
  ].filter((d) => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          labelLine={false}
          label={renderCustomizedLabel}
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          stroke="none"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string, props: any) => [
            `${formatPercent(value)} (${formatCurrency(props.payload.amount)})`,
            name,
          ]}
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid hsl(var(--border))",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
            fontSize: "13px",
            fontWeight: 600,
            padding: "8px 12px",
            backgroundColor: "hsl(var(--card))",
            color: "hsl(var(--foreground))",
          }}
          itemStyle={{
            color: "hsl(var(--foreground))",
            fontWeight: 700,
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ 
            fontSize: "12px", 
            fontWeight: 600, 
            paddingTop: "20px",
            color: "hsl(var(--muted-foreground))"
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
