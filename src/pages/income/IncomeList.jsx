import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../../components/common/DataTable';
import { DeleteConfirmDialog } from '../../components/common/ConfirmDialog';
import { useIncome } from '../../hooks/useIncome';

function IncomeList() {
  const { incomes, loading, error, deleteSalaryIncome, clearError } = useIncome();
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, income: null, loading: false });

  // Table columns configuration
  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (value) => <span className="font-mono text-sm text-gray-600">#{value}</span>
    },
    {
      key: 'userId',
      label: 'User ID',
      render: (value) => <span className="font-mono text-sm text-blue-600">#{value}</span>
    },
    {
      key: 'currencyCode',
      label: 'Currency',
      render: (value) => <span className="text-gray-700 font-medium">{value}</span>
    },
    {
      key: 'basicAmount',
      label: 'Basic Amount',
      render: (value) => <span className="font-semibold text-green-600">₹{Number(value).toLocaleString()}</span>
    },
    {
      key: 'hraAmount',
      label: 'HRA',
      render: (value) => <span className="text-green-600">₹{Number(value).toLocaleString()}</span>
    },
    {
      key: 'otherAllowanceAmount',
      label: 'Other Allowance',
      render: (value) => <span className="text-green-600">₹{Number(value).toLocaleString()}</span>
    },
    {
      key: 'bonusAmount',
      label: 'Bonus',
      render: (value) => <span className="text-green-600">₹{Number(value).toLocaleString()}</span>
    },
    {
      key: 'empPfAmount',
      label: 'PF Deduction',
      render: (value) => <span className="text-red-600">₹{Number(value).toLocaleString()}</span>
    },
    {
      key: 'professionTaxAmount',
      label: 'Prof. Tax',
      render: (value) => <span className="text-red-600">₹{Number(value).toLocaleString()}</span>
    },
    {
      key: 'incomeTaxAmount',
      label: 'Income Tax',
      render: (value) => <span className="text-red-600">₹{Number(value).toLocaleString()}</span>
    },
    {
      key: 'createdOn',
      label: 'Created',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    }
  ];

  // Action buttons for each income row
  const renderActions = (income) => (
    <div className="flex items-center gap-2">
      <Link
        to={`/income/${income.id}`}
        className="btn btn-outline btn-sm"
        title="View Details"
      >
        👁️ View
      </Link>
      <Link
        to={`/income/${income.id}/edit`}
        className="btn btn-primary btn-sm"
        title="Edit Income"
      >
        ✏️ Edit
      </Link>
      <button
        onClick={() => handleDeleteClick(income)}
        className="btn btn-danger btn-sm"
        title="Delete Income"
      >
        🗑️ Delete
      </button>
    </div>
  );

  const handleDeleteClick = (income) => {
    setDeleteDialog({ isOpen: true, income, loading: false });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.income) return;

    setDeleteDialog(prev => ({ ...prev, loading: true }));
    try {
      await deleteSalaryIncome(deleteDialog.income.id);
      setDeleteDialog({ isOpen: false, income: null, loading: false });
    } catch {
      // Error is handled by the hook
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, income: null, loading: false });
  };

  // Calculate statistics
  const calculateGrossIncome = (income) => {
    return (Number(income.basicAmount) || 0) +
           (Number(income.hraAmount) || 0) +
           (Number(income.otherAllowanceAmount) || 0) +
           (Number(income.bonusAmount) || 0);
  };
  
  const calculateDeductions = (income) => {
    return (Number(income.empPfAmount) || 0) +
           (Number(income.professionTaxAmount) || 0) +
           (Number(income.incomeTaxAmount) || 0);
  };
  

  const totalGrossIncome = incomes.reduce((sum, income) => sum + calculateGrossIncome(income), 0);
  const totalDeductions = incomes.reduce((sum, income) => sum + calculateDeductions(income), 0);
  const totalNetIncome = totalGrossIncome - totalDeductions;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Income Management
          </h1>
          <p className="text-gray-600">
            Manage all salary income records in the Finance Inspector system
          </p>
        </div>
        <Link
          to="/income/new"
          className="btn btn-primary flex items-center gap-2"
        >
          <span>➕</span>
          Add New Income
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-red-600 text-xl">⚠️</span>
            <div>
              <p className="text-red-800 font-medium">Error Loading Income Records</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={clearError}
            className="text-red-600 hover:text-red-800 font-medium text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">₹{totalGrossIncome.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Gross Income</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-full">
              <span className="text-2xl">📉</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">₹{totalDeductions.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Deductions</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">💵</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">₹{totalNetIncome.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Net Income</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{incomes.length}</p>
              <p className="text-sm text-gray-600">Total Records</p>
            </div>
          </div>
        </div>
      </div>

      {/* Income Data Table */}
      <DataTable
        data={incomes}
        columns={columns}
        loading={loading}
        actions={renderActions}
        emptyMessage="No income records found. Create your first income record to get started!"
        searchable={true}
        sortable={true}
        pagination={true}
        itemsPerPage={10}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={deleteDialog.income ? `Income Record #${deleteDialog.income.id} (₹${Number(deleteDialog.income.amount).toLocaleString()})` : ''}
        itemType="income record"
        loading={deleteDialog.loading}
      />
    </div>
  );
}

export default IncomeList;