
export interface Country {
  code: string;
  name: string;
  emoji?: string;
}

export interface Tag {
  id: string;
  label: string;
  icon: string;
}

export interface CheckIn {
  id: string;
  nickname: string;
  day: number;
  countryCode: string;
  tags: string[];
  timestamp: number;
}

export interface AnalyticsSummary {
  popularCountries: Array<{ name: string; count: number }>;
  tagDistribution: Array<{ label: string; count: number }>;
  aiAnalysis?: string;
}
