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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground leading-tight">Precifica Facil</h1>
            <p className="text-xs text-muted-foreground">Calcule o preco ideal para seus produtos</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <PrecificaFacil onStateChange={setPricingState} />

        <div className="my-10 border-t border-border" />

        <ScenarioSimulator
          basePrice={pricingState.sellingPrice}
          cost={pricingState.cost}
          isValid={pricingState.isValid}
        />

        <p className="text-center text-xs text-muted-foreground mt-10 pb-4">
          Precifica Facil — Calculos em tempo real. Os valores sao estimativas para fins de gestao.
        </p>
      </main>
    </div>
  );
}

export default App;
