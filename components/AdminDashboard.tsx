
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { db } from '../services/db';
import { analyzeCheckIns } from '../services/geminiService';
import { COUNTRIES, TAGS } from '../constants';
import { CheckIn } from '../types';
import { RefreshCw, FileText, TrendingUp, AlertCircle, Database, DatabaseBackup, Users, MapPin, Star, Calendar } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<CheckIn[]>([]);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [dbError, setDbError] = useState('');

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        setDbStatus('connected');
      } else {
        const err = await res.json();
        setDbStatus('error');
        setDbError(err.message || '連線失敗');
      }
    } catch (e) {
      setDbStatus('error');
      setDbError('伺服器無回應');
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    await checkHealth();
    const records = await db.getAllCheckIns();
    setData(records);
    setIsLoading(false);
  };

  const runAnalysis = async () => {
    if (data.length === 0) return;
    setIsAnalyzing(true);
    const result = await analyzeCheckIns(data);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleSeed = async () => {
    if (!confirm('將匯入 7 筆測試打卡紀錄，確定嗎？')) return;
    setIsLoading(true);
    try {
      await db.seedData();
      await fetchData();
      alert('✅ 測試數據匯入成功！');
    } catch (e: any) {
      alert('❌ 匯入失敗：' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const countryCounts = data.reduce((acc, curr) => {
    acc[curr.countryCode] = (acc[curr.countryCode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const countryStats = Object.keys(countryCounts).map(code => {
    const predefined = COUNTRIES.find(c => c.code === code);
    return {
      name: predefined ? predefined.name : code,
      count: countryCounts[code]
    };
  }).sort((a, b) => b.count - a.count);

  const tagStats = TAGS.map(t => ({
    name: t.label,
    count: data.filter(d => d.tags.includes(t.id)).length
  })).sort((a, b) => b.count - a.count);

  const COLORS = ['#f97316', '#ef4444', '#facc15', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="text-orange-500" />
          攤位熱度分析
        </h2>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* DB Status Light */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold border ${
            dbStatus === 'connected' ? 'bg-green-500/10 border-green-500/50 text-green-500' : 
            dbStatus === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-500' : 
            'bg-slate-500/10 border-slate-500/50 text-slate-500'
          }`}>
            <Database className="w-3 h-3" />
            {dbStatus === 'connected' ? 'DB 已連線' : dbStatus === 'error' ? '連線錯誤' : '檢查中...'}
          </div>

          {/* Seed Button - Now always visible in the toolbar if connected */}
          {dbStatus === 'connected' && (
            <button 
              onClick={handleSeed}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/20 border border-blue-500/50 text-blue-400 hover:bg-blue-600/40 rounded-full text-[10px] font-bold transition-all disabled:opacity-50"
            >
              <DatabaseBackup className="w-3 h-3" />
              匯入測試資料
            </button>
          )}
          
          <button 
            onClick={fetchData}
            className="p-2 rounded-full hover:bg-slate-800 transition-colors bg-[#161b22] border border-[#30363d]"
            title="重新整理"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {dbStatus === 'error' && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm">
          <AlertCircle className="w-5 h-5 inline mr-2" />
          資料庫連線失敗：{dbError}
          <div className="mt-2 text-xs opacity-70">請檢查 Zeabur 的 DATABASE_URL 變數格式是否正確。</div>
        </div>
      )}

      {/* Main Content */}
      {data.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center p-20 text-slate-500 bg-[#161b22] rounded-3xl border border-[#30363d] border-dashed">
          <DatabaseBackup className="w-16 h-16 mb-4 opacity-10" />
          <p className="text-lg font-medium">資料庫目前沒有數據</p>
          <p className="text-sm opacity-50 mt-1">請點擊右上角「匯入測試資料」或手動去「美食打卡」分頁新增。</p>
        </div>
      ) : (
        <>
          {/* 數據概覽卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 總打卡次數 */}
            <div className="bg-[#161b22] p-5 rounded-2xl border border-[#30363d]">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                </div>
                <span className="text-xs text-slate-400 font-medium">總打卡次數</span>
              </div>
              <div className="text-3xl font-black text-white">{data.length}</div>
            </div>

            {/* 不重複參與人數 */}
            <div className="bg-[#161b22] p-5 rounded-2xl border border-[#30363d]">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-xs text-slate-400 font-medium">參與人數</span>
              </div>
              <div className="text-3xl font-black text-white">
                {new Set(data.map(d => d.nickname)).size}
              </div>
            </div>

            {/* 熱門攤位 */}
            <div className="bg-[#161b22] p-5 rounded-2xl border border-[#30363d]">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <MapPin className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-xs text-slate-400 font-medium">熱門攤位</span>
              </div>
              <div className="text-2xl font-black text-white">
                {countryStats[0]?.name || '-'}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {countryStats[0]?.count || 0} 次打卡
              </div>
            </div>

            {/* 最受歡迎標籤 */}
            <div className="bg-[#161b22] p-5 rounded-2xl border border-[#30363d]">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                <span className="text-xs text-slate-400 font-medium">最多評價</span>
              </div>
              <div className="text-2xl font-black text-white">
                {tagStats[0]?.name || '-'}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {tagStats[0]?.count || 0} 次選擇
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Countries Bar Chart */}
            <div className="bg-[#161b22] p-6 rounded-3xl border border-[#30363d] shadow-xl">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Popular Countries / 各國人氣</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={countryStats.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#30363d" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      stroke="#8b949e" 
                      fontSize={11} 
                      tickLine={false} 
                      axisLine={false}
                      width={90}
                    />
                    <Tooltip 
                      cursor={{ fill: '#30363d', opacity: 0.4 }}
                      contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
                      {countryStats.slice(0, 10).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tags Pie Chart */}
            <div className="bg-[#161b22] p-6 rounded-3xl border border-[#30363d] shadow-xl">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Experience Distribution / 評價分佈</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tagStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={8}
                      dataKey="count"
                      stroke="none"
                    >
                      {tagStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: '12px', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI Analysis Section */}
          <div className="bg-[#161b22] rounded-3xl border border-[#30363d] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#30363d] flex justify-between items-center bg-orange-500/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <FileText className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white">AI 智慧分析報告</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Powered by Gemini 3.0</p>
                </div>
              </div>
              <button 
                onClick={runAnalysis}
                disabled={isAnalyzing || data.length === 0}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-30 flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    分析中...
                  </>
                ) : '生成最新分析'}
              </button>
            </div>
            <div className="p-8 min-h-[200px] flex items-center justify-center">
              {analysis ? (
                <div className="text-slate-300 leading-relaxed whitespace-pre-wrap w-full animate-in fade-in slide-in-from-top-4 duration-700">
                  {analysis}
                </div>
              ) : (
                <div className="text-center text-slate-500 italic flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full border border-dashed border-slate-700 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 opacity-30" />
                  </div>
                  <p>點擊上方按鈕，讓 AI 為您總結今年的美食數據趨勢。</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
