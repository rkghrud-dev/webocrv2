/* eslint-disable no-undef */
// WEBOCRV2 — app demo
const { useState, useEffect } = React;

const MARKET_NAMES = ['네이버','쿠팡','롯데ON','11번가','ESM'];
const DEFAULT_MARKET_SELECTION = Object.fromEntries(
  ['A', 'B'].flatMap((account) => MARKET_NAMES.map((market) => [`${account}:${market}`, true])),
);
const DEFAULT_KEYWORD_OPTIONS = {
  accountScope: '전체',
  runUnit: '상품단위',
  concurrency: 50,
  imageSize: 1000,
  jpegMin: 88,
  jpegMax: 92,
  logoPath: '',
  logoPathB: '',
  logoRatio: 14,
  logoOpacity: 65,
  logoPosition: 'tr',
  autoContrast: true,
  sharpen: true,
  fixRotation: true,
  mirror: false,
  detailTagA: "<img src='https://gi.esmplus.com/rkghrud/상세1.jpg' />",
  detailTagB: '',
};
const SEED_STORE_PATH = 'data/seeds';
const PIPELINE_STEPS = [
  { key: 'drop', title: '원본 입력', stage: 'drop' },
  { key: 'source', title: '원본 확인', stage: 'basic', fileMode: 'source' },
  { key: 'seed-base', title: '1차 시드', stage: 'basic', fileMode: 'seed-base' },
  { key: 'seed-review', title: '2차 수정', stage: 'basic', fileMode: 'seed-review' },
  { key: 'market-seed', title: '마켓 선택', stage: 'basic', fileMode: 'seed' },
  { key: 'keyword', title: '키워드 생성', stage: 'keyword' },
  { key: 'upload', title: '업로드', stage: 'upload' },
  { key: 'result', title: '결과 확인', stage: 'result' },
];

function isSeedFile(file) {
  const name = (file?.name || '').toLowerCase();
  return name.endsWith('.webseed.json')
    || name.endsWith('.seed.json')
    || name.includes('webseed')
    || name.includes('시드')
    || name.includes('seed');
}

function getScopedMarketKeys(selection, accountScope = '전체') {
  return Object.entries(selection || {})
    .filter(([, enabled]) => enabled !== false)
    .map(([key]) => key)
    .filter((key) => !key.endsWith(':Cafe24'))
    .filter((key) => accountScope === '전체' || key.startsWith(`${accountScope}:`));
}

function storePipelinePayload(key, payload) {
  if (!payload) return;
  try {
    localStorage.setItem(key, JSON.stringify(payload, null, 2));
    window.WEBOCR_LAST_PIPELINE_PAYLOAD = payload;
  } catch {}
}

function uploadQueueKey(channelKey, gs) {
  return `${channelKey || ''}:${gs || ''}`;
}

function historyKey(channelKey, gs) {
  return `${channelKey || ''}:${gs || ''}`;
}

function rowsWithUploadHistory(rows, history) {
  const marketIndex = { Cafe24: 0, 네이버: 1, 쿠팡: 2, 롯데ON: 3, '11번가': 4, ESM: 5 };
  return rows.map((row) => {
    const next = {
      ...row,
      A: Array.isArray(row.A) ? [...row.A] : ['muted','muted','muted','muted','muted','muted'],
      B: Array.isArray(row.B) ? [...row.B] : ['muted','muted','muted','muted','muted','muted'],
    };
    if (row.cafe24Url) {
      next.A[0] = 'uploaded';
      next.B[0] = 'uploaded';
    }
    Object.values(history || {}).forEach((item) => {
      if (item?.gs !== row.gs || !item?.channelKey) return;
      const [account, market] = item.channelKey.split(':');
      const index = marketIndex[market];
      if (!['A', 'B'].includes(account) || index == null) return;
      const status = item.status === 'uploaded'
        ? 'uploaded'
        : item.status === 'failed'
          ? 'failed'
          : item.status === 'exported'
            ? 'excel'
            : item.status === 'requested'
              ? 'targeted'
              : 'targeted';
      next[account][index] = status;
    });
    return next;
  });
}

function countKeywordTerms(pool = {}) {
  return Object.values(pool || {}).reduce((total, value) => total + (Array.isArray(value) ? value.length : 0), 0);
}

function seedPayloadToFile(seedPayload, meta = {}) {
  const products = Array.isArray(seedPayload?.products) ? seedPayload.products : [];
  const preview = products.map((product, index) => {
    const images = product.images || {};
    const ocr = product.ocrAnalysis || {};
    const cafe24 = product.cafe24 || product.cafe24Upload || {};
    return {
      id: product.gs || `seed-${index + 1}`,
      gs: product.gs || '',
      baseGs: product.baseGs || '',
      name: product.reviewFields?.productName || product.sourceName || product.gs || '',
      price: Number(product.price || 0),
      opt: product.optionSummary || '단일',
      thumb: images.representative || images.sourceThumb || '',
      images,
      optionItems: product.optionItems || [],
      optionType: product.optionType || '',
      optionCount: product.optionCount || 0,
      ocrStatus: ocr.status || 'pending',
      imageSize: images.processedSize || '',
      keywordCount: countKeywordTerms(product.keywordCandidatePool),
      cafe24Url: cafe24.url || cafe24.productUrl || '',
      originalName: product.sourceName || product.gs || '',
      history: product.uploadHistory || [],
      seedProduct: product,
    };
  });
  return {
    name: meta.name || seedPayload?.name || 'seed.webseed.json',
    kind: meta.kind || '시드 파일',
    size: Number(meta.size || 0),
    rows: Number(seedPayload?.sourceFilter?.filteredRows || products.length),
    gsCodes: products.length,
    preview,
    seedPayload,
    sourcePath: meta.path || '',
    pipelineResult: seedPayload?.pipelineResult || {},
  };
}

