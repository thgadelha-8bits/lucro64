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
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <div
        className={cn(
          "flex items-center rounded-lg border border-input bg-card transition-all",
          disabled
            ? "opacity-50 cursor-not-allowed bg-muted"
            : "focus-within:ring-2 focus-within:ring-primary focus-within:border-primary"
        )}
      >
        {prefix && (
          <span className="pl-3 pr-1 text-sm font-medium text-muted-foreground select-none">
            {prefix}
          </span>
        )}
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder ?? "0"}
          className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none min-w-0 disabled:cursor-not-allowed"
        />
        {suffix && (
          <span className="pr-3 pl-1 text-sm font-medium text-muted-foreground select-none">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
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
    { value: "st", label: "Substituicao Tributaria (ST)" },
  ];

  return (
    <div>
      {result.errorMessage && (
        <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3.5">
          <svg
            className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-red-700">Percentuais invalidos</p>
            <p className="text-sm text-red-600 mt-0.5">{result.errorMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT — Inputs */}
        <div className="space-y-5">
          {/* Cost */}
          <div className="bg-card border border-card-border rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h2 className="text-sm font-semibold text-foreground">Custo</h2>
            </div>
            <NumericInput
              label="Custo do produto (R$)"
              value={cost}
              onChange={setCost}
              prefix="R$"
              placeholder="0,00"
            />
          </div>

          {/* Tax */}
          <div className="bg-card border border-card-border rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h2 className="text-sm font-semibold text-foreground">Tributacao</h2>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Tipo de tributacao</label>
              <div className="grid grid-cols-2 gap-2">
                {taxTypeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTaxType(opt.value)}
                    className={cn(
                      "px-3 py-2.5 rounded-lg text-xs font-medium border transition-all text-left",
                      taxType === opt.value
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-card text-foreground border-input hover:border-primary/50 hover:bg-accent/30"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {result.taxNote && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <p className="text-xs text-amber-700 font-medium">{result.taxNote}</p>
              </div>
            )}

            <NumericInput
              label="Imposto (%)"
              value={taxPercent}
              onChange={setTaxPercent}
              suffix="%"
              disabled={taxType !== "simples"}
              hint={taxType === "simples" ? "Aliquota efetiva do Simples Nacional" : undefined}
            />
          </div>

          {/* Expenses */}
          <div className="bg-card border border-card-border rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <h2 className="text-sm font-semibold text-foreground">Despesas da Venda</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumericInput
                label="Taxa de cartao (%)"
                value={cardPercent}
                onChange={setCardPercent}
                suffix="%"
                hint="Maquininha / marketplace"
              />
              <NumericInput
                label="Comissao (%)"
                value={commissionPercent}
                onChange={setCommissionPercent}
                suffix="%"
                hint="Representantes / parceiros"
              />
              <NumericInput
                label="Despesas operacionais (%)"
                value={operationalPercent}
                onChange={setOperationalPercent}
                suffix="%"
                hint="Aluguel, energia, internet..."
              />
              <NumericInput
                label="Lucro desejado (%)"
                value={profitPercent}
                onChange={setProfitPercent}
                suffix="%"
                hint="Meta de margem de lucro"
              />
            </div>
          </div>
        </div>

        {/* RIGHT — Results */}
        <div className="space-y-5">
          {/* Main Result */}
          <div className="bg-card border border-card-border rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              </div>
              <h2 className="text-sm font-semibold text-foreground">Resultado da Precificacao</h2>
            </div>

            {result.isValid && result.sellingPrice > 0 ? (
              <div className="space-y-2.5">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-4 text-center">
                  <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wide mb-1">
                    Preco de Venda Ideal
                  </p>
                  <p className="text-3xl font-bold text-emerald-600 tabular-nums">
                    {formatCurrency(result.sellingPrice)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                    <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">Lucro (R$)</p>
                    <p className="text-xl font-bold text-blue-600 tabular-nums">
                      {formatCurrency(result.profitAmount)}
                    </p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
                    <p className="text-xs font-semibold text-purple-500 uppercase tracking-wide mb-1">Margem de Lucro</p>
                    <p className="text-xl font-bold text-purple-600 tabular-nums">
                      {formatPercent(result.profitPercentActual)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50">
                  <div>
                    <span className="text-sm font-medium text-foreground">Markup</span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Percentual sobre o custo para preenchimento no sistema
                    </p>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-foreground">
                    {formatMarkupPercent(result.markupPercent)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/50">
                  <div>
                    <span className="text-sm font-medium text-foreground">Total de despesas</span>
                    <p className="text-xs text-muted-foreground mt-0.5">Soma de todos os percentuais</p>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-foreground">
                    {formatPercent(result.totalExpensesPercent)}
                  </span>
                </div>

                <button
                  onClick={handleCopyMarkup}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-all",
                    copied
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-card border-input text-foreground hover:bg-accent/40 hover:border-primary/40"
                  )}
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Markup copiado!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copiar Markup ({formatMarkupPercent(result.markupPercent)})
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="py-10 text-center text-muted-foreground">
                <svg className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <p className="text-sm">Informe o custo do produto para ver os resultados</p>
              </div>
            )}
          </div>

          {/* Breakdown table */}
          {result.isValid && result.sellingPrice > 0 && (
            <div className="bg-card border border-card-border rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </div>
                <h2 className="text-sm font-semibold text-foreground">Detalhamento</h2>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground px-1 mb-2">
                  <span>Item</span>
                  <span>Valor</span>
                </div>
                {[
                  { label: "Custo do produto", value: formatCurrency(inputs.cost) },
                  ...(taxType === "simples" && inputs.taxPercent > 0
                    ? [{ label: `Imposto Simples (${formatPercent(inputs.taxPercent)})`, value: formatCurrency(result.taxAmount) }]
                    : []),
                  ...(inputs.cardPercent > 0
                    ? [{ label: `Taxa de cartao (${formatPercent(inputs.cardPercent)})`, value: formatCurrency(result.sellingPrice * (inputs.cardPercent / 100)) }]
                    : []),
                  ...(inputs.commissionPercent > 0
                    ? [{ label: `Comissao (${formatPercent(inputs.commissionPercent)})`, value: formatCurrency(result.sellingPrice * (inputs.commissionPercent / 100)) }]
                    : []),
                  ...(inputs.operationalPercent > 0
                    ? [{ label: `Desp. operacionais (${formatPercent(inputs.operationalPercent)})`, value: formatCurrency(result.operationalAmount) }]
                    : []),
                  { label: `Lucro (${formatPercent(inputs.profitPercent)})`, value: formatCurrency(result.profitAmountChart) },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center text-sm py-2.5 px-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                    <span className="text-foreground/80">{row.label}</span>
                    <span className="font-semibold tabular-nums text-foreground">{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center text-sm py-2.5 px-3 rounded-lg bg-primary/10 border border-primary/20 mt-2">
                  <span className="font-bold text-primary">Preco de Venda</span>
                  <span className="font-bold tabular-nums text-primary">{formatCurrency(result.sellingPrice)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="bg-card border border-card-border rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                  <path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
              </div>
              <h2 className="text-sm font-semibold text-foreground">Composicao do Preco</h2>
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
