import { useState } from "react";
import { PrecificaFacil, type PrecificaFacilState } from "@/components/PrecificaFacil";
import { ScenarioSimulator } from "@/components/ScenarioSimulator";
import { Calculator } from "lucide-react";

function App() {
  const [pricingState, setPricingState] = useState<PrecificaFacilState>({
    cost: 0,
    sellingPrice: 0,
    isValid: false,
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-sm">
              <Calculator className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-foreground leading-none tracking-tight">Precifica Fácil</h1>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Calculadora de Margem & Preço</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-sm font-medium text-muted-foreground">
            <span>Precificação Simples</span>
            <div className="w-1 h-1 rounded-full bg-border" />
            <span>Simulador de Cenários</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-10 space-y-12">
        <PrecificaFacil onStateChange={setPricingState} />

        <div className="border-t border-border/60" />

        <ScenarioSimulator
          basePrice={pricingState.sellingPrice}
          cost={pricingState.cost}
          isValid={pricingState.isValid}
        />

        <footer className="text-center text-sm text-muted-foreground pt-12 pb-8 border-t border-border/40">
          <p>
            Precifica Fácil — Cálculos em tempo real. Os valores são estimativas para fins de gestão.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
