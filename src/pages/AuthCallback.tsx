import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSupabaseAuth } from "../hooks/useSupabaseAuth";
import { Loader } from "lucide-react";

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, loading } = useSupabaseAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Check if we have auth tokens in the URL
      const error = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");
      
      if (error) {
        console.error("Auth callback error:", error, errorDescription);
        // Redirect to login with error
        navigate("/login?error=" + encodeURIComponent(errorDescription || error), { replace: true });
        return;
      }

      // Wait for session to be processed by Supabase
      if (!loading && session) {
        console.log("Auth callback successful, redirecting to app");
        navigate("/", { replace: true });
      } else if (!loading && !session) {
        // If no session after loading, redirect to login
        console.log("No session found after auth callback, redirecting to login");
        navigate("/login", { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams, session, loading]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-sm border p-8 text-center max-w-sm w-full">
        <div className="flex justify-center mb-4">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Memverifikasi Akun
        </h2>
        <p className="text-gray-600 text-sm">
          Sedang memproses verifikasi email Anda...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