async function fetchSeedPayload(path) {
  const response = await fetch(`/api/seed?path=${encodeURIComponent(path)}`);
  const payload = await response.json();
  if (!response.ok || !payload?.ok) throw new Error(payload?.error || `seed ${response.status}`);
  return payload.seed;
}

function rowsForFile(file) {
  const preview = file?.preview || [];
  if (!preview.length) return [];
  return preview.map((row, index) => ({
    id: row.id || `source-${index + 1}`,
    gs: row.gs,
    name: row.name,
    price: row.price || 0,
    opt: row.opt || '단일',
    thumb: row.thumb || '',
    images: row.images || row.seedProduct?.images || {},
    optionType: row.optionType || '',
    optionCount: row.optionCount || 0,
    optionItems: row.optionItems || [],
    seedProduct: row.seedProduct || null,
    keywordCandidatePool: row.seedProduct?.keywordCandidatePool || row.keywordCandidatePool || {},
    generatedKeywordSeed: row.seedProduct?.generatedKeywordSeed || row.generatedKeywordSeed || {},
    marketKeywords: row.seedProduct?.marketKeywords || row.marketKeywords || {},
    keywordGeneration: row.seedProduct?.keywordGeneration || row.keywordGeneration || {},
    cafe24Url: row.cafe24Url || '',
    ocrStatus: row.ocrStatus || '',
    imageSize: row.imageSize || '',
    keywordCount: row.keywordCount || 0,
    originalName: row.originalName || row.name,
    history: row.history || [],
    A: ['muted','muted','muted','muted','muted','muted'],
    B: ['muted','muted','muted','muted','muted','muted'],
  }));
}

