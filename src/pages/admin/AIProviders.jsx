import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as adminService from '../../services/adminService.js';
import { usePlan } from '../../hooks/usePlan.js';

const EMPTY_PROVIDER = {
  label: '', base_url: '', api_key: '', model: '',
  temperature: 0.7, max_tokens: 4096, supports_json_mode: true,
  is_reasoning: false, estimated_latency_seconds: 15, notes: '',
};

// Admin UI: kelola AI provider (ganti model/key sesuka hati tanpa redeploy).
export function AIProviders() {
  const navigate = useNavigate();
  const { showToast } = usePlan();

  const [allowed, setAllowed] = useState(null); // null=checking
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // provider obj atau null
  const [showForm, setShowForm] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setProviders(await adminService.listProviders());
    } catch (e) {
      showToast(e.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let active = true;
    adminService.checkIsAdmin().then((ok) => {
      if (!active) return;
      setAllowed(ok);
      if (ok) refresh();
    });
    return () => { active = false; };
  }, [refresh]);

  const openCreate = () => { setEditing({ ...EMPTY_PROVIDER }); setShowForm(true); };
  const openEdit = (p) => { setEditing({ ...p, api_key: '' }); setShowForm(true); };

  const handleSave = async () => {
    try {
      if (editing.id) {
        await adminService.updateProvider(editing.id, editing);
        showToast('Provider diperbarui.');
      } else {
        await adminService.createProvider(editing);
        showToast('Provider ditambahkan.');
      }
      setShowForm(false);
      setEditing(null);
      refresh();
    } catch (e) {
      showToast(e.message, { variant: 'error' });
    }
  };

  const handleActivate = async (id) => {
    try { await adminService.setActiveProvider(id); showToast('Provider aktif diubah.'); refresh(); }
    catch (e) { showToast(e.message, { variant: 'error' }); }
  };
  const handleFallback = async (id) => {
    try { await adminService.setFallbackProvider(id); showToast('Fallback diubah.'); refresh(); }
    catch (e) { showToast(e.message, { variant: 'error' }); }
  };
  const handleDelete = async (id) => {
    if (!confirm('Hapus provider ini?')) return;
    try { await adminService.deleteProvider(id); showToast('Provider dihapus.'); refresh(); }
    catch (e) { showToast(e.message, { variant: 'error' }); }
  };

  if (allowed === null) {
    return <div className="flex justify-center py-24"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span></div>;
  }
  if (!allowed) {
    return (
      <div className="max-w-lg mx-auto px-5 py-20 text-center">
        <span className="material-symbols-outlined text-5xl text-error mb-4">lock</span>
        <h1 className="font-headline-md text-headline-md text-on-surface mb-2">Khusus Admin</h1>
        <p className="text-on-surface-variant text-sm mb-6">Halaman ini hanya untuk admin CookPlan.</p>
        <button onClick={() => navigate('/generate')} className="px-6 py-3 bg-primary text-on-primary rounded-full font-semibold text-sm cursor-pointer">Kembali</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 md:px-10 py-8 md:py-12 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline-lg text-headline-lg text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-3xl">settings_suggest</span>
          AI Provider
        </h1>
        <button onClick={openCreate} className="px-4 py-2.5 bg-primary text-on-primary rounded-full font-semibold text-sm cursor-pointer inline-flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[20px]">add</span> Tambah
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><span className="material-symbols-outlined animate-spin text-3xl text-primary">progress_activity</span></div>
      ) : (
        <div className="space-y-3">
          {providers.map((p) => (
            <div key={p.id} className={`rounded-2xl border p-4 ${p.is_active ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-outline-variant'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-on-surface">{p.label}</span>
                    {p.is_active && <span className="text-[10px] font-bold uppercase bg-primary text-white px-2 py-0.5 rounded-full">Aktif</span>}
                    {p.is_fallback && <span className="text-[10px] font-bold uppercase bg-secondary text-white px-2 py-0.5 rounded-full">Fallback</span>}
                    {p.is_reasoning && <span className="text-[10px] font-bold uppercase bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full">Thinking</span>}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1 truncate">{p.model}</p>
                  <p className="text-xs text-on-surface-variant/70 truncate">{p.base_url}</p>
                  <p className="text-xs text-on-surface-variant/70">key: {p.api_key || '(kosong)'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {!p.is_active && <button onClick={() => handleActivate(p.id)} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-primary text-primary hover:bg-primary/10 cursor-pointer">Jadikan Aktif</button>}
                {!p.is_fallback && <button onClick={() => handleFallback(p.id)} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-secondary text-secondary hover:bg-secondary/10 cursor-pointer">Jadikan Fallback</button>}
                <button onClick={() => openEdit(p)} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-low cursor-pointer">Edit</button>
                <button onClick={() => handleDelete(p.id)} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-error/40 text-error hover:bg-error/10 cursor-pointer">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && editing && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-on-surface/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-3xl p-6 max-h-[90dvh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-headline-md text-headline-md text-primary mb-4">{editing.id ? 'Edit Provider' : 'Tambah Provider'}</h2>
            <div className="space-y-3">
              <AdminInput label="Label" value={editing.label} onChange={(v) => setEditing({ ...editing, label: v })} placeholder="Sonnet 4.5 Thinking" />
              <AdminInput label="Base URL" value={editing.base_url} onChange={(v) => setEditing({ ...editing, base_url: v })} placeholder="https://9router.../v1" />
              <AdminInput label="Model" value={editing.model} onChange={(v) => setEditing({ ...editing, model: v })} placeholder="anthropic/claude-sonnet-4.5" />
              <AdminInput label={editing.id ? 'API Key (kosongkan jika tidak ganti)' : 'API Key'} value={editing.api_key} onChange={(v) => setEditing({ ...editing, api_key: v })} placeholder="sk-..." type="password" />
              <div className="grid grid-cols-2 gap-3">
                <AdminInput label="Temperature" type="number" value={editing.temperature} onChange={(v) => setEditing({ ...editing, temperature: Number(v) })} />
                <AdminInput label="Max Tokens" type="number" value={editing.max_tokens} onChange={(v) => setEditing({ ...editing, max_tokens: Number(v) })} />
              </div>
              <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
                <input type="checkbox" checked={editing.is_reasoning} onChange={(e) => setEditing({ ...editing, is_reasoning: e.target.checked })} />
                Reasoning model (thinking)
              </label>
              <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
                <input type="checkbox" checked={editing.supports_json_mode} onChange={(e) => setEditing({ ...editing, supports_json_mode: e.target.checked })} />
                Dukung JSON mode
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 border border-outline-variant text-on-surface-variant rounded-full font-semibold text-sm cursor-pointer">Batal</button>
              <button onClick={handleSave} className="flex-1 py-3 bg-primary text-on-primary rounded-full font-semibold text-sm cursor-pointer">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminInput({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-on-surface mb-1">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl bg-white border border-outline-variant text-base focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
      />
    </label>
  );
}
