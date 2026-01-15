
import { CheckIn } from "../types";
import { COUNTRIES, TAGS } from "../constants";

export const analyzeCheckIns = async (records: CheckIn[]): Promise<string> => {
  if (records.length === 0) return "尚無足夠數據進行分析。";

  // 為了安全，將原始數據發送到後端進行 AI 分析
  const summary = records.map(r => ({
    country: COUNTRIES.find(c => c.code === r.countryCode)?.name || r.countryCode,
    tags: r.tags.map(tid => TAGS.find(t => t.id === tid)?.label || tid)
  }));

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: summary }),
    });

    if (!response.ok) throw new Error('Analysis request failed');
    const data = await response.json();
    return data.analysis || "無法產生分析報告。";
  } catch (error) {
    console.error("AI Analysis error:", error);
    return "分析伺服器目前無法連線。";
  }
};
