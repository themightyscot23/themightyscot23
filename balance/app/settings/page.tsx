'use client';

import { useEffect, useState } from 'react';
import { Trash2, RefreshCw, Building2, CreditCard, Wallet } from 'lucide-react';
import { PlaidLinkButton } from '@/components/PlaidLinkButton';
import { Account, PlaidItem } from '@/lib/types';

interface AccountWithInstitution extends Account {
  institution_name?: string;
}

export default function SettingsPage() {
  const [accounts, setAccounts] = useState<AccountWithInstitution[]>([]);
  const [items, setItems] = useState<PlaidItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [deletingItem, setDeletingItem] = useState<string | null>(null);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/plaid/accounts');
      const data = await res.json();
      setAccounts(data.accounts || []);
      setItems(data.items || []);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch('/api/plaid/sync-transactions', { method: 'POST' });
      alert('Sync complete!');
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async (itemId: string) => {
    if (!confirm('Are you sure you want to disconnect this account? All transaction history will be deleted.')) {
      return;
    }

    setDeletingItem(itemId);
    try {
      await fetch(`/api/plaid/accounts?item_id=${itemId}`, { method: 'DELETE' });
      await fetchAccounts();
    } catch (error) {
      console.error('Failed to disconnect:', error);
      alert('Failed to disconnect account. Please try again.');
    } finally {
      setDeletingItem(null);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const getAccountIcon = (type: string | null) => {
    switch (type) {
      case 'credit':
        return CreditCard;
      case 'depository':
        return Wallet;
      default:
        return Building2;
    }
  };

  // Group accounts by institution
  const accountsByItem = items.map((item) => ({
    item,
    accounts: accounts.filter((a) => a.plaid_item_id === item.id),
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your connected accounts</p>
      </div>

      {/* Connected Accounts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Connected Accounts</h2>
            <div className="flex gap-3">
              <button
                onClick={handleSync}
                disabled={syncing || items.length === 0}
                className="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync All'}
              </button>
              <PlaidLinkButton onSuccess={fetchAccounts} />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-40 mb-3" />
                <div className="space-y-2">
                  <div className="h-12 bg-gray-100 rounded" />
                  <div className="h-12 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : accountsByItem.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No accounts connected yet</p>
            <p className="text-sm">Click &quot;Connect Bank Account&quot; to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {accountsByItem.map(({ item, accounts }) => (
              <div key={item.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {item.institution_name || 'Unknown Institution'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Connected {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDisconnect(item.id)}
                    disabled={deletingItem === item.id}
                    className="inline-flex items-center px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {deletingItem === item.id ? 'Removing...' : 'Disconnect'}
                  </button>
                </div>

                <div className="space-y-2">
                  {accounts.map((account) => {
                    const Icon = getAccountIcon(account.type);
                    return (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                            <Icon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {account.name || account.official_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {account.subtype} {account.mask && `••••${account.mask}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Environment Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Environment</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Plaid Environment</span>
            <span className="font-mono text-gray-900">
              {process.env.NEXT_PUBLIC_PLAID_ENV || 'sandbox'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Database</span>
            <span className="font-mono text-gray-900">SQLite (local)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
