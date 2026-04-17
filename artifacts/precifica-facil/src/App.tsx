import { useState } from "react";
import { PrecificaFacil, type PrecificaFacilState } from "@/components/PrecificaFacil";
import { ScenarioSimulator } from "@/components/ScenarioSimulator";

function App() {
  const [pricingState, setPricingState] = useState<PrecificaFacilState>({
    cost: 0,
    sellingPrice: 0,
    isValid: false,
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <header className="flex-shrink-0 border-b border-border bg-card px-5 py-2.5 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-bold text-foreground leading-tight">Precifica Fácil</h1>
          <p className="text-[10px] text-muted-foreground leading-tight">Calculadora de Margem & Preço</p>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Top: calculator — 2 columns (inputs | results) */}
        <div className="flex-1 overflow-hidden border-b border-border">
          <PrecificaFacil onStateChange={setPricingState} />
        </div>

        {/* Bottom: scenario simulator — full width, 3 cards side by side */}
        <div className="flex-shrink-0 h-[230px]">
          <ScenarioSimulator
            basePrice={pricingState.sellingPrice}
            cost={pricingState.cost}
            isValid={pricingState.isValid}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
