/**
 * Landing page string catalogue.
 *
 * Split out of `landingTranslations.ts` so each locale lives in its own file
 * and can be added/removed/reviewed independently. `landingTranslations.ts`
 * re-exports this type, so every existing `import { LandingTranslation } from
 * '@/data/landingTranslations'` keeps working.
 */
export interface LandingTranslation {
  nav: {
    product: string;
    solutions: string;
    resources: string;
    bricsImpact: string;
    pricing: string;
    aboutUs: string;
    joinPilot: string;
    getStarted: string;
  };
  hero: {
    badge: string;
    titlePart1: string;
    titlePart2: string;
    titlePart3: string;
    description: string;
    ctaGetStarted: string;
    ctaLiveDemo: string;
    trustedBy: string;
  };
  stats: {
    nodes: string;
    corpora: string;
    water: string;
    resolution: string;
  };
  solutions: {
    tag: string;
    title: string;
    subtitle: string;
    farmers: string;
    farmersDesc: string;
    agribusiness: string;
    agribusinessDesc: string;
    government: string;
    governmentDesc: string;
    researchers: string;
    researchersDesc: string;
    learnMore: string;
  };
  sandbox: {
    tag: string;
    title: string;
    subtitle: string;
  };
  brics: {
    tag: string;
    title: string;
    subtitle: string;
    viewCorridor: string;
  };
  faq: {
    tag: string;
    title: string;
    subtitle: string;
  };
  finalCta: {
    title: string;
    description: string;
    ctaButton: string;
    demoButton: string;
  };
}
