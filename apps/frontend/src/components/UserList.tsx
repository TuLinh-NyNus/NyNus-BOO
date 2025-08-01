import React, { useState, useEffect } from 'react';
import { grpcClient } from '../services/grpcClient';
const { ListUsersResponse } = require('../generated/v1/user_pb');

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

interface UserListProps {
  token: string;
}

const UserList: React.FC<UserListProps> = ({ token }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  const fetchUsers = async () => {
    if (!token) {
      setError('No authentication token provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await grpcClient.listUsers(token, page, pageSize) as ListUsersResponse;

      // Convert gRPC response to our interface
      const userList: User[] = response.getUsersList().map(user => ({
        id: user.getId(),
        email: user.getEmail(),
        firstName: user.getFirstName(),
        lastName: user.getLastName(),
        role: user.getRole().toString(),
        isActive: user.getIsActive()
      }));

      setUsers(userList);

      // Get pagination info if available
      const pagination = response.getPagination();
      if (pagination) {
        setTotalUsers(pagination.getTotal());
      }

    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token, page]);

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(totalUsers / pageSize);
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case '1': return 'Student';
      case '2': return 'Teacher';
      case '3': return 'Admin';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <strong>Error:</strong> {error}
        <button
          onClick={fetchUsers}
          className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total users: {totalUsers} | Page {page} of {Math.ceil(totalUsers / pageSize)}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getRoleDisplayName(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handlePreviousPage}
              disabled={page === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="mx-4 text-sm text-gray-700">
              Page {page} of {Math.ceil(totalUsers / pageSize)}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page >= Math.ceil(totalUsers / pageSize)}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserList;
