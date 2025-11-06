import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../utils/axios';
import UniformHeader from '../../components/UniformHeader';
import FinancialSummaryCards from '../../components/FinancialSummaryCards';
import RecordIncomeForm from '../../components/RecordIncomeForm';
import RecordExpenseForm from '../../components/RecordExpenseForm';
import TransactionTable from '../../components/TransactionTable';
import StatementGenerator from '../../components/StatementGenerator';

const FinancialManagement = () => {
  const [activeTab, setActiveTab] = useState('record-income');
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  useEffect(() => {
    fetchSummary();
    fetchTransactions();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await axios.get('/financial/summary');
      if (response.data.success) {
        setSummary(response.data.data.allTime);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
      toast.error('Failed to load financial summary');
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/financial/transactions');
      if (response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleSuccess = () => {
    fetchSummary();
    fetchTransactions();
  };

  const tabs = [
    { id: 'record-income', label: 'Record Income', icon: '💰' },
    { id: 'record-expense', label: 'Record Expense', icon: '💸' },
    { id: 'view-transactions', label: 'View Transactions', icon: '📊' },
    { id: 'generate-statement', label: 'Generate Statement', icon: '📄' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Uniform Header */}
      <UniformHeader />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Financial Management</h1>
            <p className="text-purple-600 text-sm mt-1">House of David - Financial Operations</p>
          </div>
          <Link
            to="/superadmin/dashboard"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Summary Cards */}
        <FinancialSummaryCards summary={summary} loading={loadingSummary} />

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-b-4 border-purple-800'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === 'record-income' && (
            <RecordIncomeForm onSuccess={handleSuccess} />
          )}

          {activeTab === 'record-expense' && (
            <RecordExpenseForm onSuccess={handleSuccess} />
          )}

          {activeTab === 'view-transactions' && (
            loadingTransactions ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <p className="text-gray-600">Loading transactions...</p>
              </div>
            ) : (
              <TransactionTable
                transactions={transactions}
                onDelete={handleSuccess}
              />
            )
          )}

          {activeTab === 'generate-statement' && (
            <StatementGenerator />
          )}
        </div>

        {/* Quick Stats Info */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded shadow-md">
          <p className="text-blue-900 text-sm">
            <strong>💡 Tip:</strong> All financial transactions are tracked with full audit trails including who recorded them and when. You can generate statements for any date range and export them as PDF for record-keeping.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancialManagement;
