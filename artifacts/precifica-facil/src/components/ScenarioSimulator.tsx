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

type StatusLevel = "excellent" | "balanced" | "critical";

function getStatus(margin: number): StatusLevel {
  if (margin >= 25) return "excellent";
  if (margin >= 15) return "balanced";
  return "critical";
}

function getTheme(status: StatusLevel, isHighlighted: boolean) {
  const themes = {
    excellent: {
      card:        isHighlighted ? "bg-emerald-600 border-emerald-700 shadow-lg" : "bg-emerald-50 border-emerald-200",
      iconBg:      isHighlighted ? "bg-white/20 text-white"                       : "bg-emerald-100 text-emerald-700",
      title:       isHighlighted ? "text-white"                                   : "text-emerald-900",
      subtitle:    isHighlighted ? "text-white/70"                                : "text-emerald-600",
      badge:       isHighlighted ? "bg-white/25 text-white"                       : "bg-emerald-100 text-emerald-700 border border-emerald-300",
      badgeText:   "Excelente",
      inputArea:   isHighlighted ? "bg-black/15"                                  : "bg-emerald-100/60 border border-emerald-200",
      inputLabel:  isHighlighted ? "text-white/60"                                : "text-emerald-700/80",
      rowLabel:    isHighlighted ? "text-white/70"                                : "text-emerald-700",
      rowValue:    isHighlighted ? "text-white"                                   : "text-emerald-900",
      deduction:   isHighlighted ? "text-red-200"                                 : "text-red-500",
      divider:     isHighlighted ? "border-white/20"                              : "border-emerald-200",
      liquidLabel: isHighlighted ? "text-white/80"                                : "text-emerald-800",
      liquidValue: isHighlighted ? "text-white"                                   : "text-emerald-700",
      marginValue: isHighlighted ? "text-white"                                   : "text-emerald-600",
      lucroPre:    isHighlighted ? "text-white/60"                                : "text-emerald-600/80",
    },
    balanced: {
      card:        isHighlighted ? "bg-blue-600 border-blue-700 shadow-lg"        : "bg-blue-50 border-blue-200",
      iconBg:      isHighlighted ? "bg-white/20 text-white"                       : "bg-blue-100 text-blue-700",
      title:       isHighlighted ? "text-white"                                   : "text-blue-900",
      subtitle:    isHighlighted ? "text-white/70"                                : "text-blue-600",
      badge:       isHighlighted ? "bg-white/25 text-white"                       : "bg-blue-100 text-blue-700 border border-blue-300",
      badgeText:   "Equilibrado",
      inputArea:   isHighlighted ? "bg-black/15"                                  : "bg-blue-100/60 border border-blue-200",
      inputLabel:  isHighlighted ? "text-white/60"                                : "text-blue-700/80",
      rowLabel:    isHighlighted ? "text-white/70"                                : "text-blue-700",
      rowValue:    isHighlighted ? "text-white"                                   : "text-blue-900",
      deduction:   isHighlighted ? "text-red-200"                                 : "text-red-500",
      divider:     isHighlighted ? "border-white/20"                              : "border-blue-200",
      liquidLabel: isHighlighted ? "text-white/80"                                : "text-blue-800",
      liquidValue: isHighlighted ? "text-white"                                   : "text-blue-700",
      marginValue: isHighlighted ? "text-white"                                   : "text-blue-600",
      lucroPre:    isHighlighted ? "text-white/60"                                : "text-blue-600/80",
    },
    critical: {
      card:        isHighlighted ? "bg-red-600 border-red-700 shadow-lg"          : "bg-red-50 border-red-200",
      iconBg:      isHighlighted ? "bg-white/20 text-white"                       : "bg-red-100 text-red-700",
      title:       isHighlighted ? "text-white"                                   : "text-red-900",
      subtitle:    isHighlighted ? "text-white/70"                                : "text-red-500",
      badge:       isHighlighted ? "bg-white/25 text-white"                       : "bg-red-100 text-red-700 border border-red-300",
      badgeText:   "Crítico",
      inputArea:   isHighlighted ? "bg-black/15"                                  : "bg-red-100/60 border border-red-200",
      inputLabel:  isHighlighted ? "text-white/60"                                : "text-red-700/80",
      rowLabel:    isHighlighted ? "text-white/70"                                : "text-red-700",
      rowValue:    isHighlighted ? "text-white"                                   : "text-red-900",
      deduction:   isHighlighted ? "text-red-200"                                 : "text-red-500",
      divider:     isHighlighted ? "border-white/20"                              : "border-red-200",
      liquidLabel: isHighlighted ? "text-white/80"                                : "text-red-800",
      liquidValue: isHighlighted ? "text-white"                                   : "text-red-700",
      marginValue: isHighlighted ? "text-white"                                   : "text-red-600",
      lucroPre:    isHighlighted ? "text-white/60"                                : "text-red-500/80",
    },
  };
  return themes[status];
}

