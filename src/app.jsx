import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

const BENEFITS = [
  'Vale alimentacao',
  'Plano de saude',
  'Plano odontologico',
  'Refeicao no local',
  'Parceria institucional',
  'Total Pass',
  'Convenio SESC'
];

const AREAS = [
  'RH',
  'Financeiro',
  'Tecnologia',
  'Marketing',
  'Conselho',
  'Juridico',
  'CAT',
  'Seguranca e vigilancia',
  'Esportes',
  'Centro medico',
  'Cultural',
  'Transportes',
  'Manutencao'
];

const EXIT_REASONS = ['TERMINO DE CONTRATO', 'DEMISSAO', 'PEDIDO DE DEMISSAO'];

const QUESTIONS = [
  {
    name: 'expectativas',
    label: 'A empresa atendeu as expectativas do colaborador?',
    options: ['Superou', 'Atendeu', 'Parcialmente', 'Nao atendeu']
  },
  {
    name: 'recomendariaEmpresa',
    label: 'Indicaria o Clube Paineiras para trabalhar?',
    options: ['Sim', 'Talvez', 'Nao']
  },
  {
    name: 'voltariaTrabalhar',
    label: 'Voltaria a trabalhar na empresa no futuro?',
    options: ['Sim', 'Talvez', 'Nao']
  }
];

const SCORE_FIELDS = [
  { name: 'salarioSatisfacao', label: 'Satisfação com salário' },
  { name: 'empresaSatisfacao', label: 'Satisfação com a empresa' },
  { name: 'liderancaSatisfacao', label: 'Satisfação com liderança' },
  { name: 'estruturaSatisfacao', label: 'Satisfação com benefícios e estrutura' }
];

const MANAGER_FIELDS = [
  { name: 'gestorFlexibilidade', label: 'O gestor tinha flexibilidade para lidar com situacoes da equipe?' },
  { name: 'gestorAtencao', label: 'O gestor demonstrava atenção e escuta quando necessário?' },
  { name: 'gestorProfissionalismo', label: 'O gestor agia com profissionalismo e respeito?' },
  { name: 'gestorFeedback', label: 'O gestor dava direcionamento e feedback de forma clara?' }
];

const initialForm = {
  nome: '',
  cargo: '',
  area: '',
  gestor: '',
  dataDesligamento: '',
  tempoEmpresaAnos: '',
  tempoEmpresaMeses: '',
  motivoSaida: '',
  expectativas: '',
  desenvolvimento: '',
  ambiente: '',
  clube: '',
  beneficios: BENEFITS.reduce((accumulator, benefit) => {
    accumulator[benefit] = {
      uso: '',
      expectativa: ''
    };
    return accumulator;
  }, {}),
  beneficiosObservacao: '',
  salarioSatisfacao: 3,
  empresaSatisfacao: 3,
  liderancaSatisfacao: 3,
  estruturaSatisfacao: 3,
  gestorFlexibilidade: 3,
  gestorAtencao: 3,
  gestorProfissionalismo: 3,
  gestorFeedback: 3,
  gestorRecomendacao: '',
  recomendariaEmpresa: '',
  voltariaTrabalhar: '',
  observacoes: '',
  melhoriaSugestao: ''
};

function Shell({ eyebrow, title, description, actions, children }) {
  return (
    <div className="page-shell">
      <header className="hero">
        <div className="hero__brand">
          <img className="hero__logo" src="/rh-logo.png" alt="Logo RH Clube Paineiras" />
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p className="hero__text">{description}</p>
          </div>
        </div>
        <div className="hero__actions">{actions}</div>
      </header>
      {children}
    </div>
  );
}

function PillLink({ href, secondary = false, children }) {
  return (
    <a className={`pill-link ${secondary ? 'pill-link--secondary' : ''}`.trim()} href={href}>
      {children}
    </a>
  );
}

