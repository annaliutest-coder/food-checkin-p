
import React, { useState } from 'react';
import { MapPin, CheckCircle2, LayoutDashboard, UtensilsCrossed } from 'lucide-react';
import PassportForm from './components/PassportForm';
import AdminDashboard from './components/AdminDashboard';

const App: React.FC = () => {
  const [view, setView] = useState<'form' | 'admin' | 'success'>('form');

  const handleSuccess = () => {
    setView('success');
    // Auto-reset after some time
    setTimeout(() => setView('form'), 5000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 bg-black/95">
      {/* Branding */}
      <div className="text-center mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/5 text-orange-500 text-[10px] font-bold tracking-[0.2em] uppercase">
          <MapPin className="w-3 h-3" />
          International Week 2026
        </div>
        
        <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter">
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
          <div className="max-w-md mx-auto text-center space-y-6 py-20 bg-[#161b22] rounded-[40px] border border-[#30363d] shadow-2xl animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-500 animate-bounce" />
            </div>
            <h2 className="text-3xl font-bold">打卡成功！</h2>
            <p className="text-slate-400">已將您的數位印章存入護照。<br/>祝您用餐愉快！</p>
            <button 
              onClick={() => setView('form')}
              className="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-full text-sm font-bold transition-all"
            >
              返回繼續打卡
            </button>
          </div>
        )}
      </main>

      {/* Bottom Navigation / Toggle */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2 bg-[#161b22]/80 backdrop-blur-xl border border-[#30363d] p-1.5 rounded-full shadow-2xl z-50">
        <button
          onClick={() => setView('form')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all ${
            view === 'form' || view === 'success' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          美食打卡
        </button>
        <button
          onClick={() => setView('admin')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all ${
            view === 'admin' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          後台分析
        </button>
      </nav>

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
};

export default App;
