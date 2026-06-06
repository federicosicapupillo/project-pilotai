import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "it" | "en";

const STORAGE_KEY = "ideapilot_locale";

function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return "it";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "it" || saved === "en") return saved;
  } catch {
    // ignore
  }
  const nav = (typeof navigator !== "undefined" ? navigator.language : "") || "";
  return nav.toLowerCase().startsWith("it") ? "it" : "en";
}

type Dict = Record<string, string>;

const it: Dict = {
  // Brand
  "brand.full": "IdeaPilot IA",
  "brand.ai": "IA",
  "brand.tagline": "Dalla tua idea alla tua prima app",

  // Nav
  "nav.home": "Home",
  "nav.tools": "Strumenti",
  "nav.agents": "Agenti",
  "nav.pricing": "Prezzi",
  "nav.dashboard": "Dashboard",
  "nav.signIn": "Accedi",
  "nav.start": "Inizia ora",
  "nav.signOut": "Esci",
  "nav.activate": "Attiva Team AI - 29€",
  "nav.projectManager": "Parla con il Project Manager",
  "nav.projectManagerShort": "Project Manager",

  // Language switcher
  "lang.label": "Lingua",

  // Home / Hero
  "home.badge": "Metodo IA per non tecnici",
  "home.hero.title": "Hai un'idea per un'app? Scopri ore, costi e potenziale economico.",
  "home.hero.subtitle":
    "Scrivi la tua idea. La nostra IA ti aiuta a stimare ore, difficoltà, costi, strumenti necessari e possibile modello di ricavo per creare la prima versione funzionante.",
  "home.cta.primary": "Calcola ore, costi e potenziale",
  "home.cta.secondary": "Scopri il metodo",
  "home.hero.note": "Niente promesse magiche: tu resti il regista, gli agenti IA ti aiutano passo passo.",

  // Estimator
  "est.eyebrow": "Calcolatore intelligente",
  "est.title.a": "Hai un'idea per un'app? ",
  "est.title.b": "Scopri ore, costi e budget consigliato.",
  "est.desc":
    "Scrivi la tua idea, inserisci il budget che vuoi dedicare al progetto e scopri quante ore servono, quanto potrebbe costare e quale potenziale economico potrebbe avere.",
  "est.label.idea": "✍️ Raccontami la tua idea",
  "est.placeholder.idea":
    "Esempio: voglio creare un'app per aiutare ristoratori a trovare personale extra per weekend e turni serali…",
  "est.hint.idea": "💡 Più sei chiaro, più la stima sarà utile.",
  "est.budget.title": "Inserisci il tuo budget",
  "est.budget.desc":
    "Indica il budget operativo per la prima versione funzionante. Non includere il costo del corso.",
  "est.optional.toggle": "Aggiungi dettagli facoltativi per una stima più precisa",
  "est.optional.target": "A chi vuoi venderla?",
  "est.optional.revenue": "Come pensi di guadagnarci?",
  "est.optional.price": "Quanto vorresti far pagare?",
  "est.btn.calc": "Calcola ore, costi e budget consigliato",
  "est.btn.calcInProgress": "Analisi in corso…",
  "est.btn.review": "Rivedi analisi",
  "est.btn.note": "Stima orientativa basata sulla tua descrizione. Non è una promessa: serve a capire l'ordine di grandezza.",

  // Pricing
  "pricing.badge": "Pacchetto Team IA Operativo",
  "pricing.title": "Attiva il tuo Team IA operativo",
  "pricing.subtitle":
    "Tu porti l'idea. Il tuo team di agenti IA la organizza, la struttura e prepara il lavoro per trasformarla nella prima versione della tua app.",
  "pricing.launch": "Prezzo lancio",
  "pricing.oneTime": "Una tantum",
  "pricing.cta.primary": "Parti ora con il Team IA - 29€",
  "pricing.cta.dashboard": "Vai alla dashboard",
  "pricing.cta.note": "Pagamento unico. Nessun abbonamento attivato automaticamente.",
  "pricing.cta.secure": "Pagamento sicuro · Accesso immediato al tuo Team IA",

  // Auth
  "auth.signin": "Accedi",
  "auth.signup": "Crea account",
  "auth.signupCta": "Crea il tuo account",
  "auth.continueGoogle": "Continua con Google",
  "auth.continueApple": "Continua con Apple",
  "auth.orEmail": "oppure con email",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.passwordConfirm": "Conferma password",
  "auth.name": "Nome",
  "auth.wait": "Attendere...",
  "auth.pwd.length": "Almeno 8 caratteri",
  "auth.pwd.upper": "Una lettera maiuscola",
  "auth.pwd.lower": "Una lettera minuscola",
  "auth.pwd.number": "Un numero",
  "auth.pwd.special": "Un carattere speciale (! @ # $ % ^ & * ? _ - .)",
  "auth.pwd.mismatch": "Le password non coincidono.",
  "auth.show": "Mostra password",
  "auth.hide": "Nascondi password",
  "auth.toast.welcome": "Bentornato!",
  "auth.toast.created": "Account creato!",
  "auth.toast.createdConfirm": "Account creato! Controlla la tua email per confermare, poi accedi.",
  "auth.toast.oauthFail": "Accesso non riuscito. Riprova.",
  "auth.err.pwdRules": "La password deve contenere almeno 8 caratteri, una maiuscola, una minuscola, un numero e un carattere speciale.",
  "auth.err.pwdMatch": "Le password non coincidono.",

  // Common
  "common.error": "Qualcosa è andato storto. Riprova.",
  "common.privacy":
    "La tua idea viene usata solo per generare la tua analisi. Non pubblichiamo né condividiamo il tuo progetto senza il tuo permesso.",
};

