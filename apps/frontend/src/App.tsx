import React, { useState } from 'react';
import './App.css';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simulate login for now
    setTimeout(() => {
      if (email && password) {
        setIsAuthenticated(true);
        setLoading(false);
      } else {
        setError('Please enter email and password');
        setLoading(false);
      }
    }, 1000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              🎓 Exam Bank System
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to access the user management system
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-600">
                <p className="mb-2">Demo credentials:</p>
                <div className="bg-gray-100 p-3 rounded text-left">
                  <p><strong>Admin:</strong> admin@exambank.com / password123</p>
                  <p><strong>Teacher:</strong> teacher@exambank.com / password123</p>
                  <p><strong>Student:</strong> student@exambank.com / password123</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              🎓 Exam Bank System
            </h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">User Management</h2>
          <p className="text-gray-600 mb-4">
            Welcome! You are successfully logged in as: <strong>{email}</strong>
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">🚧 Coming Soon</h3>
            <p className="text-blue-700">
              The User List feature is being integrated with the gRPC backend.
              The frontend framework is ready and the backend API is functional.
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✅</span>
                <span>React Frontend with Tailwind CSS</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✅</span>
                <span>gRPC Backend with JWT Authentication</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✅</span>
                <span>PostgreSQL Database with User Data</span>
              </div>
              <div className="flex items-center">
                <span className="text-yellow-600 mr-2">🔄</span>
                <span>gRPC-Web Integration (In Progress)</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
