import { useState } from "react";
import { formatCurrency, formatPercent } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { Banknote, CreditCard, Layers, ArrowRightCircle } from "lucide-react";

interface ScenarioSimulatorProps {
  basePrice: number;
  cost: number;
  isValid: boolean;
}

interface ScenarioConfig {
  label: string;
  number: string;
  subtitle: string;
  icon: React.ReactNode;
}

const SCENARIOS: ScenarioConfig[] = [
  {
    label: "Venda à Vista",
    number: "01",
    subtitle: "PIX ou Dinheiro",
    icon: <Banknote className="w-5 h-5" />,
  },
  {
    label: "Cartão 1X",
    number: "02",
    subtitle: "Débito ou Crédito à Vista",
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    label: "Cartão 12x",
    number: "03",
    subtitle: "Parcelamento com Antecipação",
    icon: <Layers className="w-5 h-5" />,
  },
];

function getMarginLabel(margin: number): { text: string; color: string; bg: string } {
  if (margin >= 25) return { text: "Excelente", color: "text-emerald-700", bg: "bg-emerald-100/80 border border-emerald-200" };
  if (margin >= 15) return { text: "Equilibrado", color: "text-blue-700", bg: "bg-blue-100/80 border border-blue-200" };
  return { text: "Crítico", color: "text-red-700", bg: "bg-red-100/80 border border-red-200" };
}

function getMarginTextColor(margin: number): string {
  if (margin >= 25) return "text-emerald-600";
  if (margin >= 15) return "text-blue-600";
  return "text-red-600";
}

