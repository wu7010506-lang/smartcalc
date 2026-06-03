import { useState, useMemo, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CompoundInterestCalc() {
  // Read from URL on mount (client-side only)
  const [isClient, setIsClient] = useState(false);
  
  const [principal, setPrincipal] = useState<number>(100000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(10000);
  const [years, setYears] = useState<number>(10);
  const [interestRate, setInterestRate] = useState<number>(5);
  const [copied, setCopied] = useState(false);

  // Initialize from URL parameters
  useEffect(() => {
    setIsClient(true);
    const params = new URLSearchParams(window.location.search);
    if (params.has('p')) setPrincipal(Number(params.get('p')));
    if (params.has('m')) setMonthlyContribution(Number(params.get('m')));
    if (params.has('y')) setYears(Number(params.get('y')));
    if (params.has('r')) setInterestRate(Number(params.get('r')));
  }, []);

  // Update URL parameters when values change (debounce could be added, but simple update is fine for now)
  useEffect(() => {
    if (!isClient) return;
    const url = new URL(window.location.href);
    url.searchParams.set('p', principal.toString());
    url.searchParams.set('m', monthlyContribution.toString());
    url.searchParams.set('y', years.toString());
    url.searchParams.set('r', interestRate.toString());
    window.history.replaceState({}, '', url);
    setCopied(false); // Reset copy status if values change
  }, [principal, monthlyContribution, years, interestRate, isClient]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const results = useMemo(() => {
    let totalAmount = principal;
    let totalInvested = principal;
    
    // Monthly calculation
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = years * 12;

    let chartData = [];

    for (let month = 1; month <= totalMonths; month++) {
      totalAmount = (totalAmount + monthlyContribution) * (1 + monthlyRate);
      totalInvested += monthlyContribution;
      
      if (month % 12 === 0) {
        chartData.push({
          year: month / 12,
          amount: Math.round(totalAmount),
          invested: totalInvested,
          interest: Math.round(totalAmount - totalInvested)
        });
      }
    }

    const totalInterest = totalAmount - totalInvested;

    return {
      totalAmount: Math.round(totalAmount),
      totalInvested,
      totalInterest: Math.round(totalInterest),
      chartData
    };
  }, [principal, monthlyContribution, years, interestRate]);

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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
              輸入條件
            </h2>
            
            <button 
              onClick={handleShare}
              className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              {copied ? (
                <><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>已複製連結</>
              ) : (
                <><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>分享這組結果</>
              )}
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">初始本金 (TWD)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">$</span>
                <input 
                  type="number" 
                  value={principal} 
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  className="block w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">每月定期定額 (TWD)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">$</span>
                <input 
                  type="number" 
                  value={monthlyContribution} 
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="block w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">投資年限 (年)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={years} 
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">年化報酬率 (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={interestRate} 
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    step="0.1"
                    className="block w-full pr-8 pl-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors shadow-sm"
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">%</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* Results Section */}
        <div className="p-8 lg:p-12 bg-white">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">試算結果</h2>
          
          <div className="mb-8">
            <p className="text-sm font-medium text-slate-500 mb-1">期滿總金額</p>
            <p className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-indigo-600">
              {formatCurrency(results.totalAmount)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-10">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-1">總投入本金</p>
              <p className="text-xl font-bold text-slate-800">{formatCurrency(results.totalInvested)}</p>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <p className="text-xs font-medium text-emerald-600 mb-1">總利息收益</p>
              <p className="text-xl font-bold text-emerald-700">+{formatCurrency(results.totalInterest)}</p>
            </div>
          </div>

          {/* Interactive Chart */}
          {isClient && results.chartData.length > 0 && (
            <div className="mb-8 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results.chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
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
                  <YAxis 
                    hide={true} 
                    domain={['dataMin', 'dataMax']} 
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      formatCurrency(value), 
                      name === 'amount' ? '累積本息' : '總投入本金'
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
                    fill="url(#colorInvested)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    name="amount"
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAmount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Simple Data Table */}
          <div>
            <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider flex items-center justify-between">
              <span>年度成長軌跡</span>
              <span className="text-xs font-normal text-slate-400 normal-case">單位: 新台幣</span>
            </h3>
            <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar border border-slate-100 rounded-xl">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-slate-50 sticky top-0 shadow-sm">
                  <tr>
                    <th className="py-2.5 px-4">年度</th>
                    <th className="py-2.5 px-4">總投入</th>
                    <th className="py-2.5 px-4 text-right">累積本息</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.chartData.map((data) => (
                    <tr key={data.year} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-4 font-medium text-slate-900">第 {data.year} 年</td>
                      <td className="py-2.5 px-4 text-slate-600">{formatCurrency(data.invested)}</td>
                      <td className="py-2.5 px-4 text-right font-semibold text-emerald-600">{formatCurrency(data.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
