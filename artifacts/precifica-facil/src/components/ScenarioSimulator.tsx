import { useState } from "react";
import { formatCurrency, formatPercent } from "@/lib/pricing";
import { cn } from "@/lib/utils";

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
    label: "Venda a Vista",
    number: "01",
    subtitle: "PIX ou Dinheiro com Desconto",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    label: "Cartao 1X",
    number: "02",
    subtitle: "Debito ou Credito a Vista",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
        <line x1="6" y1="15" x2="6.01" y2="15" strokeWidth="3" strokeLinecap="round" />
        <line x1="10" y1="15" x2="14" y2="15" />
      </svg>
    ),
  },
  {
    label: "Cartao 12x",
    number: "03",
    subtitle: "Parcelamento com Antecipacao",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
        <path d="M6 15h2M10 15h2M14 15h2" strokeLinecap="round" />
      </svg>
    ),
  },
];

function getMarginLabel(margin: number): { text: string; color: string; bg: string } {
  if (margin >= 25) return { text: "Excelente", color: "text-emerald-700", bg: "bg-emerald-100" };
  if (margin >= 15) return { text: "Equilibrado", color: "text-blue-700", bg: "bg-blue-100" };
  return { text: "Critico", color: "text-red-700", bg: "bg-red-100" };
}

function getMarginTextColor(margin: number): string {
  if (margin >= 25) return "text-emerald-600";
  if (margin >= 15) return "text-blue-600";
  return "text-red-600";
}

