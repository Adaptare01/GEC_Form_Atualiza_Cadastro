import { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';

// ─── Design Tokens (GEC) ─────────────────────────────────────────────────────
const C = {
  bg: '#f5f0ef',
  bgCard: '#ffffff',
  primary: '#E53935',
  primaryLight: '#fdecea',
  primaryBorder: '#f5c6c5',
  text: '#1a1a1a',
  textSub: '#6b6b6b',
  textMuted: '#aaaaaa',
  border: '#e8e0df',
  inputBg: '#f8f4f3',
  inputBorder: '#ddd6d5',
  success: '#2e7d32',
  successBg: '#e8f5e9',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d: string | null) => {
  if (!d) return '—';
  try { const [y, m, day] = d.slice(0, 10).split('-'); return `${day}/${m}/${y}`; }
  catch { return d; }
};
const fmtCpf = (cpf: string) => {
  if (!cpf) return '—';
  const n = cpf.replace(/\D/g, '');
  return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};
const toDateInput = (d: string | null) => d ? d.slice(0, 10) : '';

// ─── Export ───────────────────────────────────────────────────────────────────
function exportToXlsx(socios: Socio[]) {
  const rows: Record<string, string>[] = [];

  for (const s of socios) {
    const base = {
      'Nome do Sócio': s.full_name || '',
      'CPF': fmtCpf(s.cpf),
      'RG': s.rg || '',
      'Nascimento': fmtDate(s.dob),
      'E-mail': s.email || '',
      'WhatsApp': s.whatsapp || '',
      'Cidade': s.city || '',
      'Bairro': s.neighborhood || '',
      'Endereço': s.address || '',
      'Empresa': s.empresa || '',
      'Cargo/Profissão': s.cargo || '',
      'Tel. Comercial': s.telefone_trabalho || '',
      'Cônjuge': s.nome_conjuge || '',
      'Nasc. Cônjuge': fmtDate(s.data_nasc_conjuge),
      'Cadastro em': fmtDate(s.created_at),
      'Dependente': '',
      'Parentesco': '',
      'Nasc. Dependente': '',
    };

    if (s.dependentes.length === 0) {
      rows.push(base);
    } else {
      s.dependentes.forEach((dep, i) => {
        rows.push({
          ...base,
          // Após a primeira linha do sócio, limpa os campos dele para não repetir
          ...(i > 0 ? {
            'Nome do Sócio': '',
            'CPF': '',
            'RG': '',
            'Nascimento': '',
            'E-mail': '',
            'WhatsApp': '',
            'Cidade': '',
            'Bairro': '',
            'Endereço': '',
            'Empresa': '',
            'Cargo/Profissão': '',
            'Tel. Comercial': '',
            'Cônjuge': '',
            'Nasc. Cônjuge': '',
            'Cadastro em': '',
          } : {}),
          'Dependente': dep.nome_dependente || '',
          'Parentesco': dep.parentesco || '',
          'Nasc. Dependente': fmtDate(dep.data_nascimento),
        });
      });
    }
  }

  const ws = XLSX.utils.json_to_sheet(rows);

  // Largura das colunas
  ws['!cols'] = [
    { wch: 30 }, { wch: 16 }, { wch: 14 }, { wch: 12 }, { wch: 28 },
    { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 28 }, { wch: 22 },
    { wch: 18 }, { wch: 16 }, { wch: 24 }, { wch: 14 }, { wch: 14 },
    { wch: 28 }, { wch: 16 }, { wch: 16 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sócios');
  XLSX.writeFile(wb, `GEC_Socios_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Dependente {
  id?: number;
  socio_id?: string;
  nome_dependente: string;
  data_nascimento: string;
  parentesco: string;
}
interface Socio {
  id: string; full_name: string; cpf: string; rg: string; dob: string;
  email: string; whatsapp: string; street: string; address: string;
  neighborhood: string; city: string; empresa: string; cargo: string;
  telefone_trabalho: string; nome_conjuge: string; data_nasc_conjuge: string;
  created_at: string; dependentes: Dependente[];
}

// ─── Shared UI ────────────────────────────────────────────────────────────────
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>
      {label}
    </label>
    {children}
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} style={{
    width: '100%', boxSizing: 'border-box',
    background: C.inputBg, border: `1.5px solid ${C.inputBorder}`,
    borderRadius: 10, padding: '10px 13px',
    color: C.text, fontSize: 14, outline: 'none',
    fontFamily: 'inherit',
    ...props.style,
  }}
    onFocus={e => { e.target.style.borderColor = C.primary; e.target.style.background = '#fff'; }}
    onBlur={e => { e.target.style.borderColor = C.inputBorder; e.target.style.background = C.inputBg; }}
  />
);

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Credenciais inválidas'); }
      else onLogin();
    } catch { setError('Erro de conexão. Tente novamente.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64, background: C.primary,
            borderRadius: 18, display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(229,57,53,0.3)',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
          </div>
          <div style={{ color: C.textMuted, fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
            GEC · Grêmio Esportivo Comercial
          </div>
          <h1 style={{ color: C.text, fontSize: 24, fontWeight: 800, margin: 0 }}>
            Painel Admin
          </h1>
          <p style={{ color: C.textSub, fontSize: 14, marginTop: 6 }}>
            Gestão de sócios · Recadastramento 2025
          </p>
        </div>

        <div style={{
          background: C.bgCard, borderRadius: 20,
          border: `1px solid ${C.border}`,
          padding: '32px 28px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          <form onSubmit={handleSubmit}>
            <Field label="E-mail">
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com" />
            </Field>
            <Field label="Senha">
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
            </Field>

            {error && (
              <div style={{
                background: C.primaryLight, border: `1px solid ${C.primaryBorder}`,
                borderRadius: 10, padding: '10px 14px',
                color: C.primary, fontSize: 13, marginBottom: 16,
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', background: loading ? '#e57373' : C.primary,
              border: 'none', borderRadius: 12, color: '#fff',
              fontSize: 15, fontWeight: 700, padding: '13px',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(229,57,53,0.3)',
              transition: 'all 0.2s',
            }}>
              {loading ? 'Entrando...' : 'Entrar →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ socio, onClose, onSave }: { socio: Socio; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState<Socio>({ ...socio });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'pessoal' | 'profissional' | 'dependentes'>('pessoal');

  const set = (f: keyof Socio, v: any) => setForm(p => ({ ...p, [f]: v }));
  const setDep = (i: number, f: keyof Dependente, v: string) => {
    const d = [...form.dependentes];
    d[i] = { ...d[i], [f]: v };
    setForm(p => ({ ...p, dependentes: d }));
  };
  const addDep = () => setForm(p => ({ ...p, dependentes: [...p.dependentes, { nome_dependente: '', data_nascimento: '', parentesco: '' }] }));
  const removeDep = (i: number) => setForm(p => ({ ...p, dependentes: p.dependentes.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/admin/socio/${form.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        credentials: 'include', body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      onSave();
    } catch { setError('Erro ao salvar. Tente novamente.'); }
    finally { setSaving(false); }
  };

  const tabStyle = (t: string): React.CSSProperties => ({
    flex: 1, padding: '9px 0', border: 'none', borderRadius: 10,
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
    background: tab === t ? C.primary : 'transparent',
    color: tab === t ? '#fff' : C.textSub,
    transition: 'all 0.15s',
  });

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div style={{
      fontSize: 11, fontWeight: 700, color: C.primary,
      textTransform: 'uppercase', letterSpacing: '0.08em',
      margin: '20px 0 12px', paddingBottom: 6,
      borderBottom: `1.5px solid ${C.primaryLight}`,
    }}>{children}</div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: C.bgCard, borderRadius: 20,
        border: `1px solid ${C.border}`,
        width: '100%', maxWidth: 680, maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: `1px solid ${C.border}`,
          position: 'sticky', top: 0, background: C.bgCard, zIndex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ color: C.text, fontSize: 18, fontWeight: 800, margin: 0 }}>Editar Sócio</h2>
            <p style={{ color: C.textSub, fontSize: 13, margin: '2px 0 0' }}>{socio.full_name}</p>
          </div>
          <button onClick={onClose} style={{
            background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10,
            color: C.textSub, padding: '6px 12px', cursor: 'pointer', fontSize: 16, fontWeight: 600,
          }}>✕</button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {/* Tabs */}
          <div style={{
            display: 'flex', gap: 4, background: C.bg,
            borderRadius: 12, padding: 4, marginBottom: 20,
          }}>
            <button style={tabStyle('pessoal')} onClick={() => setTab('pessoal')}>Pessoal</button>
            <button style={tabStyle('profissional')} onClick={() => setTab('profissional')}>Profissional</button>
            <button style={tabStyle('dependentes')} onClick={() => setTab('dependentes')}>
              Dependentes {form.dependentes.length > 0 && `(${form.dependentes.length})`}
            </button>
          </div>

          {tab === 'pessoal' && (
            <>
              <SectionTitle>Identificação</SectionTitle>
              <Field label="Nome Completo">
                <Input value={form.full_name || ''} onChange={e => set('full_name', e.target.value)} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="CPF"><Input value={form.cpf || ''} onChange={e => set('cpf', e.target.value)} /></Field>
                <Field label="RG"><Input value={form.rg || ''} onChange={e => set('rg', e.target.value)} /></Field>
                <Field label="Data de Nascimento">
                  <Input type="date" value={toDateInput(form.dob)} onChange={e => set('dob', e.target.value)} />
                </Field>
              </div>

              <SectionTitle>Contato</SectionTitle>
              <Field label="E-mail">
                <Input type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} />
              </Field>
              <Field label="WhatsApp">
                <Input value={form.whatsapp || ''} onChange={e => set('whatsapp', e.target.value)} />
              </Field>

              <SectionTitle>Endereço</SectionTitle>
              <Field label="Rua / Avenida / Número">
                <Input value={form.address || ''} onChange={e => set('address', e.target.value)} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Bairro"><Input value={form.neighborhood || ''} onChange={e => set('neighborhood', e.target.value)} /></Field>
                <Field label="Cidade"><Input value={form.city || ''} onChange={e => set('city', e.target.value)} /></Field>
              </div>

              <SectionTitle>Cônjuge</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Nome do Cônjuge">
                  <Input value={form.nome_conjuge || ''} onChange={e => set('nome_conjuge', e.target.value)} />
                </Field>
                <Field label="Nascimento do Cônjuge">
                  <Input type="date" value={toDateInput(form.data_nasc_conjuge)} onChange={e => set('data_nasc_conjuge', e.target.value)} />
                </Field>
              </div>
            </>
          )}

          {tab === 'profissional' && (
            <>
              <SectionTitle>Dados Profissionais</SectionTitle>
              <Field label="Empresa">
                <Input value={form.empresa || ''} onChange={e => set('empresa', e.target.value)} />
              </Field>
              <Field label="Profissão / Cargo">
                <Input value={form.cargo || ''} onChange={e => set('cargo', e.target.value)} />
              </Field>
              <Field label="Telefone Comercial">
                <Input value={form.telefone_trabalho || ''} onChange={e => set('telefone_trabalho', e.target.value)} />
              </Field>
            </>
          )}

          {tab === 'dependentes' && (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 16,
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: C.text, fontSize: 14 }}>
                    CADASTRADOS ({form.dependentes.length}/6)
                  </div>
                  <div style={{ color: C.textSub, fontSize: 12, marginTop: 2 }}>
                    Você pode adicionar até 6 dependentes.
                  </div>
                </div>
                {form.dependentes.length < 6 && (
                  <button onClick={addDep} style={{
                    background: C.primaryLight, border: `1.5px dashed ${C.primary}`,
                    borderRadius: 10, color: C.primary, fontSize: 13,
                    padding: '8px 16px', cursor: 'pointer', fontWeight: 600,
                  }}>+ Adicionar Dependente</button>
                )}
              </div>

              {form.dependentes.length === 0 && (
                <div style={{
                  background: C.bg, borderRadius: 12, padding: '24px',
                  textAlign: 'center', color: C.textMuted, fontSize: 14,
                  border: `1px solid ${C.border}`,
                }}>
                  Nenhum dependente cadastrado.
                </div>
              )}

              {form.dependentes.map((dep, i) => (
                <div key={i} style={{
                  background: C.bg, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: '16px', marginBottom: 12,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: C.text }}>
                      Dependente {i + 1}
                    </span>
                    <button onClick={() => removeDep(i)} style={{
                      background: C.primaryLight, border: `1px solid ${C.primaryBorder}`,
                      borderRadius: 8, color: C.primary, fontSize: 12,
                      padding: '4px 10px', cursor: 'pointer', fontWeight: 600,
                    }}>Remover</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
                    <Field label="Nome completo">
                      <Input value={dep.nome_dependente} onChange={e => setDep(i, 'nome_dependente', e.target.value)} />
                    </Field>
                    <Field label="Nascimento">
                      <Input type="date" value={toDateInput(dep.data_nascimento)} onChange={e => setDep(i, 'data_nascimento', e.target.value)} />
                    </Field>
                    <Field label="Parentesco">
                      <Input value={dep.parentesco || ''} onChange={e => setDep(i, 'parentesco', e.target.value)} placeholder="Ex: Filho" />
                    </Field>
                  </div>
                </div>
              ))}
            </>
          )}

          {error && (
            <div style={{
              background: C.primaryLight, border: `1px solid ${C.primaryBorder}`,
              borderRadius: 10, padding: '10px 14px', color: C.primary, fontSize: 13, marginTop: 8,
            }}>{error}</div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{
              background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12,
              color: C.textSub, padding: '11px 22px', cursor: 'pointer', fontSize: 14, fontWeight: 600,
            }}>Cancelar</button>
            <button onClick={handleSave} disabled={saving} style={{
              background: saving ? '#e57373' : C.primary, border: 'none', borderRadius: 12,
              color: '#fff', padding: '11px 28px', cursor: saving ? 'not-allowed' : 'pointer',
              fontSize: 14, fontWeight: 700,
              boxShadow: '0 4px 14px rgba(229,57,53,0.3)',
            }}>{saving ? 'Salvando...' : 'Salvar alterações'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Socio Card ───────────────────────────────────────────────────────────────
function SocioCard({ socio, onEdit, onDelete, isAdmin }: { socio: Socio; onEdit: (s: Socio) => void; onDelete: (s: Socio) => void; isAdmin: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const initials = socio.full_name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <div style={{
      background: C.bgCard, border: `1px solid ${C.border}`,
      borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Main row */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Avatar */}
        <div style={{
          width: 44, height: 44, borderRadius: 12, background: C.primaryLight,
          border: `1.5px solid ${C.primaryBorder}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: C.primary, fontWeight: 800, fontSize: 15, flexShrink: 0,
        }}>{initials}</div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {socio.full_name}
          </div>
          <div style={{ fontSize: 12, color: C.textSub, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span>{fmtCpf(socio.cpf)}</span>
            {socio.city && <span>📍 {socio.city}</span>}
          </div>
        </div>

        {/* Badge dependentes */}
        {socio.dependentes.length > 0 && (
          <div style={{
            background: C.primaryLight, border: `1px solid ${C.primaryBorder}`,
            borderRadius: 20, padding: '3px 10px',
            color: C.primary, fontSize: 12, fontWeight: 700, flexShrink: 0,
          }}>
            {socio.dependentes.length} dep.
          </div>
        )}
      </div>

      {/* Detalhes */}
      <div style={{
        padding: '0 20px 14px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '6px 16px',
        borderBottom: `1px solid ${C.border}`,
      }}>
        {[
          ['📧', socio.email],
          ['📱', socio.whatsapp],
          ['🏢', socio.empresa],
          ['📅', fmtDate(socio.dob)],
          ['💍', socio.nome_conjuge],
          ['🗓️', `Cadastro: ${fmtDate(socio.created_at)}`],
        ].map(([icon, val], i) => val && val !== '—' && (
          <div key={i} style={{ fontSize: 12, color: C.textSub, display: 'flex', gap: 5, alignItems: 'center' }}>
            <span style={{ opacity: 0.7 }}>{icon}</span>
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{val}</span>
          </div>
        ))}
      </div>

      {/* Dependentes expandidos */}
      {socio.dependentes.length > 0 && expanded && (
        <div style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
          {socio.dependentes.map((dep, i) => (
            <div key={i} style={{
              padding: '10px 20px 10px 32px',
              borderBottom: i < socio.dependentes.length - 1 ? `1px solid ${C.border}` : 'none',
              display: 'flex', gap: 12, alignItems: 'center',
            }}>
              <span style={{ color: C.primaryBorder, fontSize: 14 }}>└</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{dep.nome_dependente}</span>
                <span style={{ fontSize: 12, color: C.textSub, marginLeft: 10 }}>
                  {dep.parentesco}{dep.data_nascimento ? ` · Nasc. ${fmtDate(dep.data_nascimento)}` : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ações */}
      <div style={{
        padding: '10px 20px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
        background: C.bg,
      }}>
        {socio.dependentes.length > 0 ? (
          <button onClick={() => setExpanded(v => !v)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: C.primary, fontSize: 12, fontWeight: 600, padding: 0,
          }}>
            {expanded ? '▲ Ocultar dependentes' : '▼ Ver dependentes'}
          </button>
        ) : <div />}

        <div style={{ display: 'flex', gap: 8 }}>
          {isAdmin && (
            <>
              <button onClick={() => onEdit(socio)} style={{
                background: '#fff', border: `1.5px solid ${C.border}`,
                borderRadius: 10, color: C.text, fontSize: 13,
                padding: '6px 14px', cursor: 'pointer', fontWeight: 600,
              }}>Editar</button>
              <button onClick={() => onDelete(socio)} style={{
                background: C.primaryLight, border: `1.5px solid ${C.primaryBorder}`,
                borderRadius: 10, color: C.primary, fontSize: 13,
                padding: '6px 14px', cursor: 'pointer', fontWeight: 600,
              }}>Excluir</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [role, setRole] = useState<'admin' | 'viewer'>('viewer');
  const [loading, setLoading] = useState(true);
  const [nomeSocio, setNomeSocio] = useState('');
  const [nomeDep, setNomeDep] = useState('');
  const [editingSocio, setEditingSocio] = useState<Socio | null>(null);
  const [deletingSocio, setDeletingSocio] = useState<Socio | null>(null);
  const [deleting, setDeleting] = useState(false);
  const isAdmin = role === 'admin';

  const fetchSocios = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (nomeSocio) p.set('nome_socio', nomeSocio);
    if (nomeDep) p.set('nome_dependente', nomeDep);
    try {
      const res = await fetch(`/api/admin/socios?${p}`, { credentials: 'include' });
      if (res.status === 401) { onLogout(); return; }
      const data = await res.json();
      setSocios(data.socios || []);
      if (data.role) setRole(data.role);
    } catch { setSocios([]); }
    finally { setLoading(false); }
  }, [nomeSocio, nomeDep]);

  useEffect(() => {
    const t = setTimeout(fetchSocios, 400);
    return () => clearTimeout(t);
  }, [fetchSocios]);

  const handleDelete = async () => {
    if (!deletingSocio) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/socios?id=${deletingSocio.id}`, { method: 'DELETE', credentials: 'include' });
      setDeletingSocio(null);
      fetchSocios();
    } finally { setDeleting(false); }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    onLogout();
  };

  const totalDeps = socios.reduce((acc, s) => acc + s.dependentes.length, 0);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{
        background: C.bgCard, borderBottom: `1px solid ${C.border}`,
        padding: '0 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 60,
        position: 'sticky', top: 0, zIndex: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, background: C.primary, borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: 15, color: C.text }}>GEC Admin</span>
            <span style={{ color: C.textMuted, fontSize: 13, marginLeft: 6 }}>Recadastramento 2025</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isAdmin && (
            <button
              onClick={() => exportToXlsx(socios)}
              disabled={socios.length === 0}
              style={{
                background: socios.length === 0 ? C.bg : '#e8f5e9',
                border: `1px solid ${socios.length === 0 ? C.border : '#a5d6a7'}`,
                borderRadius: 10,
                color: socios.length === 0 ? C.textMuted : '#2e7d32',
                padding: '6px 14px',
                cursor: socios.length === 0 ? 'not-allowed' : 'pointer',
                fontSize: 13, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              ⬇ Exportar Excel
            </button>
          )}
          {!isAdmin && (
            <span style={{
              background: '#fef9c3', border: '1px solid #fde047',
              borderRadius: 8, padding: '4px 10px',
              fontSize: 12, color: '#854d0e', fontWeight: 600,
            }}>Somente leitura</span>
          )}
          <button onClick={handleLogout} style={{
            background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10,
            color: C.textSub, padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
          }}>Sair</button>
        </div>
      </div>

      <div style={{ padding: '28px 24px', maxWidth: 960, margin: '0 auto' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Sócios cadastrados', value: socios.length, icon: '👥' },
            { label: 'Total de dependentes', value: totalDeps, icon: '👨‍👧' },
            { label: 'Com dependentes', value: socios.filter(s => s.dependentes.length > 0).length, icon: '👨‍👩‍👦' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: C.bgCard, border: `1px solid ${C.border}`,
              borderRadius: 16, padding: '18px 20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{stat.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.primary, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: C.textSub, marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div style={{
          background: C.bgCard, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: '16px 20px',
          display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          alignItems: 'center',
        }}>
          <div style={{ flex: '1 1 220px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.textMuted, fontSize: 15 }}>🔍</span>
            <Input
              value={nomeSocio}
              onChange={e => setNomeSocio(e.target.value)}
              placeholder="Buscar por nome do sócio..."
              style={{ paddingLeft: 34 }}
            />
          </div>
          <div style={{ flex: '1 1 220px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.textMuted, fontSize: 15 }}>👨‍👧</span>
            <Input
              value={nomeDep}
              onChange={e => setNomeDep(e.target.value)}
              placeholder="Buscar por nome do dependente..."
              style={{ paddingLeft: 34 }}
            />
          </div>
          {(nomeSocio || nomeDep) && (
            <button onClick={() => { setNomeSocio(''); setNomeDep(''); }} style={{
              background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10,
              color: C.textSub, padding: '9px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            }}>Limpar</button>
          )}
        </div>

        {/* Lista */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: C.textMuted }}>
            Carregando sócios...
          </div>
        ) : socios.length === 0 ? (
          <div style={{
            background: C.bgCard, borderRadius: 16, padding: '48px',
            textAlign: 'center', color: C.textMuted, border: `1px solid ${C.border}`,
          }}>
            Nenhum sócio encontrado.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {socios.map(s => (
              <SocioCard key={s.id} socio={s} onEdit={setEditingSocio} onDelete={setDeletingSocio} isAdmin={isAdmin} />
            ))}
          </div>
        )}

        <p style={{ color: C.textMuted, fontSize: 12, marginTop: 16, textAlign: 'center' }}>
          {socios.length} sócio(s) · {totalDeps} dependente(s)
        </p>
      </div>

      {/* Modal edição */}
      {editingSocio && (
        <EditModal
          socio={editingSocio}
          onClose={() => setEditingSocio(null)}
          onSave={() => { setEditingSocio(null); fetchSocios(); }}
        />
      )}

      {/* Confirm delete */}
      {deletingSocio && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
        }}>
          <div style={{
            background: C.bgCard, borderRadius: 20, padding: '32px 28px',
            maxWidth: 400, width: '100%',
            border: `1px solid ${C.primaryBorder}`,
            boxShadow: '0 16px 48px rgba(229,57,53,0.12)',
          }}>
            <div style={{ textAlign: 'center', fontSize: 40, marginBottom: 16 }}>⚠️</div>
            <h3 style={{ color: C.text, textAlign: 'center', margin: '0 0 8px', fontSize: 18, fontWeight: 800 }}>
              Excluir sócio?
            </h3>
            <p style={{ color: C.primary, textAlign: 'center', fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>
              {deletingSocio.full_name}
            </p>
            <p style={{ color: C.textSub, textAlign: 'center', fontSize: 13, margin: '0 0 24px' }}>
              {deletingSocio.dependentes.length > 0
                ? `Esta ação também excluirá ${deletingSocio.dependentes.length} dependente(s) vinculado(s). `
                : ''}
              Não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeletingSocio(null)} style={{
                flex: 1, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12,
                color: C.textSub, padding: '11px', cursor: 'pointer', fontSize: 14, fontWeight: 600,
              }}>Cancelar</button>
              <button onClick={handleDelete} disabled={deleting} style={{
                flex: 1, background: deleting ? '#e57373' : C.primary, border: 'none', borderRadius: 12,
                color: '#fff', padding: '11px', cursor: deleting ? 'not-allowed' : 'pointer',
                fontSize: 14, fontWeight: 700,
                boxShadow: '0 4px 14px rgba(229,57,53,0.3)',
              }}>{deleting ? 'Excluindo...' : 'Confirmar exclusão'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function AdminScreen() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/admin/socios', { credentials: 'include' })
      .then(r => setAuthed(r.status !== 401))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: C.textMuted, fontFamily: 'sans-serif',
    }}>Carregando...</div>
  );

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;
  return <AdminDashboard onLogout={() => setAuthed(false)} />;
}
