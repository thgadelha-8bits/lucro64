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
  { label: "À Vista", subtitle: "PIX / Dinheiro", icon: <Banknote className="w-3.5 h-3.5" /> },
  { label: "Cartão 1X", subtitle: "Débito / Crédito", icon: <CreditCard className="w-3.5 h-3.5" /> },
  { label: "Cartão 12x", subtitle: "Parcelado", icon: <Layers className="w-3.5 h-3.5" /> },
];

function getMarginBadge(margin: number) {
  if (margin >= 25) return { text: "Excelente", cls: "bg-emerald-100 text-emerald-700 border border-emerald-200" };
  if (margin >= 15) return { text: "Equil.", cls: "bg-blue-100 text-blue-700 border border-blue-200" };
  return { text: "Crítico", cls: "bg-red-100 text-red-700 border border-red-200" };
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
  highlighted,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  prefix?: string;
  highlighted?: boolean;
}) {
  return (
    <div className="space-y-0.5 min-w-0">
      <label className={cn("block text-[10px] font-bold uppercase tracking-wide truncate", highlighted ? "text-white/60" : "text-muted-foreground")}>
        {label}
      </label>
      <div className={cn(
        "flex items-center rounded-md border text-xs overflow-hidden transition-all focus-within:ring-1",
        highlighted
          ? "bg-white/10 border-white/20 text-white focus-within:border-white/50 focus-within:ring-white/20"
          : "bg-background border-input focus-within:border-primary focus-within:ring-primary/20"
      )}>
        {prefix && <span className={cn("pl-1.5 pr-1 font-semibold flex-shrink-0", highlighted ? "text-white/50" : "text-muted-foreground")}>{prefix}</span>}
        <input
          type="number"
          min="0"
          step="0.1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent px-1.5 py-1 font-semibold outline-none min-w-0 w-full"
        />
        {suffix && <span className={cn("pr-1.5 pl-1 font-semibold flex-shrink-0", highlighted ? "text-white/50" : "text-muted-foreground")}>{suffix}</span>}
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

  let deductions: { label: string; amount: number }[] = [];
  let liquidoRecebido = 0;

  if (idx === 0) {
    const discountAmt = basePrice * (parseFloat(discountPct) || 0) / 100;
    const feeAmt = parseFloat(transactionFee) || 0;
    liquidoRecebido = basePrice - discountAmt - feeAmt;
    deductions = [
      { label: `Desconto (${parseFloat(discountPct) || 0}%)`, amount: discountAmt },
      { label: "Tarifa fixa", amount: feeAmt },
    ];
  } else if (idx === 1) {
    const feeAmt = basePrice * (parseFloat(cardFee1x) || 0) / 100;
    liquidoRecebido = basePrice - feeAmt;
    deductions = [{ label: `Taxa (${parseFloat(cardFee1x) || 0}%)`, amount: feeAmt }];
  } else {
    const interFeeAmt = basePrice * (parseFloat(cardFee12x) || 0) / 100;
    const installFeeAmt = basePrice * (parseFloat(installmentFee) || 0) / 100;
    liquidoRecebido = basePrice - interFeeAmt - installFeeAmt;
    deductions = [
      { label: `Interm. (${parseFloat(cardFee12x) || 0}%)`, amount: interFeeAmt },
      { label: `Parcel. (${parseFloat(installmentFee) || 0}%)`, amount: installFeeAmt },
    ];
  }

  const lucro = liquidoRecebido - cost;
  const margin = liquidoRecebido > 0 ? (lucro / liquidoRecebido) * 100 : 0;
  const badge = getMarginBadge(margin);
  const marginColor = getMarginColor(margin);

  return (
    <div className={cn(
      "h-full flex flex-col p-3 gap-2",
      isHighlighted ? "bg-primary" : "bg-card"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className={cn("p-1 rounded-md flex-shrink-0", isHighlighted ? "bg-white/20 text-white" : "bg-primary/5 text-primary")}>
            {config.icon}
          </div>
          <div className="min-w-0">
            <p className={cn("text-xs font-bold leading-tight", isHighlighted ? "text-white" : "text-foreground")}>{config.label}</p>
            <p className={cn("text-[10px]", isHighlighted ? "text-white/60" : "text-muted-foreground")}>{config.subtitle}</p>
          </div>
        </div>
        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ml-2", isHighlighted ? "bg-white/20 text-white" : badge.cls)}>
          {badge.text}
        </span>
      </div>

      {/* Config inputs */}
      <div className={cn("rounded-lg p-2 flex-shrink-0", isHighlighted ? "bg-black/15" : "bg-muted/40 border border-border/50")}>
        {idx === 0 && (
          <div className="grid grid-cols-2 gap-2">
            <SmallInput label="Desconto" value={discountPct} onChange={setDiscountPct} suffix="%" highlighted={isHighlighted} />
            <SmallInput label="Tarifa" value={transactionFee} onChange={setTransactionFee} prefix="R$" highlighted={isHighlighted} />
          </div>
        )}
        {idx === 1 && (
          <SmallInput label="Taxa cartão" value={cardFee1x} onChange={setCardFee1x} suffix="%" highlighted={isHighlighted} />
        )}
        {idx === 2 && (
          <div className="grid grid-cols-2 gap-2">
            <SmallInput label="Interm." value={cardFee12x} onChange={setCardFee12x} suffix="%" highlighted={isHighlighted} />
            <SmallInput label="Parcel." value={installmentFee} onChange={setInstallmentFee} suffix="%" highlighted={isHighlighted} />
          </div>
        )}
      </div>

      {/* Deduction rows */}
      <div className="flex-1 space-y-1 min-h-0">
        <div className={cn("flex justify-between text-[11px]", isHighlighted ? "text-white/80" : "")}>
          <span className={isHighlighted ? "text-white/60" : "text-muted-foreground"}>Preço Bruto</span>
          <span className="font-semibold tabular-nums">{formatCurrency(basePrice)}</span>
        </div>
        {deductions.filter(d => d.amount !== 0).map((d, i) => (
          <div key={i} className={cn("flex justify-between text-[11px]", isHighlighted ? "" : "")}>
            <span className={isHighlighted ? "text-white/60" : "text-muted-foreground"}>{d.label}</span>
            <span className={cn("font-semibold tabular-nums", isHighlighted ? "text-red-300" : "text-red-500")}>
              - {formatCurrency(d.amount)}
            </span>
          </div>
        ))}
      </div>

      {/* Result */}
      <div className={cn("border-t pt-2 flex items-end justify-between flex-shrink-0", isHighlighted ? "border-white/20" : "border-border")}>
        <div>
          <p className={cn("text-[10px] font-bold uppercase tracking-wide", isHighlighted ? "text-white/60" : "text-muted-foreground")}>Líquido</p>
          <p className={cn("text-base font-extrabold tabular-nums leading-tight", isHighlighted ? "text-white" : "text-primary")}>{formatCurrency(liquidoRecebido)}</p>
          <p className={cn("text-[10px]", isHighlighted ? "text-white/50" : "text-muted-foreground")}>Lucro: {formatCurrency(lucro)}</p>
        </div>
        <div className="text-right">
          <p className={cn("text-[10px] font-bold uppercase tracking-wide mb-0.5", isHighlighted ? "text-white/60" : "text-muted-foreground")}>Margem</p>
          <p className={cn("text-xl font-extrabold tabular-nums leading-none", isHighlighted ? "text-white" : marginColor)}>
            {formatPercent(margin)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ScenarioSimulator({ basePrice, cost, isValid }: ScenarioSimulatorProps) {
  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Title bar */}
      <div className="flex-shrink-0 px-4 py-1.5 border-b border-border bg-muted/20 flex items-center gap-3">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Simulador de Cenários</h2>
        {(!isValid || basePrice <= 0 || cost <= 0) && (
          <span className="text-[10px] text-muted-foreground/60 italic">— preencha o custo para ativar</span>
        )}
      </div>

      {/* 3 cards in a row */}
      {!isValid || basePrice <= 0 || cost <= 0 ? (
        <div className="flex-1 grid grid-cols-3 divide-x divide-border">
          {SCENARIOS.map((scenario, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center gap-2 p-4 text-center opacity-40">
              <div className="p-2 rounded-lg bg-muted/50 text-muted-foreground">{scenario.icon}</div>
              <div>
                <p className="text-xs font-bold text-foreground">{scenario.label}</p>
                <p className="text-[10px] text-muted-foreground">{scenario.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-3 divide-x divide-border overflow-hidden">
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
