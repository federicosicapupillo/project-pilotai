export type MarketingStat = {
  key: "earlyUsers" | "ideasAnalyzed" | "reportsGenerated" | "projectsSaved";
  value: string;
};

export const marketingStats: MarketingStat[] = [
  { key: "earlyUsers", value: "1.000+" },
  { key: "ideasAnalyzed", value: "3.700+" },
  { key: "reportsGenerated", value: "2.100+" },
  { key: "projectsSaved", value: "860+" },
];

export const marketingStatsEn: Record<MarketingStat["key"], string> = {
  earlyUsers: "1,000+",
  ideasAnalyzed: "3,700+",
  reportsGenerated: "2,100+",
  projectsSaved: "860+",
};