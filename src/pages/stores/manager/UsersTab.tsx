import { useMemo, useRef, useState } from 'react';
import { Check, Download, Plus, Search, Shield, Trash2, Upload, Users as UsersIcon, X } from 'lucide-react';
import { type AccessRule, type DistributorStore, type StoreUser } from '../../../data/storesData';
import { useStores } from '../../../context/StoresContext';
import { SAMPLE_USERS_CSV, csvToUsers, parseCsv, type CsvUserRow } from '../../../utils/csv';
import { card, input, label } from './shared';

const today = () => new Date().toISOString().slice(0, 10);

export function UsersTab({ store }: { store: DistributorStore }) {
  const { updateStore } = useStores();
  const fileRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [importRows, setImportRows] = useState<CsvUserRow[] | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const users = store.users.users;
  const roles = useMemo(() => [...new Set(users.map(u => u.role))].sort(), [users]);

  const filtered = useMemo(() => {
    let list = users;
    if (roleFilter !== 'all') list = list.filter(u => u.role === roleFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.includes(q) || (u.department ?? '').toLowerCase().includes(q));
    }
    return list;
  }, [users, roleFilter, query]);

  const patchUsers = (fn: (users: StoreUser[]) => StoreUser[]) =>
    updateStore(store.id, s => ({ users: { ...s.users, users: fn(s.users.users) } }));

  const handleCsv = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    setImportRows(csvToUsers(parseCsv(text)));
  };

  const commitImport = () => {
    if (!importRows) return;
    const valid = importRows.filter(r => r.valid);
    updateStore(store.id, s => {
      const existing = new Set(s.users.users.map(u => u.email));
      const added: StoreUser[] = valid
        .filter(r => !existing.has(r.email))
        .map((r, i) => ({
          id: `u-${Date.now().toString(36)}-${i}`,
          name: r.name, email: r.email, role: r.role, department: r.department,
          isAdmin: r.isAdmin, discountPct: r.discountPct, source: 'csv', addedAt: today(),
        }));
      // uploaded users are granted storefront access automatically
      return { users: { ...s.users, enabled: true, users: [...s.users.users, ...added] } };
    });
    setImportRows(null);
  };

  const sampleHref = `data:text/csv;charset=utf-8,${encodeURIComponent(SAMPLE_USERS_CSV)}`;

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="text-[13.5px] text-snp-navy-600">
          <b className="text-snp-navy-950">{users.length} user{users.length !== 1 ? 's' : ''}</b>
          {users.length > 0 && <> · {users.filter(u => u.isAdmin).length} admin{users.filter(u => u.isAdmin).length !== 1 ? 's' : ''} · {users.filter(u => u.discountPct).length} with discounts</>}
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          <a href={sampleHref} download="store-users-sample.csv"
            className="flex items-center gap-2 h-10 px-4 rounded-[10px] border border-snp-navy-200 bg-white text-[13px] font-semibold text-snp-navy-700 hover:bg-snp-navy-50">
            <Download className="w-3.5 h-3.5" /> Sample CSV
          </a>
          <button onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 h-10 px-4 rounded-[10px] border border-snp-navy-200 bg-white text-[13px] font-semibold text-snp-navy-700 hover:bg-snp-navy-50">
            <Upload className="w-3.5 h-3.5" /> Import CSV
          </button>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-[10px] text-white text-[13px] font-semibold hover:opacity-90"
            style={{ background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)' }}>
            <Plus className="w-4 h-4" /> Add user
          </button>
        </div>
      </div>
      <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={e => { handleCsv(e.target.files?.[0] ?? null); e.target.value = ''; }} />

      {users.length === 0 ? (
        <div className={`${card} py-16 text-center`}>
          <UsersIcon className="w-8 h-8 mx-auto mb-3 text-snp-navy-300" />
          <p className="text-[14.5px] font-bold text-snp-navy-800 mb-1">No users yet</p>
          <p className="text-[12.5px] text-snp-navy-500 max-w-sm mx-auto">
            Upload a CSV with names, emails, roles and discounts — everyone on the list gets storefront access
            when you switch “Who can shop” to <b>Approved email list</b> in Settings.
          </p>
        </div>
      ) : (
        <div className={`${card} overflow-hidden`}>
          <div className="px-5 py-3.5 flex items-center gap-3 flex-wrap border-b border-snp-navy-100">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-snp-navy-400" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search name, email or department…"
                className="w-full h-10 pl-9 pr-3 bg-white rounded-[10px] border border-snp-navy-200 text-[13px] outline-none focus:border-snp-indigo-500"
              />
            </div>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="h-10 px-3 bg-white rounded-[10px] border border-snp-navy-200 text-[12.5px] font-semibold text-snp-navy-700 outline-none"
            >
              <option value="all">All roles</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10.5px] font-bold uppercase tracking-wider text-snp-navy-400 border-b border-snp-navy-100 bg-snp-navy-50/50">
                <th className="py-2.5 pl-5">User</th><th className="py-2.5">Role</th><th className="py-2.5">Department</th>
                <th className="py-2.5 text-center">Discount</th><th className="py-2.5 text-center">Admin</th>
                <th className="py-2.5">Source</th><th className="py-2.5 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-snp-navy-50 last:border-0 text-[13px] hover:bg-snp-indigo-50/30">
                  <td className="py-2.5 pl-5">
                    <div className="font-bold text-snp-navy-950">{u.name}</div>
                    <div className="text-[11.5px] text-snp-navy-400">{u.email}</div>
                  </td>
                  <td className="py-2.5 text-snp-navy-700 font-medium">{u.role}</td>
                  <td className="py-2.5 text-snp-navy-500">{u.department ?? '—'}</td>
                  <td className="py-2.5 text-center">
                    <div className="inline-flex items-center gap-0.5">
                      <input
                        type="number" min={0} max={100}
                        value={u.discountPct ?? ''}
                        placeholder="—"
                        onChange={e => patchUsers(us => us.map(x => x.id === u.id
                          ? { ...x, discountPct: e.target.value ? Number(e.target.value) : undefined } : x))}
                        className="w-14 h-8 px-1.5 text-center rounded-[7px] border border-snp-navy-200 text-[12.5px] font-bold text-emerald-600 outline-none focus:border-snp-indigo-500"
                      />
                      <span className="text-[11px] text-snp-navy-400">%</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-center">
                    <input
                      type="checkbox" className="accent-[#7c3aed] w-4 h-4"
                      checked={u.isAdmin}
                      onChange={e => patchUsers(us => us.map(x => x.id === u.id ? { ...x, isAdmin: e.target.checked } : x))}
                    />
                  </td>
                  <td className="py-2.5">
                    <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${u.source === 'csv' ? 'bg-snp-navy-50 text-snp-navy-500' : 'bg-snp-indigo-50 text-snp-indigo-700'}`}>
                      {u.source === 'csv' ? 'CSV' : 'Manual'}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-right">
                    <button
                      title="Remove user"
                      onClick={() => patchUsers(us => us.filter(x => x.id !== u.id))}
                      className="w-7 h-7 rounded-[7px] text-snp-navy-300 hover:text-snp-red-600 inline-flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-10 text-center text-[13px] text-snp-navy-400">No users match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Access rules */}
      <RulesCard store={store} />

      {/* CSV import preview */}
      {importRows && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5" style={{ background: 'rgba(1,39,84,0.4)' }} onClick={() => setImportRows(null)}>
          <div className="w-full max-w-2xl bg-white rounded-[18px] p-6 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[19px] font-bold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>Review import</h3>
                <p className="text-[12.5px] text-snp-navy-500">
                  {importRows.filter(r => r.valid).length} of {importRows.length} rows valid · duplicates are skipped · imported users get storefront access
                </p>
              </div>
              <button onClick={() => setImportRows(null)} className="w-8 h-8 rounded-full bg-snp-navy-50 flex items-center justify-center text-snp-navy-500"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto rounded-[12px] border border-snp-navy-200">
              <table className="w-full text-left text-[12.5px]">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-wider text-snp-navy-400 bg-snp-navy-50/60 border-b border-snp-navy-100">
                    <th className="py-2 pl-3">Name</th><th className="py-2">Email</th><th className="py-2">Role</th>
                    <th className="py-2">Dept</th><th className="py-2 text-center">Discount</th><th className="py-2 text-center">Admin</th><th className="py-2 pr-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {importRows.map((r, i) => (
                    <tr key={i} className={`border-b border-snp-navy-50 last:border-0 ${!r.valid ? 'bg-red-50/60' : ''}`}>
                      <td className="py-2 pl-3 font-semibold text-snp-navy-900">{r.name}</td>
                      <td className="py-2 text-snp-navy-600">{r.email || '—'}</td>
                      <td className="py-2 text-snp-navy-600">{r.role}</td>
                      <td className="py-2 text-snp-navy-500">{r.department ?? '—'}</td>
                      <td className="py-2 text-center text-emerald-600 font-bold">{r.discountPct ? `${r.discountPct}%` : '—'}</td>
                      <td className="py-2 text-center">{r.isAdmin ? '✓' : '—'}</td>
                      <td className="py-2 pr-3 text-right">
                        {r.valid
                          ? <span className="text-[10.5px] font-bold text-emerald-600">OK</span>
                          : <span className="text-[10.5px] font-bold text-red-500">{r.problem}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-2.5 mt-4">
              <button onClick={() => setImportRows(null)} className="h-11 px-5 rounded-[10px] border border-snp-navy-200 text-[13px] font-semibold text-snp-navy-700">Cancel</button>
              <button
                disabled={!importRows.some(r => r.valid)}
                onClick={commitImport}
                className="flex items-center gap-2 h-11 px-6 rounded-[10px] text-white text-[13px] font-bold disabled:opacity-40 hover:opacity-90"
                style={{ background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)' }}
              >
                <Check className="w-4 h-4" /> Import {importRows.filter(r => r.valid).length} users
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdd && <AddUserModal store={store} onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function RulesCard({ store }: { store: DistributorStore }) {
  const { updateStore } = useStores();
  const rules = store.users.rules;

  const patchRules = (fn: (rules: AccessRule[]) => AccessRule[]) =>
    updateStore(store.id, s => ({ users: { ...s.users, rules: fn(s.users.rules) } }));

  const addRule = () => patchRules(rs => [...rs, {
    id: `r-${Date.now().toString(36)}`, field: 'role', value: '', effect: 'discount', discountPct: 10,
  }]);

  const sel = 'h-9 px-2 bg-white rounded-[8px] border border-snp-navy-200 text-[12px] font-semibold text-snp-navy-800 outline-none focus:border-snp-indigo-500';

  return (
    <div className={`${card} p-5`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[15px] font-bold text-snp-navy-950 flex items-center gap-2"><Shield className="w-4 h-4 text-snp-indigo-700" /> Rule-based permissions</span>
        <button onClick={addRule} className="text-[12.5px] font-semibold text-snp-indigo-700 flex items-center gap-1.5 hover:text-snp-indigo-800">
          <Plus className="w-3.5 h-3.5" /> Add rule
        </button>
      </div>
      <p className="text-[12px] text-snp-navy-500 mb-4">Applied automatically at checkout on top of individual user settings.</p>
      {rules.length === 0 ? (
        <p className="text-[12.5px] text-snp-navy-400">No rules — e.g. “everyone with a @club.org email gets 10% off”.</p>
      ) : (
        <div className="space-y-2">
          {rules.map(r => (
            <div key={r.id} className="flex items-center gap-2 flex-wrap text-[12.5px] text-snp-navy-600">
              <span>If</span>
              <select className={sel} value={r.field} onChange={e => patchRules(rs => rs.map(x => x.id === r.id ? { ...x, field: e.target.value as AccessRule['field'] } : x))}>
                <option value="role">role</option>
                <option value="department">department</option>
                <option value="emailDomain">email domain</option>
              </select>
              <span>is</span>
              <input
                className="h-9 px-2.5 w-40 bg-white rounded-[8px] border border-snp-navy-200 text-[12px] font-semibold outline-none focus:border-snp-indigo-500"
                placeholder={r.field === 'emailDomain' ? 'club.org' : r.field === 'role' ? 'Coach' : 'Field Ops'}
                value={r.value}
                onChange={e => patchRules(rs => rs.map(x => x.id === r.id ? { ...x, value: e.target.value } : x))}
              />
              <span>→</span>
              <select className={sel} value={r.effect} onChange={e => patchRules(rs => rs.map(x => x.id === r.id ? { ...x, effect: e.target.value as AccessRule['effect'] } : x))}>
                <option value="discount">apply discount</option>
                <option value="grant-admin">grant admin</option>
              </select>
              {r.effect === 'discount' && (
                <span className="flex items-center gap-1">
                  <input
                    type="number" min={1} max={100}
                    className="h-9 w-16 px-2 bg-white rounded-[8px] border border-snp-navy-200 text-[12px] font-bold text-emerald-600 text-center outline-none"
                    value={r.discountPct ?? 10}
                    onChange={e => patchRules(rs => rs.map(x => x.id === r.id ? { ...x, discountPct: Number(e.target.value) } : x))}
                  />%
                </span>
              )}
              <button onClick={() => patchRules(rs => rs.filter(x => x.id !== r.id))} className="w-7 h-7 rounded-[7px] text-snp-navy-300 hover:text-snp-red-600 flex items-center justify-center">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddUserModal({ store, onClose }: { store: DistributorStore; onClose: () => void }) {
  const { updateStore } = useStores();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');
  const [department, setDepartment] = useState('');
  const [discountPct, setDiscountPct] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && name.trim().length > 1
    && !store.users.users.some(u => u.email === email.trim().toLowerCase());

  const add = () => {
    updateStore(store.id, s => ({
      users: {
        ...s.users,
        enabled: true,
        users: [...s.users.users, {
          id: `u-${Date.now().toString(36)}`,
          name: name.trim(), email: email.trim().toLowerCase(), role: role.trim() || 'Member',
          department: department.trim() || undefined,
          discountPct: discountPct ? Number(discountPct) : undefined,
          isAdmin, source: 'manual', addedAt: today(),
        }],
      },
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5" style={{ background: 'rgba(1,39,84,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-[18px] p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[19px] font-bold text-snp-navy-950" style={{ fontFamily: "'Clash Display', sans-serif" }}>Add user</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-snp-navy-50 flex items-center justify-center text-snp-navy-500"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-3.5">
          <div><label className={label}>Full name</label><input className={input} value={name} onChange={e => setName(e.target.value)} autoFocus /></div>
          <div><label className={label}>Email</label><input className={input} type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={label}>Role</label><input className={input} value={role} onChange={e => setRole(e.target.value)} /></div>
            <div><label className={label}>Department</label><input className={input} value={department} onChange={e => setDepartment(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3 items-end">
            <div><label className={label}>Discount %</label><input className={input} type="number" min={0} max={100} placeholder="None" value={discountPct} onChange={e => setDiscountPct(e.target.value)} /></div>
            <label className="flex items-center gap-2.5 h-11 cursor-pointer text-[13px] font-semibold text-snp-navy-800">
              <input type="checkbox" className="accent-[#7c3aed] w-4 h-4" checked={isAdmin} onChange={e => setIsAdmin(e.target.checked)} />
              Administrator
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2.5 mt-6">
          <button onClick={onClose} className="h-11 px-5 rounded-[10px] border border-snp-navy-200 text-[13px] font-semibold text-snp-navy-700">Cancel</button>
          <button
            disabled={!valid}
            onClick={add}
            className="h-11 px-6 rounded-[10px] text-white text-[13px] font-bold disabled:opacity-40 hover:opacity-90"
            style={{ background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)' }}
          >
            Add user
          </button>
        </div>
      </div>
    </div>
  );
}
