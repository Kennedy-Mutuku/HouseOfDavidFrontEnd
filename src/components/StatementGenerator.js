import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from '../utils/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const StatementGenerator = () => {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [statementData, setStatementData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    if (!dateRange.startDate || !dateRange.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (new Date(dateRange.startDate) > new Date(dateRange.endDate)) {
      toast.error('Start date cannot be after end date');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.get('/financial/statement', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });

      if (response.data.success) {
        setStatementData(response.data.data);
        toast.success('Statement generated successfully!');
      }
    } catch (error) {
      console.error('Error generating statement:', error);
      const message = error.response?.data?.message || 'Failed to generate statement';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `KSH ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const exportToPDF = () => {
    if (!statementData) {
      toast.error('No statement data available');
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // Add Header with Church Name
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('House of David Church', pageWidth / 2, 15, { align: 'center' });

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Financial Statement', pageWidth / 2, 25, { align: 'center' });

      // Date Range
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const startDateFormatted = formatDate(statementData.period.startDate);
      const endDateFormatted = formatDate(statementData.period.endDate);
      doc.text(
        `Period: ${startDateFormatted} to ${endDateFormatted}`,
        pageWidth / 2,
        33,
        { align: 'center' }
      );

      // Current date and time
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      const now = new Date();
      const generatedDateTime = `Generated: ${now.toLocaleDateString('en-GB')} at ${now.toLocaleTimeString('en-GB')}`;
      doc.text(generatedDateTime, pageWidth / 2, 40, { align: 'center' });
      doc.setTextColor(0, 0, 0);

      // Summary Section - Compact
      let yPos = 48;
      doc.setFillColor(240, 240, 255);
      doc.rect(14, yPos - 3, pageWidth - 28, 20, 'F');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary:', 18, yPos + 2);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      // All on one line to save space
      let xPos = 18;
      doc.text('Income:', xPos, yPos + 8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 128, 0);
      doc.text(formatCurrency(statementData.summary.totalIncome), xPos + 22, yPos + 8);
      doc.setTextColor(0, 0, 0);

      xPos = 75;
      doc.setFont('helvetica', 'normal');
      doc.text('Expenses:', xPos, yPos + 8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(200, 0, 0);
      doc.text(formatCurrency(statementData.summary.totalExpenses), xPos + 26, yPos + 8);
      doc.setTextColor(0, 0, 0);

      xPos = 135;
      doc.setFont('helvetica', 'normal');
      doc.text('Balance:', xPos, yPos + 8);
      doc.setFont('helvetica', 'bold');
      const balanceColor = statementData.summary.netBalance >= 0 ? [0, 100, 200] : [200, 100, 0];
      doc.setTextColor(...balanceColor);
      doc.text(formatCurrency(statementData.summary.netBalance), xPos + 22, yPos + 8);
      doc.setTextColor(0, 0, 0);

      yPos += 18;

      // Income Transactions
      if (statementData.transactions.income && statementData.transactions.income.length > 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Income Transactions (${statementData.transactions.income.length})`, 14, yPos);
        yPos += 3;

        const incomeData = statementData.transactions.income.map(t => [
          formatDate(t.date),
          t.category || 'N/A',
          formatCurrency(t.amount),
          (t.description || '-').substring(0, 45)
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Date', 'Category', 'Amount', 'Description']],
          body: incomeData,
          theme: 'grid',
          headStyles: {
            fillColor: [34, 197, 94],
            fontSize: 8,
            fontStyle: 'bold',
            halign: 'center',
            cellPadding: 2
          },
          margin: { left: 14, right: 14 },
          styles: {
            fontSize: 7.5,
            cellPadding: 1.5,
            lineColor: [200, 200, 200],
            lineWidth: 0.1
          },
          columnStyles: {
            0: { cellWidth: 28, halign: 'center' },
            1: { cellWidth: 32 },
            2: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
            3: { cellWidth: 'auto' }
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251]
          }
        });

        yPos = doc.lastAutoTable.finalY + 6;
      }

      // Expense Transactions
      if (statementData.transactions.expenses && statementData.transactions.expenses.length > 0) {
        // Check if we need a new page
        if (yPos > pageHeight - 50) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Expense Transactions (${statementData.transactions.expenses.length})`, 14, yPos);
        yPos += 3;

        const expenseData = statementData.transactions.expenses.map(t => [
          formatDate(t.date),
          t.category || 'N/A',
          formatCurrency(t.amount),
          (t.description || '-').substring(0, 45)
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['Date', 'Category', 'Amount', 'Description']],
          body: expenseData,
          theme: 'grid',
          headStyles: {
            fillColor: [239, 68, 68],
            fontSize: 8,
            fontStyle: 'bold',
            halign: 'center',
            cellPadding: 2
          },
          margin: { left: 14, right: 14 },
          styles: {
            fontSize: 7.5,
            cellPadding: 1.5,
            lineColor: [200, 200, 200],
            lineWidth: 0.1
          },
          columnStyles: {
            0: { cellWidth: 28, halign: 'center' },
            1: { cellWidth: 32 },
            2: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
            3: { cellWidth: 'auto' }
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251]
          }
        });

        yPos = doc.lastAutoTable.finalY + 6;
      }

      // Footer on all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Draw footer line
        doc.setDrawColor(200, 200, 200);
        doc.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);

        // Left side - Generated info
        const generatedBy = statementData.generatedBy?.name || 'System Admin';
        doc.text(
          `Generated by: ${generatedBy}`,
          14,
          pageHeight - 12
        );

        // Right side - Page number
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth - 14,
          pageHeight - 12,
          { align: 'right' }
        );

        // Center - Church name
        doc.text(
          'House of David Church Management System',
          pageWidth / 2,
          pageHeight - 12,
          { align: 'center' }
        );

        doc.setTextColor(0, 0, 0);
      }

      // Save PDF with proper filename
      const filename = `HouseOfDavid_Financial_Statement_${dateRange.startDate}_to_${dateRange.endDate}.pdf`;
      doc.save(filename);

      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      console.error('Error details:', error.message);
      toast.error(`Failed to generate PDF: ${error.message}`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Generate Financial Statement</h3>

      {/* Date Range Form */}
      <form onSubmit={handleGenerate} className="space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="startDate"
              value={dateRange.startDate}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="endDate"
              value={dateRange.endDate}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Generating...' : 'Generate Statement'}
        </button>
      </form>

      {/* Statement Preview */}
      {statementData && (
        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-bold text-gray-800">Statement Preview</h4>
            <button
              onClick={exportToPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700 font-semibold">Total Income</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(statementData.summary.totalIncome)}
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700 font-semibold">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(statementData.summary.totalExpenses)}
              </p>
            </div>
            <div className={`${statementData.summary.netBalance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border rounded-lg p-4`}>
              <p className={`text-sm ${statementData.summary.netBalance >= 0 ? 'text-blue-700' : 'text-orange-700'} font-semibold`}>
                Net Balance
              </p>
              <p className={`text-2xl font-bold ${statementData.summary.netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {formatCurrency(statementData.summary.netBalance)}
              </p>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-6">
            {/* Income Transactions */}
            {statementData.transactions.income.length > 0 && (
              <div>
                <h5 className="text-md font-bold text-gray-800 mb-3">Income Transactions ({statementData.transactions.income.length})</h5>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-green-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Category</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Amount</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Description</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {statementData.transactions.income.map((t, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 whitespace-nowrap">{formatDate(t.date)}</td>
                          <td className="px-4 py-2">{t.category}</td>
                          <td className="px-4 py-2 font-semibold">{formatCurrency(t.amount)}</td>
                          <td className="px-4 py-2">{t.description || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Expense Transactions */}
            {statementData.transactions.expenses.length > 0 && (
              <div>
                <h5 className="text-md font-bold text-gray-800 mb-3">Expense Transactions ({statementData.transactions.expenses.length})</h5>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-red-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Category</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Amount</th>
                        <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Description</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {statementData.transactions.expenses.map((t, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 whitespace-nowrap">{formatDate(t.date)}</td>
                          <td className="px-4 py-2">{t.category}</td>
                          <td className="px-4 py-2 font-semibold">{formatCurrency(t.amount)}</td>
                          <td className="px-4 py-2">{t.description || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Generated Info */}
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-gray-500">
              Generated on {formatDate(statementData.generatedAt)} by {statementData.generatedBy.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatementGenerator;