function getCardBg(idx: number): string {
  if (idx === 1) return "bg-blue-700 text-white";
  return "bg-card text-foreground";
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
      { label: "Preco Bruto", amount: basePrice },
      { label: `Desconto (${parseFloat(discountPct) || 0}%)`, amount: -discountAmt, isDeduction: true },
      { label: "Taxa Transacao", amount: -feeAmt, isDeduction: true },
    ];
  } else if (idx === 1) {
    const feeAmt = basePrice * (parseFloat(cardFee1x) || 0) / 100;
    liquidoRecebido = basePrice - feeAmt;
    rows = [
      { label: "Preco Bruto", amount: basePrice },
      { label: `Taxa Intermediacao (${parseFloat(cardFee1x) || 0}%)`, amount: -feeAmt, isDeduction: true },
    ];
  } else {
    const interFeeAmt = basePrice * (parseFloat(cardFee12x) || 0) / 100;
    const installFeeAmt = basePrice * (parseFloat(installmentFee) || 0) / 100;
    liquidoRecebido = basePrice - interFeeAmt - installFeeAmt;
    rows = [
      { label: "Preco Bruto", amount: basePrice },
      { label: `Taxa Intermediacao (${parseFloat(cardFee12x) || 0}%)`, amount: -interFeeAmt, isDeduction: true },
      { label: `Taxa Parcelamento (${parseFloat(installmentFee) || 0}%)`, amount: -installFeeAmt, isDeduction: true },
    ];
  }

  const lucro = liquidoRecebido - cost;
  const margin = liquidoRecebido > 0 ? (lucro / liquidoRecebido) * 100 : 0;
  const { text: marginLabel, color: marginColor, bg: marginBg } = getMarginLabel(margin);
  const marginTextColor = getMarginTextColor(margin);

  const labelClass = isHighlighted ? "text-white/70" : "text-muted-foreground";
  const valueClass = isHighlighted ? "text-white font-semibold tabular-nums" : "text-foreground font-semibold tabular-nums";
  const deductionClass = isHighlighted ? "text-red-300 font-semibold tabular-nums" : "text-red-500 font-semibold tabular-nums";
  const borderClass = isHighlighted ? "border-white/20" : "border-border";
  const inputBg = isHighlighted
    ? "bg-white/10 border-white/20 text-white placeholder-white/40"
    : "bg-muted border-input text-foreground";

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
      <div className="space-y-1">
        <label className={cn("block text-xs font-medium", isHighlighted ? "text-white/70" : "text-muted-foreground")}>
          {label}
        </label>
        <div className={cn("flex items-center rounded-md border text-xs", inputBg)}>
          {prefix && <span className={cn("pl-2 pr-0.5 select-none", isHighlighted ? "text-white/60" : "text-muted-foreground")}>{prefix}</span>}
          <input
            type="number"
            min="0"
            step="0.1"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 bg-transparent px-2 py-1.5 outline-none min-w-0 text-xs"
          />
          {suffix && <span className={cn("pr-2 pl-0.5 select-none", isHighlighted ? "text-white/60" : "text-muted-foreground")}>{suffix}</span>}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 flex flex-col gap-4 shadow-sm transition-all",
        isHighlighted
          ? "bg-blue-700 border-blue-600 shadow-lg scale-[1.02]"
          : "bg-card border-card-border"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className={cn("text-xs font-bold tracking-widest uppercase", isHighlighted ? "text-blue-200" : "text-muted-foreground")}>
            Cenario {config.number}
          </span>
          <h3 className={cn("text-lg font-bold mt-0.5", isHighlighted ? "text-white" : "text-foreground")}>
            {config.label}
          </h3>
          <p className={cn("text-xs mt-0.5", isHighlighted ? "text-blue-200" : "text-muted-foreground")}>
            {config.subtitle}
          </p>
        </div>
        <div className={cn("p-2 rounded-lg", isHighlighted ? "bg-white/15 text-white" : "bg-muted text-muted-foreground")}>
          {config.icon}
        </div>
      </div>

      {/* Config inputs */}
      <div className={cn("rounded-lg p-3 space-y-2", isHighlighted ? "bg-white/10" : "bg-muted/50")}>
        <p className={cn("text-xs font-semibold mb-2", isHighlighted ? "text-white/80" : "text-muted-foreground")}>
          Parametros do cenario
        </p>
        {idx === 0 && (
          <div className="grid grid-cols-2 gap-2">
            <SmallInput label="Desconto (%)" value={discountPct} onChange={setDiscountPct} suffix="%" />
            <SmallInput label="Taxa Transacao (R$)" value={transactionFee} onChange={setTransactionFee} prefix="R$" />
          </div>
        )}
        {idx === 1 && (
          <SmallInput label="Taxa do Cartao (%)" value={cardFee1x} onChange={setCardFee1x} suffix="%" />
        )}
        {idx === 2 && (
          <div className="grid grid-cols-2 gap-2">
            <SmallInput label="Taxa Intermediacao (%)" value={cardFee12x} onChange={setCardFee12x} suffix="%" />
            <SmallInput label="Taxa Parcelamento (%)" value={installmentFee} onChange={setInstallmentFee} suffix="%" />
          </div>
        )}
      </div>

      {/* Rows */}
      <div className={cn("space-y-2 border-t pt-3", borderClass)}>
        {rows.map((row, i) => (
          <div key={i} className="flex justify-between items-center text-sm">
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
      <div className={cn("flex justify-between items-center pt-2 border-t", borderClass)}>
        <span className={cn("text-sm font-bold", isHighlighted ? "text-white" : "text-foreground")}>
          Liquido Recebido
        </span>
        <span className={cn("text-base font-bold tabular-nums", isHighlighted ? "text-blue-200" : "text-primary")}>
          {formatCurrency(liquidoRecebido)}
        </span>
      </div>

      {/* Margin result */}
      <div className={cn("rounded-xl p-4", isHighlighted ? "bg-white/10" : "bg-muted/50")}>
        <p className={cn("text-xs font-bold uppercase tracking-wider mb-2", isHighlighted ? "text-white/60" : "text-muted-foreground")}>
          Resultado de Margem
        </p>
        <div className="flex items-center gap-2 mb-1">
          <span className={cn("text-2xl font-bold tabular-nums", isHighlighted ? "text-white" : marginTextColor)}>
            {formatPercent(margin)}
          </span>
          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", isHighlighted ? "bg-white/20 text-white" : `${marginBg} ${marginColor}`)}>
            {marginLabel}
          </span>
        </div>
        <p className={cn("text-xs", isHighlighted ? "text-blue-200" : "text-muted-foreground")}>
          Lucro: {formatCurrency(lucro)} por unidade
        </p>
      </div>
    </div>
  );
}

export function ScenarioSimulator({ basePrice, cost, isValid }: ScenarioSimulatorProps) {
  if (!isValid || basePrice <= 0 || cost <= 0) {
    return (
      <section className="mt-10">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Simulador de Cenarios</h2>
          <p className="text-muted-foreground mt-1">
            Compare diferentes modalidades de pagamento para otimizar sua margem de lucro.
          </p>
        </div>
        <div className="bg-card border border-card-border rounded-2xl p-10 text-center shadow-xs">
          <svg className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          <p className="text-muted-foreground text-sm">
            Preencha o custo e os percentuais acima para ativar o simulador de cenarios.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Simulador de Cenarios</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Compare diferentes modalidades de pagamento para otimizar sua margem de lucro.
          </p>
        </div>
        <div className="bg-card border border-card-border rounded-xl px-5 py-3 shadow-xs flex-shrink-0">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
            Custo Base Unitario
          </p>
          <p className="text-xl font-bold text-primary tabular-nums">{formatCurrency(cost)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
