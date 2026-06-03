import { useState, useMemo, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Preset ETF Data (Simplified historical averages for demonstration)
const ETF_PRESETS = [
  { id: 'custom', name: '自訂報酬率', type: '自訂', expectedReturn: 6, yieldRate: 4 },
  { id: '0050', name: '0050 元大台灣50', type: '市值型', expectedReturn: 9.5, yieldRate: 3.5 },
  { id: '0056', name: '0056 元大高股息', type: '高股息', expectedReturn: 7.0, yieldRate: 6.5 },
  { id: '00878', name: '00878 國泰永續高股息', type: '高股息', expectedReturn: 7.5, yieldRate: 6.0 },
  { id: '006208', name: '006208 富邦台50', type: '市值型', expectedReturn: 9.5, yieldRate: 3.5 },
  { id: '00713', name: '00713 元大台灣高息低波', type: '高股息', expectedReturn: 8.0, yieldRate: 6.5 },
];

export default function EtfSipCalc() {
  const [isClient, setIsClient] = useState(false);
  
  const [selectedEtf, setSelectedEtf] = useState(ETF_PRESETS[1]);
  const [monthlyAmount, setMonthlyAmount] = useState<number>(10000);
  const [years, setYears] = useState<number>(15);
  const [reinvestDividends, setReinvestDividends] = useState<boolean>(true);
  
  // Custom rates if user changes them manually
  const [customReturn, setCustomReturn] = useState<number>(ETF_PRESETS[1].expectedReturn);
  const [customYield, setCustomYield] = useState<number>(ETF_PRESETS[1].yieldRate);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Simple URL parsing could go here, omitting for brevity to focus on the tool logic
  }, []);

  const handleEtfChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const etf = ETF_PRESETS.find(p => p.id === e.target.value) || ETF_PRESETS[0];
    setSelectedEtf(etf);
    setCustomReturn(etf.expectedReturn);
    setCustomYield(etf.yieldRate);
  };

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const results = useMemo(() => {
    let totalSharesValue = 0; // The capital value of the portfolio
    let totalInvested = 0;
    let totalDividendsReceived = 0;
    let chartData = [];

    const months = years * 12;
    const monthlyCapitalReturn = (customReturn - customYield) / 100 / 12; // Approximation of capital gains portion

    for (let month = 1; month <= months; month++) {
      // 1. Add new investment
      totalInvested += monthlyAmount;
      totalSharesValue += monthlyAmount;
      
      // 2. Capital appreciation for the month
      totalSharesValue = totalSharesValue * (1 + monthlyCapitalReturn);
      
      // 3. Dividend payout (assuming annual payout distributed roughly, for simplicity we do annual calculation at year end)
      if (month % 12 === 0) {
        const annualDividend = totalSharesValue * (customYield / 100);
        
        if (reinvestDividends) {
          totalSharesValue += annualDividend; // Buy more shares
        } else {
          totalDividendsReceived += annualDividend; // Take cash out
        }

        chartData.push({
          year: month / 12,
          invested: totalInvested,
          portfolioValue: Math.round(totalSharesValue),
          accumulatedDividends: Math.round(totalDividendsReceived),
          yearlyDividend: Math.round(annualDividend)
        });
      }
    }

    const totalFinalWealth = reinvestDividends ? totalSharesValue : (totalSharesValue + totalDividendsReceived);

    return {
      totalInvested,
      totalSharesValue: Math.round(totalSharesValue),
      totalDividendsReceived: Math.round(totalDividendsReceived),
      totalFinalWealth: Math.round(totalFinalWealth),
      finalYearlyDividend: chartData.length > 0 ? chartData[chartData.length - 1].yearlyDividend : 0,
      chartData
    };
  }, [monthlyAmount, years, customReturn, customYield, reinvestDividends]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Input Section */}
        <div className="lg:col-span-4 p-6 lg:p-8 bg-slate-50 border-r border-slate-100 relative">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="m3 3 3 9-3 9 19-9Z"/><path d="M6 12h16"/></svg>
              存股策略設定
            </h2>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">選擇熱門標的</label>
              <select 
                value={selectedEtf.id}
                onChange={handleEtfChange}
                className="block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors shadow-sm text-sm"
              >
                {ETF_PRESETS.map(etf => (
                  <option key={etf.id} value={etf.id}>{etf.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">每月扣款金額 (TWD)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">$</span>
                <input 
                  type="number" 
                  value={monthlyAmount} 
                  onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                  className="block w-full pl-7 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors shadow-sm text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">存股年限 (年)</label>
              <input 
                type="number" 
                value={years} 
                onChange={(e) => setYears(Number(e.target.value))}
                className="block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors shadow-sm text-sm"
              />
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">進階假設 (基於歷史回測)</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">預估總年化報酬</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={customReturn} 
                      onChange={(e) => {
                        setCustomReturn(Number(e.target.value));
                        setSelectedEtf(ETF_PRESETS[0]); // switch to custom
                      }}
                      step="0.1"
                      className="block w-full pr-6 pl-2 py-1.5 bg-white border border-slate-200 rounded-md text-sm"
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-500 text-xs">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">預估殖利率</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={customYield} 
                      onChange={(e) => {
                        setCustomYield(Number(e.target.value));
                        setSelectedEtf(ETF_PRESETS[0]);
                      }}
                      step="0.1"
                      className="block w-full pr-6 pl-2 py-1.5 bg-white border border-slate-200 rounded-md text-sm"
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-500 text-xs">%</span>
                  </div>
                </div>
              </div>
              
              <label className="flex items-center gap-2 cursor-pointer bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={reinvestDividends} 
                  onChange={(e) => setReinvestDividends(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm font-medium text-slate-700">股息自動再投入 (複利效應)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-8 p-6 lg:p-8 bg-white flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">資產推估結果</h2>
              <p className="text-sm text-slate-500">以 {selectedEtf.name} 的預估回報進行試算</p>
            </div>
            <button 
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              {copied ? '已複製連結' : '分享試算'}
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="col-span-2 bg-slate-900 p-5 rounded-2xl text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 -mr-10 -mt-10"></div>
              <p className="text-sm font-medium text-slate-300 mb-1">期滿總資產價值</p>
              <p className="text-3xl font-extrabold">{formatCurrency(results.totalFinalWealth)}</p>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-center">
              <p className="text-xs font-medium text-slate-500 mb-1">總投入本金</p>
              <p className="text-lg font-bold text-slate-800">{formatCurrency(results.totalInvested)}</p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex flex-col justify-center">
              <p className="text-xs font-medium text-red-600 mb-1">
                {reinvestDividends ? '第 ' + years + ' 年預估股息' : '累積領取股息'}
              </p>
              <p className="text-lg font-bold text-red-700">
                {formatCurrency(reinvestDividends ? results.finalYearlyDividend : results.totalDividendsReceived)}
              </p>
            </div>
          </div>

          {/* Interactive Chart */}
          {isClient && results.chartData.length > 0 && (
            <div className="mb-6 h-56 w-full flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorInvestedEtf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="year" 
                    tickFormatter={(val) => `第${val}年`}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis hide={true} domain={['dataMin', 'dataMax']} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatCurrency(value), 
                      name === 'portfolioValue' ? '庫存市值' : '總投入本金'
                    ]}
                    labelFormatter={(label) => `第 ${label} 年`}
                    contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="invested" 
                    name="invested"
                    stroke="#94a3b8" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorInvestedEtf)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="portfolioValue" 
                    name="portfolioValue"
                    stroke="#ef4444" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorPortfolio)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Simple Data Table */}
          <div className="flex-grow flex flex-col min-h-0">
            <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider flex items-center justify-between flex-shrink-0">
              <span>逐年資產變化明細</span>
              <span className="text-xs font-normal text-slate-400 normal-case">單位: 新台幣</span>
            </h3>
            <div className="overflow-y-auto flex-grow rounded-xl border border-slate-100 custom-scrollbar">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-slate-50 sticky top-0 shadow-sm">
                  <tr>
                    <th className="py-2.5 px-4">年度</th>
                    <th className="py-2.5 px-4">累積本金</th>
                    <th className="py-2.5 px-4">庫存市值</th>
                    <th className="py-2.5 px-4 text-right">當年領息</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.chartData.map((data) => (
                    <tr key={data.year} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 font-medium text-slate-900">第 {data.year} 年</td>
                      <td className="py-2.5 px-4 text-slate-600">{formatCurrency(data.invested)}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{formatCurrency(data.portfolioValue)}</td>
                      <td className="py-2.5 px-4 text-right text-red-600 font-medium">+{formatCurrency(data.yearlyDividend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 text-right flex-shrink-0">
            * 本試算使用預估之歷史平均報酬率，不代表未來實際績效，亦不含交易手續費與稅賦。
          </p>
        </div>
      </div>
    </div>
  );
}
