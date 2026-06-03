import { useState, useMemo } from 'react';

export default function SalaryCalc() {
  const [monthlySalary, setMonthlySalary] = useState<number>(50000);
  const [bonusMonths, setBonusMonths] = useState<number>(2);
  const [hasSpouse, setHasSpouse] = useState<boolean>(false);
  const [dependents, setDependents] = useState<number>(0);

  // Taiwan 2024 Tax Brackets and Deductions (simplified for MVP)
  const EXEMPTION = 97000; // 免稅額
  const STANDARD_DEDUCTION_SINGLE = 131000; // 標準扣除額(單身)
  const STANDARD_DEDUCTION_MARRIED = 262000; // 標準扣除額(有配偶)
  const SALARY_DEDUCTION = 218000; // 薪資所得特別扣除額

  const results = useMemo(() => {
    // 1. Calculate Gross Income
    const annualSalary = monthlySalary * 12;
    const annualBonus = monthlySalary * bonusMonths;
    const totalGrossIncome = annualSalary + annualBonus;

    // 2. Calculate Deductions
    const totalExemption = EXEMPTION * (1 + (hasSpouse ? 1 : 0) + dependents);
    const standardDeduction = hasSpouse ? STANDARD_DEDUCTION_MARRIED : STANDARD_DEDUCTION_SINGLE;
    const salaryDeduction = Math.min(SALARY_DEDUCTION, totalGrossIncome); // 不能超過總薪資
    
    const totalDeductions = totalExemption + standardDeduction + salaryDeduction;

    // 3. Calculate Net Taxable Income (所得淨額)
    const taxableIncome = Math.max(0, totalGrossIncome - totalDeductions);

    // 4. Calculate Tax (累進稅率)
    let tax = 0;
    let taxBracket = "0%";

    if (taxableIncome === 0) {
      tax = 0;
      taxBracket = "免稅";
    } else if (taxableIncome <= 590000) {
      tax = taxableIncome * 0.05;
      taxBracket = "5%";
    } else if (taxableIncome <= 1330000) {
      tax = (taxableIncome * 0.12) - 41300;
      taxBracket = "12%";
    } else if (taxableIncome <= 2660000) {
      tax = (taxableIncome * 0.20) - 147700;
      taxBracket = "20%";
    } else if (taxableIncome <= 4980000) {
      tax = (taxableIncome * 0.30) - 413700;
      taxBracket = "30%";
    } else {
      tax = (taxableIncome * 0.40) - 911700;
      taxBracket = "40%";
    }

    tax = Math.max(0, Math.round(tax));

    // Calculate effective tax rate
    const effectiveTaxRate = totalGrossIncome > 0 ? ((tax / totalGrossIncome) * 100).toFixed(2) : "0.00";

    // Estimated monthly net income (subtracting simplified labor/health insurance ~ 5% total)
    const estimatedInsurance = Math.round(monthlySalary * 0.05); 
    const monthlyNet = monthlySalary - estimatedInsurance;

    return {
      totalGrossIncome,
      totalDeductions,
      taxableIncome,
      tax,
      taxBracket,
      effectiveTaxRate,
      estimatedInsurance,
      monthlyNet
    };
  }, [monthlySalary, bonusMonths, hasSpouse, dependents]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Input Section */}
        <div className="p-8 lg:p-12 bg-slate-50 border-r border-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a8 8 0 0 1-5-1.524A6 6 0 0 1 15 15V9a6 6 0 0 1 10 2.215V19a2 2 0 0 1-2 2H6a4 4 0 0 1-4-4V7a2 2 0 0 1 2-2h14zm-4 4h-3a2 2 0 0 0 0 4h3V11z"/></svg>
            收入與扶養條件 (2024 年度)
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">每月固定薪資 (TWD)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">$</span>
                <input 
                  type="number" 
                  value={monthlySalary} 
                  onChange={(e) => setMonthlySalary(Number(e.target.value))}
                  className="block w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">年終 / 績效獎金 (約多少個月)</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={bonusMonths} 
                  onChange={(e) => setBonusMonths(Number(e.target.value))}
                  step="0.5"
                  className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500">個月</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-4">家庭狀況 (影響免稅額與扣除額)</h3>
              
              <div className="flex items-center justify-between mb-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                  <p className="font-medium text-slate-800">配偶</p>
                  <p className="text-xs text-slate-500">是否合併申報</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={hasSpouse} onChange={(e) => setHasSpouse(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">扶養親屬人數 (人)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={dependents} 
                    onChange={(e) => setDependents(Math.max(0, Number(e.target.value)))}
                    min="0"
                    className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors shadow-sm"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">包含未成年子女、年滿60歲直系尊親屬等</p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="p-8 lg:p-12 bg-white">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">稅務試算結果</h2>
          
          <div className="mb-8">
            <p className="text-sm font-medium text-slate-500 mb-1">預估應繳納稅額</p>
            <p className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600">
              {formatCurrency(results.tax)}
            </p>
            <div className="flex gap-4 mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                最高稅率級距: {results.taxBracket}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                實質稅率: {results.effectiveTaxRate}%
              </span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-600 font-medium">年度總收入</span>
              <span className="font-bold text-slate-900">{formatCurrency(results.totalGrossIncome)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-600 font-medium flex items-center gap-1">
                免稅額與扣除額合計 
                <span className="text-xs text-slate-400 font-normal" title="免稅額 + 標準扣除額 + 薪資特別扣除額">(標準申報)</span>
              </span>
              <span className="font-bold text-emerald-600">-{formatCurrency(results.totalDeductions)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-100">
              <span className="text-slate-600 font-medium">所得淨額 <span className="text-xs font-normal text-slate-400">(用來對應稅率)</span></span>
              <span className="font-bold text-slate-900">{formatCurrency(results.taxableIncome)}</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 mb-3">每月金流預估</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">月薪</span>
              <span className="text-sm font-medium">{formatCurrency(monthlySalary)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">預估勞健保自付額</span>
              <span className="text-sm font-medium text-red-500">-{formatCurrency(results.estimatedInsurance)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center mt-2">
              <span className="text-sm font-bold text-slate-800">預估實領月薪</span>
              <span className="text-lg font-bold text-purple-700">{formatCurrency(results.monthlyNet)}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 text-center">
            * 試算結果僅供參考，實際應納稅額請以國稅局系統或報稅軟體為主。<br/>勞健保級距採用概算，未包含二代健保補充保費。
          </p>
        </div>
      </div>
    </div>
  );
}
