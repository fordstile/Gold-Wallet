"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(api.auth.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        // Handle validation errors from backend
        if (data?.message && Array.isArray(data.message)) {
          throw new Error(data.message.join(', '));
        } else if (data?.message) {
          throw new Error(data.message);
        } else {
          throw new Error("Login failed");
        }
      }
      
      if (!data?.ok || !data?.token) {
        throw new Error("Login failed - no token received");
      }
      
      localStorage.setItem("token", data.token);
      
      // Check if user is admin and redirect accordingly
      if (data.user?.isAdmin) {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to your Gold Wallet account
        </p>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-yellow-400 px-4 py-2.5 font-semibold text-black transition-colors hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <a className="font-medium text-yellow-600 hover:text-yellow-500" href="/register">
          Create one
        </a>
      </p>
    </div>
  );
}
