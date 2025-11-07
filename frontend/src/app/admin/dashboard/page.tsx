'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, fetchWithAuth } from '@/lib/api';

interface Pool {
  id: string;
  name: string;
  totalGrams: number;
  availableGrams: number;
  purity: string;
  createdAt: string;
}

interface Price {
  id: string;
  buyPricePerGram: number;
  sellPricePerGram: number;
  effectiveFrom: string;
}

interface Stats {
  totalPools: number;
  totalGoldGrams: number;
  availableGoldGrams: number;
  allocatedGoldGrams: number;
}

interface Payout {
  id: string;
  userId: string;
  amountKes: number;
  phone: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [pools, setPools] = useState<Pool[]>([]);
  const [currentPrice, setCurrentPrice] = useState<Price | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'pools' | 'prices' | 'payouts'>('overview');

  // Form states
  const [showCreatePool, setShowCreatePool] = useState(false);
  const [showSetPrice, setShowSetPrice] = useState(false);
  const [poolForm, setPoolForm] = useState({ name: '', totalGrams: '', purity: '24k' });
  const [priceForm, setPriceForm] = useState({ buyPricePerGram: '', sellPricePerGram: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchAllData(token);
  }, [router]);

  const fetchAllData = async (token: string) => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(token),
        fetchPools(token),
        fetchCurrentPrice(token),
        fetchPayouts(token)
      ]);
    } finally {
      setLoading(false);
    }
  };

  async function fetchStats(token: string) {
    try {
      const data = await fetchWithAuth(api.admin.stats);
      const normalized: Stats = {
        totalPools: data.totalPools ?? data.total ?? 0,
        totalGoldGrams: Number(data.totalGold ?? data.totalGoldGrams ?? 0),
        availableGoldGrams: Number(data.availableGold ?? data.availableGoldGrams ?? 0),
        allocatedGoldGrams: Number(data.allocatedGold ?? data.allocatedGoldGrams ?? 0),
      };
      setStats(normalized);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  async function fetchPools(token: string) {
    try {
      const data = await fetchWithAuth(api.admin.pools);
      const normalized: Pool[] = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        totalGrams: Number(p.totalGrams ?? p.total_grams ?? 0),
        availableGrams: Number(p.availableGrams ?? p.available_grams ?? 0),
        purity: p.purity ?? '24k',
        createdAt: p.createdAt ?? p.created_at ?? '',
      }));
      setPools(normalized);
    } catch (error) {
      console.error('Error fetching pools:', error);
    }
  }

  async function fetchCurrentPrice(_token: string) {
    try {
      const res = await fetch(api.admin.price);
      if (res.ok) {
        const data = await res.json();
        setCurrentPrice(data);
      }
    } catch (error) {
      console.error('Error fetching price:', error);
    }
  }

  async function fetchPayouts(_token: string) {
    try {
      const data = await fetchWithAuth(`${api.admin.payouts}/pending`);
      setPayouts(data);
    } catch (error) {
      console.error('Error fetching payouts:', error);
    }
  }

  const handleApprovePayout = async (payoutId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!confirm('Are you sure you want to approve this payout?')) return;

    try {
      const res = await fetch(api.admin.approvePayout(payoutId), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const result = await res.json();
        alert(`✅ ${result.message}`);
        fetchPayouts(token);
      } else {
        const error = await res.json();
        alert(`❌ Error: ${error.message || 'Failed to approve payout'}`);
      }
    } catch (error) {
      console.error('Error approving payout:', error);
      alert('Failed to approve payout');
    }
  };

  const handleRejectPayout = async (payoutId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!confirm('Are you sure you want to reject this payout? The gold will be unlocked.')) return;

    try {
      const res = await fetch(api.admin.rejectPayout(payoutId), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const result = await res.json();
        alert(`✅ ${result.message}`);
        fetchPayouts(token);
      } else {
        const error = await res.json();
        alert(`❌ Error: ${error.message || 'Failed to reject payout'}`);
      }
    } catch (error) {
      console.error('Error rejecting payout:', error);
      alert('Failed to reject payout');
    }
  };

  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(api.admin.pools, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: poolForm.name,
          totalGrams: parseFloat(poolForm.totalGrams),
          purity: poolForm.purity,
        }),
      });

      if (res.ok) {
        setShowCreatePool(false);
        setPoolForm({ name: '', totalGrams: '', purity: '24k' });
        fetchAllData(token);
        alert('Pool created successfully!');
      } else {
        const error = await res.json();
        alert(`Error: ${error.message || 'Failed to create pool'}`);
      }
    } catch (error) {
      console.error('Error creating pool:', error);
      alert('Failed to create pool');
    }
  };

  const handleSetPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(api.admin.createPrice, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          buyPricePerGram: parseFloat(priceForm.buyPricePerGram),
          sellPricePerGram: parseFloat(priceForm.sellPricePerGram),
        }),
      });

      if (res.ok) {
        setShowSetPrice(false);
        setPriceForm({ buyPricePerGram: '', sellPricePerGram: '' });
        fetchAllData(token);
        alert('Price updated successfully!');
      } else {
        const error = await res.json();
        alert(`Error: ${error.message || 'Failed to set price'}`);
      }
    } catch (error) {
      console.error('Error setting price:', error);
      alert('Failed to set price');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">⚡</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Gold Wallet Management</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-sm inline-flex">
            {(['overview', 'pools', 'prices', 'payouts'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'payouts' && payouts.length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {payouts.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-amber-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Pools</h3>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalPools || 0}</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-amber-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Gold</h3>
                <p className="text-3xl font-bold text-yellow-600">{stats?.totalGoldGrams?.toFixed(3) || 0}g</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-amber-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Available Gold</h3>
                <p className="text-3xl font-bold text-green-600">{stats?.availableGoldGrams?.toFixed(3) || 0}g</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg border border-amber-100 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🔒</span>
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Allocated Gold</h3>
                <p className="text-3xl font-bold text-purple-600">{stats?.allocatedGoldGrams?.toFixed(3) || 0}g</p>
              </div>
            </div>

            {/* Current Pricing */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-amber-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Current Pricing</h2>
              {currentPrice ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-2xl">💰</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Buy Price</p>
                      <p className="text-2xl font-bold text-green-700">KES {currentPrice.buyPricePerGram}/g</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-2xl">💸</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sell Price</p>
                      <p className="text-2xl font-bold text-blue-700">KES {currentPrice.sellPricePerGram}/g</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No pricing data available</p>
              )}
            </div>
          </div>
        )}

        {/* Pools Tab */}
        {activeTab === 'pools' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Gold Pools</h2>
              <button
                onClick={() => setShowCreatePool(true)}
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-lg hover:from-yellow-500 hover:to-amber-600 transition-all font-medium shadow-md hover:shadow-lg"
              >
                + Create New Pool
              </button>
            </div>

            {pools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pools.map((pool) => (
                  <div key={pool.id} className="bg-white p-6 rounded-xl shadow-lg border border-amber-100 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">{pool.name}</h3>
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                        {pool.purity}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Gold:</span>
                        <span className="font-semibold text-gray-900">{pool.totalGrams.toFixed(3)}g</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Available:</span>
                        <span className="font-semibold text-green-600">{pool.availableGrams.toFixed(3)}g</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-amber-500 h-2 rounded-full transition-all"
                          style={{ width: `${(pool.availableGrams / pool.totalGrams) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {((pool.availableGrams / pool.totalGrams) * 100).toFixed(1)}% available
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl shadow-lg border border-amber-100 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📦</span>
                </div>
                <p className="text-gray-500">No pools created yet</p>
              </div>
            )}
          </div>
        )}

        {/* Prices Tab */}
        {activeTab === 'prices' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Price Management</h2>
              <button
                onClick={() => setShowSetPrice(true)}
                className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-lg hover:from-yellow-500 hover:to-amber-600 transition-all font-medium shadow-md hover:shadow-lg"
              >
                + Set New Price
              </button>
            </div>

            {currentPrice && (
              <div className="bg-white p-8 rounded-xl shadow-lg border border-amber-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Current Active Prices</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600">Buy Price (per gram)</label>
                    <div className="text-4xl font-bold text-green-700">KES {currentPrice.buyPricePerGram}</div>
                    <p className="text-sm text-gray-500">Customers buy at this price</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600">Sell Price (per gram)</label>
                    <div className="text-4xl font-bold text-blue-700">KES {currentPrice.sellPricePerGram}</div>
                    <p className="text-sm text-gray-500">Customers sell at this price</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Effective from:</span>{' '}
                    {new Date(currentPrice.effectiveFrom).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Pool Modal */}
      {showCreatePool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Pool</h2>
            <form onSubmit={handleCreatePool} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pool Name</label>
                <input
                  type="text"
                  required
                  value={poolForm.name}
                  onChange={(e) => setPoolForm({ ...poolForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="e.g., Pool 1 - 1kg 24k"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Grams</label>
                <input
                  type="number"
                  step="0.001"
                  required
                  value={poolForm.totalGrams}
                  onChange={(e) => setPoolForm({ ...poolForm, totalGrams: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purity</label>
                <select
                  value={poolForm.purity}
                  onChange={(e) => setPoolForm({ ...poolForm, purity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="24k">24k</option>
                  <option value="22k">22k</option>
                  <option value="18k">18k</option>
                </select>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreatePool(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-lg hover:from-yellow-500 hover:to-amber-600 transition-all font-medium shadow-md"
                >
                  Create Pool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payouts Tab */}
      {activeTab === 'payouts' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-amber-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Pending Payouts</h2>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                {payouts.length} Pending
              </span>
            </div>

            {payouts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">✅</span>
                </div>
                <p className="text-gray-500">No pending payouts</p>
                <p className="text-sm text-gray-400">All payouts have been processed</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payouts.map((payout) => (
                  <div key={payout.id} className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg border border-amber-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-2xl">💰</span>
                          <h3 className="text-lg font-bold text-gray-900">
                            KES {payout.amountKes.toLocaleString()}
                          </h3>
                          <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-medium">
                            {payout.status}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><strong>User:</strong> {payout.user.email}</p>
                          <p><strong>Phone:</strong> {payout.phone}</p>
                          <p><strong>Date:</strong> {new Date(payout.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprovePayout(payout.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleRejectPayout(payout.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-md"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-900 mb-2">ℹ️ Payout Instructions</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Approve:</strong> Processes the M-Pesa payout and completes the transaction</li>
              <li>• <strong>Reject:</strong> Cancels the payout and unlocks the user's gold</li>
              <li>• Verify the phone number before approving payouts</li>
              <li>• Once approved, the gold is removed from the user's balance</li>
            </ul>
          </div>
        </div>
      )}

      {/* Set Price Modal */}
      {showSetPrice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Set New Prices</h2>
            <form onSubmit={handleSetPrice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Buy Price (KES per gram)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={priceForm.buyPricePerGram}
                  onChange={(e) => setPriceForm({ ...priceForm, buyPricePerGram: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="8500"
                />
                <p className="text-xs text-gray-500 mt-1">Price customers pay to buy gold</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sell Price (KES per gram)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={priceForm.sellPricePerGram}
                  onChange={(e) => setPriceForm({ ...priceForm, sellPricePerGram: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="8000"
                />
                <p className="text-xs text-gray-500 mt-1">Price customers receive when selling gold</p>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowSetPrice(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-lg hover:from-yellow-500 hover:to-amber-600 transition-all font-medium shadow-md"
                >
                  Set Prices
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
