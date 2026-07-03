export interface News {
  id: string;
  title: string;
  summary_3line: string[];
  impact_1line: string | null;
  category: '국내ETF' | '미국지수' | '금리환율';
  source: string | null;
  url: string | null;
  news_date: string;
  is_favorite: boolean;
  created_at: string;
}
