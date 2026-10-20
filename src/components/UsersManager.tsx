import React, { useState } from 'react';
import { UserProfile, BotRole } from '../types';
import {
  Users,
  Search,
  Crown,
  Shield,
  User,
  PlusCircle,
  MinusCircle,
  Coins,
  Package,
  Award
} from 'lucide-react';

interface UsersManagerProps {
  users: UserProfile[];
  onUpdateUser: (uid: string, updates: Partial<UserProfile>) => Promise<boolean>;
}

export const UsersManager: React.FC<UsersManagerProps> = ({ users, onUpdateUser }) => {
  const [search, setSearch] = useState('');
  const [editingUID, setEditingUID] = useState<string | null>(null);
  const [moneyAmount, setMoneyAmount] = useState<string>('5000');
  const [selectedInventoryUser, setSelectedInventoryUser] = useState<UserProfile | null>(null);

  const filteredUsers = users.filter((u) => {
    return (
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.uid.includes(search)
    );
  });

  const handleRoleChange = async (uid: string, newRole: BotRole) => {
    await onUpdateUser(uid, { role: newRole });
  };

  const handleAddMoney = async (user: UserProfile) => {
    const amt = parseInt(moneyAmount, 10);
    if (isNaN(amt) || amt <= 0) return;
    await onUpdateUser(user.uid, { balance: user.balance + amt });
    setEditingUID(null);
  };

  const handleDeductMoney = async (user: UserProfile) => {
    const amt = parseInt(moneyAmount, 10);
    if (isNaN(amt) || amt <= 0) return;
    await onUpdateUser(user.uid, { balance: Math.max(0, user.balance - amt) });
    setEditingUID(null);
  };

  const totalEconomyWealth = users.reduce((acc, u) => acc + u.balance + u.bank, 0);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Top Economy Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono">{users.length}</div>
            <div className="text-xs text-slate-400">Total Registered Users</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-400 font-mono">
              ${totalEconomyWealth.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400">Total Currency Circulation</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-purple-400 font-mono">
              {users.filter(u => u.role === 1 || u.role === 2).length}
            </div>
            <div className="text-xs text-slate-400">Privileged Staff (Admins/Owner)</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user name or Facebook UID..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Persistent state: <span className="text-emerald-400">data/users.json</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              <tr>
                <th className="px-5 py-3.5">User & Facebook UID</th>
                <th className="px-5 py-3.5">Role Permission</th>
                <th className="px-5 py-3.5">Wallet / Bank</th>
                <th className="px-5 py-3.5">Level & Streak</th>
                <th className="px-5 py-3.5">Games Won/Played</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((user) => {
                const isEditing = editingUID === user.uid;
                const roleBadge = user.role === 2
                  ? { label: '👑 Owner (2)', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' }
                  : user.role === 1
                  ? { label: '🛡️ Admin (1)', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' }
                  : { label: '🌐 Member (0)', bg: 'bg-slate-800 text-slate-300 border-slate-700' };

                return (
                  <tr key={user.uid} className="hover:bg-slate-800/30 transition">
                    {/* User Info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-400">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-200">{user.name}</div>
                          <div className="text-[11px] font-mono text-slate-500">{user.uid}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role Dropdown */}
                    <td className="px-5 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.uid, parseInt(e.target.value, 10) as BotRole)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium bg-slate-950 focus:outline-none cursor-pointer ${roleBadge.bg}`}
                      >
                        <option value={0}>Role 0: Member (All)</option>
                        <option value={1}>Role 1: Bot Admin</option>
                        <option value={2}>Role 2: Owner Only</option>
                      </select>
                    </td>

                    {/* Balances */}
                    <td className="px-5 py-4">
                      <div className="font-mono">
                        <div className="text-emerald-400 font-semibold">💵 ${user.balance.toLocaleString()}</div>
                        <div className="text-slate-400 text-[11px]">🏛️ ${user.bank.toLocaleString()}</div>
                      </div>
                    </td>

                    {/* Level */}
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-200">Level {user.level}</div>
                        <div className="text-[11px] text-slate-400">{user.dailyStreak}d daily streak</div>
                      </div>
                    </td>

                    {/* Games Stats */}
                    <td className="px-5 py-4">
                      <div className="font-mono text-slate-300">
                        {user.stats?.gamesWon || 0}W / {user.stats?.gamesPlayed || 0}P
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.inventory && Object.keys(user.inventory).length > 0 && (
                          <button
                            onClick={() => setSelectedInventoryUser(user)}
                            className="p-1.5 text-slate-400 hover:text-indigo-300 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800"
                            title="Inspect Inventory"
                          >
                            <Package className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => setEditingUID(isEditing ? null : user.uid)}
                          className="px-2.5 py-1 bg-slate-950 hover:bg-indigo-950/40 text-indigo-400 rounded-lg border border-indigo-500/30 text-xs font-medium"
                        >
                          {isEditing ? 'Cancel' : 'Manage $'}
                        </button>
                      </div>

                      {/* Currency Adjust Flyout */}
                      {isEditing && (
                        <div className="mt-2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl inline-flex items-center gap-2 shadow-2xl">
                          <input
                            type="number"
                            value={moneyAmount}
                            onChange={(e) => setMoneyAmount(e.target.value)}
                            className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none"
                            placeholder="Amount"
                          />
                          <button
                            onClick={() => handleAddMoney(user)}
                            className="p-1 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-md text-xs flex items-center gap-1 px-2"
                            title="Add Balance"
                          >
                            <PlusCircle className="w-3 h-3" /> Add
                          </button>
                          <button
                            onClick={() => handleDeductMoney(user)}
                            className="p-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded-md text-xs flex items-center gap-1 px-2"
                            title="Deduct Balance"
                          >
                            <MinusCircle className="w-3 h-3" /> Deduct
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Modal */}
      {selectedInventoryUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-400" />
                <span>{selectedInventoryUser.name}'s Inventory</span>
              </h3>
              <button
                onClick={() => setSelectedInventoryUser(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 max-h-80 overflow-y-auto">
              {Object.entries(selectedInventoryUser.inventory || {}).map(([cat, items]) => (
                <div key={cat} className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-xs font-semibold uppercase text-indigo-400 mb-2">{cat}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(items).map(([itemName, count]) => (
                      <div key={itemName} className="flex justify-between p-1.5 bg-slate-900 rounded border border-slate-800/80">
                        <span className="text-slate-300">{itemName}</span>
                        <span className="font-mono text-emerald-400">x{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedInventoryUser(null)}
              className="mt-5 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
