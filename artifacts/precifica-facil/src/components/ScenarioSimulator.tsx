import { useState } from "react";
import { formatCurrency, formatPercent } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { Banknote, CreditCard, Layers } from "lucide-react";

interface ScenarioSimulatorProps {
  basePrice: number;
  cost: number;
  isValid: boolean;
}

interface ScenarioConfig {
  label: string;
  subtitle: string;
  icon: React.ReactNode;
}

const SCENARIOS: ScenarioConfig[] = [
  { label: "À Vista", subtitle: "PIX / Dinheiro", icon: <Banknote className="w-4 h-4" /> },
  { label: "Cartão 1X", subtitle: "Débito / Crédito", icon: <CreditCard className="w-4 h-4" /> },
  { label: "Cartão 12x", subtitle: "Parcelado", icon: <Layers className="w-4 h-4" /> },
];

function getMarginBadge(margin: number) {
  if (margin >= 25) return { text: "Excelente", cls: "bg-emerald-100 text-emerald-700 border border-emerald-300" };
  if (margin >= 15) return { text: "Equilibrado", cls: "bg-blue-100 text-blue-700 border border-blue-300" };
  return { text: "Crítico", cls: "bg-red-100 text-red-700 border border-red-300" };
}

function getMarginColor(margin: number) {
  if (margin >= 25) return "text-emerald-600";
  if (margin >= 15) return "text-blue-600";
  return "text-red-600";
}

function SmallInput({
  label,
  value,
  onChange,
  suffix,
  prefix,
  isHighlighted,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  prefix?: string;
  isHighlighted?: boolean;
}) {
  return (
    <div className="space-y-0.5 min-w-0">
      <label className={cn("block text-[10px] font-bold uppercase tracking-wide truncate", isHighlighted ? "text-white/60" : "text-muted-foreground")}>
        {label}
      </label>
      <div className="flex items-center rounded-md border border-input bg-background text-xs overflow-hidden focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary transition-all">
        {prefix && <span className="pl-1.5 pr-1 text-muted-foreground font-semibold flex-shrink-0">{prefix}</span>}
        <input
          type="number"
          min="0"
          step="0.1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent px-1.5 py-1 font-semibold outline-none min-w-0 w-full"
        />
        {suffix && <span className="pr-1.5 pl-1 text-muted-foreground font-semibold flex-shrink-0">{suffix}</span>}
      </div>
    </div>
  );
}

