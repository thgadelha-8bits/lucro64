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
import { AlertCircle, Briefcase, Check, Copy, FileText, Info, Tag, TrendingUp, Wallet } from "lucide-react";

function CompactInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <div
        className={cn(
          "flex items-center rounded-lg border border-input bg-background transition-all duration-150 overflow-hidden",
          disabled
            ? "opacity-40 cursor-not-allowed"
            : "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary hover:border-primary/50"
        )}
      >
        {prefix && (
          <div className="pl-2.5 pr-1.5 py-1.5 flex items-center justify-center bg-muted/40 border-r border-border text-xs font-bold text-muted-foreground select-none">
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
          className="flex-1 bg-transparent px-2.5 py-1.5 text-sm font-semibold outline-none min-w-0 disabled:cursor-not-allowed"
        />
        {suffix && (
          <div className="pr-2.5 pl-1 py-1.5 flex items-center justify-center text-xs font-bold text-muted-foreground select-none">
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}

export interface PrecificaFacilState {
  cost: number;
  sellingPrice: number;
  isValid: boolean;
  cardPercent: number;
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
      cardPercent: inputs.cardPercent,
    });
  }, [inputs.cost, result.sellingPrice, result.isValid, inputs.cardPercent]);

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
    <div className="flex flex-col md:h-full md:grid md:grid-cols-[240px_minmax(0,1fr)] md:divide-x divide-border">
      {/* LEFT — Inputs */}
      <div className="p-4 space-y-4 md:overflow-y-auto">
        {result.errorMessage && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-red-700">{result.errorMessage}</p>
          </div>
        )}

        {/* Cost */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wide text-foreground">Custo de Aquisição</span>
          </div>
          <CompactInput
            label="Custo unitário"
            value={cost}
            onChange={setCost}
            prefix="R$"
            placeholder="0,00"
          />
        </div>

        <div className="border-t border-border/60" />

        {/* Tax */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs font-bold uppercase tracking-wide text-foreground">Tributação</span>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1.5">Regime</p>
            <div className="flex flex-col gap-1.5">
              {taxTypeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTaxType(opt.value)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all text-left flex items-center justify-between w-full",
                    taxType === opt.value
                      ? "bg-primary/10 text-primary border-primary"
                      : "bg-muted/40 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {opt.label}
                  {taxType === opt.value && <Check className="w-3 h-3 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {result.taxNote && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <Info className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-amber-800">{result.taxNote}</p>
            </div>
          )}

          <CompactInput
            label="Alíquota de Imposto"
            value={taxPercent}
            onChange={setTaxPercent}
            suffix="%"
            disabled={taxType !== "simples"}
          />
        </div>

        <div className="border-t border-border/60" />

        {/* Expenses & Margin */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-xs font-bold uppercase tracking-wide text-foreground">Despesas & Margem</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
            <CompactInput
              label="Taxa de Cartão"
              value={cardPercent}
              onChange={setCardPercent}
              suffix="%"
            />
            <CompactInput
              label="Comissão"
              value={commissionPercent}
              onChange={setCommissionPercent}
              suffix="%"
            />
            <CompactInput
              label="Custo Operacional"
              value={operationalPercent}
              onChange={setOperationalPercent}
              suffix="%"
            />
            <CompactInput
              label="Margem de Lucro"
              value={profitPercent}
              onChange={setProfitPercent}
              suffix="%"
            />
          </div>
        </div>

        <div className="border-t border-border/60" />

        {/* Total summary */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-muted-foreground">Total deduções</span>
          <span className={cn("font-bold tabular-nums", result.totalExpensesPercent >= 100 ? "text-red-600" : "text-foreground")}>
            {formatPercent(result.totalExpensesPercent)}
          </span>
        </div>
      </div>

      {/* RIGHT — Results */}
      <div className="p-4 flex flex-col gap-3 md:overflow-y-auto border-t md:border-t-0 border-border">
        {/* Price hero */}
        <div className="bg-card border border-border rounded-xl p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wide text-foreground">Preço de Venda Sugerido</span>
          </div>

          {result.isValid && result.sellingPrice > 0 ? (
            <div className="space-y-3">
              <p className="text-[2rem] font-extrabold text-foreground tabular-nums tracking-tight leading-none">
                {formatCurrency(result.sellingPrice)}
              </p>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-blue-50/80 border border-blue-100 rounded-lg p-2 text-center">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide mb-0.5">Lucro</p>
                  <p className="text-sm font-bold text-blue-800 tabular-nums">{formatCurrency(result.profitAmount)}</p>
                </div>
                <div className="bg-purple-50/80 border border-purple-100 rounded-lg p-2 text-center">
                  <p className="text-[10px] font-bold text-purple-600 uppercase tracking-wide mb-0.5">Margem</p>
                  <p className="text-sm font-bold text-purple-800 tabular-nums">{formatPercent(result.profitPercentActual)}</p>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-2 text-center">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-wide mb-0.5">Markup</p>
                  <p className="text-sm font-bold text-primary tabular-nums">{formatMarkupPercent(result.markupPercent)}</p>
                </div>
              </div>

              <button
                onClick={handleCopyMarkup}
                className={cn(
                  "w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border transition-all",
                  copied
                    ? "bg-emerald-500 border-emerald-600 text-white"
                    : "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                )}
              >
                {copied ? (
                  <><Check className="w-3.5 h-3.5" strokeWidth={3} /> Markup copiado!</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /> Copiar % Markup para o ERP</>
                )}
              </button>
            </div>
          ) : (
            <div className="py-6 text-center text-muted-foreground">
              <Wallet className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-xs font-medium">Informe o custo do produto para calcular o preço ideal.</p>
            </div>
          )}
        </div>

        {/* Breakdown table */}
        {result.isValid && result.sellingPrice > 0 && (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="px-3 py-1.5 bg-muted/40 border-b border-border">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Composição do Preço</span>
            </div>
            <div className="divide-y divide-border/60">
              <div className="grid grid-cols-3 px-3 py-1 bg-muted/20">
                <span className="text-[10px] font-bold text-muted-foreground">Item</span>
                <span className="text-[10px] font-bold text-muted-foreground text-center">%</span>
                <span className="text-[10px] font-bold text-muted-foreground text-right">Valor</span>
              </div>

              <div className="grid grid-cols-3 px-3 py-1.5 items-center">
                <span className="text-xs font-semibold text-foreground">Custo</span>
                <span className="text-xs tabular-nums text-center text-muted-foreground">{formatPercent(result.costPercent, 1)}</span>
                <span className="text-xs font-semibold tabular-nums text-right text-foreground">{formatCurrency(inputs.cost)}</span>
              </div>

              {inputs.taxPercent > 0 && taxType === "simples" && (
                <div className="grid grid-cols-3 px-3 py-1.5 items-center bg-red-50/40">
                  <span className="text-xs font-semibold text-red-700">Imposto</span>
                  <span className="text-xs tabular-nums text-center text-red-500">{formatPercent(result.taxPercent, 1)}</span>
                  <span className="text-xs font-semibold tabular-nums text-right text-red-700">{formatCurrency(result.taxAmount)}</span>
                </div>
              )}

              {inputs.cardPercent > 0 && (
                <div className="grid grid-cols-3 px-3 py-1.5 items-center bg-red-50/40">
                  <span className="text-xs font-semibold text-red-700">Taxa Cartão</span>
                  <span className="text-xs tabular-nums text-center text-red-500">{formatPercent(inputs.cardPercent, 1)}</span>
                  <span className="text-xs font-semibold tabular-nums text-right text-red-700">{formatCurrency(result.sellingPrice * inputs.cardPercent / 100)}</span>
                </div>
              )}

              {inputs.commissionPercent > 0 && (
                <div className="grid grid-cols-3 px-3 py-1.5 items-center bg-red-50/40">
                  <span className="text-xs font-semibold text-red-700">Comissão</span>
                  <span className="text-xs tabular-nums text-center text-red-500">{formatPercent(inputs.commissionPercent, 1)}</span>
                  <span className="text-xs font-semibold tabular-nums text-right text-red-700">{formatCurrency(result.sellingPrice * inputs.commissionPercent / 100)}</span>
                </div>
              )}

              {inputs.operationalPercent > 0 && (
                <div className="grid grid-cols-3 px-3 py-1.5 items-center bg-orange-50/40">
                  <span className="text-xs font-semibold text-orange-700">Op. Fixo</span>
                  <span className="text-xs tabular-nums text-center text-orange-500">{formatPercent(inputs.operationalPercent, 1)}</span>
                  <span className="text-xs font-semibold tabular-nums text-right text-orange-700">{formatCurrency(result.operationalAmount)}</span>
                </div>
              )}

              <div className="grid grid-cols-3 px-3 py-1.5 items-center bg-emerald-50/40">
                <span className="text-xs font-semibold text-emerald-700">Lucro</span>
                <span className="text-xs tabular-nums text-center text-emerald-600">{formatPercent(inputs.profitPercent, 1)}</span>
                <span className="text-xs font-semibold tabular-nums text-right text-emerald-700">{formatCurrency(result.profitAmountChart)}</span>
              </div>

              <div className="grid grid-cols-3 px-3 py-2 items-center bg-muted/30 border-t border-border">
                <span className="text-xs font-bold text-foreground">Total</span>
                <span className="text-xs font-bold tabular-nums text-center text-foreground">100%</span>
                <span className="text-xs font-bold tabular-nums text-right text-foreground">{formatCurrency(result.sellingPrice)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Bar chart */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="px-3 py-1.5 bg-muted/40 border-b border-border">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Distribuição Visual</span>
          </div>
          <div className="p-3">
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
