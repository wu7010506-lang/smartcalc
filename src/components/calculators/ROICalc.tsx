import { useState, useMemo } from 'react';

export default function ROICalc() {
  const [initialInvestment, setInitialInvestment] = useState<number>(100000);
  const [finalValue, setFinalValue] = useState<number>(120000);
  const [investmentDurationYears, setInvestmentDurationYears] = useState<number>(1);
  const [additionalCosts, setAdditionalCosts] = useState<number>(500); // e.g., fees, taxes

  const results = useMemo(() => {
    const totalCost = initialInvestment + additionalCosts;
    const netProfit = finalValue - totalCost;
    
    // Total ROI formula: (Net Profit / Total Cost) * 100
    const totalROI = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
    
    // Annualized ROI formula: ((Final Value / Total Cost) ^ (1 / Years) - 1) * 100
    let annualizedROI = 0;
    if (totalCost > 0 && investmentDurationYears > 0) {
        annualizedROI = (Math.pow(finalValue / totalCost, 1 / investmentDurationYears) - 1) * 100;
    } else if (investmentDurationYears === 0) {
        annualizedROI = totalROI; // If 0 years, just show total ROI as annualized is undefined
    }

    return {
      totalCost,
      netProfit,
      totalROI: totalROI.toFixed(2),
      annualizedROI: annualizedROI.toFixed(2),
      isProfitable: netProfit >= 0
    };
  }, [initialInvestment, finalValue, investmentDurationYears, additionalCosts]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Input Section */}
        <div className="p-8 lg:p-12 bg-slate-50 border-r border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><line x1="19" x2="5" y1="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
            投資細節
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">初始投資金額 (TWD)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">$</span>
                <input 
                  type="number" 
                  value={initialInvestment} 
                  onChange={(e) => setInitialInvestment(Number(e.target.value))}
                  className="block w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">最終收回金額 (TWD)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">$</span>
                <input 
                  type="number" 
                  value={finalValue} 
                  onChange={(e) => setFinalValue(Number(e.target.value))}
                  className="block w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors shadow-sm"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">包含賣出資產所得與期間收到的股息/利息</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">投資期間 (年)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={investmentDurationYears} 
                    onChange={(e) => setInvestmentDurationYears(Number(e.target.value))}
                    step="0.5"
                    min="0"
                    className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors shadow-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">額外成本 (手續費/稅)</label>
                <div className="relative">
                   <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">$</span>
                  <input 
                    type="number" 
                    value={additionalCosts} 
                    onChange={(e) => setAdditionalCosts(Number(e.target.value))}
                    className="block w-full pl-7 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="p-8 lg:p-12 bg-white">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">試算結果</h2>
          
          <div className="mb-8">
            <p className="text-sm font-medium text-slate-500 mb-1">年化報酬率 (Annualized ROI)</p>
            <p className={`text-4xl lg:text-5xl font-extrabold ${results.isProfitable ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500' : 'text-slate-500'}`}>
              {results.annualizedROI}%
            </p>
             <p className="text-sm text-slate-400 mt-2">
              真正能評估投資效率的指標，已考慮時間複利因素。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-1">總投資成本</p>
              <p className="text-xl font-bold text-slate-800">{formatCurrency(results.totalCost)}</p>
            </div>
            <div className={`${results.isProfitable ? 'bg-orange-50 border-orange-100' : 'bg-slate-100 border-slate-200'} p-4 rounded-2xl border`}>
              <p className={`text-xs font-medium ${results.isProfitable ? 'text-orange-600' : 'text-slate-600'} mb-1`}>
                  淨利潤 (Net Profit)
              </p>
              <p className={`text-xl font-bold ${results.isProfitable ? 'text-orange-700' : 'text-slate-700'}`}>
                  {results.isProfitable ? '+' : ''}{formatCurrency(results.netProfit)}
              </p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 text-white shadow-lg">
             <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300">總投資報酬率 (Total ROI)</span>
              <span className="text-xl font-bold">{results.totalROI}%</span>
            </div>
            <p className="text-xs text-slate-400">
              未考慮投資時間長短的絕對報酬百分比。
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
