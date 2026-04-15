import { useState, useCallback, useEffect } from "react";
import {
  calculatePricing,
  formatCurrency,
  formatPercent,
  formatMarkupPercent,
  type TaxType,
} from "@/lib/pricing";
import { PriceChart } from "@/components/PriceChart";
import { cn } from "@/lib/utils";
import { AlertCircle, Briefcase, Check, Copy, FileText, Info, PieChart, Tag, TrendingUp, Wallet } from "lucide-react";

function NumericInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
  disabled,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  disabled?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-foreground/90">
        {label}
      </label>
      <div
        className={cn(
          "flex items-center rounded-xl border border-input bg-card shadow-sm transition-all duration-200 overflow-hidden",
          disabled
            ? "opacity-50 cursor-not-allowed bg-muted/50"
            : "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary hover:border-primary/50"
        )}
      >
        {prefix && (
          <div className="pl-3.5 pr-2 py-2.5 flex items-center justify-center bg-muted/30 border-r border-border text-sm font-semibold text-muted-foreground select-none">
            {prefix}
          </div>
        )}
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder ?? "0"}
          className="flex-1 bg-transparent px-3.5 py-2.5 text-sm font-medium outline-none min-w-0 disabled:cursor-not-allowed"
        />
        {suffix && (
          <div className="pr-3.5 pl-2 py-2.5 flex items-center justify-center text-sm font-semibold text-muted-foreground select-none">
            {suffix}
          </div>
        )}
      </div>
      {hint && <p className="text-xs font-medium text-muted-foreground/80">{hint}</p>}
    </div>
  );
}

export interface PrecificaFacilState {
  cost: number;
  sellingPrice: number;
  isValid: boolean;
}

interface PrecificaFacilProps {
  onStateChange?: (state: PrecificaFacilState) => void;
}