function App() {
  const [stage, setStage]     = useState('drop');    // 'drop' | 'basic' | 'keyword' | 'upload' | 'matrix'
  const [file,  setFile]      = useState(null);
  const [fileMode, setFileMode] = useState('source'); // 'source' | 'seed-base' | 'seed-review' | 'seed'
  const [source, setSource]   = useState(null);
  const [selected, setSelected] = useState(null);
  const [selectedGs, setSelectedGs] = useState(new Set());
  const [lastCheckedGs, setLastCheckedGs] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [keywordOptionsOpen, setKeywordOptionsOpen] = useState(false);
  const [keywordOptions, setKeywordOptions] = useState(() => {
    try {
      return {
        ...DEFAULT_KEYWORD_OPTIONS,
        ...JSON.parse(localStorage.getItem('webocr.keywordOptions') || '{}'),
        concurrency: 50,
        imageSize: 1000,
      };
    } catch {
      return DEFAULT_KEYWORD_OPTIONS;
    }
  });
  const [activeChannel, setActiveChannel] = useState('A:네이버');
  const [activeImageProduct, setActiveImageProduct] = useState('');
  const [marketSelection, setMarketSelection] = useState(DEFAULT_MARKET_SELECTION);
  const [seedLibrary, setSeedLibrary] = useState([]);
  const [sourceSeedJob, setSourceSeedJob] = useState(null);
  const [keywordJob, setKeywordJob] = useState(null);
  const [uploadQueue, setUploadQueue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('webocr.uploadQueue') || '{}');
    } catch {
      return {};
    }
  });
  const [uploadHistory, setUploadHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('webocr.uploadHistory') || '{}');
    } catch {
      return {};
    }
  });
  const [appLogs, setAppLogs] = useState([{time:'시작', message:'WEBOCRV2 로컬 서버 대기'}]);
  const baseProductRows = React.useMemo(() => rowsForFile(file), [file]);
  const productRows = React.useMemo(() => rowsWithUploadHistory(baseProductRows, uploadHistory), [baseProductRows, uploadHistory]);
  const addLog = (message) => {
    const time = new Date().toLocaleTimeString('ko-KR', { hour12:false });
    setAppLogs((prev) => [...prev.slice(-80), {time, message}]);
  };
  useEffect(() => {
    let alive = true;
    fetch('/api/seeds')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error(`seeds ${response.status}`)))
      .then((payload) => {
        if (alive && payload?.ok) setSeedLibrary(payload.seeds || []);
      })
      .catch((error) => {
        const time = new Date().toLocaleTimeString('ko-KR', { hour12:false });
        setAppLogs((prev) => [...prev.slice(-80), {time, message:`시드 목록 로드 실패: ${error.message}`}]);
      });
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('webocr.uploadQueue', JSON.stringify(uploadQueue, null, 2));
    } catch {}
  }, [uploadQueue]);
  useEffect(() => {
    try {
      localStorage.setItem('webocr.uploadHistory', JSON.stringify(uploadHistory, null, 2));
    } catch {}
  }, [uploadHistory]);

  const counts = React.useMemo(() => {
    const out = {
      A: { total: 0, targeted: 0, uploaded: 0 },
      B: { total: 0, targeted: 0, uploaded: 0 },
      all: { total: 0, targeted: 0, uploaded: 0 },
    };
    productRows.forEach(r => {
      ['A', 'B'].forEach((account) => {
        r[account].forEach((status) => {
          out[account].total += 1;
          out.all.total += 1;
          if (status === 'targeted') {
            out[account].targeted += 1;
            out.all.targeted += 1;
          }
          if (status === 'uploaded') {
            out[account].uploaded += 1;
            out.all.uploaded += 1;
          }
        });
      });
    });
    return out;
  }, [productRows]);

  const onDrop = async (inputFile) => {
    if (!inputFile) return;
    const seed = isSeedFile(inputFile);
    addLog(`${inputFile.name} 불러오기 시작`);
    const nextFile = {
      name: inputFile.name,
      size: inputFile.size || 0,
      kind: seed ? '시드 파일' : '소스 파일',
      rows: 0,
      gsCodes: 0,
      preview: [],
    };

    setFile(nextFile);
    setFileMode(seed ? 'seed-review' : 'source');
    setSource({ name:nextFile.name, count:0, importedAt:'방금' });
    setSelected(null);
    setSelectedGs(new Set());
    setLastCheckedGs(null);
    setStage('basic');
    setSourceSeedJob(null);

    if (seed) {
      try {
        const seedPayload = JSON.parse(await inputFile.text());
        const seedFile = seedPayloadToFile(seedPayload, {
          name: inputFile.name,
          size: inputFile.size,
          kind: '시드 파일',
        });
        setFile(seedFile);
        setFileMode('seed-review');
        setSource({ name:seedFile.name, count:seedFile.rows, importedAt:seedPayload.createdAt || '방금' });
        setSelectedGs(new Set(seedFile.preview.map((row) => row.gs)));
        addLog(`시드 로드 완료: 상품 ${seedFile.gsCodes}개`);
      } catch (error) {
        addLog(`시드 파일 읽기 실패: ${error.message}`);
        setSourceSeedJob({ status:'failed', action:'seedLoad', error:error.message });
      }
      return;
    }

    if (inputFile && !seed) {
      try {
        const form = new FormData();
        form.append('file', inputFile);
        const response = await fetch('/api/import-source', { method: 'POST', body: form });
        const uploaded = await response.json();
        if (!response.ok || !uploaded?.ok) throw new Error(uploaded?.error || `upload ${response.status}`);
        const parsed = uploaded.parsed || {};
        const realPreview = parsed.preview || [];
        const realFile = {
          ...nextFile,
          sourcePath: uploaded.path,
          uploadId: uploaded.uploadId,
          size: uploaded.size || nextFile.size,
          rows: parsed.rows ?? nextFile.rows,
          gsCodes: parsed.gsCodes ?? nextFile.gsCodes,
          preview: realPreview.length ? realPreview : nextFile.preview,
          columns: parsed.columns || [],
        };
        setFile((current) => current ? {
          ...current,
          ...realFile,
        } : realFile);
        setSource({
          name:nextFile.name,
          count:realFile.rows,
          importedAt:'2026-05-12 11:40',
          sourcePath: uploaded.path,
        });
        setSelectedGs(new Set((realFile.preview || []).map((row) => row.gs)));
        addLog(`파싱 완료: ${realFile.rows}행 · GS ${realFile.gsCodes}개 · 미리보기 ${realFile.preview.length}개`);
      } catch (error) {
        addLog(`원본 파일 서버 저장/파싱 실패: ${error.message}`);
        setSourceSeedJob({
          status: 'failed',
          action: 'sourceUpload',
          error: `원본 파일 서버 저장 실패: ${error.message}`,
        });
      }
    }
  };
  const onImportClick = () => setStage('drop');
  const resetWorkspace = () => {
    setStage('drop');
    setFile(null);
    setFileMode('source');
    setSource(null);
    setSelected(null);
    setSettingsOpen(false);
    setKeywordOptionsOpen(false);
    setSourceSeedJob(null);
    setKeywordJob(null);
    setMarketSelection(DEFAULT_MARKET_SELECTION);
    setSelectedGs(new Set());
    setLastCheckedGs(null);
    setAppLogs([{time:'초기화', message:'작업 상태 초기화'}]);
  };
  const switchView = (view) => {
    if (!file) return;
    setSelected(null);
    setStage(view);
  };
  const pollSourceSeedJob = (jobId) => {
    window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        const job = await response.json();
        if (!response.ok || !job?.ok) throw new Error(job?.error || `job ${response.status}`);
        setSourceSeedJob(job);
        if (job.status === 'completed' && job.result) {
          addLog(`1차 시드 생성 완료: ${job.result.seedFileName}`);
          const seedPayload = await fetchSeedPayload(job.result.seedPath);
          const seedFile = seedPayloadToFile(seedPayload, {
            name: job.result.seedFileName,
            kind: '시드 파일',
            size: job.result.seedSize || 0,
            path: job.result.seedPath,
          });
          const seedRecord = {
            id: `seed-${job.jobId}`,
            name: seedFile.name,
            createdAt: job.finishedAt || '2026-05-12 11:40',
            rows: seedFile.rows,
            gsCodes: seedFile.gsCodes,
            size: seedFile.size,
            thumbnail: seedFile.preview?.[0]?.thumb,
            path: job.result.seedPath,
          };
          setFile(seedFile);
          setFileMode('seed-base');
          setSource({ name:seedFile.name, count:seedFile.rows, importedAt:seedRecord.createdAt, sourcePath: job.result.seedPath });
          setSeedLibrary((prev) => [seedRecord, ...prev.filter((item) => item.name !== seedRecord.name)]);
          setSelectedGs(new Set(seedFile.preview.map((row) => row.gs)));
          return;
        }
        if (job.status !== 'failed') pollSourceSeedJob(jobId);
        if (job.status === 'failed') addLog(`1차 시드 생성 실패: ${job.error || 'unknown error'}`);
      } catch (error) {
        addLog(`작업 상태 조회 실패: ${error.message}`);
        setSourceSeedJob({ jobId, status: 'failed', error: error.message });
      }
    }, 1500);
  };
  const createSeedFile = async () => {
    if (!file) return;
    if (selectedGs.size === 0) {
      addLog('1차 시드 생성 중단: 선택된 상품이 없습니다.');
      setSourceSeedJob({
        status: 'failed',
        action: 'sourceToSeed',
        createdAt: '방금',
        error: '선택된 상품이 없습니다.',
        tail: ['상품을 1개 이상 선택한 뒤 다시 실행하세요.'],
      });
      return;
    }
    const payload = window.WEBOCR_PIPELINE?.buildSourceToSeedPayload?.({
      file,
      selectedGs,
      options: keywordOptions,
    });
    const actualPayload = {
      ...payload,
      sourcePath: file.sourcePath || source?.sourcePath || '',
      sourceFilePath: file.sourcePath || source?.sourcePath || '',
    };
    storePipelinePayload('webocr.pipeline.sourceToSeed', actualPayload);
    if (!actualPayload.sourcePath) {
      setSourceSeedJob({ status: 'failed', error: '원본 파일이 아직 서버에 저장되지 않았습니다. 파일을 다시 드래그해서 넣어주세요.' });
      return;
    }
    setSourceSeedJob({
          status: 'queued',
          action: 'sourceToSeed',
          createdAt: '방금',
          progressPercent: 2,
          currentStage: '선택 원본 준비',
          tail: [`선택 상품 ${selectedGs.size}개 기준으로 필터 원본 생성 중`],
        });
    addLog(`1차 시드 생성 요청 전송: 선택 ${selectedGs.size}개`);
    try {
      const response = await fetch('/api/source-to-seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actualPayload),
      });
      const job = await response.json();
      if (!response.ok || !job?.ok) throw new Error(job?.error || `job ${response.status}`);
      setSourceSeedJob(job);
      addLog(`서버 작업 생성: ${job.jobId}`);
      pollSourceSeedJob(job.jobId);
    } catch (error) {
      addLog(`1차 시드 생성 요청 실패: ${error.message}`);
      setSourceSeedJob({ status: 'failed', action: 'sourceToSeed', error: error.message });
    }
  };
  const loadSecondSeed = () => {
    if (!file) return;
    setFile({
      ...file,
      name: file.name.replace(/\.webseed\.json$/i, '.review.webseed.json'),
      kind: '2차 수정 시드',
    });
    setFileMode('seed-review');
  };
  const startMarketWork = () => {
    setFileMode('seed');
  };
  const loadSeedFromLibrary = async (seed) => {
    try {
      addLog(`시드 파일 로드: ${seed.name}`);
      const seedPayload = await fetchSeedPayload(seed.path);
      const seedFile = seedPayloadToFile(seedPayload, {
        name: seed.name,
        kind: '시드 파일',
        size: seed.size,
        path: seed.path,
      });
      setFile(seedFile);
      setFileMode('seed-review');
      setSource({ name:seedFile.name, count:seedFile.rows, importedAt:seed.createdAt, sourcePath: seed.path });
      setSelected(null);
      setSelectedGs(new Set(seedFile.preview.map((row) => row.gs)));
      setLastCheckedGs(null);
      setStage('basic');
    } catch (error) {
      addLog(`시드 파일 로드 실패: ${error.message}`);
      setSourceSeedJob({ status:'failed', action:'seedLoad', error:error.message });
    }
  };
  const deleteSeedFromLibrary = async (seed) => {
    if (!seed?.path) return;
    if (!window.confirm(`${seed.name}\n\n이 시드 파일을 삭제할까요?`)) return;
    try {
      const response = await fetch('/api/seed-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action:'delete', path: seed.path }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.ok) throw new Error(payload?.error || `delete ${response.status}`);
      setSeedLibrary(payload.seeds || []);
      if (file?.sourcePath === seed.path) {
        setFile(null);
        setSource(null);
        setSelectedGs(new Set());
        setStage('drop');
      }
      addLog(`시드 삭제: ${seed.name}`);
    } catch (error) {
      addLog(`시드 삭제 실패: ${error.message}`);
      setSourceSeedJob({ status:'failed', action:'seedDelete', error:error.message });
    }
  };
  const renameSeedFromLibrary = async (seed) => {
    if (!seed?.path) return;
    const nextName = window.prompt('새 시드 파일명', seed.name);
    if (!nextName || nextName === seed.name) return;
    try {
      const response = await fetch('/api/seed-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action:'rename', path: seed.path, newName: nextName }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.ok) throw new Error(payload?.error || `rename ${response.status}`);
      setSeedLibrary(payload.seeds || []);
      if (file?.sourcePath === seed.path && payload.seed) {
        setFile((current) => current ? { ...current, name: payload.seed.name, sourcePath: payload.seed.path } : current);
        setSource((current) => current ? { ...current, name: payload.seed.name, sourcePath: payload.seed.path } : current);
      }
      addLog(`시드 이름 수정: ${seed.name} → ${payload.seed?.name || nextName}`);
    } catch (error) {
      addLog(`시드 이름 수정 실패: ${error.message}`);
      setSourceSeedJob({ status:'failed', action:'seedRename', error:error.message });
    }
  };
  const toggleMarket = (key) => {
    setMarketSelection((prev) => ({ ...prev, [key]: prev[key] === false }));
  };
  const queueUploadItem = (items) => {
    const list = Array.isArray(items) ? items : [items];
    const validItems = list.filter((item) => item?.gs && item?.channelKey);
    if (!validItems.length) return;
    const queuedAt = new Date().toISOString();
    setUploadQueue((prev) => {
      const next = { ...prev };
      validItems.forEach((item) => {
        const key = uploadQueueKey(item.channelKey, item.gs);
        next[key] = {
          ...next[key],
          ...item,
          queueKey: key,
          status: 'queued',
          queuedAt,
        };
      });
      return next;
    });
    addLog(`업로드 대기열 반영: ${validItems.length}개`);
    setUploadHistory((prev) => {
      const next = { ...prev };
      validItems.forEach((item) => {
        const key = historyKey(item.channelKey, item.gs);
        next[key] = {
          ...next[key],
          ...item,
          historyKey: key,
          status: 'queued',
          updatedAt: queuedAt,
        };
      });
      return next;
    });
    setStage('upload');
  };
  const updateUploadHistory = (items, status) => {
    const list = Array.isArray(items) ? items : [items];
    const validItems = list.filter((item) => item?.gs && item?.channelKey);
    if (!validItems.length) return;
    const updatedAt = new Date().toISOString();
    setUploadHistory((prev) => {
      const next = { ...prev };
      validItems.forEach((item) => {
        const key = historyKey(item.channelKey, item.gs);
        next[key] = {
          ...next[key],
          ...item,
          historyKey: key,
          status,
          updatedAt,
        };
      });
      return next;
    });
  };
  const openKeywordOptions = () => {
    setKeywordOptionsOpen(true);
  };
  const generateKeywords = () => {
    startKeywordRun(keywordOptions);
  };
  const applyCompletedKeywordJob = async (job) => {
    addLog(`키워드 생성 완료: 상품 ${job.result.products}개 · 채널 결과 ${job.result.generatedChannels}개`);
    const seedPayload = await fetchSeedPayload(job.result.seedPath);
    const seedFile = seedPayloadToFile(seedPayload, {
      name: file?.name || 'keyword.webseed.json',
      kind: '마켓 키워드 시드',
      size: 0,
      path: job.result.seedPath,
    });
    setFile((current) => ({
      ...seedFile,
      name: current?.name || seedFile.name,
      sourcePath: job.result.seedPath,
    }));
    setSource((current) => current ? { ...current, sourcePath: job.result.seedPath } : current);
    setKeywordJob(job);
  };
  const pollKeywordJob = (jobId) => {
    window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        const job = await response.json();
        if (!response.ok || !job?.ok) throw new Error(job?.error || `job ${response.status}`);
        setKeywordJob(job);
        if (job.status === 'completed' && job.result) {
          await applyCompletedKeywordJob(job);
          return;
        }
        if (job.status !== 'failed') pollKeywordJob(jobId);
        if (job.status === 'failed') addLog(`키워드 생성 실패: ${job.error || 'unknown error'}`);
      } catch (error) {
        addLog(`키워드 작업 상태 조회 실패: ${error.message}`);
        setKeywordJob({ jobId, status:'failed', error:error.message });
      }
    }, 1800);
  };
  useEffect(() => {
    if (!keywordJob?.jobId || !['queued', 'running'].includes(keywordJob.status)) return undefined;
    let cancelled = false;
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/jobs/${keywordJob.jobId}`);
        const job = await response.json();
        if (cancelled || !response.ok || !job?.ok) return;
        setKeywordJob(job);
        if (job.status === 'completed' && job.result) {
          await applyCompletedKeywordJob(job);
        }
        if (job.status === 'failed') addLog(`키워드 생성 실패: ${job.error || 'unknown error'}`);
      } catch (error) {
        if (!cancelled) addLog(`키워드 작업 재확인 실패: ${error.message}`);
      }
    }, 2500);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [keywordJob?.jobId, keywordJob?.status, file?.name]);
  const startKeywordRun = async (options) => {
    const nextOptions = {
      ...options,
      concurrency: 50,
      imageSize: 1000,
    };
    const payload = window.WEBOCR_PIPELINE?.buildKeywordRunPayload?.({
      file,
      selectedGs,
      options: nextOptions,
      marketSelection,
    });
    const actualPayload = {
      ...payload,
      seedPath: file?.sourcePath || source?.sourcePath || '',
      sourcePath: file?.sourcePath || source?.sourcePath || '',
      options: nextOptions,
    };
    storePipelinePayload('webocr.pipeline.keywordSeed', actualPayload);
    setKeywordOptions(nextOptions);
    try {
      localStorage.setItem('webocr.keywordOptions', JSON.stringify(nextOptions));
    } catch {}
    const firstChannel = getScopedMarketKeys(marketSelection, nextOptions.accountScope)[0] || 'A:네이버';
    const firstRow = productRows.find((row) => selectedGs.has(row.gs));
    setKeywordOptionsOpen(false);
    setSelected(null);
    setActiveChannel(firstChannel);
    setActiveImageProduct(firstRow?.id || '');
    setStage('keyword');
    if (!actualPayload.seedPath) {
      addLog('키워드 생성 중단: 시드 파일 경로가 없습니다.');
      setKeywordJob({ status:'failed', action:'keywordGenerate', error:'시드 파일 경로가 없습니다. 시드를 다시 불러와 주세요.' });
      return;
    }
    if (selectedGs.size === 0) {
      addLog('키워드 생성 중단: 선택된 상품이 없습니다.');
      setKeywordJob({ status:'failed', action:'keywordGenerate', error:'선택된 상품이 없습니다.' });
      return;
    }
    setKeywordJob({
      status:'queued',
      action:'keywordGenerate',
      createdAt:'방금',
      progressPercent:1,
      currentStage:'Codex 키워드 생성 대기',
      selectedGs:Array.from(selectedGs),
      channels:actualPayload.channels || [],
    });
    addLog(`키워드 생성 요청 전송: 상품 ${selectedGs.size}개 · 채널 ${(actualPayload.channels || []).length}개`);
    try {
      const response = await fetch('/api/keyword-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actualPayload),
      });
      const job = await response.json();
      if (!response.ok || !job?.ok) throw new Error(job?.error || `job ${response.status}`);
      setKeywordJob(job);
      addLog(`키워드 서버 작업 생성: ${job.jobId}`);
      pollKeywordJob(job.jobId);
    } catch (error) {
      addLog(`키워드 생성 요청 실패: ${error.message}`);
      setKeywordJob({ status:'failed', action:'keywordGenerate', error:error.message });
    }
  };
  const selectAllProducts = () => {
    setSelectedGs(new Set(productRows.map((row) => row.gs)));
  };
  const clearAllProducts = () => {
    setSelectedGs(new Set());
    setLastCheckedGs(null);
  };
  const toggleProductSelection = (gs, index, event, rows = productRows) => {
    const rangeStart = rows.findIndex((row) => row.gs === lastCheckedGs);
    setSelectedGs((prev) => {
      const next = new Set(prev);
      if (event?.shiftKey && rangeStart >= 0) {
        const start = Math.min(rangeStart, index);
        const end = Math.max(rangeStart, index);
        rows.slice(start, end + 1).forEach((row) => next.add(row.gs));
      } else if (next.has(gs)) {
        next.delete(gs);
      } else {
        next.add(gs);
      }
      return next;
    });
    setLastCheckedGs(gs);
  };
  const getFlowKey = () => {
    if (stage === 'drop') return 'drop';
    if (stage === 'keyword') return 'keyword';
    if (stage === 'upload') return 'upload';
    if (stage === 'result') return 'result';
    if (fileMode === 'source') return 'source';
    if (fileMode === 'seed-base') return 'seed-base';
    if (fileMode === 'seed-review') return 'seed-review';
    return 'market-seed';
  };
  const currentFlowKey = getFlowKey();
  const currentFlowIndex = Math.max(0, PIPELINE_STEPS.findIndex((step) => step.key === currentFlowKey));
  const sourceSeedRunning = ['queued', 'running'].includes(sourceSeedJob?.status);
  const keywordRunning = ['queued', 'running'].includes(keywordJob?.status);
  const selectedProductRows = productRows.filter((row) => selectedGs.has(row.gs));
  const keywordHasResults = selectedProductRows.length > 0 && selectedProductRows.some((row) => {
    const marketKeywords = row.marketKeywords || row.seedProduct?.marketKeywords || {};
    return Object.keys(marketKeywords).length > 0;
  });
  const sourceSeedProgress = Math.max(0, Math.min(100, Number(
    sourceSeedJob?.progressPercent
      ?? (sourceSeedJob?.status === 'completed' ? 100 : sourceSeedJob?.status === 'failed' ? 100 : 0)
  )));
  const sourceSeedStage = sourceSeedJob?.currentStage
    || (sourceSeedRunning ? '1차 시드 생성 실행중' : sourceSeedJob?.status === 'completed' ? '1차 시드 생성 완료' : '');
  const keywordProgress = Math.max(0, Math.min(100, Number(
    keywordJob?.progressPercent
      ?? (keywordJob?.status === 'completed' ? 100 : keywordJob?.status === 'failed' ? 100 : 0)
  )));
  const keywordStage = keywordJob?.currentStage
    || (keywordRunning ? '키워드 생성 실행중' : keywordJob?.status === 'completed' ? '키워드 생성 완료' : '');
  const moveToFlowStep = (step) => {
    setSelected(null);
    if (!step) return;
    setStage(step.stage);
    if (step.fileMode) setFileMode(step.fileMode);
  };
  const goBack = () => {
    moveToFlowStep(PIPELINE_STEPS[currentFlowIndex - 1]);
  };
  const goForward = () => {
    setSelected(null);
    if (currentFlowKey === 'drop') {
      moveToFlowStep(PIPELINE_STEPS[currentFlowIndex + 1]);
      return;
    }
    if (currentFlowKey === 'source') {
      createSeedFile();
      return;
    }
    if (currentFlowKey === 'seed-base') {
      loadSecondSeed();
      return;
    }
    if (currentFlowKey === 'seed-review') {
      startMarketWork();
      return;
    }
    if (currentFlowKey === 'market-seed') {
      generateKeywords();
      return;
    }
    if (currentFlowKey === 'keyword') {
      if (!keywordHasResults) {
        generateKeywords();
        return;
      }
      setStage('upload');
      return;
    }
    if (currentFlowKey === 'upload') {
      setStage('result');
    }
  };
  const navState = (() => {
    const currentStep = PIPELINE_STEPS[currentFlowIndex] || PIPELINE_STEPS[0];
    const previousStep = PIPELINE_STEPS[currentFlowIndex - 1];
    const forwardLabel = !file
      ? '파일 대기'
      : currentFlowKey === 'source'
      ? '1차 시드 생성'
      : currentFlowKey === 'seed-base'
        ? '2차 수정 시드'
        : currentFlowKey === 'seed-review'
          ? '마켓별 작업'
            : currentFlowKey === 'market-seed'
              ? '키워드 생성'
            : currentFlowKey === 'keyword'
              ? keywordHasResults ? '업로드 화면' : '키워드 생성 시작'
              : currentFlowKey === 'upload'
                ? '결과 확인'
              : PIPELINE_STEPS[currentFlowIndex + 1]?.title || '다음';
    return {
      title: currentStep.title,
      backLabel: previousStep?.title || '처음 단계',
      forwardLabel: sourceSeedRunning ? `생성 중 ${sourceSeedProgress}%` : keywordRunning ? `생성 중 ${keywordProgress}%` : forwardLabel,
      canBack: currentFlowIndex > 0,
      canForward: currentFlowIndex < PIPELINE_STEPS.length - 1 && !!file && !sourceSeedRunning && !keywordRunning,
    };
  })();

  const product = selected && (() => {
    const r = productRows.find(x => x.id === selected);
    return r ? { ...r, originalName:r.originalName || r.name, history:r.history || [] } : null;
  })();
  const basicCrumb = fileMode === 'source'
    ? 'STEP 02 · 원본 기본화면 · source_products'
    : fileMode === 'seed-base'
      ? 'STEP 02 · 1차 시드 · base_seed_dataset'
      : fileMode === 'seed-review'
        ? 'STEP 03 · 2차 수정 시드 · review_seed'
        : 'STEP 04 · 마켓 작업 시드 · market_seed';

  return (
    <div className="app">
      <TopBar
        source={source?.name}
        onImport={onImportClick}
        onReset={resetWorkspace}
        onSettings={() => setSettingsOpen(true)}/>
      <div className="body">
        <Sidebar
          source={source}
          seedFiles={seedLibrary}
          seedStorePath={SEED_STORE_PATH}
          onLoadSeed={loadSeedFromLibrary}
          onRenameSeed={renameSeedFromLibrary}
          onDeleteSeed={deleteSeedFromLibrary}/>

        <main className="main">
          {stage === 'drop' && (
            <>
              <div className="section-head">
                <div className="left">
                  <span className="crumbs">STEP 01 · 원본 입력</span>
                  <h2>새 소스 파일 불러오기</h2>
                </div>
                <div className="right">
                  <GhostBtn>최근 파일</GhostBtn>
                </div>
              </div>
              <DropZone onDrop={onDrop}/>
            </>
          )}

          {stage === 'basic' && file && (
            <>
              <div className="section-head">
                <div className="left">
                  <span className="crumbs">{basicCrumb}</span>
                  <h2>{file.name}</h2>
                </div>
                <ViewSwitch view="basic" onChange={switchView}/>
              </div>
              <ImportPreview
                file={file}
                mode={fileMode}
                selectedGs={selectedGs}
                sourceJob={sourceSeedJob}
                onToggleProduct={toggleProductSelection}
                onSelectAll={selectAllProducts}
                onClearAll={clearAllProducts}/>
            </>
          )}

          {stage === 'matrix' && (
            <>
              <div className="section-head">
                <div className="left">
                  <span className="crumbs">STEP 03 · 마켓 분기 · listing_status</span>
                  <h2>상품 매트릭스</h2>
                </div>
                <AccountSummary counts={counts}/>
                <div className="summary">
                  <div><small>총</small><strong>{counts.all.total}</strong></div>
                  <div><small>등록</small><strong style={{color:'var(--color-night-violet)'}}>{counts.all.targeted}</strong></div>
                  <div><small>업로드 완료</small><strong style={{color:'var(--color-quizlet-violet)'}}>{counts.all.uploaded}</strong></div>
                  <ViewSwitch view="matrix" onChange={switchView}/>
                </div>
              </div>
              <ProductMatrix
                rows={productRows}
                selectedId={selected}
                selectedGs={selectedGs}
                onToggleProduct={toggleProductSelection}
                onSelectAll={selectAllProducts}
                onClearAll={clearAllProducts}
                onSelect={(id) => setSelected(id === selected ? null : id)}/>
            </>
          )}

          {stage === 'keyword' && file && (
            <>
              <div className="section-head">
                <div className="left">
                  <span className="crumbs">STEP 05 · 마켓별 키워드 생성 · keyword_seed</span>
                  <h2>마켓별 키워드 생성</h2>
                </div>
                <AccountSummary counts={counts}/>
                <div className="summary">
                  <div><small>대상</small><strong>{selectedGs.size}</strong></div>
                  <div><small>병렬</small><strong style={{color:'var(--color-quizlet-violet)'}}>{keywordOptions.concurrency}</strong></div>
                  <AuroraBtn icon={<IconSync size={16}/>} onClick={generateKeywords} disabled={keywordRunning}>
                    {keywordRunning ? `생성 중 ${keywordProgress}%` : '키워드 생성 시작'}
                  </AuroraBtn>
                  <GhostBtn onClick={openKeywordOptions}>옵션</GhostBtn>
                </div>
              </div>
              <KeywordWorkbench
                rows={productRows}
                selectedGs={selectedGs}
                marketSelection={marketSelection}
                options={keywordOptions}
                activeChannel={activeChannel}
                onChannelChange={setActiveChannel}
                activeProductId={activeImageProduct}
                onActiveProductChange={setActiveImageProduct}
                keywordJob={keywordJob}
                onStartKeyword={generateKeywords}
                uploadQueue={uploadQueue}
                onQueueUploadItem={queueUploadItem}/>
            </>
          )}

          {stage === 'upload' && file && (
            <>
              <div className="section-head">
                <div className="left">
                  <span className="crumbs">STEP 04 · 마켓 업로드 · market_upload</span>
                  <h2>마켓별 업로드</h2>
                </div>
                <div className="summary">
                  <div><small>대기열</small><strong>{Object.keys(uploadQueue || {}).length}</strong></div>
                  <div><small>API/Excel</small><strong style={{color:'var(--color-quizlet-violet)'}}>선택</strong></div>
                </div>
              </div>
              <MarketUploadWorkbench
                rows={productRows}
                selectedGs={selectedGs}
                marketSelection={marketSelection}
                options={keywordOptions}
                activeChannel={activeChannel}
                onChannelChange={setActiveChannel}
                uploadQueue={uploadQueue}
                onUploadHistoryChange={updateUploadHistory}/>
            </>
          )}

          {stage === 'result' && file && (
            <>
              <div className="section-head">
                <div className="left">
                  <span className="crumbs">STEP 07 · 업로드 결과 · listing_status</span>
                  <h2>상품별 업로드 결과</h2>
                </div>
                <AccountSummary counts={counts}/>
                <div className="summary">
                  <div><small>총</small><strong>{counts.all.total}</strong></div>
                  <div><small>대기/등록</small><strong style={{color:'var(--color-night-violet)'}}>{counts.all.targeted}</strong></div>
                  <div><small>업로드 완료</small><strong style={{color:'var(--color-quizlet-violet)'}}>{counts.all.uploaded}</strong></div>
                </div>
              </div>
              <ProductMatrix
                rows={productRows}
                selectedId={selected}
                selectedGs={selectedGs}
                onToggleProduct={toggleProductSelection}
                onSelectAll={selectAllProducts}
                onClearAll={clearAllProducts}
                onSelect={(id) => setSelected(id === selected ? null : id)}/>
            </>
          )}

          {stage !== 'drop' && stage !== 'keyword' && stage !== 'upload' && stage !== 'result' && file && (
            <>
              <WorkflowActionPanel
                mode={fileMode}
                file={file}
                markets={marketSelection}
                onToggleMarket={toggleMarket}/>
            </>
          )}
          <section className="app-log-panel surface">
            <div className="app-log-head">
              <span>실행 로그</span>
              <strong>{appLogs.length}</strong>
            </div>
            <div className="app-log-lines">
              {appLogs.slice(-6).map((log, index) => (
                <code key={index}>[{log.time}] {log.message}</code>
              ))}
            </div>
          </section>
          <nav className="page-step-nav surface" aria-label="페이지 이동">
            <ol className="page-flow-rail">
              {PIPELINE_STEPS.map((step, index) => (
                <li
                  key={step.key}
                  className={`${index < currentFlowIndex ? 'is-done' : ''} ${index === currentFlowIndex ? 'is-active' : ''}`}>
                  <i/>
                  <span>{step.title}</span>
                </li>
              ))}
            </ol>
            <GhostBtn onClick={goBack} disabled={!navState.canBack}>
              뒤로: {navState.backLabel}
            </GhostBtn>
            <div className="page-step-current">
              <span>현재 단계</span>
              <strong>{navState.title}</strong>
              {sourceSeedRunning && (
                <span className="nav-run-progress" aria-label="1차 시드 생성 진행률">
                  <i style={{width: `${sourceSeedProgress}%`}}/>
                  <b>{sourceSeedStage}</b>
                </span>
              )}
              {keywordRunning && (
                <span className="nav-run-progress" aria-label="키워드 생성 진행률">
                  <i style={{width: `${keywordProgress}%`}}/>
                  <b>{keywordStage}</b>
                </span>
              )}
            </div>
            <AuroraBtn icon={<IconChevR size={16}/>} onClick={goForward} disabled={!navState.canForward}>
              앞으로: {navState.forwardLabel}
            </AuroraBtn>
          </nav>
        </main>
      </div>

      {stage === 'matrix' && selected && product && (
        <DetailModal
          product={product}
          onClose={() => setSelected(null)}
          onStatusChange={() => {}}/>
      )}

      {settingsOpen && (
        <SettingsModal onClose={() => setSettingsOpen(false)}/>
      )}

      {keywordOptionsOpen && (
        <KeywordOptionsModal
          initialOptions={keywordOptions}
          marketSelection={marketSelection}
          onClose={() => setKeywordOptionsOpen(false)}
          onStart={startKeywordRun}/>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
