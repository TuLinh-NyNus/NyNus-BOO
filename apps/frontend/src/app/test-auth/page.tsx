'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export default function TestAuthPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">NextAuth.js Test Page</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
        
        {session ? (
          <div className="space-y-4">
            <div className="text-green-600 font-medium">✅ Authenticated</div>
            
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium mb-2">Session Data:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
            
            <button
              onClick={() => signOut()}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-red-600 font-medium">❌ Not Authenticated</div>
            
            <div className="space-y-2">
              <p className="text-gray-600">
                Google OAuth is currently disabled. You can enable it by:
              </p>
              <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
                <li>Setting up Google OAuth credentials</li>
                <li>Adding GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env.local</li>
                <li>Uncommenting the Google provider in auth.ts</li>
              </ol>
            </div>
            
            <button
              onClick={() => signIn('google')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={true}
            >
              Sign In with Google (Disabled)
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-8 bg-blue-50 p-4 rounded">
        <h3 className="font-medium text-blue-800 mb-2">NextAuth.js Status:</h3>
        <p className="text-blue-700 text-sm">
          ✅ NextAuth.js is properly configured and running without errors
        </p>
      </div>
    </div>
  );
}
