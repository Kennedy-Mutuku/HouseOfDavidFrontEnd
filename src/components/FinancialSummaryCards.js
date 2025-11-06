import React from 'react';

const FinancialSummaryCards = ({ summary, loading }) => {
  const formatCurrency = (amount) => {
    return `KSH ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const totalIncome = summary?.totalIncome || 0;
  const totalExpenses = summary?.totalExpenses || 0;
  const netBalance = summary?.netBalance || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Income Card */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold opacity-90 uppercase tracking-wide mb-2">
              Total Income
            </p>
            <h3 className="text-3xl font-bold">{formatCurrency(totalIncome)}</h3>
          </div>
          <div className="bg-white/20 rounded-full p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Total Expenses Card */}
      <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold opacity-90 uppercase tracking-wide mb-2">
              Total Expenses
            </p>
            <h3 className="text-3xl font-bold">{formatCurrency(totalExpenses)}</h3>
          </div>
          <div className="bg-white/20 rounded-full p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      {/* Net Balance Card */}
      <div className={`bg-gradient-to-br ${netBalance >= 0 ? 'from-blue-500 to-cyan-600' : 'from-orange-500 to-amber-600'} rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold opacity-90 uppercase tracking-wide mb-2">
              Net Balance
            </p>
            <h3 className="text-3xl font-bold">{formatCurrency(netBalance)}</h3>
          </div>
          <div className="bg-white/20 rounded-full p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummaryCards;
