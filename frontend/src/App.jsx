import { useCallback, useEffect, useState } from 'react';
import { createSala, deleteSala, listSalas, updateSala } from './api';

const emptyForm = {
  nome: '',
  bloco: '',
  capacidade: '',
  recursos: '',
  disponivel: true
};

function salaToForm(sala) {
  return {
    nome: sala.nome,
    bloco: sala.bloco,
    capacidade: String(sala.capacidade),
    recursos: (sala.recursos || []).join(', '),
    disponivel: sala.disponivel
  };
}

function formToPayload(form) {
  return {
    nome: form.nome.trim(),
    bloco: form.bloco.trim(),
    capacidade: Number(form.capacidade),
    recursos: form.recursos
      .split(',')
      .map((resource) => resource.trim())
      .filter(Boolean),
    disponivel: form.disponivel
  };
}

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value));
}

export default function App() {
  const [activeView, setActiveView] = useState('consulta');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [salas, setSalas] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadSalas = useCallback(async (search = '') => {
    setLoading(true);
    try {
      const result = await listSalas(search);
      setSalas(result.salas || []);
      setFeedback(null);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => loadSalas(query), 250);
    return () => clearTimeout(timeout);
  }, [loadSalas, query]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(sala) {
    setEditingId(sala.id);
    setForm(salaToForm(sala));
    setActiveView('cadastro');
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback(null);

    if (!form.nome.trim() || !form.bloco.trim() || Number(form.capacidade) < 1) {
      setFeedback({ type: 'error', message: 'Preencha nome, bloco e uma capacidade válida.' });
      return;
    }

    setSaving(true);
    try {
      const payload = formToPayload(form);
      if (editingId) {
        await updateSala(editingId, payload);
        setFeedback({ type: 'success', message: 'Sala alterada com sucesso.' });
      } else {
        await createSala(payload);
        setFeedback({ type: 'success', message: 'Sala cadastrada com sucesso.' });
      }

      resetForm();
      setActiveView('consulta');
      await loadSalas(query);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(sala) {
    if (!window.confirm(`Excluir a sala “${sala.nome}”?`)) return;

    setFeedback(null);
    try {
      await deleteSala(sala.id);
      setFeedback({ type: 'success', message: 'Sala excluída com sucesso.' });
      await loadSalas(query);
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    }
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero-inner">
          <div className="brand-mark" aria-hidden="true">RS</div>
          <div>
            <p className="eyebrow">Plataforma de reservas universitárias</p>
            <h1>Gestão de salas</h1>
            <p className="hero-copy">Cadastre, consulte e mantenha os espaços acadêmicos sempre atualizados.</p>
          </div>
          <div className="hero-status"><span /> Azure Functions + MongoDB Atlas</div>
        </div>
      </header>

      <main className="content">
        <nav className="tabs" aria-label="Funcionalidades">
          <button className={activeView === 'consulta' ? 'tab active' : 'tab'} onClick={() => setActiveView('consulta')}>
            <span aria-hidden="true">⌕</span> Consultar salas
          </button>
          <button className={activeView === 'cadastro' ? 'tab active' : 'tab'} onClick={() => { resetForm(); setActiveView('cadastro'); }}>
            <span aria-hidden="true">＋</span> Cadastrar sala
          </button>
        </nav>

        {feedback && <div className={`feedback ${feedback.type}`} role="status">{feedback.message}</div>}

        {activeView === 'cadastro' ? (
          <section className="panel form-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{editingId ? 'Atualização' : 'Novo cadastro'}</p>
                <h2>{editingId ? 'Alterar sala' : 'Cadastrar sala'}</h2>
              </div>
              <span className="step-badge">CRUD · {editingId ? 'UPDATE' : 'CREATE'}</span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  Nome da sala
                  <input value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} placeholder="Ex.: Laboratório 01" maxLength={120} required />
                </label>
                <label>
                  Bloco
                  <input value={form.bloco} onChange={(event) => setForm({ ...form, bloco: event.target.value })} placeholder="Ex.: Bloco A" maxLength={80} required />
                </label>
                <label>
                  Capacidade
                  <input type="number" min="1" max="10000" value={form.capacidade} onChange={(event) => setForm({ ...form, capacidade: event.target.value })} placeholder="Ex.: 30" required />
                </label>
                <label>
                  Recursos
                  <input value={form.recursos} onChange={(event) => setForm({ ...form, recursos: event.target.value })} placeholder="Projetor, computadores" />
                  <small>Separe os recursos por vírgula.</small>
                </label>
              </div>

              <label className="availability-toggle">
                <input type="checkbox" checked={form.disponivel} onChange={(event) => setForm({ ...form, disponivel: event.target.checked })} />
                <span className="toggle-track" aria-hidden="true"><span /></span>
                <span><strong>Sala disponível</strong><small>Permitir novas reservas neste espaço</small></span>
              </label>

              <div className="form-actions">
                <button type="button" className="button secondary" onClick={() => { resetForm(); setActiveView('consulta'); }}>Cancelar</button>
                <button type="submit" className="button primary" disabled={saving}>{saving ? 'Salvando…' : editingId ? 'Salvar alterações' : 'Cadastrar sala'}</button>
              </div>
            </form>
          </section>
        ) : (
          <section className="panel">
            <div className="section-heading list-heading">
              <div>
                <p className="eyebrow">Visão geral</p>
                <h2>Salas cadastradas <span className="count-badge">{salas.length}</span></h2>
              </div>
              <button className="button primary compact" onClick={() => { resetForm(); setActiveView('cadastro'); }}>＋ Nova sala</button>
            </div>

            <div className="search-box">
              <span aria-hidden="true">⌕</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar por nome ou bloco…" aria-label="Pesquisar salas" />
              {query && <button onClick={() => setQuery('')} aria-label="Limpar pesquisa">×</button>}
            </div>

            {loading ? <div className="empty-state"><div className="spinner" />Carregando salas…</div> : salas.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">⌂</div>
                <strong>{query ? 'Nenhuma sala encontrada' : 'Ainda não há salas cadastradas'}</strong>
                <p>{query ? 'Tente buscar por outro nome ou bloco.' : 'Cadastre a primeira sala para começar a organizar os espaços.'}</p>
                {!query && <button className="button primary" onClick={() => setActiveView('cadastro')}>Cadastrar primeira sala</button>}
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Sala</th><th>Localização</th><th>Capacidade</th><th>Recursos</th><th>Status</th><th className="actions-heading">Ações</th></tr></thead>
                  <tbody>
                    {salas.map((sala) => (
                      <tr key={sala.id}>
                        <td><strong>{sala.nome}</strong><small>Atualizada em {formatDate(sala.atualizadoEm)}</small></td>
                        <td>{sala.bloco}</td>
                        <td><span className="capacity">{sala.capacidade}</span> lugares</td>
                        <td><div className="resource-list">{sala.recursos?.length ? sala.recursos.map((resource) => <span key={resource}>{resource}</span>) : <span className="muted">Não informado</span>}</div></td>
                        <td><span className={sala.disponivel ? 'status available' : 'status unavailable'}><span />{sala.disponivel ? 'Disponível' : 'Indisponível'}</span></td>
                        <td><div className="row-actions"><button className="icon-button" onClick={() => startEdit(sala)} aria-label={`Editar ${sala.nome}`}>✎</button><button className="icon-button danger" onClick={() => handleDelete(sala)} aria-label={`Excluir ${sala.nome}`}>⌫</button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        <footer className="footer-note"><span>Semana 5 · PJBL</span><span>Azure Functions + MongoDB Atlas</span></footer>
      </main>
    </div>
  );
}