export function PrecificaFacil({ onStateChange }: PrecificaFacilProps) {
  const [cost, setCost] = useState("");
  const [taxType, setTaxType] = useState<TaxType>("simples");
  const [taxPercent, setTaxPercent] = useState("6");
  const [cardPercent, setCardPercent] = useState("3");
  const [commissionPercent, setCommissionPercent] = useState("0");
  const [operationalPercent, setOperationalPercent] = useState("5");
  const [profitPercent, setProfitPercent] = useState("20");
  const [copied, setCopied] = useState(false);

  const inputs = {
    cost: parseFloat(cost) || 0,
    taxType,
    taxPercent: parseFloat(taxPercent) || 0,
    cardPercent: parseFloat(cardPercent) || 0,
    commissionPercent: parseFloat(commissionPercent) || 0,
    operationalPercent: parseFloat(operationalPercent) || 0,
    profitPercent: parseFloat(profitPercent) || 0,
  };

  const result = calculatePricing(inputs);

  useEffect(() => {
    onStateChange?.({
      cost: inputs.cost,
      sellingPrice: result.sellingPrice,
      isValid: result.isValid,
    });
  }, [inputs.cost, result.sellingPrice, result.isValid]);

  const handleCopyMarkup = useCallback(() => {
    if (result.isValid) {
      navigator.clipboard.writeText(formatMarkupPercent(result.markupPercent)).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [result]);

  const taxTypeOptions: { value: TaxType; label: string }[] = [
    { value: "simples", label: "Simples Nacional" },
    { value: "st", label: "Substituição Tributária" },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {result.errorMessage && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3.5 mb-6">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-800">Percentuais inválidos</p>
            <p className="text-sm font-medium text-red-600 mt-0.5">{result.errorMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT — Inputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Cost */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Tag className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-foreground">Custo de Aquisição</h2>
            </div>
            <NumericInput
              label="Custo unitário do produto"
              value={cost}
              onChange={setCost}
              prefix="R$"
              placeholder="0,00"
            />
          </div>

          {/* Tax */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-foreground">Tributação</h2>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground/90">Regime Tributário</label>
              <div className="grid grid-cols-2 gap-3">
                {taxTypeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTaxType(opt.value)}
                    className={cn(
                      "px-4 py-3 rounded-xl text-sm font-semibold border transition-all text-left flex items-center justify-between",
                      taxType === opt.value
                        ? "bg-primary/10 text-primary border-primary shadow-sm"
                        : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:bg-accent/30 hover:text-foreground"
                    )}
                  >
                    {opt.label}
                    {taxType === opt.value && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {result.taxNote && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <Info className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p className="text-sm text-amber-800 font-medium">{result.taxNote}</p>
              </div>
            )}

            <NumericInput
              label="Alíquota de Imposto"
              value={taxPercent}
              onChange={setTaxPercent}
              suffix="%"
              disabled={taxType !== "simples"}
              hint={taxType === "simples" ? "Alíquota efetiva do Simples Nacional" : undefined}
            />
          </div>

          {/* Expenses */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                <Briefcase className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-foreground">Despesas e Margem</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <NumericInput
                label="Taxa de Cartão"
                value={cardPercent}
                onChange={setCardPercent}
                suffix="%"
                hint="Maquininha / Gateway"
              />
              <NumericInput
                label="Comissão"
                value={commissionPercent}
                onChange={setCommissionPercent}
                suffix="%"
                hint="Representantes / Vendedores"
              />
              <NumericInput
                label="Custo Operacional"
                value={operationalPercent}
                onChange={setOperationalPercent}
                suffix="%"
                hint="Aluguel, energia, internet"
              />
              <NumericInput
                label="Margem de Lucro"
                value={profitPercent}
                onChange={setProfitPercent}
                suffix="%"
                hint="Lucro líquido desejado"
              />
            </div>
          </div>
        </div>

        {/* RIGHT — Results */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Result */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-foreground">Preço de Venda Sugerido</h2>
            </div>

            {result.isValid && result.sellingPrice > 0 ? (
              <div className="space-y-6">
                <div className="text-center pb-2">
                  <p className="text-[2.75rem] font-extrabold text-foreground tabular-nums tracking-tight leading-none">
                    {formatCurrency(result.sellingPrice)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50/80 border border-blue-100 rounded-xl p-4 text-center">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1.5">Lucro Bruto</p>
                    <p className="text-xl font-bold text-blue-800 tabular-nums">
                      {formatCurrency(result.profitAmount)}
                    </p>
                  </div>
                  <div className="bg-purple-50/80 border border-purple-100 rounded-xl p-4 text-center">
                    <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1.5">Margem Real</p>
                    <p className="text-xl font-bold text-purple-800 tabular-nums">
                      {formatPercent(result.profitPercentActual)}
                    </p>
                  </div>
                </div>

                {/* Detailed breakdown */}
                <div className="rounded-xl border border-border overflow-hidden">
                  <div className="px-4 py-2.5 bg-muted/40 border-b border-border">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Composição do Preço</span>
                  </div>
                  <div className="divide-y divide-border/60">
                    {/* Header row */}
                    <div className="grid grid-cols-3 px-4 py-2 bg-muted/20">
                      <span className="text-xs font-bold text-muted-foreground">Item</span>
                      <span className="text-xs font-bold text-muted-foreground text-center">%</span>
                      <span className="text-xs font-bold text-muted-foreground text-right">Valor</span>
                    </div>
                    {/* Cost row */}
                    <div className="grid grid-cols-3 px-4 py-2.5 items-center">
                      <span className="text-sm font-semibold text-foreground">Custo</span>
                      <span className="text-sm tabular-nums text-center text-muted-foreground">{formatPercent(result.costPercent, 1)}</span>
                      <span className="text-sm font-semibold tabular-nums text-right text-foreground">{formatCurrency(inputs.cost)}</span>
                    </div>
                    {/* Tax row */}
                    {inputs.taxPercent > 0 && taxType === "simples" && (
                      <div className="grid grid-cols-3 px-4 py-2.5 items-center bg-red-50/40">
                        <span className="text-sm font-semibold text-red-700">Imposto</span>
                        <span className="text-sm tabular-nums text-center text-red-500">{formatPercent(result.taxPercent, 1)}</span>
                        <span className="text-sm font-semibold tabular-nums text-right text-red-700">{formatCurrency(result.taxAmount)}</span>
                      </div>
                    )}
                    {/* Card fee row */}
                    {inputs.cardPercent > 0 && (
                      <div className="grid grid-cols-3 px-4 py-2.5 items-center bg-red-50/40">
                        <span className="text-sm font-semibold text-red-700">Taxa Cartão</span>
                        <span className="text-sm tabular-nums text-center text-red-500">{formatPercent(inputs.cardPercent, 1)}</span>
                        <span className="text-sm font-semibold tabular-nums text-right text-red-700">{formatCurrency(result.sellingPrice * inputs.cardPercent / 100)}</span>
                      </div>
                    )}
                    {/* Commission row */}
                    {inputs.commissionPercent > 0 && (
                      <div className="grid grid-cols-3 px-4 py-2.5 items-center bg-red-50/40">
                        <span className="text-sm font-semibold text-red-700">Comissão</span>
                        <span className="text-sm tabular-nums text-center text-red-500">{formatPercent(inputs.commissionPercent, 1)}</span>
                        <span className="text-sm font-semibold tabular-nums text-right text-red-700">{formatCurrency(result.sellingPrice * inputs.commissionPercent / 100)}</span>
                      </div>
                    )}
                    {/* Operational row */}
                    {inputs.operationalPercent > 0 && (
                      <div className="grid grid-cols-3 px-4 py-2.5 items-center bg-orange-50/40">
                        <span className="text-sm font-semibold text-orange-700">Custo Op.</span>
                        <span className="text-sm tabular-nums text-center text-orange-500">{formatPercent(inputs.operationalPercent, 1)}</span>
                        <span className="text-sm font-semibold tabular-nums text-right text-orange-700">{formatCurrency(result.operationalAmount)}</span>
                      </div>
                    )}
                    {/* Profit row */}
                    <div className="grid grid-cols-3 px-4 py-2.5 items-center bg-emerald-50/40">
                      <span className="text-sm font-semibold text-emerald-700">Lucro</span>
                      <span className="text-sm tabular-nums text-center text-emerald-600">{formatPercent(inputs.profitPercent, 1)}</span>
                      <span className="text-sm font-semibold tabular-nums text-right text-emerald-700">{formatCurrency(result.profitAmountChart)}</span>
                    </div>
                    {/* Total row */}
                    <div className="grid grid-cols-3 px-4 py-3 items-center bg-muted/30 border-t border-border">
                      <span className="text-sm font-bold text-foreground">Total</span>
                      <span className="text-sm font-bold tabular-nums text-center text-foreground">100%</span>
                      <span className="text-sm font-bold tabular-nums text-right text-foreground">{formatCurrency(result.sellingPrice)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/50 border border-border/50">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">Fator Markup (ERP)</span>
                    <span className="text-xs font-medium text-muted-foreground">% sobre o custo para uso externo</span>
                  </div>
                  <span className="text-base font-bold tabular-nums text-primary bg-primary/10 px-3 py-1 rounded-md">
                    {formatMarkupPercent(result.markupPercent)}
                  </span>
                </div>

                <button
                  onClick={handleCopyMarkup}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold border transition-all shadow-sm",
                    copied
                      ? "bg-emerald-500 border-emerald-600 text-white"
                      : "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" strokeWidth={3} />
                      Markup copiado para área de transferência!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar % Markup para o ERP
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-sm font-medium px-4">Informe o custo do produto para calcular o preço ideal de venda.</p>
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <PieChart className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-foreground">Composição do Preço</h2>
            </div>
            <PriceChart
              result={result}
              costValue={inputs.cost}
              taxType={taxType}
              taxPercent={inputs.taxPercent}
              cardPercent={inputs.cardPercent}
              commissionPercent={inputs.commissionPercent}
              operationalPercent={inputs.operationalPercent}
              profitPercent={inputs.profitPercent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
