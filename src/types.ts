export type Difficulty = 'آسان' | 'متوسط' | 'سخت';
export type Verdict = 'بنویس' | 'بنویس ولی زاویه را عوض کن' | 'ننویس';

export interface CompetitorPage {
  domain: string;
  title: string;
  summary: string;
  url: string;
}

export interface SearchPhrase {
  phrase: string;
  isBranded: boolean;
  brandName?: string;
  evidence: 'seen' | 'inferred';
}

export interface GoogleTrendsInsight {
  peakMonth: string;
  fiveYearTrend: 'صعودی' | 'ثابت' | 'نزولی' | 'داده‌ی کافی نیست';
  wordingComparison: string;
  notes: string;
}

export interface TopicStrategy {
  id: string;
  title: string;
  targetKeyword: string;
  difficulty: Difficulty;
  productionMonth: string;
  peakSeason: string;
  verdict: Verdict;
  oneLineReason: string;
  suggestedAngle?: string;
  
  // 1. Real search phrases
  searchPhrases: SearchPhrase[];
  
  // 2. Ranking pages
  rankingPages: CompetitorPage[];
  
  // 3. Content gap
  contentGap: {
    missingElements: string[];
    actionableProposal: string;
    rahekonkurAdvantage: string;
  };
  
  // 4. Difficulty rationale
  difficultyRationale: string;
  
  // 4.5 Google Trends
  googleTrends: GoogleTrendsInsight;
  
  // 5. Seasonal timing
  seasonalTiming: {
    peakPeriod: string;
    productionRule: string;
    productionMonth: string;
  };
  
  // 6. Verdict details
  verdictDetails: {
    type: Verdict;
    justification: string;
    angleRecommendation?: string;
  };
  
  // 7. Proposed target keyword
  keywordDetails: {
    keyword: string;
    wordCount: number;
    sampleMetaTitle: string;
    sampleMetaDescription: string;
  };
}
