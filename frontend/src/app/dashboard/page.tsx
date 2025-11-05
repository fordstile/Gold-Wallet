"use client";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, fetchWithAuth } from "@/lib/api";

interface UserBalance {
  grams: number;
  lockedGrams: number;
  availableGrams: number;
}

interface CurrentPrice {
  id: string;
  buyPricePerGram: number;
  sellPricePerGram: number;
  effectiveFrom: string;
}

interface LedgerEntry {
  id: string;
  type: string;
  grams: number;
  pricePerGram: number;
  totalKes: number;
  status: string;
  poolId: string | null;
  reference: string | null;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; isAdmin?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [currentPrice, setCurrentPrice] = useState<CurrentPrice | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<LedgerEntry[]>([]);
  const [priceLoading, setPriceLoading] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(true);

  const [buyKes, setBuyKes] = useState<string>("");
  const [buyPhone, setBuyPhone] = useState<string>("");
  const [sellGrams, setSellGrams] = useState<string>("");
  const [sellPhone, setSellPhone] = useState<string>("");
  const [buyLoading, setBuyLoading] = useState(false);
  const [sellLoading, setSellLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetchAllData(token);
  }, [router]);

  const fetchAllData = async (token: string) => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUserData(token),
        fetchBalance(token),
        fetchCurrentPrice(),
        fetchRecentTransactions(token)
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async (token: string) => {
    try {
      const data = await fetchWithAuth(api.user.me);
      if (data?.email) {
        setUser(data);
      } else {
        localStorage.removeItem("token");
        router.push("/login");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      localStorage.removeItem("token");
      router.push("/login");
    }
  };

  const fetchBalance = async (token: string) => {
    setBalanceLoading(true);
    try {
      const data = await fetchWithAuth(api.user.balance);
        // Convert string values to numbers
        setBalance({
          grams: Number(data.grams),
          lockedGrams: Number(data.lockedGrams),
          availableGrams: Number(data.availableGrams),
        });
    } catch (err) {
      console.error("Error fetching balance:", err);
    } finally {
      setBalanceLoading(false);
    }
  };

  const fetchCurrentPrice = async () => {
    setPriceLoading(true);
    try {
      const data = await fetch(api.admin.price).then(res => res.ok ? res.json() : null);
      if (data) {
        // Convert price values to numbers
        setCurrentPrice({
          id: data.id,
          buyPricePerGram: Number(data.buyPricePerGram),
          sellPricePerGram: Number(data.sellPricePerGram),
          effectiveFrom: data.effectiveFrom,
        });
      }
    } catch (err) {
      console.error("Error fetching price:", err);
    } finally {
      setPriceLoading(false);
    }
  };

  const fetchRecentTransactions = async (token: string) => {
    try {
      const data = await fetchWithAuth(`${api.user.ledger}?limit=10`);
        // Convert transaction data to proper types
        setRecentTransactions(data.map((tx: any) => ({
          id: tx.id,
          type: tx.type,
          grams: Number(tx.grams),
          pricePerGram: Number(tx.pricePerGram),
          totalKes: Number(tx.totalKes),
          status: tx.status,
          poolId: tx.poolId,
          reference: tx.reference,
          createdAt: tx.createdAt,
        })));
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  };

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  const balanceKes = useMemo(() => {
    if (!balance || !currentPrice) return 0;
    return balance.grams * currentPrice.sellPricePerGram;
  }, [balance, currentPrice]);

  const handleBuy = async () => {
    const kes = Number(buyKes);
    if (!kes || kes <= 0) return;
    if (!currentPrice) return alert("Price data not available");
    
    setBuyLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const phone = buyPhone || "254708374149"; // Use sandbox test number if not provided
      
      const response = await fetch(api.trade.buy, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amountKes: kes,
          phoneNumber: phone,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Buy failed");
      }

      const result = await response.json();
      alert(`✅ ${result.message}\n\nYou will receive: ${result.grams.toFixed(6)}g\nTotal: KES ${result.totalKes.toLocaleString()}`);
      
      setBuyKes("");
      // Refresh data
      await fetchAllData(token);
    } catch (error: any) {
      console.error("Buy error:", error);
      alert(`❌ Buy failed: ${error.message}`);
    } finally {
      setBuyLoading(false);
    }
  };

  const handleSell = async () => {
    const grams = Number(sellGrams);
    if (!grams || grams <= 0) return;
    if (!balance || grams > balance.availableGrams) return alert("Not enough available balance");
    if (!currentPrice) return alert("Price data not available");
    
    setSellLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const phone = sellPhone || "254708374149"; // Use sandbox test number if not provided
      
      const response = await fetch(api.trade.sell, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          grams: grams,
          payoutPhone: phone,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Sell failed");
      }

      const result = await response.json();
      alert(`✅ ${result.message}\n\nYou will receive: KES ${result.totalKes.toLocaleString()}\nGrams sold: ${result.grams.toFixed(6)}g`);
      
      setSellGrams("");
      // Refresh data
      await fetchAllData(token);
    } catch (error: any) {
      console.error("Sell error:", error);
      alert(`❌ Sell failed: ${error.message}`);
    } finally {
      setSellLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 py-10">
        <div className="mx-auto max-w-4xl rounded-xl bg-black p-6 text-gray-100 shadow-lg">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mr-3"></div>
            <p>Loading your gold wallet...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-10">
      <div className="mx-auto max-w-6xl rounded-xl bg-black p-6 text-gray-100 shadow-lg">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">⚡</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Gold Wallet</h1>
              <p className="text-sm text-gray-400">Welcome back, {user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {user?.isAdmin && (
              <a 
                href="/admin/dashboard"
                className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                Admin Panel
              </a>
            )}
            <button 
              onClick={handleLogout}
              className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Balance Overview */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="bg-gradient-to-br from-yellow-400 to-amber-600 p-6 rounded-xl text-black">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-yellow-900">Gold Balance</p>
                {balanceLoading ? (
                  <div className="animate-pulse bg-yellow-200 h-8 w-24 rounded mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold text-yellow-900">
                    {balance?.grams?.toFixed(6) || '0.000000'}g
                  </p>
                )}
              </div>
              <span className="text-3xl">🏆</span>
            </div>
            <p className="text-sm text-yellow-800">
              Available: {balance?.availableGrams?.toFixed(6) || '0.000000'}g
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-green-100">KES Value</p>
                {balanceLoading ? (
                  <div className="animate-pulse bg-green-200 h-8 w-32 rounded mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold text-white">
                    KES {balanceKes.toLocaleString()}
                  </p>
                )}
              </div>
              <span className="text-3xl">💰</span>
            </div>
            <p className="text-sm text-green-100">
              Based on current sell price
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-blue-100">Current Price</p>
                {priceLoading ? (
                  <div className="animate-pulse bg-blue-200 h-8 w-28 rounded mt-2"></div>
                ) : (
                  <p className="text-3xl font-bold text-white">
                    KES {currentPrice?.buyPricePerGram?.toLocaleString() || '0'}/g
                  </p>
                )}
              </div>
              <span className="text-3xl">📈</span>
            </div>
            <p className="text-sm text-blue-100">
              Buy: KES {currentPrice?.buyPricePerGram?.toLocaleString() || '0'}/g<br />
              Sell: KES {currentPrice?.sellPricePerGram?.toLocaleString() || '0'}/g
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trading Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Buy Gold */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center mb-6">
                <span className="text-2xl mr-3">📈</span>
                <h2 className="text-xl font-bold text-gray-100">Buy Gold</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount in KES
                  </label>
                  <input
                    type="number"
                    value={buyKes}
                    onChange={(e) => setBuyKes(e.target.value)}
                    placeholder="Enter amount in KES"
                    className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    M-Pesa Phone Number
                  </label>
                  <input
                    type="tel"
                    value={buyPhone}
                    onChange={(e) => setBuyPhone(e.target.value)}
                    placeholder="254708374149 (sandbox test)"
                    className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: 254XXXXXXXXX (or leave empty for test number)
                  </p>
                </div>
                
                {buyKes && currentPrice && (
                  <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-lg">
                    <p className="text-sm text-green-300">
                      You will receive: <span className="font-bold text-green-200">
                        {(Number(buyKes) / currentPrice.buyPricePerGram).toFixed(6)}g
                      </span>
                    </p>
                    <p className="text-xs text-green-400 mt-1">
                      📱 M-Pesa prompt will be sent to your phone
                    </p>
                  </div>
                )}
                
                <button
                  onClick={handleBuy}
                  disabled={buyLoading || !buyKes || !currentPrice}
                  className="w-full rounded-md bg-yellow-400 px-4 py-2.5 font-semibold text-black transition-colors hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {buyLoading ? 'Processing... Check Your Phone' : '📱 Buy with M-Pesa'}
                </button>
              </div>
            </div>

            {/* Sell Gold */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center mb-6">
                <span className="text-2xl mr-3">📉</span>
                <h2 className="text-xl font-bold text-gray-100">Sell Gold</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Amount in Grams
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={sellGrams}
                    onChange={(e) => setSellGrams(e.target.value)}
                    placeholder="Enter grams to sell"
                    className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    M-Pesa Phone Number (for payout)
                  </label>
                  <input
                    type="tel"
                    value={sellPhone}
                    onChange={(e) => setSellPhone(e.target.value)}
                    placeholder="254708374149 (optional)"
                    className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-gray-100 placeholder-gray-400 focus:border-yellow-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Payout will be sent to this number after admin approval
                  </p>
                </div>
                
                {sellGrams && currentPrice && (
                  <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
                    <p className="text-sm text-red-300">
                      You will receive: <span className="font-bold text-red-200">
                        KES {(Number(sellGrams) * currentPrice.sellPricePerGram).toFixed(2)}
                      </span>
                    </p>
                    <p className="text-xs text-red-400 mt-1">
                      ⏳ Payout processed within 24 hours
                    </p>
                  </div>
                )}
                
                <button
                  onClick={handleSell}
                  disabled={sellLoading || !sellGrams || !balance || Number(sellGrams) > balance.availableGrams}
                  className="w-full rounded border border-gray-600 px-4 py-2.5 font-semibold text-gray-200 transition-colors hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sellLoading ? 'Processing...' : 'Sell Gold'}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Profile */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">👤</span>
                <h3 className="text-lg font-bold text-gray-100">Profile</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-gray-100 font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Account Type</p>
                  <p className="text-gray-100 font-medium">
                    {user?.isAdmin ? 'Administrator' : 'Standard User'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Member Since</p>
                  <p className="text-gray-100 font-medium">October 2025</p>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">⚙️</span>
                <h3 className="text-lg font-bold text-gray-100">Settings</h3>
              </div>
              
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-200">Notifications</span>
                    <span className="text-gray-400">→</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-200">Security</span>
                    <span className="text-gray-400">→</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-200">Preferences</span>
                    <span className="text-gray-400">→</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-200">Help & Support</span>
                    <span className="text-gray-400">→</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">📊</span>
                <h3 className="text-lg font-bold text-gray-100">Quick Stats</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Transactions</span>
                  <span className="text-gray-100 font-medium">{recentTransactions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Locked Gold</span>
                  <span className="text-gray-100 font-medium">{balance?.lockedGrams?.toFixed(6) || '0.000000'}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Portfolio Value</span>
                  <span className="text-gray-100 font-medium">KES {balanceKes.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center mb-6">
            <span className="text-2xl mr-3">📋</span>
            <h2 className="text-xl font-bold text-gray-100">Recent Transactions</h2>
          </div>
          
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'buy' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      {tx.type === 'buy' ? '📈' : '📉'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-100 capitalize">{tx.type}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-100">
                      {tx.grams.toFixed(6)}g
                    </p>
                    <p className="text-sm text-gray-400">
                      KES {tx.totalKes.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📋</span>
              </div>
              <p className="text-gray-400">No transactions yet</p>
              <p className="text-sm text-gray-500">Your transaction history will appear here</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
