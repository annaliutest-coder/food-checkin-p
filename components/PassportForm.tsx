
import React, { useState } from 'react';
import { User, Plane, Globe, AlertCircle } from 'lucide-react';
import { COUNTRIES, TAGS, DAYS } from '../constants';
import { db } from '../services/db';

interface CheckInData {
  nickname: string;
  day: number;
  countryCode: string;
  countryName: string;
  tags: string[];
}

interface Props {
  onSuccess: (data: CheckInData) => void;
}

const PassportForm: React.FC<Props> = ({ onSuccess }) => {
  const [nickname, setNickname] = useState('');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [customCountry, setCustomCountry] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleTag = (id: string) => {
    setSelectedTags(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleCountrySelect = (code: string) => {
    setSelectedCountry(code);
    setIsOtherSelected(false);
  };

  const handleOtherSelect = () => {
    setSelectedCountry('OTHER');
    setIsOtherSelected(true);
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    if (!nickname) {
      alert('請填寫暱稱！');
      return;
    }
    
    if (!selectedCountry) {
      alert('請選擇一個國家！');
      return;
    }

    if (isOtherSelected && !customCountry.trim()) {
      alert('請輸入國家名稱！');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const finalCountryCode = isOtherSelected ? customCountry.trim() : selectedCountry;
      const countryObj = COUNTRIES.find(c => c.code === selectedCountry);
      const countryName = isOtherSelected ? customCountry.trim() : (countryObj?.name || selectedCountry);

      await db.saveCheckIn({
        nickname,
        day: selectedDay,
        countryCode: finalCountryCode,
        tags: selectedTags
      });
      onSuccess({
        nickname,
        day: selectedDay,
        countryCode: finalCountryCode,
        countryName,
        tags: selectedTags
      });
    } catch (err: any) {
      console.error('Submit error:', err);
      // 顯示最詳細的錯誤訊息以便診斷
      setErrorMsg(err.message || '連線伺服器失敗，請確認網路與資料庫狀態。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-[#161b22] rounded-[40px] border border-[#30363d] overflow-hidden shadow-2xl">
      <div className="h-1 w-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>
      
      <div className="p-8 space-y-8">
        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">打卡失敗</p>
              <p className="text-xs opacity-90 break-all mt-1">{errorMsg}</p>
              <p className="text-[10px] mt-2 opacity-60">提示：請確認 Zeabur 後端日誌 (Logs) 是否有資料庫連線報錯。</p>
            </div>
          </div>
        )}

        <section className="space-y-4">
          <label className="block text-xs font-bold text-slate-400 tracking-widest uppercase">
            Identification / 您的稱呼
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="請輸入暱稱或稱呼"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
            />
          </div>
        </section>

        <section className="space-y-4">
          <label className="block text-xs font-bold text-slate-400 tracking-widest uppercase">
            Travel Date / 參加天數
          </label>
          <div className="flex gap-3">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-1 py-3 rounded-xl border font-bold transition-all ${
                  selectedDay === day 
                    ? 'bg-orange-900/20 border-orange-500 text-orange-500' 
                    : 'bg-[#0d1117] border-[#30363d] text-slate-500'
                }`}
              >
                Day {day}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <label className="block text-xs font-bold text-slate-400 tracking-widest uppercase">
            Discovery / 我今天吃了...
          </label>
          <div className="grid grid-cols-4 gap-3">
            {COUNTRIES.map(c => (
              <button
                key={c.code}
                onClick={() => handleCountrySelect(c.code)}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 border transition-all ${
                  selectedCountry === c.code && !isOtherSelected
                    ? 'bg-red-900/20 border-red-500 ring-1 ring-red-500'
                    : 'bg-[#0d1117] border-[#30363d]'
                }`}
              >
                <span className="text-xl font-bold text-white mb-1">{c.code}</span>
                <span className="text-[10px] text-slate-400 text-center">{c.name}</span>
              </button>
            ))}
            <button
              onClick={handleOtherSelect}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 border transition-all ${
                isOtherSelected
                  ? 'bg-red-900/20 border-red-500 ring-1 ring-red-500'
                  : 'bg-[#0d1117] border-[#30363d]'
              }`}
            >
              <span className="text-xl font-bold text-white mb-1">??</span>
              <span className="text-[10px] text-slate-400">其他</span>
            </button>
          </div>

          {isOtherSelected && (
            <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  value={customCountry}
                  onChange={(e) => setCustomCountry(e.target.value)}
                  placeholder="請輸入國家名稱"
                  className="w-full bg-[#0d1117] border border-red-500/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                />
              </div>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <label className="block text-xs font-bold text-slate-400 tracking-widest uppercase">
            Experience Tags / 必推理由
          </label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`px-4 py-2 rounded-full text-xs flex items-center gap-1.5 border transition-all ${
                  selectedTags.includes(tag.id)
                    ? 'bg-slate-700 border-slate-500 text-white'
                    : 'bg-[#0d1117] border-[#30363d] text-slate-400 hover:border-slate-500'
                }`}
              >
                <span>{tag.icon}</span>
                {tag.label}
              </button>
            ))}
          </div>
        </section>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-500 hover:to-orange-300 py-6 rounded-full text-white font-montserrat italic font-extrabold text-xl shadow-lg shadow-orange-900/20 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'STAMPING...' : (
            <>
              CLAIM MY STAMP
              <Plane className="w-6 h-6 rotate-45" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PassportForm;
