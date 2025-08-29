import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useSalaryIncome } from '../../hooks/useIncome';

const IncomeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { income, loading, error } = useSalaryIncome(id);

  const formatCurrency = (amount, currencyCode = 'INR') => {
    const symbol = currencyCode === 'INR' ? '₹' : currencyCode === 'USD' ? '$' : currencyCode === 'EUR' ? '€' : currencyCode === 'GBP' ? '£' : currencyCode;
    return `${symbol}${Number(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateGrossIncome = () => {
    if (!income) return 0;
    return (Number(income.basicAmount) || 0) + 
           (Number(income.hraAmount) || 0) + 
           (Number(income.otherAllowanceAmount) || 0) + 
           (Number(income.bonusAmount) || 0);
  };

  const calculateTotalDeductions = () => {
    if (!income) return 0;
    return (Number(income.empPfAmount) || 0) + 
           (Number(income.professionTaxAmount) || 0) + 
           (Number(income.incomeTaxAmount) || 0);
  };

  const calculateNetIncome = () => {
    return calculateGrossIncome() - calculateTotalDeductions();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <LoadingSpinner size="lg" message="Loading salary income details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="card">
          <div className="text-center">
            <span className="text-4xl mb-4 block">⚠️</span>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Salary Income Details</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => navigate('/income')}
              className="btn btn-secondary"
            >
              Back to Income List
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!income) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="card">
          <div className="text-center">
            <span className="text-4xl mb-4 block">📭</span>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Salary Income Record Not Found</h2>
            <p className="text-gray-600 mb-4">The salary income record you're looking for doesn't exist.</p>
            <button 
              onClick={() => navigate('/income')}
              className="btn btn-secondary"
            >
              Back to Income List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Salary Income Details
          </h1>
          <p className="text-gray-600">
            Detailed salary breakdown for record #{income.id}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/income/${income.id}/edit`}
            className="btn btn-primary flex items-center gap-2"
          >
            <span>✏️</span>
            Edit Record
          </Link>
          <button
            onClick={() => navigate('/income')}
            className="btn btn-secondary"
          >
            Back to List
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-4xl mb-2 block">💰</span>
            <p className="text-sm font-medium text-green-800">Gross Income</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {formatCurrency(calculateGrossIncome(), income.currencyCode)}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
            <span className="text-4xl mb-2 block">📉</span>
            <p className="text-sm font-medium text-red-800">Total Deductions</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {formatCurrency(calculateTotalDeductions(), income.currencyCode)}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="text-center p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-4xl mb-2 block">💵</span>
            <p className="text-sm font-medium text-blue-800">Net Income</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {formatCurrency(calculateNetIncome(), income.currencyCode)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Income Components */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="text-green-600 mr-2">💰</span>
            Income Components
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="font-medium text-gray-700">Basic Amount</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(income.basicAmount, income.currencyCode)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="font-medium text-gray-700">HRA Amount</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(income.hraAmount, income.currencyCode)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="font-medium text-gray-700">Other Allowance</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(income.otherAllowanceAmount, income.currencyCode)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="font-medium text-gray-700">Bonus Amount</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(income.bonusAmount, income.currencyCode)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 bg-green-50 rounded-lg px-4">
              <span className="font-bold text-gray-800">Total Gross</span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(calculateGrossIncome(), income.currencyCode)}
              </span>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="text-red-600 mr-2">📉</span>
            Deductions
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="font-medium text-gray-700">Employee PF</span>
              <span className="text-lg font-bold text-red-600">
                {formatCurrency(income.empPfAmount, income.currencyCode)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="font-medium text-gray-700">Profession Tax</span>
              <span className="text-lg font-bold text-red-600">
                {formatCurrency(income.professionTaxAmount, income.currencyCode)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="font-medium text-gray-700">Income Tax</span>
              <span className="text-lg font-bold text-red-600">
                {formatCurrency(income.incomeTaxAmount, income.currencyCode)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 bg-red-50 rounded-lg px-4">
              <span className="font-bold text-gray-800">Total Deductions</span>
              <span className="text-xl font-bold text-red-600">
                {formatCurrency(calculateTotalDeductions(), income.currencyCode)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Record ID</label>
            <p className="mt-1 text-lg font-mono text-gray-900">#{income.id}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">User ID</label>
            <p className="mt-1 text-lg font-mono text-blue-600">#{income.userId}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Currency</label>
            <p className="mt-1 text-lg font-medium text-gray-900">{income.currencyCode}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Created On</label>
            <p className="mt-1 text-gray-900">
              {formatDate(income.createdOn)}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Last Updated</label>
            <p className="mt-1 text-gray-900">
              {formatDate(income.updatedOn)}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Net Take-Home</label>
            <p className="mt-1 text-xl font-bold text-blue-600">
              {formatCurrency(calculateNetIncome(), income.currencyCode)}
            </p>
          </div>
        </div>
      </div>

      {/* Percentage Breakdown */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Breakdown Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Income Distribution</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Basic Amount</span>
                <span className="font-medium">
                  {((Number(income.basicAmount) / calculateGrossIncome()) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">HRA</span>
                <span className="font-medium">
                  {((Number(income.hraAmount) / calculateGrossIncome()) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Other Allowance</span>
                <span className="font-medium">
                  {((Number(income.otherAllowanceAmount) / calculateGrossIncome()) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Bonus</span>
                <span className="font-medium">
                  {((Number(income.bonusAmount) / calculateGrossIncome()) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Deduction Analysis</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Deduction Rate</span>
                <span className="font-medium text-red-600">
                  {((calculateTotalDeductions() / calculateGrossIncome()) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Net Take-Home Rate</span>
                <span className="font-medium text-green-600">
                  {((calculateNetIncome() / calculateGrossIncome()) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tax Burden</span>
                <span className="font-medium">
                  {(((Number(income.incomeTaxAmount) + Number(income.professionTaxAmount)) / calculateGrossIncome()) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">PF Contribution</span>
                <span className="font-medium">
                  {((Number(income.empPfAmount) / calculateGrossIncome()) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeDetails;