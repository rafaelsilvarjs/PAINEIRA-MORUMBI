const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const publicDir = path.join(__dirname, 'public');
const dataFile = path.join(__dirname, 'feedbacks.json');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(publicDir));

function ensureDataFile() {
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, '[]');
  }
}

function readFeedbacks() {
  ensureDataFile();

  try {
    const raw = fs.readFileSync(dataFile, 'utf8').trim();
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Erro ao ler feedbacks:', error);
    return [];
  }
}

function writeFeedbacks(feedbacks) {
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

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'form.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(publicDir, 'dashboard.html'));
});

app.get('/detalhamento', (req, res) => {
  res.sendFile(path.join(publicDir, 'details.html'));
});

app.post('/submit-feedback', (req, res) => {
  if (!String(req.body?.dataDesligamento || '').trim()) {
    return res.status(400).send('Data de desligamento e obrigatoria.');
  }

  const feedbacks = readFeedbacks();
  const feedback = normalizeFeedback(req.body);

  feedbacks.push(feedback);
  writeFeedbacks(feedbacks);

  res.redirect('/dashboard');
});

app.get('/api/feedbacks', (req, res) => {
  res.json(readFeedbacks());
});

app.get('/api/feedbacks/summary', (req, res) => {
  res.json(buildSummary(readFeedbacks()));
});

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    service: 'exit-feedback'
  });
});

app.post('/api/feedbacks', (req, res) => {
  if (!String(req.body?.dataDesligamento || '').trim()) {
    return res.status(400).json({
      success: false,
      message: 'Data de desligamento e obrigatoria.'
    });
  }

  const feedbacks = readFeedbacks();
  const feedback = normalizeFeedback(req.body);

  feedbacks.push(feedback);
  writeFeedbacks(feedbacks);

  res.status(201).json({
    success: true,
    feedback,
    summary: buildSummary(feedbacks)
  });
});

ensureDataFile();

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