function ScenarioCard({ config, idx, basePrice, cost }: {
  config: ScenarioConfig;
  idx: number;
  basePrice: number;
  cost: number;
}) {
  const isHighlighted = idx === 1;

  const [discountPct, setDiscountPct] = useState("5");
  const [transactionFee, setTransactionFee] = useState("0");
  const [cardFee1x, setCardFee1x] = useState("2.5");
  const [cardFee12x, setCardFee12x] = useState("4");
  const [installmentFee, setInstallmentFee] = useState("16");

  let rows: { label: string; amount: number; isDeduction?: boolean }[] = [];
  let liquidoRecebido = 0;

  if (idx === 0) {
    const discountAmt = basePrice * (parseFloat(discountPct) || 0) / 100;
    const feeAmt = parseFloat(transactionFee) || 0;
    liquidoRecebido = basePrice - discountAmt - feeAmt;
    rows = [
      { label: `Desconto ${parseFloat(discountPct) || 0}%`, amount: -discountAmt, isDeduction: true },
      { label: "Tarifa fixa", amount: -feeAmt, isDeduction: true },
    ];
  } else if (idx === 1) {
    const feeAmt = basePrice * (parseFloat(cardFee1x) || 0) / 100;
    liquidoRecebido = basePrice - feeAmt;
    rows = [
      { label: `Taxa ${parseFloat(cardFee1x) || 0}%`, amount: -feeAmt, isDeduction: true },
    ];
  } else {
    const interFeeAmt = basePrice * (parseFloat(cardFee12x) || 0) / 100;
    const installFeeAmt = basePrice * (parseFloat(installmentFee) || 0) / 100;
    liquidoRecebido = basePrice - interFeeAmt - installFeeAmt;
    rows = [
      { label: `Interm. ${parseFloat(cardFee12x) || 0}%`, amount: -interFeeAmt, isDeduction: true },
      { label: `Parcela. ${parseFloat(installmentFee) || 0}%`, amount: -installFeeAmt, isDeduction: true },
    ];
  }

  const lucro = liquidoRecebido - cost;
  const margin = liquidoRecebido > 0 ? (lucro / liquidoRecebido) * 100 : 0;
  const badge = getMarginBadge(margin);
  const marginColor = getMarginColor(margin);

  return (
    <div className={cn(
      "rounded-xl border p-3 flex flex-col gap-2.5 transition-all",
      isHighlighted ? "bg-primary border-primary shadow-md" : "bg-card border-border"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("p-1.5 rounded-lg flex-shrink-0", isHighlighted ? "bg-white/20 text-white" : "bg-primary/5 text-primary")}>
            {config.icon}
          </div>
          <div className="min-w-0">
            <p className={cn("text-sm font-bold leading-tight", isHighlighted ? "text-white" : "text-foreground")}>{config.label}</p>
            <p className={cn("text-[10px]", isHighlighted ? "text-white/70" : "text-muted-foreground")}>{config.subtitle}</p>
          </div>
        </div>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0", badge.cls)}>
          {badge.text}
        </span>
      </div>

      {/* Config inputs */}
      <div className={cn("rounded-lg p-2", isHighlighted ? "bg-black/15" : "bg-muted/40 border border-border/50")}>
        {idx === 0 && (
          <div className="grid grid-cols-2 gap-2">
            <SmallInput label="Desconto" value={discountPct} onChange={setDiscountPct} suffix="%" isHighlighted={isHighlighted} />
            <SmallInput label="Tarifa" value={transactionFee} onChange={setTransactionFee} prefix="R$" isHighlighted={isHighlighted} />
          </div>
        )}
        {idx === 1 && (
          <SmallInput label="Taxa cartão" value={cardFee1x} onChange={setCardFee1x} suffix="%" isHighlighted={isHighlighted} />
        )}
        {idx === 2 && (
          <div className="grid grid-cols-2 gap-2">
            <SmallInput label="Interm." value={cardFee12x} onChange={setCardFee12x} suffix="%" isHighlighted={isHighlighted} />
            <SmallInput label="Parcela." value={installmentFee} onChange={setInstallmentFee} suffix="%" isHighlighted={isHighlighted} />
          </div>
        )}
      </div>

      {/* Deduction rows */}
      <div className="space-y-1">
        <div className={cn("flex justify-between text-xs py-0.5", isHighlighted ? "text-white/80" : "text-foreground")}>
          <span className={isHighlighted ? "text-white/70" : "text-muted-foreground"}>Preço Bruto</span>
          <span className="font-semibold tabular-nums">{formatCurrency(basePrice)}</span>
        </div>
        {rows.map((row, i) => (
          row.amount !== 0 && (
            <div key={i} className={cn("flex justify-between text-xs py-0.5 border-t border-dashed", isHighlighted ? "border-white/10" : "border-border")}>
              <span className={isHighlighted ? "text-white/70" : "text-muted-foreground"}>{row.label}</span>
              <span className={cn("font-semibold tabular-nums", isHighlighted ? "text-red-300" : "text-red-500")}>
                {row.amount < 0 ? `- ${formatCurrency(Math.abs(row.amount))}` : formatCurrency(row.amount)}
              </span>
            </div>
          )
        ))}
      </div>

      {/* Result */}
      <div className={cn("border-t pt-2 space-y-1", isHighlighted ? "border-white/20" : "border-border")}>
        <div className="flex justify-between items-center">
          <span className={cn("text-[11px] font-bold uppercase tracking-wide", isHighlighted ? "text-white/80" : "text-muted-foreground")}>Líquido</span>
          <span className={cn("text-base font-extrabold tabular-nums", isHighlighted ? "text-white" : "text-primary")}>{formatCurrency(liquidoRecebido)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={cn("text-[10px]", isHighlighted ? "text-white/60" : "text-muted-foreground")}>
            Lucro: {formatCurrency(lucro)}
          </span>
          <span className={cn("text-sm font-bold tabular-nums", isHighlighted ? "text-white" : marginColor)}>
            {formatPercent(margin)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ScenarioSimulator({ basePrice, cost, isValid }: ScenarioSimulatorProps) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 px-3 py-2.5 border-b border-border bg-muted/20">
        <h2 className="text-xs font-bold uppercase tracking-wide text-foreground">Simulador de Cenários</h2>
        <p className="text-[10px] text-muted-foreground mt-0.5">Compare modalidades de pagamento</p>
      </div>

      {!isValid || basePrice <= 0 || cost <= 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
            <CreditCard className="w-5 h-5 text-muted-foreground/40" />
          </div>
          <p className="text-xs font-semibold text-foreground mb-1">Aguardando dados</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Preencha o custo e os percentuais para ativar o simulador.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {SCENARIOS.map((scenario, idx) => (
            <ScenarioCard
              key={idx}
              config={scenario}
              idx={idx}
              basePrice={basePrice}
              cost={cost}
            />
          ))}
        </div>
      )}
    </div>
  );
}
