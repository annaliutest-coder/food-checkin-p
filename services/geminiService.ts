// AI 分析服務（暫時停用）

interface CheckIn {
  id: string;
  nickname: string;
  day: number;
  countryCode: string;
  tags: string[];
  timestamp: number;
}

export async function analyzeCheckIns(records: CheckIn[]): Promise<string> {
  // 簡單的本地分析（不需要 AI API）
  const totalCheckins = records.length;
  const uniqueUsers = new Set(records.map(r => r.nickname)).size;

  const countryCounts: Record<string, number> = {};
  records.forEach(r => {
    countryCounts[r.countryCode] = (countryCounts[r.countryCode] || 0) + 1;
  });

  const sortedCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const dayStats = [1, 2, 3].map(day => ({
    day,
    count: records.filter(r => r.day === day).length
  }));

  return `📊 國際週美食數據分析報告

📈 總體數據
• 總打卡次數：${totalCheckins} 次
• 參與人數：${uniqueUsers} 人
• 平均每人打卡：${(totalCheckins / uniqueUsers).toFixed(1)} 次

🏆 人氣排行榜
${sortedCountries.map((c, i) => `${i + 1}. ${c[0]}：${c[1]} 次打卡`).join('\n')}

📅 各日參與情況
${dayStats.map(d => `• Day ${d.day}：${d.count} 次打卡`).join('\n')}

💡 建議
${sortedCountries[0] ? `最受歡迎的是 ${sortedCountries[0][0]} 攤位，建議明年可以擴大規模！` : '目前數據不足，請繼續收集打卡資料。'}`;
}
