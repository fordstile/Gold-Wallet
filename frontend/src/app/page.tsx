"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600">
                <span className="text-xl font-bold text-black">G</span>
              </div>
              <span className="text-xl font-bold text-white">Gold Wallet</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 px-6 py-2 text-sm font-semibold text-black transition-transform hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
              Own <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Digital Gold</span>
              <br />
              in Kenya
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400 sm:text-xl">
              Buy, sell, and store gold-backed digital assets securely. Simple, fast, and backed by real gold reserves.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/register"
                className="rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 px-8 py-3 text-base font-semibold text-black shadow-lg shadow-yellow-500/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/40"
              >
                Start Trading
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-slate-600 bg-slate-800/50 px-8 py-3 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-slate-500 hover:bg-slate-800"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 backdrop-blur-sm">
              <div className="text-3xl font-bold text-yellow-400">24K</div>
              <div className="mt-2 text-sm text-slate-400">Pure Gold</div>
            </div>
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 backdrop-blur-sm">
              <div className="text-3xl font-bold text-yellow-400">M-Pesa</div>
              <div className="mt-2 text-sm text-slate-400">Instant Payments</div>
            </div>
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-6 backdrop-blur-sm">
              <div className="text-3xl font-bold text-yellow-400">Secure</div>
              <div className="mt-2 text-sm text-slate-400">Bank-Level Security</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-slate-700/50 bg-slate-900/50 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Why Choose Gold Wallet?</h2>
            <p className="mt-4 text-lg text-slate-400">Everything you need to invest in digital gold</p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-8 backdrop-blur-sm transition-all hover:border-yellow-500/50 hover:bg-slate-800/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600">
                <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">Real Gold Backing</h3>
              <p className="mt-2 text-slate-400">Every gram is backed by physical 24K gold stored in secure vaults.</p>
            </div>

            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-8 backdrop-blur-sm transition-all hover:border-yellow-500/50 hover:bg-slate-800/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600">
                <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">Instant Transactions</h3>
              <p className="mt-2 text-slate-400">Buy and sell gold instantly via M-Pesa. No waiting, no delays.</p>
            </div>

            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-8 backdrop-blur-sm transition-all hover:border-yellow-500/50 hover:bg-slate-800/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600">
                <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">Secure Storage</h3>
              <p className="mt-2 text-slate-400">Bank-level encryption and security. Your gold is safe with us.</p>
            </div>

            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-8 backdrop-blur-sm transition-all hover:border-yellow-500/50 hover:bg-slate-800/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600">
                <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">Real-Time Prices</h3>
              <p className="mt-2 text-slate-400">Live gold prices updated continuously. Transparent pricing.</p>
            </div>

            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-8 backdrop-blur-sm transition-all hover:border-yellow-500/50 hover:bg-slate-800/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600">
                <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">Low Fees</h3>
              <p className="mt-2 text-slate-400">Competitive rates with no hidden charges. What you see is what you get.</p>
            </div>

            <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-8 backdrop-blur-sm transition-all hover:border-yellow-500/50 hover:bg-slate-800/50">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600">
                <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">Mobile First</h3>
              <p className="mt-2 text-slate-400">Access your gold portfolio anywhere, anytime. Works on all devices.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-slate-700/50 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-lg text-slate-400">Get started in 3 simple steps</p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-2xl font-bold text-black">
                1
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">Create Account</h3>
              <p className="mt-2 text-slate-400">Sign up with your email. It takes less than a minute.</p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-2xl font-bold text-black">
                2
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">Buy Gold</h3>
              <p className="mt-2 text-slate-400">Use M-Pesa to instantly purchase gold at current market prices.</p>
            </div>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-2xl font-bold text-black">
                3
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">Track & Trade</h3>
              <p className="mt-2 text-slate-400">Monitor your portfolio and sell anytime. Money goes to your M-Pesa.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-slate-700/50 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to Start Investing?</h2>
          <p className="mt-4 text-lg text-slate-400">
            Join thousands of Kenyans already investing in digital gold
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 px-8 py-3 text-base font-semibold text-black shadow-lg shadow-yellow-500/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-yellow-500/40"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600">
                <span className="text-xl font-bold text-black">G</span>
              </div>
              <span className="text-xl font-bold text-white">Gold Wallet</span>
            </div>
            <p className="text-sm text-slate-400">
              © 2025 Gold Wallet. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