function SmallInput({
  label,
  value,
  onChange,
  suffix,
  prefix,
  labelClass,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  prefix?: string;
  labelClass?: string;
}) {
  return (
    <div className="space-y-0.5 min-w-0">
      <label className={cn("block text-[10px] font-bold uppercase tracking-wide truncate", labelClass ?? "text-muted-foreground")}>
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
  const status = getStatus(margin);
  const t = getTheme(status, isHighlighted);

  return (
    <div className={cn("rounded-xl border p-3 flex flex-col gap-2.5 transition-all duration-300", t.card)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("p-1.5 rounded-lg flex-shrink-0", t.iconBg)}>
            {config.icon}
          </div>
          <div className="min-w-0">
            <p className={cn("text-sm font-bold leading-tight", t.title)}>{config.label}</p>
            <p className={cn("text-[10px]", t.subtitle)}>{config.subtitle}</p>
          </div>
        </div>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0", t.badge)}>
          {t.badgeText}
        </span>
      </div>

      {/* Config inputs */}
      <div className={cn("rounded-lg p-2", t.inputArea)}>
        {idx === 0 && (
          <div className="grid grid-cols-2 gap-2">
            <SmallInput label="Desconto" value={discountPct} onChange={setDiscountPct} suffix="%" labelClass={t.inputLabel} />
            <SmallInput label="Tarifa" value={transactionFee} onChange={setTransactionFee} prefix="R$" labelClass={t.inputLabel} />
          </div>
        )}
        {idx === 1 && (
          <SmallInput label="Taxa cartão" value={cardFee1x} onChange={setCardFee1x} suffix="%" labelClass={t.inputLabel} />
        )}
        {idx === 2 && (
          <div className="grid grid-cols-2 gap-2">
            <SmallInput label="Interm." value={cardFee12x} onChange={setCardFee12x} suffix="%" labelClass={t.inputLabel} />
            <SmallInput label="Parcela." value={installmentFee} onChange={setInstallmentFee} suffix="%" labelClass={t.inputLabel} />
          </div>
        )}
      </div>

      {/* Deduction rows */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs py-0.5">
          <span className={t.rowLabel}>Preço Bruto</span>
          <span className={cn("font-semibold tabular-nums", t.rowValue)}>{formatCurrency(basePrice)}</span>
        </div>
        {rows.map((row, i) => (
          row.amount !== 0 && (
            <div key={i} className={cn("flex justify-between text-xs py-0.5 border-t border-dashed", t.divider)}>
              <span className={t.rowLabel}>{row.label}</span>
              <span className={cn("font-semibold tabular-nums", t.deduction)}>
                {row.amount < 0 ? `- ${formatCurrency(Math.abs(row.amount))}` : formatCurrency(row.amount)}
              </span>
            </div>
          )
        ))}
      </div>

      {/* Result */}
      <div className={cn("border-t pt-2 space-y-1", t.divider)}>
        <div className="flex justify-between items-center">
          <span className={cn("text-[11px] font-bold uppercase tracking-wide", t.liquidLabel)}>Líquido</span>
          <span className={cn("text-base font-extrabold tabular-nums", t.liquidValue)}>{formatCurrency(liquidoRecebido)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={cn("text-[10px]", t.lucroPre)}>
            Lucro: {formatCurrency(lucro)}
          </span>
          <span className={cn("text-sm font-bold tabular-nums", t.marginValue)}>
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
