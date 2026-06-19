import { PreferenceWizard } from "../components/PreferenceWizard";

export function PreferenceOnboardingPage() {
  return (
    <div className="mx-auto max-w-4xl py-4 sm:py-8">
      <div className="mb-8 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Preferência inicial</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Conte o que você procura
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          Essa preferência será salva no banco e usada para gerar automaticamente imóveis compatíveis com score mínimo de 70%.
        </p>
      </div>
      <PreferenceWizard />
    </div>
  );
}
