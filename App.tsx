
import React, { useState } from 'react';
import { MapPin, CheckCircle2, LayoutDashboard, UtensilsCrossed, Share2, Copy, Check } from 'lucide-react';
import PassportForm from './components/PassportForm';
import AdminDashboard from './components/AdminDashboard';
import { TAGS } from './constants';

interface CheckInData {
  nickname: string;
  day: number;
  countryCode: string;
  countryName: string;
  tags: string[];
}

const App: React.FC = () => {
  // 透過 URL 參數 ?admin=true 進入後台
  const urlParams = new URLSearchParams(window.location.search);
  const isAdmin = urlParams.get('admin') === 'true';

  const [view, setView] = useState<'form' | 'admin' | 'success'>(isAdmin ? 'admin' : 'form');
  const [checkInData, setCheckInData] = useState<CheckInData | null>(null);
  const [copied, setCopied] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  // 隱藏入口：連續點擊標題 5 次進入後台
  const handleTitleTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 5) {
      setView('admin');
      setTapCount(0);
    }
    // 2 秒內沒繼續點就重置
    setTimeout(() => setTapCount(0), 2000);
  };

  const handleSuccess = (data: CheckInData) => {
    setCheckInData(data);
    setView('success');
    setCopied(false);
  };

  const getShareText = () => {
    if (!checkInData) return '';
    const tagLabels = checkInData.tags
      .map(id => TAGS.find(t => t.id === id))
      .filter(Boolean)
      .map(t => `${t!.icon} ${t!.label}`)
      .join(' ');

    return `🌍 我在國際週美食護照打卡了！

📍 Day ${checkInData.day} - ${checkInData.countryName}美食
${tagLabels ? `✨ ${tagLabels}` : ''}

來一起體驗異國美食吧！🍜
#國際週 #美食護照 #InternationalWeek`;
  };

  const handleShareThreads = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://www.threads.net/intent/post?text=${text}`, '_blank');
  };

  const handleCopyForIG = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 bg-black/95">
      {/* Branding */}
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/5 text-orange-500 text-[10px] font-bold tracking-[0.2em] uppercase">
          <MapPin className="w-3 h-3" />
          International Week 2026
        </div>
        
        <h1
          onClick={handleTitleTap}
          className="text-5xl md:text-6xl font-black italic tracking-tighter cursor-default select-none"
        >
          國際週美食<span className="text-red-500">護照</span>
        </h1>
        
        <p className="text-slate-500 font-montserrat tracking-[0.3em] text-xs uppercase">
          Digital Food Passport
        </p>
      </div>

      {/* Main Content Area */}
      <main className="w-full max-w-4xl">
        {view === 'form' && (
          <div className="animate-in slide-in-from-bottom-8 duration-700">
            <PassportForm onSuccess={handleSuccess} />
          </div>
        )}

        {view === 'admin' && (
          <div className="animate-in fade-in duration-500">
            <AdminDashboard />
          </div>
        )}

        {view === 'success' && (
          <div className="max-w-md mx-auto text-center space-y-6 py-12 px-8 bg-[#161b22] rounded-[40px] border border-[#30363d] shadow-2xl animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-500 animate-bounce" />
            </div>
            <h2 className="text-3xl font-bold">打卡成功！</h2>
            <p className="text-slate-400">已將您的數位印章存入護照。<br/>祝您用餐愉快！</p>

            {/* 分享區塊 */}
            <div className="pt-4 space-y-3">
              <p className="text-xs text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />
                分享到社群
              </p>

              <div className="flex gap-3 justify-center">
                {/* Threads 分享 */}
                <button
                  onClick={handleShareThreads}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 rounded-full text-sm font-bold transition-all active:scale-95"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.028-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.592 12c.024 3.088.715 5.5 2.053 7.164 1.432 1.781 3.632 2.695 6.54 2.717 1.733-.013 3.86-.478 5.457-1.726 1.324-1.034 2.393-2.727 2.393-5.155h2.12c0 3.167-1.396 5.453-3.298 6.94-2.18 1.704-4.862 2.143-6.68 2.06zm5.548-10.467c-.241-3.186-1.89-5.087-4.778-5.513a5.89 5.89 0 0 0-.88-.066c-1.723 0-3.167.642-4.178 1.858-1.138 1.37-1.634 3.478-1.432 6.094.171 2.216.948 4.023 2.188 5.09.969.835 2.182 1.273 3.508 1.273.09 0 .18-.002.27-.006 2.732-.125 4.584-1.735 5.203-4.526.096-.432.169-.904.222-1.404a5.696 5.696 0 0 1-.123-.8zm-2.114.148c-.033.275-.08.542-.143.798-.377 1.542-1.373 2.544-2.808 2.61a3.14 3.14 0 0 1-.156.003c-.706 0-1.331-.212-1.808-.614-.677-.57-1.104-1.542-1.203-2.743-.143-1.74.21-3.097.993-3.82.534-.493 1.243-.753 2.05-.753.18 0 .366.013.556.04 1.596.236 2.417 1.257 2.519 3.12v.002a4.29 4.29 0 0 1 0 .357z"/>
                  </svg>
                  Threads
                </button>

                {/* IG 複製文字 */}
                <button
                  onClick={handleCopyForIG}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 rounded-full text-sm font-bold transition-all active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      已複製！
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      複製到 IG
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-slate-600">點擊「複製到 IG」後，到 Instagram 貼上分享</p>
            </div>

            <button
              onClick={() => setView('form')}
              className="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-full text-sm font-bold transition-all mt-4"
            >
              返回繼續打卡
            </button>
          </div>
        )}
      </main>

      {/* Bottom Navigation - 後台分析透過 /admin 路徑訪問 */}
      {view !== 'form' && view !== 'success' && (
        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2 bg-[#161b22]/80 backdrop-blur-xl border border-[#30363d] p-1.5 rounded-full shadow-2xl z-50">
          <button
            onClick={() => setView('form')}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all bg-orange-500 text-white"
          >
            <UtensilsCrossed className="w-4 h-4" />
            返回打卡
          </button>
        </nav>
      )}

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
};

export default App;
