import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../../components/common/DataTable';
import { DeleteConfirmDialog } from '../../components/common/ConfirmDialog';
import { useUsers } from '../../hooks/useUsers';

function UsersList() {
  const { users, loading, error, deleteUser, clearError } = useUsers();
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, user: null, loading: false });

  // Table columns configuration
  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (value) => <span className="font-mono text-sm text-gray-600">#{value}</span>
    },
    {
      key: 'userName',
      label: 'Username',
      render: (value) => <span className="font-medium text-gray-900">{value}</span>
    },
    {
      key: 'email',
      label: 'Email',
      render: (value) => <span className="text-blue-600">{value}</span>
    },
    {
      key: 'firstName',
      label: 'First Name',
    },
    {
      key: 'lastName',
      label: 'Last Name',
    },
    {
      key: 'createdOn',
      label: 'Created',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    }
  ];

  // Action buttons for each user row
  const renderActions = (user) => (
    <div className="flex items-center gap-2">
      <Link
        to={`/users/${user.id}`}
        className="btn btn-outline btn-sm"
        title="View Details"
      >
        👁️ View
      </Link>
      <Link
        to={`/users/${user.id}/edit`}
        className="btn btn-primary btn-sm"
        title="Edit User"
      >
        ✏️ Edit
      </Link>
      <button
        onClick={() => handleDeleteClick(user)}
        className="btn btn-danger btn-sm"
        title="Delete User"
      >
        🗑️ Delete
      </button>
    </div>
  );

  const handleDeleteClick = (user) => {
    setDeleteDialog({ isOpen: true, user, loading: false });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.user) return;

    setDeleteDialog(prev => ({ ...prev, loading: true }));
    try {
      await deleteUser(deleteDialog.user.id);
      setDeleteDialog({ isOpen: false, user: null, loading: false });
    } catch {
      // Error is handled by the hook
      setDeleteDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, user: null, loading: false });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            User Management
          </h1>
          <p className="text-gray-600">
            Manage all users in the Finance Inspector system
          </p>
        </div>
        <Link
          to="/users/new"
          className="btn btn-primary flex items-center gap-2"
        >
          <span>➕</span>
          Add New User
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-red-600 text-xl">⚠️</span>
            <div>
              <p className="text-red-800 font-medium">Error Loading Users</p>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.createdOn && new Date(u.createdOn) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
              </p>
              <p className="text-sm text-gray-600">New This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        actions={renderActions}
        emptyMessage="No users found. Create your first user to get started!"
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
        itemName={deleteDialog.user ? `${deleteDialog.user.firstName} ${deleteDialog.user.lastName} (${deleteDialog.user.userName})` : ''}
        itemType="user"
        loading={deleteDialog.loading}
      />
    </div>
  );
}

export default UsersList;