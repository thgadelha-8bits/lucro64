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

const COLORS = ["#2e7d6e", "#3b82f6", "#f59e0b", "#8b5cf6", "#22c55e"];

const RADIAN = Math.PI / 180;
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
      fontWeight={600}
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
      <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
        Preencha os dados para visualizar a composicao do preco
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
            name: "Taxas (Cartao + Comissao)",
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
            name: "Lucro",
            value: profitPercent,
            amount: result.profitAmountChart,
          },
        ]
      : []),
  ].filter((d) => d.value > 0);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={100}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string, props) => [
            `${formatPercent(value)} (${formatCurrency(props.payload.amount)})`,
            name,
          ]}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid hsl(214 32% 88%)",
            fontSize: "13px",
          }}
        />
        <Legend
          iconType="circle"
          iconSize={10}
          wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