function ScenarioCard({
  config,
  idx,
  basePrice,
  cost,
}: {
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
      { label: "Preço Bruto", amount: basePrice },
      { label: `Desconto (${parseFloat(discountPct) || 0}%)`, amount: -discountAmt, isDeduction: true },
      { label: "Taxa Transação", amount: -feeAmt, isDeduction: true },
    ];
  } else if (idx === 1) {
    const feeAmt = basePrice * (parseFloat(cardFee1x) || 0) / 100;
    liquidoRecebido = basePrice - feeAmt;
    rows = [
      { label: "Preço Bruto", amount: basePrice },
      { label: `Taxa Intermediação (${parseFloat(cardFee1x) || 0}%)`, amount: -feeAmt, isDeduction: true },
    ];
  } else {
    const interFeeAmt = basePrice * (parseFloat(cardFee12x) || 0) / 100;
    const installFeeAmt = basePrice * (parseFloat(installmentFee) || 0) / 100;
    liquidoRecebido = basePrice - interFeeAmt - installFeeAmt;
    rows = [
      { label: "Preço Bruto", amount: basePrice },
      { label: `Taxa Intermediação (${parseFloat(cardFee12x) || 0}%)`, amount: -interFeeAmt, isDeduction: true },
      { label: `Taxa Parcelamento (${parseFloat(installmentFee) || 0}%)`, amount: -installFeeAmt, isDeduction: true },
    ];
  }

  const lucro = liquidoRecebido - cost;
  const margin = liquidoRecebido > 0 ? (lucro / liquidoRecebido) * 100 : 0;
  const { text: marginLabel, color: marginColor, bg: marginBg } = getMarginLabel(margin);
  const marginTextColor = getMarginTextColor(margin);

  const labelClass = isHighlighted ? "text-white/70" : "text-muted-foreground font-medium";
  const valueClass = isHighlighted ? "text-white font-bold tabular-nums" : "text-foreground font-bold tabular-nums";
  const deductionClass = isHighlighted ? "text-red-300 font-bold tabular-nums" : "text-red-500 font-bold tabular-nums";
  const borderClass = isHighlighted ? "border-white/10" : "border-border";
  const inputBg = isHighlighted
    ? "bg-white/10 border-white/20 text-white placeholder-white/40 focus-within:border-white focus-within:ring-white/20"
    : "bg-muted/50 border-input text-foreground focus-within:border-primary focus-within:ring-primary/20";

  function SmallInput({
    label,
    value,
    onChange,
    suffix,
    prefix,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    suffix?: string;
    prefix?: string;
  }) {
    return (
      <div className="space-y-1.5">
        <label className={cn("block text-[11px] font-bold uppercase tracking-wide", isHighlighted ? "text-white/60" : "text-muted-foreground/80")}>
          {label}
        </label>
        <div className={cn("flex items-center rounded-lg border text-sm transition-all duration-200 overflow-hidden focus-within:ring-2", inputBg)}>
          {prefix && <span className={cn("pl-2.5 pr-1 font-semibold", isHighlighted ? "text-white/50" : "text-muted-foreground/60")}>{prefix}</span>}
          <input
            type="number"
            min="0"
            step="0.1"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-transparent px-2.5 py-1.5 font-semibold outline-none min-w-0 text-sm"
          />
          {suffix && <span className={cn("pr-2.5 pl-1 font-semibold", isHighlighted ? "text-white/50" : "text-muted-foreground/60")}>{suffix}</span>}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-[1.25rem] border p-6 flex flex-col gap-6 shadow-sm transition-all relative overflow-hidden",
        isHighlighted
          ? "bg-primary border-primary shadow-xl scale-[1.03] z-10"
          : "bg-card border-border hover:border-primary/30"
      )}
    >
      {isHighlighted && (
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      )}
      
      {/* Header */}
      <div className="flex items-start justify-between relative z-10">
        <div>
          <span className={cn("text-[10px] font-bold tracking-widest uppercase", isHighlighted ? "text-primary-foreground/70" : "text-primary")}>
            Cenário {config.number}
          </span>
          <h3 className={cn("text-xl font-bold mt-1", isHighlighted ? "text-white" : "text-foreground")}>
            {config.label}
          </h3>
          <p className={cn("text-xs font-medium mt-1", isHighlighted ? "text-white/70" : "text-muted-foreground")}>
            {config.subtitle}
          </p>
        </div>
        <div className={cn("p-2.5 rounded-xl shadow-sm", isHighlighted ? "bg-white/20 text-white" : "bg-primary/5 text-primary border border-primary/10")}>
          {config.icon}
        </div>
      </div>

      {/* Config inputs */}
      <div className={cn("rounded-xl p-4 space-y-3 relative z-10", isHighlighted ? "bg-black/15" : "bg-muted/40 border border-border/50")}>
        {idx === 0 && (
          <div className="grid grid-cols-2 gap-3">
            <SmallInput label="Desconto" value={discountPct} onChange={setDiscountPct} suffix="%" />
            <SmallInput label="Tarifa Fixa" value={transactionFee} onChange={setTransactionFee} prefix="R$" />
          </div>
        )}
        {idx === 1 && (
          <SmallInput label="Taxa do Cartão" value={cardFee1x} onChange={setCardFee1x} suffix="%" />
        )}
        {idx === 2 && (
          <div className="grid grid-cols-2 gap-3">
            <SmallInput label="Intermediação" value={cardFee12x} onChange={setCardFee12x} suffix="%" />
            <SmallInput label="Parcelamento" value={installmentFee} onChange={setInstallmentFee} suffix="%" />
          </div>
        )}
      </div>

      {/* Rows */}
      <div className={cn("space-y-3 pt-2 relative z-10")}>
        {rows.map((row, i) => (
          <div key={i} className={cn("flex justify-between items-center text-sm py-1.5 border-b border-dashed", borderClass)}>
            <span className={cn("text-sm", labelClass)}>{row.label}</span>
            <span className={row.isDeduction && row.amount < 0 ? deductionClass : valueClass}>
              {row.isDeduction && row.amount < 0
                ? `- ${formatCurrency(Math.abs(row.amount))}`
                : formatCurrency(row.amount)}
            </span>
          </div>
        ))}
      </div>

      {/* Liquido */}
      <div className={cn("flex justify-between items-end pt-3 relative z-10 border-t", borderClass)}>
        <span className={cn("text-sm font-bold uppercase tracking-wide", isHighlighted ? "text-white/90" : "text-foreground/80")}>
          Líquido Recebido
        </span>
        <span className={cn("text-2xl font-bold tabular-nums leading-none", isHighlighted ? "text-white" : "text-primary")}>
          {formatCurrency(liquidoRecebido)}
        </span>
      </div>

      {/* Margin result */}
      <div className={cn("rounded-xl p-4 mt-auto relative z-10", isHighlighted ? "bg-black/20" : "bg-muted/40 border border-border/50")}>
        <div className="flex items-center justify-between mb-2">
          <p className={cn("text-[10px] font-bold uppercase tracking-widest", isHighlighted ? "text-white/60" : "text-muted-foreground/80")}>
            Margem Efetiva
          </p>
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md", isHighlighted ? "bg-white/20 text-white" : `${marginBg} ${marginColor}`)}>
            {marginLabel}
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={cn("text-3xl font-extrabold tabular-nums tracking-tight leading-none", isHighlighted ? "text-white" : marginTextColor)}>
            {formatPercent(margin)}
          </span>
        </div>
        <p className={cn("text-xs font-semibold mt-2.5", isHighlighted ? "text-white/70" : "text-muted-foreground")}>
          Lucro de {formatCurrency(lucro)} / unidade
        </p>
      </div>
    </div>
  );
}

export function ScenarioSimulator({ basePrice, cost, isValid }: ScenarioSimulatorProps) {
  if (!isValid || basePrice <= 0 || cost <= 0) {
    return (
      <section className="animate-in fade-in duration-700">
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Simulador de Cenários</h2>
          <p className="text-muted-foreground font-medium mt-1">
            Compare diferentes modalidades de pagamento para otimizar sua margem.
          </p>
        </div>
        <div className="bg-card border border-dashed border-border/80 rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <ArrowRightCircle className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Aguardando dados...</h3>
          <p className="text-muted-foreground text-sm max-w-sm font-medium">
            Preencha o custo e os percentuais na calculadora acima para ativar o simulador de cenários e comparar as margens reais.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Simulador de Cenários</h2>
          <p className="text-muted-foreground font-medium mt-1 text-sm">
            Impacto das taxas na sua margem de lucro em diferentes modalidades.
          </p>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-xl px-5 py-3 shadow-sm flex-shrink-0">
          <p className="text-[10px] font-bold text-primary/80 uppercase tracking-widest mb-1">
            Custo Base Unitário
          </p>
          <p className="text-xl font-extrabold text-primary tabular-nums leading-none">{formatCurrency(cost)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
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
    </section>
  );
}