function FormPage() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  function buildTenureLabel() {
    const years = Number(form.tempoEmpresaAnos || 0);
    const months = Number(form.tempoEmpresaMeses || 0);
    const parts = [];

    if (years > 0) {
      parts.push(`${years} ${years === 1 ? 'ano' : 'anos'}`);
    }

    if (months > 0) {
      parts.push(`${months} ${months === 1 ? 'mes' : 'meses'}`);
    }

    return parts.length ? parts.join(' e ') : '';
  }

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function updateBenefit(benefit, field, value) {
    setForm((current) => ({
      ...current,
      beneficios: {
        ...current.beneficios,
        [benefit]: {
          ...current.beneficios[benefit],
          [field]: value
        }
      }
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ state: 'loading', message: 'Enviando respostas...' });

    try {
      const payload = {
        ...form,
        tempoEmpresa: buildTenureLabel()
      };

      const response = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar feedback.');
      }

      setStatus({
        state: 'success',
        message: 'Feedback registrado com sucesso. Obrigado por compartilhar sua experiência.'
      });
      setForm(initialForm);
    } catch (error) {
      setStatus({
        state: 'error',
        message: 'Nao foi possivel enviar agora. Tente novamente em instantes.'
      });
    }
  }

  return (
    <Shell
      eyebrow="RH | Entrevista de desligamento"
      title="Formulario de desligamento"
      description="Este formulario abaixo serve para entendermos toda a experiência que voce teve conosco ao longo da sua jornada."
      actions={
        <PillLink href="#formulario" secondary>
          Iniciar preenchimento
        </PillLink>
      }
    >
      <main className="content-grid content-grid--single">
        <form id="formulario" className="panel form-panel" onSubmit={handleSubmit}>
          <div className="section-heading">
            <div>
              <p className="panel__tag">Formulario</p>
              <h2>Feedback de desligamento</h2>
            </div>
            <span className={`status status--${status.state}`}>{status.message || 'Pronto para responder'}</span>
          </div>

          <div className="form-grid">
            <label>
              Nome completo
              <input value={form.nome} onChange={(e) => updateField('nome', e.target.value)} required />
            </label>
            <label>
              Cargo
              <input value={form.cargo} onChange={(e) => updateField('cargo', e.target.value)} required />
            </label>
            <label>
              Area / setor
              <select value={form.area} onChange={(e) => updateField('area', e.target.value)} required>
                <option value="">Selecione um setor</option>
                {AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Gestor direto
              <input value={form.gestor} onChange={(e) => updateField('gestor', e.target.value)} />
            </label>
            <label>
              Data de desligamento
              <input
                type="date"
                value={form.dataDesligamento}
                onChange={(e) => updateField('dataDesligamento', e.target.value)}
                required
              />
            </label>
            <label className="tenure-card">
              <span>Tempo de empresa</span>
              <div className="tenure-fields">
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={form.tempoEmpresaAnos}
                  onChange={(e) => updateField('tempoEmpresaAnos', e.target.value)}
                  placeholder="Anos"
                />
                <input
                  type="number"
                  min="0"
                  max="11"
                  inputMode="numeric"
                  value={form.tempoEmpresaMeses}
                  onChange={(e) => updateField('tempoEmpresaMeses', e.target.value)}
                  placeholder="Meses"
                />
              </div>
              <small className="field-help">Exemplo: 2 anos e 4 meses.</small>
            </label>
            <label>
              Principal motivo da saida
              <select value={form.motivoSaida} onChange={(e) => updateField('motivoSaida', e.target.value)} required>
                <option value="">Selecione um motivo</option>
                {EXIT_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="question-stack">
            {QUESTIONS.map((question) => (
              <label key={question.name}>
                {question.label}
                <select
                  value={form[question.name]}
                  onChange={(e) => updateField(question.name, e.target.value)}
                  required
                >
                  <option value="">Selecione</option>
                  {question.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>

          <div className="score-grid">
            {SCORE_FIELDS.map((field) => (
              <label key={field.name} className="score-card">
                <span>{field.label}</span>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={form[field.name]}
                  onChange={(e) => updateField(field.name, Number(e.target.value))}
                />
                <strong>{form[field.name]}/5</strong>
              </label>
            ))}
          </div>

          {form.gestor.trim() ? (
            <section className="panel panel--soft">
              <div className="section-heading">
                <div>
                  <p className="panel__tag">Avaliacao do gestor</p>
                  <h3>Avalie {form.gestor}</h3>
                </div>
              </div>
              <div className="score-grid">
                {MANAGER_FIELDS.map((field) => (
                  <label key={field.name} className="score-card">
                    <span>{field.label}</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={form[field.name]}
                      onChange={(e) => updateField(field.name, Number(e.target.value))}
                    />
                    <strong>{form[field.name]}/5</strong>
                  </label>
                ))}
              </div>
              <label>
                Recomendaria este gestor como lider?
                <select
                  value={form.gestorRecomendacao}
                  onChange={(e) => updateField('gestorRecomendacao', e.target.value)}
                  required
                >
                  <option value="">Selecione</option>
                  <option value="Sim">Sim</option>
                  <option value="Talvez">Talvez</option>
                  <option value="Nao">Nao</option>
                </select>
              </label>
            </section>
          ) : (
            <section className="panel panel--soft">
              <div className="section-heading">
                <div>
                  <p className="panel__tag">Avaliacao do gestor</p>
                  <h3>Informe o gestor direto para liberar esta etapa</h3>
                </div>
              </div>
              <p className="section-copy">
                As perguntas especificas sobre liderança aparecem automaticamente depois que o nome do gestor e preenchido.
              </p>
            </section>
          )}

          <section className="detail-grid">
            <label>
              Como foi a experiencia com desenvolvimento e crescimento?
              <textarea
                rows="4"
                value={form.desenvolvimento}
                onChange={(e) => updateField('desenvolvimento', e.target.value)}
              />
            </label>
            <label>
              Como voce descreve o ambiente de trabalho?
              <textarea
                rows="4"
                value={form.ambiente}
                onChange={(e) => updateField('ambiente', e.target.value)}
              />
            </label>
            <label>
              O que achou do clube e da experiencia institucional?
              <textarea rows="4" value={form.clube} onChange={(e) => updateField('clube', e.target.value)} />
            </label>
            <label>
              Observacoes finais
              <textarea
                rows="4"
                value={form.observacoes}
                onChange={(e) => updateField('observacoes', e.target.value)}
              />
            </label>
          </section>

          <section className="panel panel--soft">
            <div className="section-heading">
              <div>
                <p className="panel__tag">Beneficios</p>
                <h3>Avaliacao de beneficios</h3>
              </div>
            </div>
            <div className="benefits-assessment">
              {BENEFITS.map((benefit) => (
                <div key={benefit} className="benefit-row">
                  <strong>{benefit}</strong>
                  <div className="benefit-row__fields">
                    <label>
                      Fazia uso?
                      <select
                        value={form.beneficios[benefit].uso}
                        onChange={(e) => updateBenefit(benefit, 'uso', e.target.value)}
                      >
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="Nao">Nao</option>
                      </select>
                    </label>
                    <label>
                      Atendeu expectativa?
                      <select
                        value={form.beneficios[benefit].expectativa}
                        onChange={(e) => updateBenefit(benefit, 'expectativa', e.target.value)}
                      >
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="Nao">Nao</option>
                      </select>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <label>
              Observacao sobre beneficios e clube
              <textarea
                rows="3"
                value={form.beneficiosObservacao}
                onChange={(e) => updateField('beneficiosObservacao', e.target.value)}
                placeholder="Ex.: faltou flexibilidade, os beneficios eram diferenciais, o clube foi valorizado..."
              />
            </label>
          </section>

          <label>
            Deixe sua opiniao final sobre a empresa. Compartilhe, de forma livre e sincera, os principais pontos positivos, os aspectos que poderiam ser melhorados e qualquer percepção que considere relevante sobre sua experiência.
            <textarea
              rows="4"
              value={form.melhoriaSugestao}
              onChange={(e) => updateField('melhoriaSugestao', e.target.value)}
            />
          </label>

          <div className="form-actions">
            <button className="primary-button" type="submit" disabled={status.state === 'loading'}>
              {status.state === 'loading' ? 'Salvando...' : 'Enviar feedback'}
            </button>
          </div>
        </form>
      </main>
    </Shell>
  );
}

function DashboardPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const response = await fetch('/api/feedbacks');
      const data = await response.json();
      setFeedbacks(Array.isArray(data) ? data.reverse() : []);
      setLoading(false);
    }

    load();
  }, []);

  const analytics = useMemo(() => buildDashboardAnalytics(feedbacks), [feedbacks]);

  return (
    <Shell
      eyebrow="RH | Dashboard estratégico"
      title="Painel de desligamento"
      description=""
      actions={
        <>
          <PillLink href="/detalhamento" secondary>
            Ver detalhamento
          </PillLink>
          <PillLink href="/dashboard" secondary>
            Atualizar painel
          </PillLink>
        </>
      }
    >
      <main className="dashboard-layout">
        <section className="metrics-grid">
          <MetricCard label="Feedbacks recebidos" value={analytics.overview.totalFeedbacks} tone="gold" />
          <MetricCard label="Satisfação com salário" value={`${analytics.overview.salarioPct}%`} tone="green" />
          <MetricCard label="Satisfação com a empresa" value={`${analytics.overview.empresaPct}%`} tone="green" />
          <MetricCard label="Voltaria a trabalhar" value={`${analytics.overview.voltariaSimPct}%`} tone="blue" />
          <MetricCard label="Indicaria a empresa" value={`${analytics.overview.recomendariaSimPct}%`} tone="blue" />
          <MetricCard label="Expectativa positiva" value={`${analytics.overview.expectativaPositivaPct}%`} tone="gold" />
          <MetricCard
            label="Local com mais desligamento"
            value={analytics.overview.topAreaLabel}
            detail={analytics.overview.topAreaCount ? `${analytics.overview.topAreaCount} registro(s)` : 'Sem dados'}
            tone="blue"
          />
        </section>

        <section className="dashboard-grid dashboard-grid--two">
          <ChartCard
            tag="Satisfação média"
            title="Dimensões principais"
            subtitle="Comparativo das notas médias por tema."
          >
            <BarChart
              items={analytics.scoreAverages.map((item) => ({
                label: item.label,
                value: item.value,
                suffix: '%'
              }))}
              maxValue={100}
            />
          </ChartCard>

          <ChartCard
            tag="Expectativas e retorno"
            title="Intenção de permanência"
            subtitle="Como os colaboradores percebem a empresa ao sair."
          >
            <DonutRow items={analytics.intentions} />
          </ChartCard>
        </section>

        <section className="dashboard-grid dashboard-grid--two">
          <ChartCard
            tag="Motivo da saída"
            title="Distribuição dos desligamentos"
            subtitle="Leitura rápida do peso de cada tipo de saída."
          >
            <HorizontalBars items={analytics.exitReasons} />
          </ChartCard>

          <ChartCard
            tag="Area"
            title="Saídas por setor"
            subtitle="Volume de respostas e concentração por área."
          >
            <HorizontalBars items={analytics.areaBreakdown} />
          </ChartCard>
        </section>

        <section className="dashboard-grid dashboard-grid--two">
          <ChartCard
            tag="Tempo de empresa"
            title="Perfil de permanência"
            subtitle="Faixas de permanência registradas nos desligamentos."
          >
            <HorizontalBars items={analytics.tenureBreakdown} />
          </ChartCard>
          <ChartCard
            tag="Liderança"
            title="Visão consolidada da liderança"
            subtitle="Resumo dos critérios usados na avaliação dos gestores."
          >
            <LeadershipOverviewCard data={analytics.leadershipOverview} />
          </ChartCard>
        </section>

        <section className="dashboard-grid dashboard-grid--two">
          <ChartCard
            tag="Gestão"
            className="panel--ranking"
            title="Ranking visual de gestores"
            subtitle="Classificação construída a partir das respostas específicas sobre a atuação do gestor."
          >
            <div className="ranking-scroll">
              <ManagerRankingPro items={analytics.byManager} />
            </div>
          </ChartCard>

          <ChartCard
            tag="Leitura qualitativa"
            title="Alertas e sinais para RH"
            subtitle="Concentrado automático dos principais pontos para análise."
          >
            <div className="insights-scroll">
              <InsightsList items={analytics.insights} />
            </div>
          </ChartCard>
        </section>

        <section className="panel">
          <div className="section-heading section-heading--stack">
            <div>
              <p className="panel__tag">Resumo final</p>
              <h2>Informacoes percentuais</h2>
              <p className="section-copy">Leitura consolidada dos principais indicadores percentuais.</p>
            </div>
          </div>
          <PercentageSummaryTable items={analytics.percentageSummary} averageValue={analytics.generalAveragePct} />
        </section>

      </main>
    </Shell>
  );
}

function DetailsPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const response = await fetch('/api/feedbacks');
      const data = await response.json();
      setFeedbacks(Array.isArray(data) ? data.reverse() : []);
      setLoading(false);
    }

    load();
  }, []);

  return (
    <Shell
      eyebrow="RH | Detalhamento"
      title="Detalhamento individual"
      description="Consulta organizada de cada desligamento, com dados pessoais, avaliacao da experiencia, lideranca, beneficios e comentarios finais."
      actions={
        <>
          <PillLink href="/dashboard">Voltar ao painel</PillLink>
          <PillLink href="/" secondary>
            Novo feedback
          </PillLink>
        </>
      }
    >
      <main className="dashboard-layout">
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="panel__tag">Registros</p>
              <h2>Todos os desligamentos</h2>
            </div>
            {loading ? <span className="status status--loading">Carregando...</span> : null}
          </div>

          <div className="details-list">
            {feedbacks.length === 0 ? (
              <p className="empty-state">Nenhum feedback registrado ate o momento.</p>
            ) : (
              feedbacks.map((item) => (
                <article key={item.id} className="detail-card">
                  <div className="detail-card__header">
                    <div>
                      <h3>{item.nome}</h3>
                      <p>
                        {item.cargo || 'Cargo nao informado'} | {item.area || 'Area nao informada'}
                      </p>
                    </div>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>

                  <div className="detail-card__grid">
                    <DetailBlock
                      title="Dados gerais"
                      items={[
                        ['Data de desligamento', item.dataDesligamento ? formatDate(item.dataDesligamento) : '-'],
                        ['Gestor', item.gestor || '-'],
                        ['Tempo de empresa', item.tempoEmpresa || '-'],
                        ['Motivo da saida', item.motivoSaida || '-'],
                        ['Expectativas', item.expectativas || '-']
                      ]}
                    />
                    <DetailBlock
                      title="Satisfacao"
                      items={[
                        ['Salario', `${scoreToPercent(item.salarioSatisfacao)}%`],
                        ['Empresa', `${scoreToPercent(item.empresaSatisfacao)}%`],
                        ['Lideranca', `${scoreToPercent(item.liderancaSatisfacao)}%`],
                        ['Beneficios e estrutura', `${scoreToPercent(item.estruturaSatisfacao)}%`]
                      ]}
                    />
                    <DetailBlock
                      title="Gestor"
                      items={[
                        ['Flexibilidade', `${scoreToPercent(item.gestorFlexibilidade)}%`],
                        ['Atencao', `${scoreToPercent(item.gestorAtencao)}%`],
                        ['Profissionalismo', `${scoreToPercent(item.gestorProfissionalismo)}%`],
                        ['Feedback', `${scoreToPercent(item.gestorFeedback)}%`],
                        ['Recomendaria o gestor', item.gestorRecomendacao || '-']
                      ]}
                    />
                    <DetailBlock
                      title="Decisao futura"
                      items={[
                        ['Indicaria a empresa', item.recomendariaEmpresa || '-'],
                        ['Voltaria a trabalhar', item.voltariaTrabalhar || '-']
                      ]}
                    />
                  </div>

                  <div className="detail-card__text-grid">
                    <TextPanel title="Desenvolvimento e crescimento" text={item.desenvolvimento} />
                    <TextPanel title="Ambiente de trabalho" text={item.ambiente} />
                    <TextPanel title="Clube e experiencia institucional" text={item.clube} />
                    <TextPanel title="Observacoes finais" text={item.observacoes} />
                    <TextPanel title="Beneficios e clube" text={item.beneficiosObservacao} />
                    <TextPanel title="Opiniao final" text={item.melhoriaSugestao} />
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </Shell>
  );
}

function ChartCard({ tag, title, subtitle, children, className = "" }) {
  return (
    <section className={`panel ${className}`.trim()}>
      <div className="section-heading section-heading--stack">
        <div>
          <p className="panel__tag">{tag}</p>
          <h2>{title}</h2>
          <p className="section-copy">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function MetricCard({ label, value, tone, detail }) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </article>
  );
}

function DetailBlock({ title, items }) {
  return (
    <section className="detail-block">
      <h4>{title}</h4>
      <div className="detail-block__items">
        {items.map(([label, value]) => (
          <div key={label} className="detail-block__item">
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function TextPanel({ title, text }) {
  return (
    <section className="text-panel">
      <h4>{title}</h4>
      <p>{text || '-'}</p>
    </section>
  );
}

function BarChart({ items, maxValue }) {
  return (
    <div className="bar-chart">
      {items.map((item) => {
        const width = maxValue > 0 ? Math.max((item.value / maxValue) * 100, 4) : 0;
        return (
          <div key={item.label} className="bar-chart__row">
            <div className="bar-chart__header">
              <span>{item.label}</span>
              <strong>
                {item.value}
                {item.suffix || ''}
              </strong>
            </div>
            <div className="bar-chart__track">
              <div className="bar-chart__fill" style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function HorizontalBars({ items }) {
  if (!items.length) {
    return <p className="empty-state">Ainda nao ha dados suficientes para este grafico.</p>;
  }

  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="bar-chart">
      {items.map((item) => (
        <div key={item.label} className="bar-chart__row">
          <div className="bar-chart__header">
            <span>{item.label}</span>
            <strong>
              {item.value}
              {item.suffix || ''}
            </strong>
          </div>
          <div className="bar-chart__track">
            <div
              className="bar-chart__fill bar-chart__fill--soft"
              style={{ width: `${Math.max((item.value / maxValue) * 100, 4)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutRow({ items }) {
  if (!items.length) {
    return <p className="empty-state">Ainda nao ha dados suficientes para este grafico.</p>;
  }

  return (
    <div className="donut-row">
      {items.map((item) => (
        <div key={item.label} className="donut-card">
          <DonutChart value={item.value} label={item.label} />
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ value, label }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(value, 100)) / 100) * circumference;

  return (
    <div className="donut">
      <svg viewBox="0 0 120 120" className="donut__svg" aria-hidden="true">
        <circle className="donut__bg" cx="60" cy="60" r={radius} />
        <circle
          className="donut__value"
          cx="60"
          cy="60"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="donut__content">
        <strong>{value}%</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function InsightsList({ items }) {
  if (!items.length) {
    return <p className="empty-state">Os insights aparecerao conforme novas respostas forem entrando.</p>;
  }

  return (
    <div className="insights-list">
      {items.map((item, index) => (
        <article key={`${item}-${index}`} className="insight-card">
          <strong>{index + 1}.</strong>
          <p>{item}</p>
        </article>
      ))}
    </div>
  );
}

function CommentList({ items }) {
  if (!items.length) {
    return <p className="empty-state">Ainda nao ha comentarios finais para destacar.</p>;
  }

  return (
    <div className="comment-list">
      {items.map((item) => (
        <article key={item.id} className="comment-card">
          <strong>
            {item.nome} | {item.cargo || 'Cargo nao informado'}
          </strong>
          <span>{formatDate(item.createdAt)}</span>
          <p>{item.texto}</p>
        </article>
      ))}
    </div>
  );
}

function PercentageSummaryTable({ items, averageValue }) {
  if (!items.length) {
    return <p className="empty-state">Ainda nao ha percentuais suficientes para destacar.</p>;
  }

  return (
    <div className="percentage-summary">
      <div className="vertical-bars">
        {items.map((item) => (
          <div key={item.label} className="vertical-bars__item">
            <div className="vertical-bars__value">{item.value}%</div>
            <div className="vertical-bars__chart">
              <div className="vertical-bars__track">
                <div className="vertical-bars__fill" style={{ height: `${item.value}%` }} />
              </div>
            </div>
            <strong>{item.label}</strong>
          </div>
        ))}
      </div>

      <div className="percentage-summary__average">
        <div className="percentage-summary__average-head">
          <span>Linha da media</span>
          <strong>{averageValue}%</strong>
        </div>
        <div className="percentage-summary__track percentage-summary__track--average">
          <div className="percentage-summary__fill percentage-summary__fill--average" style={{ width: `${averageValue}%` }} />
        </div>
      </div>
    </div>
  );
}

function buildDashboardAnalytics(feedbacks) {
  if (!feedbacks.length) {
    return {
      overview: {
        totalFeedbacks: 0,
        salarioPct: 0,
        empresaPct: 0,
        liderancaMedia: 0,
        estruturaMedia: 0,
        expectativaPositivaPct: 0,
        voltariaSimPct: 0,
        recomendariaSimPct: 0,
        topAreaLabel: '-',
        topAreaCount: 0
      },
      scoreAverages: [],
      intentions: [],
      exitReasons: [],
      areaBreakdown: [],
      tenureBreakdown: [],
      leadershipOverview: {
        flexibilidadePct: 0,
        atencaoPct: 0,
        profissionalismoPct: 0,
        feedbackPct: 0,
        recomendacaoPct: 0
      },
      percentageSummary: [],
      generalAveragePct: 0,
      benefitsBreakdown: [],
      byManager: [],
      insights: [],
      recentComments: []
    };
  }

  const average = (key) =>
    Number((feedbacks.reduce((sum, item) => sum + Number(item[key] || 0), 0) / feedbacks.length).toFixed(1));
  const scorePercent = (key) => Number((((average(key) || 0) / 5) * 100).toFixed(1));
  const percent = (predicate) => Number(((feedbacks.filter(predicate).length / feedbacks.length) * 100).toFixed(1));
  const countBy = (getter) => {
    const map = new Map();
    feedbacks.forEach((item) => {
      const key = getter(item) || 'Nao informado';
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  };
  const countByPercent = (getter) =>
    countBy(getter).map((item) => ({
      ...item,
      value: Number(((item.value / feedbacks.length) * 100).toFixed(1)),
      suffix: '%'
    }));

  const scoreAverages = [
    { label: 'Salario', value: scorePercent('salarioSatisfacao') },
    { label: 'Empresa', value: scorePercent('empresaSatisfacao') },
    { label: 'Lideranca', value: scorePercent('liderancaSatisfacao') },
    { label: 'Beneficios e estrutura', value: scorePercent('estruturaSatisfacao') }
  ];
  const areaCounts = countBy((item) => item.area);
  const areaBreakdown = countByPercent((item) => item.area);
  const topArea = areaCounts[0] || { label: '-', value: 0 };
  const exitReasonCounts = countBy((item) => item.motivoSaida);
  const topReason = exitReasonCounts[0] || { label: '-', value: 0 };
  const tenureCounts = countBy((item) => bucketTenure(item.tempoEmpresa));
  const topTenure = tenureCounts[0] || { label: '-', value: 0 };

  const expectationsPositive = percent(
    (item) => item.expectativas === 'Superou' || item.expectativas === 'Atendeu'
  );
  const voltariaSimPct = percent((item) => item.voltariaTrabalhar === 'Sim');
  const recomendariaSimPct = percent((item) => item.recomendariaEmpresa === 'Sim');
  const maybeReturnPct = percent((item) => item.voltariaTrabalhar === 'Talvez');
  const expectativaNegativaPct = percent(
    (item) => item.expectativas === 'Parcialmente' || item.expectativas === 'Nao atendeu'
  );

  const byManagerMap = feedbacks.reduce((accumulator, item) => {
    const key = item.gestor || 'Nao informado';
    accumulator[key] = accumulator[key] || [];
    accumulator[key].push(item);
    return accumulator;
  }, {});

  const byManager = Object.entries(byManagerMap)
    .map(([gestor, items]) => ({
      gestor,
      total: items.length,
      empresaSatisfacao: percentScoreFromItems(items, 'empresaSatisfacao'),
      liderancaSatisfacao: percentScoreFromItems(items, 'liderancaSatisfacao'),
      gestorMedia: managerAveragePercent(items),
      flexibilidadePct: percentScoreFromItems(items, 'gestorFlexibilidade'),
      atencaoPct: percentScoreFromItems(items, 'gestorAtencao'),
      profissionalismoPct: percentScoreFromItems(items, 'gestorProfissionalismo'),
      feedbackPct: percentScoreFromItems(items, 'gestorFeedback'),
      voltariaPct: percentFromItems(items, (item) => item.voltariaTrabalhar === 'Sim'),
      gestorRecomendacaoPct: percentFromItems(items, (item) => item.gestorRecomendacao === 'Sim'),
      expectativaPositivaPct: percentFromItems(
        items,
        (item) => item.expectativas === 'Superou' || item.expectativas === 'Atendeu'
      ),
      classificacao: classifyManager(managerAveragePercent(items))
    }))
    .sort((left, right) => right.total - left.total);

  const insights = [];
  const lowestManager = [...byManager].sort((a, b) => Number(a.gestorMedia) - Number(b.gestorMedia))[0];
  const highestManager = [...byManager].sort((a, b) => Number(b.gestorMedia) - Number(a.gestorMedia))[0];

  if (average('liderancaSatisfacao') <= 3) {
    insights.push('A lideranca aparece como um ponto de atencao, com media igual ou inferior a 3.');
  }
  if (average('empresaSatisfacao') >= 4) {
    insights.push(`A satisfacao com a empresa esta em patamar positivo, com media de ${average('empresaSatisfacao')} em 5.`);
  }
  if (average('salarioSatisfacao') <= 3) {
    insights.push('A percepcao sobre salario merece atencao, pois a media esta igual ou abaixo de 3 em 5.');
  }
  if (voltariaSimPct < 50) {
    insights.push('Menos da metade dos respondentes afirma que voltaria a trabalhar na empresa.');
  }
  if (voltariaSimPct >= 50) {
    insights.push(`${voltariaSimPct}% dos respondentes afirmam que voltariam a trabalhar na empresa.`);
  }
  if (recomendariaSimPct < 50) {
    insights.push('A taxa de recomendacao esta abaixo de 50%, sugerindo necessidade de revisar a experiencia interna.');
  }
  if (recomendariaSimPct >= 50) {
    insights.push(`${recomendariaSimPct}% indicariam a empresa como local de trabalho.`);
  }
  if (topReason.value) {
    insights.push(`O principal motivo de saida registrado ate agora e ${topReason.label}, com ${topReason.value} ocorrencia(s).`);
  }
  if (topArea.value) {
    insights.push(`O setor com maior concentracao de desligamentos e ${topArea.label}, com ${topArea.value} registro(s).`);
  }
  if (topTenure.value) {
    insights.push(`A faixa de permanencia mais frequente entre os desligamentos e ${topTenure.label}.`);
  }
  if (expectativaNegativaPct > 0) {
    insights.push(`${expectativaNegativaPct}% relataram que as expectativas foram apenas parcialmente atendidas ou nao atendidas.`);
  }
  if (highestManager) {
    insights.push(`No ranking de gestores, ${highestManager.gestor} lidera com score geral de ${highestManager.gestorMedia}%.`);
  }
  if (lowestManager) {
    insights.push(`Entre os gestores avaliados, ${lowestManager.gestor} apresenta o menor score geral, com ${lowestManager.gestorMedia}%.`);
  }
  if (byManager.length > 1) {
    insights.push(`O ranking atual compara ${byManager.length} gestores com base em flexibilidade, atencao, profissionalismo, feedback e recomendacao.`);
  }
  if (feedbacks.some((item) => item.ambiente && item.ambiente.trim())) {
    insights.push('Ha comentarios qualitativos registrados sobre ambiente de trabalho, uteis para leitura complementar no detalhamento.');
  }
  if (feedbacks.some((item) => item.melhoriaSugestao && item.melhoriaSugestao.trim())) {
    insights.push('As opinioes finais ja trazem sugestoes de melhoria que podem orientar acoes praticas de RH e lideranca.');
  }

  return {
    overview: {
      totalFeedbacks: feedbacks.length,
      salarioPct: scorePercent('salarioSatisfacao'),
      empresaPct: scorePercent('empresaSatisfacao'),
      liderancaMedia: average('liderancaSatisfacao'),
      estruturaMedia: average('estruturaSatisfacao'),
      expectativaPositivaPct: expectationsPositive,
      voltariaSimPct,
      recomendariaSimPct
      ,
      topAreaLabel: topArea.label,
      topAreaCount: topArea.value
    },
    scoreAverages,
    intentions: [
      {
        label: 'Voltaria',
        value: voltariaSimPct,
        description: `${maybeReturnPct}% responderam "Talvez".`
      },
      {
        label: 'Indicaria',
        value: recomendariaSimPct,
        description: `${expectationsPositive}% avaliaram a experiencia como positiva.`
      }
    ],
    exitReasons: exitReasonCounts.map((item) => ({
      ...item,
      value: Number(((item.value / feedbacks.length) * 100).toFixed(1)),
      suffix: '%'
    })),
    areaBreakdown,
    tenureBreakdown: tenureCounts.map((item) => ({
      ...item,
      value: Number(((item.value / feedbacks.length) * 100).toFixed(1)),
      suffix: '%'
    })),
    leadershipOverview: {
      flexibilidadePct: scorePercent('gestorFlexibilidade'),
      atencaoPct: scorePercent('gestorAtencao'),
      profissionalismoPct: scorePercent('gestorProfissionalismo'),
      feedbackPct: scorePercent('gestorFeedback'),
      recomendacaoPct: percent((item) => item.gestorRecomendacao === 'Sim')
    },
    percentageSummary: [
      { label: 'Satisfacao com salario', value: scorePercent('salarioSatisfacao') },
      { label: 'Satisfacao com a empresa', value: scorePercent('empresaSatisfacao') },
      { label: 'Satisfacao com lideranca', value: scorePercent('liderancaSatisfacao') },
      { label: 'Satisfacao com beneficios', value: scorePercent('estruturaSatisfacao') },
      { label: 'Expectativa positiva', value: expectationsPositive },
      { label: 'Voltaria a trabalhar', value: voltariaSimPct },
      { label: 'Indicaria a empresa', value: recomendariaSimPct },
      { label: 'Recomendacao do gestor', value: percent((item) => item.gestorRecomendacao === 'Sim') }
    ],
    generalAveragePct: Number((
      [
        scorePercent('salarioSatisfacao'),
        scorePercent('empresaSatisfacao'),
        scorePercent('liderancaSatisfacao'),
        scorePercent('estruturaSatisfacao'),
        expectationsPositive,
        voltariaSimPct,
        recomendariaSimPct,
        percent((item) => item.gestorRecomendacao === 'Sim')
      ].reduce((sum, value) => sum + Number(value || 0), 0) / 8
    ).toFixed(1)),
    byManager,
    insights,
    recentComments: feedbacks
      .filter((item) => item.melhoriaSugestao || item.observacoes)
      .slice(0, 5)
      .map((item) => ({
        id: item.id,
        nome: item.nome,
        cargo: item.cargo,
        createdAt: item.createdAt,
        texto: item.melhoriaSugestao || item.observacoes
      }))
  };
}

function averageFromItems(items, key) {
  if (!items.length) {
    return '0.0';
  }

  return (items.reduce((sum, item) => sum + Number(item[key] || 0), 0) / items.length).toFixed(1);
}

function percentFromItems(items, predicate) {
  if (!items.length) {
    return '0.0';
  }

  return (((items.filter(predicate).length / items.length) * 100)).toFixed(1);
}

function percentScoreFromItems(items, key) {
  if (!items.length) {
    return '0.0';
  }

  const average = items.reduce((sum, item) => sum + Number(item[key] || 0), 0) / items.length;
  return ((average / 5) * 100).toFixed(1);
}

function managerAveragePercent(items) {
  if (!items.length) {
    return '0.0';
  }

  const keys = ['gestorFlexibilidade', 'gestorAtencao', 'gestorProfissionalismo', 'gestorFeedback'];
  const total = items.reduce((sum, item) => {
    const itemAverage = keys.reduce((acc, key) => acc + Number(item[key] || 0), 0) / keys.length;
    return sum + itemAverage;
  }, 0);

  return (((total / items.length) / 5) * 100).toFixed(1);
}

function classifyManager(value) {
  const numeric = Number(value || 0);

  if (numeric >= 85) {
    return 'Excelente';
  }
  if (numeric >= 70) {
    return 'Bom';
  }
  if (numeric >= 50) {
    return 'Atencao';
  }
  return 'Critico';
}

function scoreToPercent(value) {
  return (((Number(value || 0) / 5) * 100)).toFixed(0);
}

function bucketTenure(value) {
  const text = String(value || '').toLowerCase().trim();
  if (!text) {
    return 'Nao informado';
  }

  const yearsMatch = text.match(/(\d+)\s*ano/);
  const monthsMatch = text.match(/(\d+)\s*mes/);
  const years = yearsMatch ? Number(yearsMatch[1]) : 0;
  const months = monthsMatch ? Number(monthsMatch[1]) : 0;
  const totalMonths = years * 12 + months;

  if (totalMonths === 0) {
    return 'Nao informado';
  }
  if (totalMonths <= 3) {
    return 'Ate 3 meses';
  }
  if (totalMonths <= 6) {
    return 'De 4 a 6 meses';
  }
  if (totalMonths < 12) {
    return 'De 7 meses a 1 ano';
  }
  if (totalMonths < 36) {
    return 'De 1 a 3 anos';
  }
  if (totalMonths <= 60) {
    return 'De 3 a 5 anos';
  }

  return 'Mais de 5 anos';
}

function LeadershipOverviewCard({ data }) {
  const items = [
    ['Flexibilidade', data.flexibilidadePct],
    ['Atencao', data.atencaoPct],
    ['Profissionalismo', data.profissionalismoPct],
    ['Feedback', data.feedbackPct],
    ['Recomendacao', data.recomendacaoPct]
  ];

  return (
    <div className="leadership-overview">
      {items.map(([label, value]) => (
        <div key={label} className="leadership-overview__item">
          <div className="leadership-overview__header">
            <span>{label}</span>
            <strong>{value}%</strong>
          </div>
          <div className="leadership-overview__track">
            <div className="leadership-overview__fill" style={{ width: `${value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ManagerRanking({ items }) {
  if (!items.length) {
    return <p className="empty-state">Ainda nao ha gestores informados para comparar.</p>;
  }

  return (
    <div className="manager-table">
      {items.map((item, index) => (
        <article key={item.gestor} className="manager-card">
          <div className="manager-card__top">
            <div className="manager-rank">{index + 1}</div>
            <div>
              <strong>{item.gestor}</strong>
              <span>{item.total} resposta(s)</span>
            </div>
          </div>
          <div className={`manager-badge manager-badge--${item.classificacao.toLowerCase()}`}>{item.classificacao}</div>
          <div className="manager-progress">
            <div className="manager-progress__track">
              <div className="manager-progress__fill" style={{ width: `${item.gestorMedia}%` }} />
            </div>
            <strong>{item.gestorMedia}%</strong>
          </div>
          <div className="manager-card__stats">
            <span>Flexibilidade: {item.flexibilidadePct}%</span>
            <span>Atencao: {item.atencaoPct}%</span>
            <span>Profissionalismo: {item.profissionalismoPct}%</span>
            <span>Feedback: {item.feedbackPct}%</span>
            <span>Recomendacao: {item.gestorRecomendacaoPct}%</span>
          </div>
        </article>
      ))}
    </div>
  );
}

function ManagerRankingVisual({ items }) {
  if (!items.length) {
    return <p className="empty-state">Ainda nao ha gestores informados para comparar.</p>;
  }

  return (
    <div className="manager-table manager-table--enhanced">
      {items.map((item, index) => (
        <article key={`${item.gestor}-${index}`} className="manager-card manager-card--enhanced">
          <div className="manager-card__header">
            <div className="manager-card__identity">
              <div className="manager-rank manager-rank--enhanced">{index + 1}</div>
              <div className="manager-card__title">
                <strong>{item.gestor}</strong>
                <span>{item.total} resposta(s)</span>
              </div>
            </div>

            <div className="manager-card__summary">
              <div className="manager-card__score">
                <small>Score geral</small>
                <strong>{item.gestorMedia}%</strong>
              </div>
              <div className={`manager-badge manager-badge--${item.classificacao.toLowerCase()}`}>{item.classificacao}</div>
            </div>
          </div>

          <div className="manager-progress manager-progress--enhanced">
            <div className="manager-progress__track manager-progress__track--enhanced">
              <div className="manager-progress__fill" style={{ width: `${item.gestorMedia}%` }} />
            </div>
            <strong className="manager-progress__value">{item.gestorMedia}%</strong>
          </div>

          <div className="manager-metrics">
            <div className="manager-metric">
              <span>Flexibilidade</span>
              <strong>{item.flexibilidadePct}%</strong>
            </div>
            <div className="manager-metric">
              <span>Atencao</span>
              <strong>{item.atencaoPct}%</strong>
            </div>
            <div className="manager-metric">
              <span>Profissionalismo</span>
              <strong>{item.profissionalismoPct}%</strong>
            </div>
            <div className="manager-metric">
              <span>Feedback</span>
              <strong>{item.feedbackPct}%</strong>
            </div>
            <div className="manager-metric manager-metric--accent">
              <span>Recomendacao</span>
              <strong>{item.gestorRecomendacaoPct}%</strong>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function ManagerRankingPro({ items }) {
  if (!items.length) {
    return <p className="empty-state">Ainda nao ha gestores informados para comparar.</p>;
  }

  return (
    <div className="manager-pro-list">
      {items.map((item, index) => {
        const classification = normalizeManagerClassification(item.classificacao);
        const badgeClass = classification.toLowerCase();





        return (
          <article key={`${item.gestor}-${index}`} className="manager-pro-card">
            <div className="manager-pro-card__header">
              <div className="manager-pro-card__identity">
                <div className="manager-pro-rank">{index + 1}</div>
                <div>
                  <h3>{item.gestor}</h3>
                  <p>{item.total} resposta(s)</p>
                </div>
              </div>

              <div className="manager-pro-card__summary">
                <div className="manager-pro-score">
                  <span>Score Geral</span>
                  <strong>{item.gestorMedia}%</strong>
                </div>
                <div className={`manager-badge manager-badge--${badgeClass}`}>{classification}</div>
              </div>
            </div>

            <div className="manager-pro-bar">
              <div className="manager-pro-bar__track">
                <div className="manager-pro-bar__fill" style={{ width: `${item.gestorMedia}%` }} />
              </div>
              <strong>{item.gestorMedia}%</strong>
            </div>

            <div className="manager-pro-metrics">
              <MetricMiniCard label="Flexibilidade" value={`${item.flexibilidadePct}%`} tone="default" />
              <MetricMiniCard label="Atencao" value={`${item.atencaoPct}%`} tone="default" />
              <MetricMiniCard label="Profissionalismo" value={`${item.profissionalismoPct}%`} tone="default" />
              <MetricMiniCard label="Feedback" value={`${item.feedbackPct}%`} tone="default" />
              <MetricMiniCard label="Recomendacao" value={`${item.gestorRecomendacaoPct}%`} tone="accent" />
            </div>
          </article>
        );
      })}
    </div>
  );
}

function MetricMiniCard({ label, value, tone }) {
  return (
    <div className={`manager-mini manager-mini--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function normalizeManagerClassification(value) {
  const raw = String(value || '').toLowerCase();

  if (raw.includes('excel')) {
    return 'Excelente';
  }
  if (raw.includes('bom')) {
    return 'Bom';
  }
  if (raw.includes('aten')) {
    return 'Atencao';
  }
  return 'Critico';
}

function formatDate(value) {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function AppRouter() {
  const rootNode = document.getElementById('root');
  const page = rootNode?.dataset.page;

  if (page === 'details') {
    return <DetailsPage />;
  }

  if (page === 'dashboard') {
    return <DashboardPage />;
  }

  return <FormPage />;
}

const container = document.getElementById('root');
createRoot(container).render(<AppRouter />);
