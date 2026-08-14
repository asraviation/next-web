"use client";

// Sign-in card for the admin panel.
//
// On success the server has set an httpOnly session cookie; router.refresh()
// re-runs the server layout, which then renders the panel. No credential is
// held in component state.

import { useState } from "react";
import { useRouter } from "next/navigation";
import GoogleSignIn from "@/components/GoogleSignIn";

export default function AdminSignIn() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleAuthSuccess = (data: any) => {
    if (data.authorized) {
      setError(null);
      router.refresh();
    } else {
      setError(`Access denied. ${data.email} is not authorized.`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2 text-gray-900">ASR Admin</h1>
        <p className="text-sm text-gray-500 mb-6">
          Sign in with an authorized ASR staff account to continue.
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <GoogleSignIn onAuthSuccess={handleAuthSuccess} onAuthError={setError} />
      </div>
    </div>
  );
}
