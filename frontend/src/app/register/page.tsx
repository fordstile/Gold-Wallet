"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Client-side password validation
  function validatePassword(pwd: string): string[] {
    const errors: string[] = [];
    if (pwd.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/\d/.test(pwd) && !/\W/.test(pwd)) {
      errors.push("Password must contain at least one number or special character");
    }
    return errors;
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    setValidationErrors(validatePassword(value));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Client-side validation
    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    
    const pwdErrors = validatePassword(password);
    if (pwdErrors.length > 0) {
      setError(pwdErrors[0]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(api.auth.register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, passwordConfirm }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        // Handle validation errors from backend
        if (data?.message && Array.isArray(data.message)) {
          throw new Error(data.message.join(', '));
        } else if (data?.message) {
          throw new Error(data.message);
        } else {
          throw new Error("Registration failed");
        }
      }
      
      if (!data?.ok || !data?.token) {
        throw new Error("Registration failed - no token received");
      }
      
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-lg bg-white p-8 shadow-lg">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="mt-2 text-sm text-gray-600">
          Start investing in digital gold today
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
            onChange={(e) => handlePasswordChange(e.target.value)}
            placeholder="Enter a strong password"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
          {validationErrors.length > 0 && (
            <ul className="mt-2 space-y-1">
              {validationErrors.map((err, i) => (
                <li key={i} className="text-xs text-gray-500 flex items-start">
                  <span className="mr-1">•</span>
                  <span>{err}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700">
            Confirm password
          </label>
          <input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="Re-enter your password"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
          {password && passwordConfirm && password !== passwordConfirm && (
            <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
          )}
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
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <a className="font-medium text-yellow-600 hover:text-yellow-500" href="/login">
          Sign in
        </a>
      </p>
    </div>
  );
}
