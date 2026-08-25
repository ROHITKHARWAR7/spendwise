"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });

      if (!result) {
        setError(
          "Unable to sign in. Please try again."
        );
        return;
      }

      if (result.error) {
        setError(
          "Invalid email or password. Please try again."
        );
        return;
      }

      /*
       * Auth.js has successfully created the session.
       * Refresh the server components so /dashboard
       * reads the newly authenticated user's session.
       */
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Something went wrong while signing in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Logo / Brand */}
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-xl font-bold text-slate-950">
                S
              </div>

              <span className="text-2xl font-bold tracking-tight">
                SpendWise
              </span>
            </Link>

            <h1 className="mt-8 text-3xl font-bold">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Sign in to manage your finances
            </p>
          </div>

          {/* Login Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Email
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-200"
                  >
                    Password
                  </label>

                  <span className="text-xs text-slate-500">
                    Keep it secure
                  </span>
                </div>

                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Signup */}
            <div className="mt-6 border-t border-slate-800 pt-6 text-center">
              <p className="text-sm text-slate-400">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-emerald-400 transition hover:text-emerald-300"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>

          {/* Back */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-slate-500 transition hover:text-slate-300"
            >
              ← Back to SpendWise
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}