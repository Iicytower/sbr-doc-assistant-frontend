"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ApiClient from "../../backend/backend";
import { AuthForm } from "../../components/auth-form";

const api = new ApiClient();

export default function HomePage() {
  const [mode, setMode] = useState<'signin' | 'signup'>("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  if (api.getToken()) {
    router.push("/dashboard");
  }

  async function handleSignIn(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      await api.login({ email, password });
      setSuccess("Signed in successfully!");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.body?.message || err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const nickname = formData.get("nickname") as string | undefined;
      await api.register({ email, password, nickname });
      setSuccess("Account created and signed in!");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.body?.message || err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome to SBR Doc Assistant</h1>
        <div className="flex justify-center mb-6">
          <button
            type="button"
            className={`px-4 py-2 rounded-l ${mode === "signin" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setMode("signin")}
            disabled={loading}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-r ${mode === "signup" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            onClick={() => setMode("signup")}
            disabled={loading}
          >
            Sign Up
          </button>
        </div>
        {mode === "signin" ? (
          <AuthForm action={handleSignIn}>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </AuthForm>
        ) : (
          <AuthForm action={handleSignUp}>
            <div className="flex flex-col gap-2">
              <label htmlFor="nickname" className="text-zinc-600 font-normal dark:text-zinc-400">Nickname (optional)</label>
              <input
                id="nickname"
                name="nickname"
                className="bg-muted text-md md:text-sm px-3 py-2 border rounded"
                type="text"
                placeholder="Your nickname"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </AuthForm>
        )}
  {error && <div className="mt-4 text-blue-600 text-center">{error}</div>}
  {success && <div className="mt-4 text-blue-700 text-center">{success}</div>}
      </div>
    </main>
  );
}