const en: Dict = {
  // Brand
  "brand.full": "IdeaPilot AI",
  "brand.ai": "AI",
  "brand.tagline": "From your idea to your first app",

  // Nav
  "nav.home": "Home",
  "nav.tools": "Tools",
  "nav.agents": "Agents",
  "nav.pricing": "Pricing",
  "nav.dashboard": "Dashboard",
  "nav.signIn": "Sign in",
  "nav.start": "Get started",
  "nav.signOut": "Sign out",
  "nav.activate": "Activate AI Team - €29",
  "nav.projectManager": "Talk to the Project Manager",
  "nav.projectManagerShort": "Project Manager",

  // Language switcher
  "lang.label": "Language",

  // Home / Hero
  "home.badge": "AI method for non-technical founders",
  "home.hero.title": "Turn your app idea into a real project in minutes.",
  "home.hero.subtitle":
    "IdeaPilot AI helps you analyze your app idea, understand its potential, estimate costs, define features, and get a clear roadmap before you start building.",
  "home.cta.primary": "Analyze your idea for free",
  "home.cta.secondary": "See how it works",
  "home.hero.note": "No magic promises: you stay in charge, the AI agents support you step by step.",

  // Estimator
  "est.eyebrow": "Smart calculator",
  "est.title.a": "Have an app idea? ",
  "est.title.b": "See hours, costs and recommended budget.",
  "est.desc":
    "Describe your idea, set the budget you want to dedicate to the project, and find out how many hours it takes, what it could cost, and what kind of revenue potential it has.",
  "est.label.idea": "✍️ Describe your app idea",
  "est.placeholder.idea":
    "Example: I want to create an app that helps restaurants find extra staff for last-minute shifts.",
  "est.hint.idea": "💡 The clearer you are, the more useful the estimate.",
  "est.budget.title": "Enter your budget",
  "est.budget.desc":
    "Indicate the operational budget for the first working version. Do not include the cost of the course.",
  "est.optional.toggle": "Add optional details for a more accurate estimate",
  "est.optional.target": "Who are you selling it to?",
  "est.optional.revenue": "How do you plan to make money?",
  "est.optional.price": "How much would you charge?",
  "est.btn.calc": "Calculate hours, costs and recommended budget",
  "est.btn.calcInProgress": "Analyzing…",
  "est.btn.review": "Review analysis",
  "est.btn.note": "Rough estimate based on your description. It's not a promise: it's meant to give you a sense of scale.",

  // Pricing
  "pricing.badge": "AI Team Operational Package",
  "pricing.title": "Activate your operational AI Team",
  "pricing.subtitle":
    "You bring the idea. Your AI agent team organizes it, structures it, and prepares the work to turn it into the first version of your app.",
  "pricing.launch": "Launch price",
  "pricing.oneTime": "One-time payment",
  "pricing.cta.primary": "Get started with the AI Team - €29",
  "pricing.cta.dashboard": "Go to dashboard",
  "pricing.cta.note": "One-time payment. No subscription is started automatically.",
  "pricing.cta.secure": "Secure payment · Instant access to your AI Team",

  // Auth
  "auth.signin": "Sign in",
  "auth.signup": "Create account",
  "auth.signupCta": "Create your account",
  "auth.continueGoogle": "Continue with Google",
  "auth.continueApple": "Continue with Apple",
  "auth.orEmail": "or with email",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.passwordConfirm": "Confirm password",
  "auth.name": "Name",
  "auth.wait": "Please wait...",
  "auth.pwd.length": "At least 8 characters",
  "auth.pwd.upper": "One uppercase letter",
  "auth.pwd.lower": "One lowercase letter",
  "auth.pwd.number": "One number",
  "auth.pwd.special": "One special character (! @ # $ % ^ & * ? _ - .)",
  "auth.pwd.mismatch": "Passwords do not match.",
  "auth.show": "Show password",
  "auth.hide": "Hide password",
  "auth.toast.welcome": "Welcome back!",
  "auth.toast.created": "Account created!",
  "auth.toast.createdConfirm": "Account created! Check your email to confirm, then sign in.",
  "auth.toast.oauthFail": "Sign in failed. Please try again.",
  "auth.err.pwdRules": "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character.",
  "auth.err.pwdMatch": "Passwords do not match.",

  // Common
  "common.error": "Something went wrong. Please try again.",
  "common.privacy":
    "Your idea is used only to generate your analysis. We do not publish or share your project without your permission.",
};

