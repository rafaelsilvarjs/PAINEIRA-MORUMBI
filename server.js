require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const publicDir = path.join(__dirname, 'public');
const dataFile = path.join(__dirname, 'feedbacks.json');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseTable = process.env.SUPABASE_TABLE || 'exit_feedbacks';
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseServiceRoleKey);
const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(publicDir));

function ensureDataFile() {
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, '[]');
  }
}

function readFeedbacksFromFile() {
  ensureDataFile();

  try {
    const raw = fs.readFileSync(dataFile, 'utf8').trim();
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Erro ao ler feedbacks:', error);
    return [];
  }
}

function writeFeedbacksToFile(feedbacks) {
  fs.writeFileSync(dataFile, JSON.stringify(feedbacks, null, 2));
}

function asNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeBenefits(benefits) {
  if (benefits && typeof benefits === 'object' && !Array.isArray(benefits)) {
    return Object.entries(benefits).reduce((accumulator, [name, value]) => {
      accumulator[name] = {
        uso: String(value?.uso || '').trim(),
        expectativa: String(value?.expectativa || '').trim()
      };
      return accumulator;
    }, {});
  }

  if (Array.isArray(benefits)) {
    return benefits.filter(Boolean);
  }

  if (typeof benefits === 'string' && benefits.trim()) {
    return benefits
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeFeedback(payload = {}) {
  return {
    id: payload.id || `fb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: payload.createdAt || new Date().toISOString(),
    nome: String(payload.nome || '').trim(),
    cargo: String(payload.cargo || '').trim(),
    area: String(payload.area || '').trim(),
    gestor: String(payload.gestor || '').trim(),
    dataDesligamento: String(payload.dataDesligamento || '').trim(),
    tempoEmpresa: String(payload.tempoEmpresa || '').trim(),
    motivoSaida: String(payload.motivoSaida || '').trim(),
    expectativas: String(payload.expectativas || '').trim(),
    desenvolvimento: String(payload.desenvolvimento || '').trim(),
    ambiente: String(payload.ambiente || '').trim(),
    clube: String(payload.clube || '').trim(),
    beneficios: normalizeBenefits(payload.beneficios),
    beneficiosObservacao: String(payload.beneficiosObservacao || '').trim(),
    salarioSatisfacao: asNumber(payload.salarioSatisfacao),
    empresaSatisfacao: asNumber(payload.empresaSatisfacao),
    liderancaSatisfacao: asNumber(payload.liderancaSatisfacao),
    estruturaSatisfacao: asNumber(payload.estruturaSatisfacao),
    gestorFlexibilidade: asNumber(payload.gestorFlexibilidade),
    gestorAtencao: asNumber(payload.gestorAtencao),
    gestorProfissionalismo: asNumber(payload.gestorProfissionalismo),
    gestorFeedback: asNumber(payload.gestorFeedback),
    gestorRecomendacao: String(payload.gestorRecomendacao || '').trim(),
    recomendariaEmpresa: String(payload.recomendariaEmpresa || '').trim(),
    voltariaTrabalhar: String(payload.voltariaTrabalhar || '').trim(),
    observacoes: String(payload.observacoes || '').trim(),
    melhoriaSugestao: String(payload.melhoriaSugestao || '').trim()
  };
}

function average(items, key) {
  if (!items.length) {
    return 0;
  }

  const total = items.reduce((sum, item) => sum + asNumber(item[key]), 0);
  return Number((total / items.length).toFixed(1));
}

function percentage(items, key, expectedValue) {
  if (!items.length) {
    return 0;
  }

  const total = items.filter((item) => item[key] === expectedValue).length;
  return Number(((total / items.length) * 100).toFixed(1));
}

function buildSummary(feedbacks) {
  const byCargoMap = new Map();

  feedbacks.forEach((item) => {
    const cargo = item.cargo || 'Nao informado';
    if (!byCargoMap.has(cargo)) {
      byCargoMap.set(cargo, []);
    }
    byCargoMap.get(cargo).push(item);
  });

  const byCargo = Array.from(byCargoMap.entries())
    .map(([cargo, items]) => ({
      cargo,
      total: items.length,
      salarioSatisfacao: average(items, 'salarioSatisfacao'),
      empresaSatisfacao: average(items, 'empresaSatisfacao'),
      voltariaPct: percentage(items, 'voltariaTrabalhar', 'Sim'),
      recomendariaPct: percentage(items, 'recomendariaEmpresa', 'Sim')
    }))
    .sort((left, right) => right.total - left.total);

  return {
    totalFeedbacks: feedbacks.length,
    salarioSatisfacaoMedia: average(feedbacks, 'salarioSatisfacao'),
    empresaSatisfacaoMedia: average(feedbacks, 'empresaSatisfacao'),
    liderancaSatisfacaoMedia: average(feedbacks, 'liderancaSatisfacao'),
    estruturaSatisfacaoMedia: average(feedbacks, 'estruturaSatisfacao'),
    expectativasAtendidasPct: percentage(feedbacks, 'expectativas', 'Atendeu'),
    voltariaPct: percentage(feedbacks, 'voltariaTrabalhar', 'Sim'),
    recomendariaPct: percentage(feedbacks, 'recomendariaEmpresa', 'Sim'),
    byCargo
  };
}

async function readFeedbacks() {
  if (!supabase) {
    return readFeedbacksFromFile();
  }

  const { data, error } = await supabase
    .from(supabaseTable)
    .select('id, created_at, payload')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao ler feedbacks do Supabase:', error);
    throw new Error('Nao foi possivel ler os feedbacks.');
  }

  return (data || []).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    ...((row.payload && typeof row.payload === 'object') ? row.payload : {})
  }));
}

async function createFeedback(payload) {
  const feedback = normalizeFeedback(payload);

  if (!supabase) {
    const feedbacks = readFeedbacksFromFile();
    feedbacks.push(feedback);
    writeFeedbacksToFile(feedbacks);
    return {
      feedback,
      feedbacks
    };
  }

  const { id, createdAt, ...feedbackPayload } = feedback;
  const row = {
    id,
    created_at: createdAt,
    payload: feedbackPayload
  };

  const { error } = await supabase.from(supabaseTable).insert(row);

  if (error) {
    console.error('Erro ao salvar feedback no Supabase:', error);
    throw new Error('Nao foi possivel salvar o feedback.');
  }

  const feedbacks = await readFeedbacks();

  return {
    feedback,
    feedbacks
  };
}

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'form.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(publicDir, 'dashboard.html'));
});

app.get('/detalhamento', (req, res) => {
  res.sendFile(path.join(publicDir, 'details.html'));
});

app.post('/submit-feedback', async (req, res) => {
  if (!String(req.body?.dataDesligamento || '').trim()) {
    return res.status(400).send('Data de desligamento e obrigatoria.');
  }

  try {
    await createFeedback(req.body);
    res.redirect('/dashboard');
  } catch (error) {
    res.status(500).send(error.message || 'Erro interno ao salvar feedback.');
  }
});

app.get('/api/feedbacks', async (req, res) => {
  try {
    res.json(await readFeedbacks());
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno ao carregar feedbacks.'
    });
  }
});

app.get('/api/feedbacks/summary', async (req, res) => {
  try {
    const feedbacks = await readFeedbacks();
    res.json(buildSummary(feedbacks));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno ao carregar resumo.'
    });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    service: 'exit-feedback'
  });
});

app.post('/api/feedbacks', async (req, res) => {
  if (!String(req.body?.dataDesligamento || '').trim()) {
    return res.status(400).json({
      success: false,
      message: 'Data de desligamento e obrigatoria.'
    });
  }

  try {
    const { feedback, feedbacks } = await createFeedback(req.body);

    res.status(201).json({
      success: true,
      feedback,
      summary: buildSummary(feedbacks)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Erro interno ao salvar feedback.'
    });
  }
});

ensureDataFile();

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
