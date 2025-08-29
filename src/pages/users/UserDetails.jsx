import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUsers';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading, error, clearError } = useUser(id);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <LoadingSpinner message="Loading user details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-red-600 text-xl">⚠️</span>
            <div>
              <p className="text-red-800 font-medium">Error Loading User</p>
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
        <div className="text-center">
          <Link
            to="/users"
            className="btn btn-outline"
          >
            ← Back to Users
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="py-12">
          <span className="text-6xl mb-4 block">👤</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-6">The user you're looking for doesn't exist.</p>
          <Link
            to="/users"
            className="btn btn-outline"
          >
            ← Back to Users
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-ghost btn-sm"
              title="Go Back"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              User Details
            </h1>
          </div>
          <p className="text-gray-600">
            Viewing information for {user.firstName} {user.lastName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/users/${user.id}/edit`}
            className="btn btn-primary flex items-center gap-2"
          >
            <span>✏️</span>
            Edit User
          </Link>
          <Link
            to="/users"
            className="btn btn-outline"
          >
            All Users
          </Link>
        </div>
      </div>

      {/* User Information Card */}
      <div className="card mb-8">
        <div className="flex items-start gap-6">
          {/* Profile Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
            </div>
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600 text-lg">@{user.userName}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-500 text-xl">📧</span>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-blue-600">{user.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-green-500 text-xl">🆔</span>
                    <div>
                      <p className="text-sm text-gray-600">User ID</p>
                      <p className="font-mono text-gray-900">#{user.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-purple-500 text-xl">👤</span>
                    <div>
                      <p className="text-sm text-gray-600">Username</p>
                      <p className="font-medium text-gray-900">{user.userName}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timestamps Card */}
      <div className="card mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <span className="text-green-500 text-xl">📅</span>
            <div>
              <p className="text-sm text-gray-600">Account Created</p>
              <p className="font-medium text-gray-900">{formatDate(user.createdOn)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-orange-500 text-xl">🔄</span>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="font-medium text-gray-900">{formatDate(user.updatedOn)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Summary Card */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-2xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-600">Income Records</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-2">💰</div>
            <p className="text-2xl font-bold text-green-600">$0.00</p>
            <p className="text-sm text-gray-600">Total Income</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl mb-2">📈</div>
            <p className="text-2xl font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-600">Days Active</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-600">
            💡 Income tracking features will be available once the Income Management module is implemented
          </p>
        </div>
      </div>
    </div>
  );
}

export default UserDetails;