const DICTS: Record<Locale, Dict> = { it, en };

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("it");

  // Hydrate from localStorage/navigator after mount (avoids SSR mismatch)
  useEffect(() => {
    const initial = detectInitialLocale();
    setLocaleState(initial);
  }, []);

  // Keep <html lang> in sync
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, l);
      }
    } catch {
      // ignore
    }
  };

  const value = useMemo<Ctx>(
    () => ({
      locale,
      setLocale,
      t: (key: string) => DICTS[locale][key] ?? DICTS.it[key] ?? key,
    }),
    [locale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fail-safe: return identity so missing provider doesn't crash the app
    return {
      locale: "it" as Locale,
      setLocale: (_l: Locale) => {},
      t: (key: string) => DICTS.it[key] ?? key,
    };
  }
  return ctx;
}

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useT();
  const Btn = ({ code, label }: { code: Locale; label: string }) => {
    const active = locale === code;
    return (
      <button
        type="button"
        onClick={() => setLocale(code)}
        aria-pressed={active}
        aria-label={label}
        className={
          "px-2 py-1 text-xs font-semibold rounded-md transition-colors " +
          (active
            ? "bg-primary/15 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/40")
        }
      >
        {label}
      </button>
    );
  };
  return (
    <div
      role="group"
      aria-label="Language"
      className={
        "inline-flex items-center gap-0.5 rounded-md border border-border/50 bg-secondary/30 p-0.5 " +
        className
      }
    >
      <Btn code="it" label="IT" />
      <Btn code="en" label="EN" />
    </div>
  );
}