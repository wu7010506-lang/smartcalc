import { useState, useMemo, useEffect, useCallback } from 'react';

export default function FireCalc() {
  const [isClient, setIsClient] = useState(false);
  
  // Inputs
  const [targetMonthlyIncome, setTargetMonthlyIncome] = useState<number>(50000); // 期望月被動收入
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [targetRetireAge, setTargetRetireAge] = useState<number>(50);
  const [currentSavings, setCurrentSavings] = useState<number>(500000); // 目前已有本金
  const [expectedReturn, setExpectedReturn] = useState<number>(7); // 預期年化報酬率
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useState<number>(4); // 安全提領率 (通常是 4%)

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // URL parsing can be added here
  }, []);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const results = useMemo(() => {
    const yearsToRetire = targetRetireAge - currentAge;
    
    if (yearsToRetire <= 0) {
      return { isValid: false, requiredCapital: 0, requiredMonthlySaving: 0 };
    }

    // 1. Calculate Required FIRE Capital (Target Annual Income / Safe Withdrawal Rate)
    const targetAnnualIncome = targetMonthlyIncome * 12;
    const requiredCapital = targetAnnualIncome / (safeWithdrawalRate / 100);

    // 2. Calculate future value of current savings
    const annualReturnRate = expectedReturn / 100;
    const futureValueOfCurrentSavings = currentSavings * Math.pow(1 + annualReturnRate, yearsToRetire);

    // 3. Calculate remaining gap
    const remainingGap = requiredCapital - futureValueOfCurrentSavings;

    // 4. Calculate required monthly savings to bridge the gap using PMT formula
    const monthlyReturnRate = annualReturnRate / 12;
    const months = yearsToRetire * 12;
    
    let requiredMonthlySaving = 0;
    if (remainingGap > 0) {
      if (monthlyReturnRate === 0) {
        requiredMonthlySaving = remainingGap / months;
      } else {
        // PMT formula: PMT = FV * (r / ((1+r)^n - 1))
        requiredMonthlySaving = remainingGap * (monthlyReturnRate / (Math.pow(1 + monthlyReturnRate, months) - 1));
      }
    }

    return {
      isValid: true,
      yearsToRetire,
      requiredCapital: Math.round(requiredCapital),
      futureValueOfCurrentSavings: Math.round(futureValueOfCurrentSavings),
      remainingGap: Math.round(Math.max(0, remainingGap)),
      requiredMonthlySaving: Math.round(Math.max(0, requiredMonthlySaving)),
      isAlreadyFire: remainingGap <= 0
    };
  }, [targetMonthlyIncome, currentAge, targetRetireAge, currentSavings, expectedReturn, safeWithdrawalRate]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Input Section */}
        <div className="p-8 lg:p-12 bg-slate-50 border-r border-slate-100 relative">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <span className="text-2xl">🔥</span> FIRE 夢想設定
            </h2>
            <button 
              onClick={handleShare}
              className="flex items-center gap-1.5 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              {copied ? '已複製連結' : '分享計畫'}
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-orange-400 to-red-500"></div>
              <label className="block text-sm font-bold text-slate-800 mb-2">退休後，希望每個月有多少被動收入？</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">$</span>
                <input 
                  type="number" 
                  value={targetMonthlyIncome} 
                  onChange={(e) => setTargetMonthlyIncome(Number(e.target.value))}
                  className="block w-full pl-8 pr-4 py-3 bg-slate-50 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-bold text-lg text-orange-600 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">目前年齡</label>
                <input 
                  type="number" 
                  value={currentAge} 
                  onChange={(e) => setCurrentAge(Number(e.target.value))}
                  className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">預計退休年齡</label>
                <input 
                  type="number" 
                  value={targetRetireAge} 
                  onChange={(e) => setTargetRetireAge(Number(e.target.value))}
                  className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">目前已準備的本金 (TWD)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">$</span>
                <input 
                  type="number" 
                  value={currentSavings} 
                  onChange={(e) => setCurrentSavings(Number(e.target.value))}
                  className="block w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">投資年化報酬率</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={expectedReturn} 
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                    step="0.1"
                    className="block w-full pr-6 pl-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-orange-500"
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">%</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">安全提領率 (通常4%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={safeWithdrawalRate} 
                    onChange={(e) => setSafeWithdrawalRate(Number(e.target.value))}
                    step="0.1"
                    className="block w-full pr-6 pl-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-orange-500"
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="p-8 lg:p-12 bg-white flex flex-col justify-center">
          {!results.isValid ? (
            <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-slate-500">退休年齡必須大於目前年齡喔！</p>
            </div>
          ) : results.isAlreadyFire ? (
            <div className="text-center p-8 bg-green-50 rounded-3xl border border-green-200">
              <span className="text-5xl mb-4 block">🎉</span>
              <h2 className="text-2xl font-bold text-green-800 mb-2">恭喜您！已經達成 FIRE 條件！</h2>
              <p className="text-green-700">您目前的本金在提領率 {safeWithdrawalRate}% 下，已經足以支付您期望的退休生活。</p>
            </div>
          ) : (
            <>
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">殘酷真相：您的行動指南</h2>
              
              <div className="mb-10">
                <p className="text-slate-700 font-medium mb-2">為了在 {targetRetireAge} 歲退休，您現在起<strong className="text-orange-600">每個月</strong>需要投資：</p>
                <p className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                  {formatCurrency(results.requiredMonthlySaving)}
                </p>
                <p className="text-xs text-slate-400 mt-2">持續投入 {results.yearsToRetire} 年，並維持 {expectedReturn}% 年報酬率</p>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">目標財務自由數字 (FIRE Number)</p>
                    <p className="text-xl font-bold text-slate-800">{formatCurrency(results.requiredCapital)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">🎯</div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">已有本金的未來價值</p>
                    <p className="text-lg font-semibold text-slate-700">{formatCurrency(results.futureValueOfCurrentSavings)}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">💰</div>
                </div>

                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-medium text-red-500 mb-1">退休資金缺口</p>
                    <p className="text-lg font-semibold text-red-700">{formatCurrency(results.remainingGap)}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500">⚠️</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
