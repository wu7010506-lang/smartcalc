import { useState, useMemo, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toPng } from 'html-to-image';
import download from 'downloadjs';

export default function MortgageCalc() {
  const calcRef = useRef<HTMLDivElement>(null);
  // Load initial values from localStorage
  const [loanAmount, setLoanAmount] = useState<number>(() => 
    typeof window !== 'undefined' ? Number(localStorage.getItem('loanAmount')) || 10000000 : 10000000
  );
  const [years, setYears] = useState<number>(() => 
    typeof window !== 'undefined' ? Number(localStorage.getItem('years')) || 30 : 30
  );
  const [interestRate, setInterestRate] = useState<number>(() => 
    typeof window !== 'undefined' ? Number(localStorage.getItem('interestRate')) || 2.06 : 2.06
  );
  const [gracePeriodYears, setGracePeriodYears] = useState<number>(() => 
    typeof window !== 'undefined' ? Number(localStorage.getItem('gracePeriodYears')) || 0 : 0
  );
  const [extraYearlyRepayment, setExtraYearlyRepayment] = useState<number>(() => 
    typeof window !== 'undefined' ? Number(localStorage.getItem('extraYearlyRepayment')) || 0 : 0
  );

  // Save to localStorage when values change
  useMemo(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('loanAmount', loanAmount.toString());
      localStorage.setItem('years', years.toString());
      localStorage.setItem('interestRate', interestRate.toString());
      localStorage.setItem('gracePeriodYears', gracePeriodYears.toString());
      localStorage.setItem('extraYearlyRepayment', extraYearlyRepayment.toString());
    }
  }, [loanAmount, years, interestRate, gracePeriodYears, extraYearlyRepayment]);

  const results = useMemo(() => {
    const totalMonths = years * 12;
    const graceMonths = gracePeriodYears * 12;
    const monthlyRate = interestRate / 100 / 12;
    
    let monthlyPayment = 0;
    const remainingMonths = totalMonths - graceMonths;
    if (remainingMonths > 0 && monthlyRate > 0) {
      const x = Math.pow(1 + monthlyRate, remainingMonths);
      monthlyPayment = Math.round((loanAmount * monthlyRate * x) / (x - 1));
    } else {
      monthlyPayment = Math.round(loanAmount / remainingMonths);
    }

    const totalInterestOriginal = (monthlyPayment * remainingMonths) - loanAmount;
    const savingsEstimate = Math.round(extraYearlyRepayment * years * (interestRate / 100) * 0.8);
    const totalInterestNew = Math.max(0, totalInterestOriginal - savingsEstimate);

    return {
      monthlyPayment,
      totalInterestOriginal,
      totalInterestNew,
      savings: savingsEstimate,
      chartData: [
        { name: '原計畫', interest: totalInterestOriginal },
        { name: '提前還款計畫', interest: totalInterestNew }
      ]
    };
  }, [loanAmount, years, interestRate, gracePeriodYears, extraYearlyRepayment]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(val);
  };

  const handleDownload = () => {
    if (calcRef.current) {
      toPng(calcRef.current).then((dataUrl) => {
        download(dataUrl, 'my-mortgage-plan.png');
      });
    }
  };

  return (
    <div ref={calcRef} className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden p-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">貸款彈性試算</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">貸款總額</label>
            <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="w-full p-3 border rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-slate-700">年限 (年)</label>
                <input type="number" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full p-3 border rounded-xl" />
             </div>
             <div>
                <label className="block text-sm font-medium text-slate-700">年利率 (%)</label>
                <input type="number" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} step="0.01" className="w-full p-3 border rounded-xl" />
             </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">每年額外償還本金 (TWD)</label>
            <input type="number" value={extraYearlyRepayment} onChange={(e) => setExtraYearlyRepayment(Number(e.target.value))} className="w-full p-3 border border-blue-500 rounded-xl bg-blue-50" />
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl">
          <h3 className="font-bold text-slate-800 mb-4">利息支出對比</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={results.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="interest" name="利息總支出" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-xl text-center">
            <p className="text-sm">若採用提前還款計畫</p>
            <p className="text-2xl font-bold">預計可省下 {formatCurrency(results.savings)}</p>
          </div>
        </div>
      </div>
      <button 
        onClick={handleDownload}
        className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition"
      >
        下載我的理財試算報告
      </button>
    </div>
  );
}
