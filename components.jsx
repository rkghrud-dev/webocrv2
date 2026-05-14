/* eslint-disable no-undef */
// WEBOCRV2 UI Kit — components
// All shared on window so other Babel scripts can use them.

const { useState, useRef, useEffect } = React;

/* ── icons (inline 1.5px stroke, lucide-style) ────────────── */
const Icon = ({ d, size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className={className}>{d}</svg>
);
const IconSearch    = (p) => <Icon {...p} d={<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>}/>;
const IconUpload    = (p) => <Icon {...p} d={<><path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/></>}/>;
const IconSync      = (p) => <Icon {...p} d={<><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></>}/>;
const IconSettings  = (p) => <Icon {...p} d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>}/>;
const IconEdit      = (p) => <Icon {...p} d={<><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></>}/>;
const IconClose     = (p) => <Icon {...p} d={<><path d="M18 6 6 18M6 6l12 12"/></>}/>;
const IconFile      = (p) => <Icon {...p} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></>}/>;
const IconFilter    = (p) => <Icon {...p} d={<><path d="M3 4h18l-7 9v5l-4 2v-7L3 4z"/></>}/>;
const IconCmd       = (p) => <Icon {...p} d={<><path d="M18 3a3 3 0 1 0 0 6h-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3v3H6a3 3 0 1 0 3 3V9h6v3a3 3 0 1 0 3-3h-3V6a3 3 0 0 1 3-3z"/></>}/>;
const IconChevR     = (p) => <Icon {...p} d={<><path d="m9 6 6 6-6 6"/></>}/>;

/* ── buttons ──────────────────────────────────────────────── */
function AuroraBtn({ icon, children, ...p }) {
  return <button className="btn-aurora" {...p}>{icon}{children}</button>;
}
function VioletBtn({ icon, children, ...p }) {
  return <button className="btn-violet" {...p}>{icon}{children}</button>;
}
function GhostBtn({ icon, children, ...p }) {
  return <button className="btn-ghost" {...p}>{icon}{children}</button>;
}
function IconBtn({ icon, label, ...p }) {
  return (
    <button className="btn-ghost icon-only" aria-label={label} title={label} {...p}>
      {icon}
    </button>
  );
}

/* ── status pill ──────────────────────────────────────────── */
const STATUS_LABEL = {
  queued:   ['대기열',       'targeted'],
  running:  ['서버처리',     'targeted'],
  requested:['요청됨',       'targeted'],
  exported: ['엑셀 저장',     'excel'],
  uploaded: ['업로드 완료', 'uploaded'],
  skipped:  ['제외',         'muted'],
  targeted: ['등록',         'targeted'],
  excel:    ['엑셀 생성',     'excel'],
  external: ['외부 존재',     'external'],
  failed:   ['실패',         'failed'],
  review:   ['검수 필요',     'review'],
  missing:  ['삭제/누락',     'missing'],
  muted:    ['미등록',        'muted'],
};
function Pill({ status, children }) {
  const [label, mod] = STATUS_LABEL[status] || ['', 'muted'];
  return <span className={`pill pill--${mod}`}>{children || label}</span>;
}
function ProductThumb({ src, alt = '', compact = false }) {
  return (
    <span className={`product-thumb ${compact ? 'product-thumb--compact' : ''}`}>
      {src ? <img src={src} alt={alt} loading="lazy"/> : <IconFile size={16}/>}
    </span>
  );
}

const KEYWORD_POOL_LABELS = {
  identity: '상품 정체성',
  function: '기능',
  usePlace: '사용처',
  problemSolving: '문제 해결',
  materialSpec: '재질/규격',
  userSituation: '사용자/상황',
  synonyms: '동의어/현장명',
};

function formatWon(value) {
  const amount = Number(value || 0);
  return amount ? `₩${amount.toLocaleString()}` : '가격 없음';
}

function getOptionMeta(row = {}) {
  const product = row.seedProduct || {};
  const optionItems = Array.isArray(row.optionItems) && row.optionItems.length
    ? row.optionItems
    : Array.isArray(product.optionItems)
      ? product.optionItems
      : [];
  const summary = row.opt || product.optionSummary || '단일';
  const countText = String(summary).match(/(\d+)\s*옵션/);
  const summaryCount = countText ? Number(countText[1]) : 0;
  const savedCount = Number(row.optionCount || product.optionCount || 0);
  const count = Math.max(optionItems.length, summaryCount || 0, savedCount);
  const savedType = row.optionType || product.optionType || '';
  const hasOptions = savedType === 'option' || count > 1 || (/옵션|\/|,/.test(summary) && !/^단일/.test(summary));
  return {
    hasOptions,
    count: hasOptions ? Math.max(count, 1) : 1,
    label: hasOptions ? `옵션 상품${count > 1 ? ` ${count}개` : ''}` : '단일 상품',
    summary: summary || '단일',
    items: optionItems,
  };
}

function uniqueList(values = []) {
  const out = [];
  const seen = new Set();
  values.forEach((value) => {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    if (!text || seen.has(text)) return;
    seen.add(text);
    out.push(text);
  });
  return out;
}

function rowKeywordPool(row = {}) {
  return row.keywordCandidatePool || row.seedProduct?.keywordCandidatePool || {};
}

function poolValues(pool, keys, limit = 99) {
  return uniqueList(keys.flatMap((key) => Array.isArray(pool[key]) ? pool[key] : [])).slice(0, limit);
}

function filterOptionTerms(row, terms) {
  const optionWords = new Set((row.optionItems || row.seedProduct?.optionItems || [])
    .map((item) => String(item.option || '').trim())
    .filter(Boolean));
  return terms.filter((term) => {
    if (!term) return false;
    for (const option of optionWords) {
      if (option !== '단일' && term.includes(option)) return false;
    }
    return true;
  });
}

const KEYWORD_BAN_WORDS = [
  '무료배송', '배송', '쿠폰', '할인', '특가', '행사', '사은품', '추천', '가격', '판매',
  '저렴한', '예쁜', '인기', '핫템', '베스트', '정품', '고급진', '럭셔리', '필수품',
  '데일리', '프리미엄', '최고급', '모음', '추천템', '가성비', '초특가',
  '홈런마켓', '굿셀러스', '수입사', '제조국', '중국', '급배송', '당일', '발송',
  '택배', '묶음배송', '대량구매', '문의', '상담', '문자상담', '환영합니다',
  '참고사항', '참고용', '측정방법', '오차', '발생할', '선택하세요', '크기에',
  '사이즈를', '가구예시', '실제', '앞면', '뒷면', 'Product', 'Profile',
];
const COLOR_OPTION_WORDS = ['블랙', '화이트', '실버', '골드', '핑크', '스카이', '옐로우', '레드', '블루', '그린', '카키', '투명', '검정', '흰색', '빨강', '파랑'];
const COMPOUND_SPACING_RULES = [
  ['카라비너릴고리', '카라비너 릴고리'],
  ['와이어릴고리', '와이어 릴고리'],
  ['릴고리카라비너', '릴고리 카라비너'],
  ['카라비너릴홀더', '카라비너 릴홀더'],
  ['릴홀더와이어', '릴홀더 와이어'],
  ['와이어릴홀더', '와이어 릴홀더'],
  ['카라비너클립', '카라비너 클립'],
  ['백팩카라비너', '백팩 카라비너'],
  ['ABS카라비너', 'ABS 카라비너'],
  ['카라비너고리', '카라비너 고리'],
  ['카라비너열쇠고리', '카라비너 열쇠고리'],
  ['카라비너가방고리', '카라비너 가방고리'],
  ['카라비너와이어', '카라비너 와이어'],
  ['키고리릴', '키고리 릴'],
  ['쿠션깔창', '쿠션 깔창'],
  ['신발깔창', '신발 깔창'],
  ['소프트깔창', '소프트 깔창'],
  ['쿠션인솔', '쿠션 인솔'],
  ['가구천커버', '가구 천 커버'],
  ['가구커버', '가구 커버'],
  ['가구덮개', '가구 덮개'],
  ['소파커버', '소파 커버'],
  ['탁자커버', '탁자 커버'],
  ['먼지방지', '먼지 방지'],
];
const MARKET_SEARCH_RULES = {
  Cafe24: { limit: 30, separator: ', ', compact: true, label: '공통 키워드 풀' },
  네이버: { limit: 12, separator: ', ', compact: false, label: '스마트스토어 태그' },
  쿠팡: { limit: 20, separator: ', ', compact: false, label: '쿠팡 검색태그' },
  롯데ON: { limit: 14, separator: ' ', compact: false, label: '롯데ON 검색키워드' },
  '11번가': { limit: 18, separator: ', ', compact: false, label: '11번가 검색키워드' },
  ESM: { limit: 18, separator: ', ', compact: false, label: 'ESM 검색키워드' },
};

function normalizeKeywordTerm(value) {
  let text = String(value || '');
  COMPOUND_SPACING_RULES.forEach(([from, to]) => {
    text = text.replaceAll(from, to);
  });
  return text
    .replace(/[<>{}\[\]"'`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function keywordSemanticKey(value) {
  return normalizeKeywordTerm(value).replace(/\s+/g, '').toLowerCase();
}

function hasRepeatedKeywordChunk(value) {
  const tokens = normalizeKeywordTerm(value).split(/\s+/).filter(Boolean);
  if (tokens.length >= 4 && tokens.length % 2 === 0) {
    const half = tokens.length / 2;
    if (tokens.slice(0, half).join('') === tokens.slice(half).join('')) return true;
  }
  const compact = keywordSemanticKey(value);
  if (compact.length >= 6 && compact.length % 2 === 0) {
    const half = compact.length / 2;
    if (compact.slice(0, half) === compact.slice(half)) return true;
  }
  return false;
}

function isUsefulKeywordTerm(value) {
  const text = normalizeKeywordTerm(value);
  if (!text || text === '후보 없음') return false;
  if (text.length < 2 || text.length > 24) return false;
  if (/https?:|www\.|\.jpg|\.png|\.webp|\.xlsx|\.json/i.test(text)) return false;
  if (/^[\d\s.,/:-]+$/.test(text)) return false;
  if (KEYWORD_BAN_WORDS.some((word) => text.includes(word))) return false;
  if (hasRepeatedKeywordChunk(text)) return false;
  if ((text.match(/\s/g) || []).length > 4) return false;
  return true;
}

function cleanKeywordList(values = [], limit = 99) {
  const out = [];
  const seen = new Set();
  values.forEach((value) => {
    const text = normalizeKeywordTerm(value);
    const key = keywordSemanticKey(text);
    if (!isUsefulKeywordTerm(text) || seen.has(key)) return;
    seen.add(key);
    out.push(text);
  });
  return out.slice(0, limit);
}

function getRawOptionTerms(row = {}) {
  const meta = getOptionMeta(row);
  const optionItems = meta.items.length ? meta.items : [];
  const terms = optionItems.map((item) => item.option).filter(Boolean);
  if (!terms.length && meta.summary && meta.summary !== '단일') {
    terms.push(...String(meta.summary).replace(/^\d+\s*옵션\s*·?\s*/, '').split(/[\/,|·]/g));
  }
  return uniqueList(terms.map((term) => normalizeKeywordTerm(term)).filter(Boolean));
}

function getOptionTerms(row = {}) {
  const terms = getRawOptionTerms(row);
  return cleanKeywordList(terms, 20);
}

function optionDescriptor(row = {}) {
  const meta = getOptionMeta(row);
  if (!meta.hasOptions) return '';
  const rawTerms = getRawOptionTerms(row);
  const terms = getOptionTerms(row);
  const optionBasis = rawTerms.length ? rawTerms : terms;
  if (!optionBasis.length) return meta.count > 1 ? `${meta.count}종 선택형` : '선택형';
  const isColor = optionBasis.every((term) => COLOR_OPTION_WORDS.some((color) => term.includes(color)));
  if (isColor) return '';

  const bareNumbers = rawTerms
    .map((term) => String(term).match(/^(\d{2,4})$/))
    .filter(Boolean)
    .map((match) => Number(match[1]))
    .filter((num) => Number.isFinite(num));
  if (bareNumbers.length >= 2) {
    return `${Math.min(...bareNumbers)}-${Math.max(...bareNumbers)} 사이즈 선택형`;
  }

  const specTerms = optionBasis
    .map((term) => String(term).match(/(\d+(?:\.\d+)?)\s*(mm|cm|m|M|호|형|인치|inch)/))
    .filter(Boolean);
  if (specTerms.length >= Math.min(optionBasis.length, 2)) {
    if (optionBasis.length <= 3) return `${optionBasis.slice(0, 3).join(' ')} 선택형`;
    const unit = specTerms[0][2];
    const numbers = specTerms.map((match) => Number(match[1])).filter((num) => Number.isFinite(num));
    if (numbers.length >= 2 && specTerms.every((match) => match[2] === unit)) {
      return `${Math.min(...numbers)}-${Math.max(...numbers)}${unit} 선택형`;
    }
    return '규격 선택형';
  }
  return terms.length <= 3 ? `${terms.join(' ')} 선택형` : `${meta.count || terms.length}종 선택형`;
}

function titleLimitForChannel(channel, options = {}) {
  const accountLimit = channel.account === 'B'
    ? Number(options.bNameMax || options.BNameMax || 98)
    : Number(options.aNameMax || options.ANameMax || 100);
  const marketLimit = {
    Cafe24: 95,
    네이버: 48,
    쿠팡: 80,
    롯데ON: 70,
    '11번가': 62,
    ESM: 58,
  }[channel.market] || 70;
  return Math.max(24, Math.min(accountLimit || marketLimit, marketLimit));
}

function formatSearchTerms(terms, channel) {
  const baseRule = MARKET_SEARCH_RULES[channel.market] || MARKET_SEARCH_RULES.Cafe24;
  const limit = channel.account === 'B'
    ? Math.min(baseRule.limit, channel.market === '네이버' ? 10 : baseRule.limit)
    : baseRule.limit;
  return cleanKeywordList(terms, 40)
    .slice(0, limit)
    .map((term) => baseRule.compact ? term.replace(/\s+/g, '') : term)
    .join(baseRule.separator);
}

function keywordFieldLabel(market) {
  return (MARKET_SEARCH_RULES[market] || MARKET_SEARCH_RULES.Cafe24).label;
}

function preferKeywordTerms(terms = [], hints = [], limit = 99) {
  const preferred = [];
  const rest = [];
  cleanKeywordList(terms, 99).forEach((term) => {
    if (hints.some((hint) => term.includes(hint))) preferred.push(term);
    else rest.push(term);
  });
  return uniqueList([...preferred, ...rest]).slice(0, limit);
}

function derivedKeywordPool(row = {}) {
  const product = row.seedProduct || {};
  const ocrText = product.ocrAnalysis?.rawText || product.ocrAnalysis?.fields?.OCR텍스트 || '';
  const source = normalizeKeywordTerm([
    row.name,
    row.sourceName,
    product.sourceName,
    row.opt,
    product.optionSummary,
    ocrText,
  ].filter(Boolean).join(' '));
  const out = {
    identity: [],
    function: [],
    usePlace: [],
    problemSolving: [],
    materialSpec: [],
    userSituation: [],
    synonyms: [],
  };
  const add = (key, values) => { out[key].push(...values); };
  if (/깔창|인솔/.test(source)) {
    add('identity', ['쿠션 깔창', '신발 깔창', '소프트 깔창', '인솔']);
    add('function', ['발 쿠션', '착용감 보강', '충격 완화']);
    add('usePlace', ['운동화', '구두', '신발']);
    add('materialSpec', ['PU', '에어메쉬']);
    add('synonyms', ['쿠션 인솔', '발바닥 깔창', '신발 인솔']);
  }
  if (/가구\s*천\s*커버|가구천커버|가구\s*커버/.test(source)) {
    add('identity', ['가구 천 커버', '가구 커버', '가구 덮개', '패브릭 커버']);
    add('function', ['먼지 방지', '보호 덮개']);
    add('usePlace', ['소파', '탁자', '침대', '대형 TV']);
    add('materialSpec', ['폴리에스테르', '체크무늬']);
    add('synonyms', ['소파 커버', '탁자 커버', '가구 보호 커버']);
  }
  return Object.fromEntries(Object.entries(out).map(([key, values]) => [key, cleanKeywordList(values, 20)]));
}

function titleSpecTerms(row, specTerms = []) {
  const meta = getOptionMeta(row);
  return cleanKeywordList(specTerms, 20).filter((term) => {
    const text = normalizeKeywordTerm(term);
    const hasNumericSpec = /\d+(?:\.\d+)?\s*(?:mm|cm|m|M|호|형|인치|inch)\b/i.test(text);
    if (meta.hasOptions && hasNumericSpec) return false;
    if (/^\d/.test(text) && meta.hasOptions) return false;
    return true;
  });
}

function composeLimitedTitle(terms, limit) {
  const picked = [];
  for (const term of uniqueList(terms)) {
    const next = [...picked, term].join(' ');
    if (next.length > limit) continue;
    picked.push(term);
  }
  return picked.join(' ');
}

function buildMarketKeywordVariant(row, channel = { account:'A', market:'Cafe24' }, options = {}) {
  const pool = rowKeywordPool(row);
  const derived = derivedKeywordPool(row);
  const keywordSeed = row.generatedKeywordSeed || row.seedProduct?.generatedKeywordSeed || {};
  const generatedTerms = cleanKeywordList([
    ...(Array.isArray(keywordSeed.productNames) ? keywordSeed.productNames : []),
    ...(Array.isArray(keywordSeed.searchTerms) ? keywordSeed.searchTerms : []),
    ...(Array.isArray(keywordSeed.longtails) ? keywordSeed.longtails : []),
  ], 20);
  const marketLimit = titleLimitForChannel(channel, options);
  const identity = cleanKeywordList(filterOptionTerms(row, [...poolValues(pool, ['identity'], 12), ...derived.identity]), 10);
  const fn = cleanKeywordList(filterOptionTerms(row, [...poolValues(pool, ['function'], 16), ...derived.function]), 12);
  const usePlace = cleanKeywordList(filterOptionTerms(row, [...poolValues(pool, ['usePlace'], 16), ...derived.usePlace]), 12);
  const problem = cleanKeywordList(filterOptionTerms(row, [...poolValues(pool, ['problemSolving'], 12), ...derived.problemSolving]), 8);
  const spec = titleSpecTerms(row, filterOptionTerms(row, [...poolValues(pool, ['materialSpec'], 12), ...derived.materialSpec]));
  const user = cleanKeywordList(filterOptionTerms(row, [...poolValues(pool, ['userSituation'], 10), ...derived.userSituation]), 8);
  const synonyms = cleanKeywordList(filterOptionTerms(row, [...poolValues(pool, ['synonyms'], 18), ...derived.synonyms, ...generatedTerms]), 14);
  const baseIdentity = cleanKeywordList(identity.length ? identity : [row.name], 4);
  const optionText = optionDescriptor(row);
  const identityA = preferKeywordTerms([...baseIdentity, ...synonyms], ['카라비너', '릴고리', '릴홀더', '고리'], 8);
  const identityB = preferKeywordTerms([...synonyms, ...baseIdentity], ['와이어', '클립', '키고리', '열쇠', '가방', '아웃도어'], 8);
  const fnA = preferKeywordTerms(fn, ['와이어', '릴홀더', '탈부착', '연결', '체결'], 8);
  const fnB = preferKeywordTerms([...fn, ...problem], ['탈부착', '체결', '연결', '후크', '클립'], 8);
  const placeA = preferKeywordTerms(usePlace, ['백팩', '텐트', '스트랩', '하네스'], 8);
  const placeB = preferKeywordTerms([...usePlace, ...user], ['가방', '열쇠', '키고리', '하네스', '아웃도어'], 8);
  const specA = preferKeywordTerms(spec, ['ABS', '60cm', 'cm', 'mm'], 4);
  const activeIdentity = channel.account === 'B' ? identityB : identityA;
  const activeFn = channel.account === 'B' ? fnB : fnA;
  const activePlace = channel.account === 'B' ? placeB : placeA;
  const naverA = [
    ...baseIdentity.slice(0, 1),
    ...identityA.slice(0, 2),
    ...specA.slice(0, 1),
    ...fnA.slice(0, 2),
    ...placeA.slice(0, 2),
    optionText,
  ];
  const naverB = [
    ...identityB.slice(0, 2),
    ...specA.slice(0, 1),
    ...placeB.slice(0, 2),
    ...fnB.slice(0, 2),
    optionText,
  ];
  const broadExcelA = [
    ...identityA.slice(0, 3),
    ...fnA.slice(0, 3),
    ...placeA.slice(0, 3),
    ...problem.slice(0, 2),
    ...specA.slice(0, 2),
    optionText,
  ];
  const broadExcelB = [
    ...identityB.slice(0, 3),
    ...placeB.slice(0, 3),
    ...fnB.slice(0, 3),
    ...problem.slice(0, 2),
    ...specA.slice(0, 2),
    optionText,
  ];
  const recipeMap = channel.account === 'B'
    ? {
        Cafe24: [...identityB.slice(0, 4), ...fnB.slice(0, 4), ...placeB.slice(0, 3), ...specA.slice(0, 2), ...synonyms.slice(0, 4)],
        네이버: naverB,
        쿠팡: [...identityB.slice(0, 2), ...specA.slice(0, 1), ...fnB.slice(0, 3), ...placeB.slice(0, 3), optionText],
        롯데ON: [...identityB.slice(0, 2), ...fnB.slice(0, 2), ...placeB.slice(0, 2), ...specA.slice(0, 1), optionText],
        '11번가': broadExcelB,
        ESM: broadExcelB,
      }
    : {
        Cafe24: [...identityA.slice(0, 4), ...fnA.slice(0, 4), ...placeA.slice(0, 3), ...specA.slice(0, 2), ...synonyms.slice(0, 4)],
        네이버: naverA,
        쿠팡: [...identityA.slice(0, 2), ...specA.slice(0, 1), ...fnA.slice(0, 3), ...placeA.slice(0, 3), optionText],
        롯데ON: [...identityA.slice(0, 2), ...fnA.slice(0, 2), ...placeA.slice(0, 2), ...specA.slice(0, 1), optionText],
        '11번가': broadExcelA,
        ESM: broadExcelA,
      };
  const recipe = recipeMap[channel.market] || [...activeIdentity.slice(0, 2), ...activeFn.slice(0, 2), ...activePlace.slice(0, 1), optionText];
  const title = composeLimitedTitle(recipe, marketLimit) || row.name || row.gs;
  const titleKeys = new Set(String(title).split(/\s+/).map(keywordSemanticKey).filter(Boolean));
  const rawSearchTerms = uniqueList([
    ...baseIdentity,
    ...fn,
    ...usePlace,
    ...problem,
    ...spec,
    ...user,
    ...synonyms,
  ]);
  const searchTerms = formatSearchTerms([
    ...rawSearchTerms.filter((term) => !titleKeys.has(keywordSemanticKey(term))),
    ...rawSearchTerms,
  ], channel);
  return {
    title,
    searchTerms,
    candidateCount: cleanKeywordList([...baseIdentity, ...fn, ...usePlace, ...problem, ...spec, ...user, ...synonyms]).length,
  };
}

function SeedPreviewModal({ row, tab, onTab, onClose }) {
  const product = row?.seedProduct || {};
  const images = product.images || {};
  const ocr = product.ocrAnalysis || {};
  const ocrFields = ocr.fields || {};
  const keywordPool = product.keywordCandidatePool || {};
  const optionMeta = getOptionMeta(row);
  const optionRows = optionMeta.items.length
    ? optionMeta.items
    : [{ gs: row.gs, name: row.name, option: optionMeta.summary, price: row.price, thumb: row.thumb }];
  const rawOcrText = ocr.rawText || ocrFields.OCR텍스트 || '';
  const extraKeywordKeys = Object.keys(keywordPool).filter((key) => !KEYWORD_POOL_LABELS[key]);
  const tabs = [
    ['summary', '정리 데이터'],
    ['ocr', 'OCR 분석'],
    ['keywords', '후보 풀'],
    ['price', '가격/옵션'],
  ];

  return (
    <div className="modal-scrim" onClick={onClose}>
      <aside className="seed-preview-modal" onClick={(event) => event.stopPropagation()}>
        <div className="seed-preview-head">
          <div>
            <span className="t-eyebrow">preview · seed_dataset</span>
            <h3>{row.gs} · {row.name || product.sourceName || '상품명 없음'}</h3>
          </div>
          <IconBtn icon={<IconClose size={18}/>} label="닫기" onClick={onClose}/>
        </div>

        <div className="seed-preview-tabs">
          {tabs.map(([key, label]) => (
            <button
              type="button"
              key={key}
              className={tab === key ? 'active' : ''}
              onClick={() => onTab(key)}>
              {label}
            </button>
          ))}
        </div>

        <div className="seed-preview-body">
          {tab === 'summary' && (
            <>
              <div className="seed-summary-top">
                <ProductThumb src={row.thumb || images.representative || images.sourceThumb} alt={row.name}/>
                <div className="seed-data-grid">
                  <div><span>GS코드</span><strong className="mono">{row.gs}</strong></div>
                  <div><span>원본 상품명</span><strong>{product.sourceName || row.originalName || row.name}</strong></div>
                  <div><span>가격</span><strong className="mono">{formatWon(row.price || product.price)}</strong></div>
                  <div><span>옵션 구분</span><strong>{optionMeta.label}</strong></div>
                  <div><span>이미지 기준</span><strong>{images.processedSize || row.imageSize || '대기'}</strong></div>
                  <div><span>OCR 상태</span><strong>{ocr.status === 'loaded' ? 'OCR 저장됨' : 'OCR 대기'}</strong></div>
                </div>
              </div>
              <div className="seed-preview-note">
                <strong>{optionMeta.summary}</strong>
                <span>1차 시드는 OCR/사진분석/가격/옵션/후보 키워드를 모아둔 기준 데이터셋이다.</span>
              </div>
            </>
          )}

          {tab === 'ocr' && (
            <>
              <div className="seed-data-grid seed-data-grid--compact">
                <div><span>상태</span><strong>{ocr.status === 'loaded' ? 'OCR 결과 있음' : 'OCR 결과 없음'}</strong></div>
                <div><span>처리 이미지</span><strong>{ocrFields.OCR처리이미지수 || '-'} / {ocrFields.전체이미지수 || '-'}</strong></div>
                <div><span>OCR 이미지</span><strong>{ocrFields.OCR이미지 || '-'}</strong></div>
                <div><span>Vision JSON</span><strong>{ocrFields.Vision분석JSON ? '저장됨' : '없음'}</strong></div>
              </div>
              <pre className="ocr-text-box">{rawOcrText || 'OCR 원문이 아직 저장되지 않았습니다.'}</pre>
            </>
          )}

          {tab === 'keywords' && (
            <div className="keyword-preview-list">
              {[...Object.keys(KEYWORD_POOL_LABELS), ...extraKeywordKeys].map((key) => {
                const values = Array.isArray(keywordPool[key]) ? keywordPool[key] : [];
                return (
                  <div className="keyword-preview-row" key={key}>
                    <strong>{KEYWORD_POOL_LABELS[key] || key}</strong>
                    <div className="keyword-tags">
                      {values.length
                        ? values.map((value, index) => <span key={`${key}-${index}`}>{value}</span>)
                        : <em>후보 없음</em>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'price' && (
            <>
              <div className="seed-data-grid seed-data-grid--compact">
                <div><span>옵션 구분</span><strong>{optionMeta.label}</strong></div>
                <div><span>옵션 요약</span><strong>{optionMeta.summary}</strong></div>
                <div><span>대표 가격</span><strong className="mono">{formatWon(row.price || product.price)}</strong></div>
                <div><span>정리 기준</span><strong>{optionMeta.hasOptions ? '옵션 목록으로 관리' : '단일 상품으로 관리'}</strong></div>
              </div>
              <div className="option-preview-table">
                <div className="option-preview-head">
                  <span>이미지</span><span>GS코드</span><span>옵션</span><span>상품명</span><span>가격</span>
                </div>
                {optionRows.map((item, index) => (
                  <div className="option-preview-row" key={`${item.gs || index}-${index}`}>
                    <ProductThumb src={item.thumb || row.thumb} alt={item.name} compact/>
                    <span className="mono">{item.gs || row.gs}</span>
                    <strong>{item.option || item.suffix || '단일'}</strong>
                    <span>{item.name || row.name}</span>
                    <span className="mono">{formatWon(item.price || row.price || product.price)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

/* ── menu ─────────────────────────────────────────────────── */
function Menu({ children, style }) {
  return <div className="menu" role="menu" style={style}>{children}</div>;
}
function MenuItem({ icon, label, kbd, onClick, active }) {
  return (
    <button className={`menu-item ${active ? 'is-active' : ''}`} role="menuitem" onClick={onClick}>
      {icon}<span style={{flex:1, textAlign:'left'}}>{label}</span>
      {kbd && <kbd>{kbd}</kbd>}
    </button>
  );
}
function MenuSection({ children }) { return <div className="menu-section">{children}</div>; }

/* ── top bar ──────────────────────────────────────────────── */
function TopBar({ source, onImport, onReset, onSettings }) {
  const [q, setQ] = useState('');
  const ref = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault(); ref.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <header className="topbar">
      <div className="brand">
        <img src="./assets/brandmark.svg" alt="" width="28" height="28"/>
        <strong>AI 마켓 관리자</strong>
        <span className="brand-divider"/>
        <span className="brand-source">{source || '소스 없음'}</span>
      </div>
      <div className="topbar-search">
        <IconSearch size={16}/>
        <input ref={ref} value={q} onChange={(e)=>setQ(e.target.value)} placeholder="GS코드 · 약식 상품명 · 마켓 상품번호"/>
        <kbd>/</kbd>
      </div>
      <div className="topbar-actions">
        <GhostBtn icon={<IconClose size={16}/>} onClick={onReset} title="현재까지 진행과정을 초기화합니다">진행 초기화</GhostBtn>
        <AuroraBtn icon={<IconUpload size={16}/>} onClick={onImport}>원본 import</AuroraBtn>
        <IconBtn icon={<IconSettings size={18}/>} label="설정" onClick={onSettings}/>
      </div>
    </header>
  );
}

/* ── sidebar ──────────────────────────────────────────────── */
function Sidebar({
  source,
  seedFiles = [],
  seedStorePath = 'data/seeds',
  onLoadSeed,
  onRenameSeed,
  onDeleteSeed,
}) {
  const [seedOpen, setSeedOpen] = useState(false);
  const [seedMenu, setSeedMenu] = useState(null);
  useEffect(() => {
    if (!seedMenu) return undefined;
    const close = () => setSeedMenu(null);
    window.addEventListener('click', close);
    window.addEventListener('keydown', close);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('keydown', close);
    };
  }, [seedMenu]);
  return (
    <aside className="sidebar">
      <div className="sb-section">
        <div className="sb-head"><IconFile size={14}/>현재 소스</div>
        {source ? (
          <div className="sb-source">
            <strong>{source.name}</strong>
            <small>{source.count}개 상품 · {source.importedAt}</small>
          </div>
        ) : (
          <div className="sb-source muted">파일을 드래그해서 시작</div>
        )}
      </div>

      <div className={`sb-section seed-section ${seedOpen ? 'is-open' : 'is-collapsed'}`}>
        <button
          type="button"
          className="seed-toggle"
          aria-expanded={seedOpen}
          onClick={() => setSeedOpen((open) => !open)}>
          <span className="seed-toggle-title"><IconFile size={14}/>시드 파일</span>
          <span className="seed-count">{seedFiles.length}</span>
          <span className="seed-toggle-state">{seedOpen ? '접기' : '펼치기'}</span>
        </button>
        {seedOpen && (
          <div className="seed-panel">
            <div className="seed-store-path">{seedStorePath}</div>
            <div className="seed-list">
              {seedFiles.length > 0 ? seedFiles.map((seed) => (
                <button
                  type="button"
                  className="seed-item"
                  key={seed.id}
                  onClick={() => onLoadSeed?.(seed)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setSeedMenu({ seed, x: e.clientX, y: e.clientY });
                  }}
                  title={seed.path}>
                  <ProductThumb src={seed.thumbnail} compact/>
                  <span className="seed-item-text">
                    <span className="seed-date">{seed.createdAt}</span>
                    <strong>{seed.name}</strong>
                    <small>{seed.rows}행 · GS {seed.gsCodes}개</small>
                  </span>
                </button>
              )) : (
                <div className="seed-empty">생성된 시드 파일 없음</div>
              )}
            </div>
            {seedMenu && (
              <div
                className="seed-context-menu"
                style={{ left: seedMenu.x, top: seedMenu.y }}
                onClick={(e) => e.stopPropagation()}>
                <button type="button" onClick={() => { onLoadSeed?.(seedMenu.seed); setSeedMenu(null); }}>불러오기</button>
                <button type="button" onClick={() => { onRenameSeed?.(seedMenu.seed); setSeedMenu(null); }}>이름 수정</button>
                <button type="button" className="danger" onClick={() => { onDeleteSeed?.(seedMenu.seed); setSeedMenu(null); }}>삭제</button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

/* ── drop zone (the main entry point) ─────────────────────── */
function DropZone({ onDrop }) {
  const [over, setOver] = useState(false);
  const inputRef = useRef(null);
  return (
    <div className={`dropzone ${over ? 'is-over' : ''}`}
      onDragOver={(e)=>{e.preventDefault(); setOver(true);}}
      onDragLeave={()=>setOver(false)}
      onDrop={(e)=>{e.preventDefault(); setOver(false); onDrop(e.dataTransfer.files?.[0]);}}
      onClick={()=>inputRef.current?.click()}>
      <div className="dropzone-inner">
        <div className="dropzone-icon"><IconUpload size={32}/></div>
        <h2>원본 CSV / Excel 또는 시드 파일을 끌어다 놓기</h2>
        <p>시드 파일은 1차 수정본 기준으로 불러온다 · 같은 파일을 다시 넣으면 중복 import를 묻는다</p>
        <div className="dropzone-meta">
          <span>지원</span>
          <code>.csv</code><code>.xlsx</code><code>.xls</code><code>.webseed.json</code>
        </div>
      </div>
      <input ref={inputRef} type="file" hidden accept=".csv,.xlsx,.xls,.json,.webseed.json"
        onChange={(e)=>onDrop(e.target.files?.[0])}/>
    </div>
  );
}

/* ── import preview (between drop and matrix) ─────────────── */
function ImportPreview({
  file,
  mode = 'source',
  selectedGs = new Set(),
  sourceJob = null,
  onToggleProduct,
  onSelectAll,
  onClearAll,
}) {
  const visibleRows = file.preview || [];
  const [preview, setPreview] = useState(null);
  const allVisibleSelected = visibleRows.length > 0 && visibleRows.every((row) => selectedGs.has(row.gs));
  const isSeedView = mode !== 'source';
  const isSourceSeedJob = mode === 'source' && sourceJob;
  const firstPreviewRow = visibleRows.find((row) => selectedGs.has(row.gs)) || visibleRows[0];
  const previewColSpan = mode === 'source' || mode === 'seed-base' ? 7 : 6;
  const openPreview = (row, tab = 'summary') => {
    if (!row) return;
    setPreview({ row, tab });
  };
  const sourceJobRunning = ['queued', 'running'].includes(sourceJob?.status);
  const sourceJobProgress = Math.max(0, Math.min(100, Number(
    sourceJob?.progressPercent
      ?? (sourceJob?.status === 'completed' ? 100 : sourceJob?.status === 'failed' ? 100 : 0)
  )));
  const sourceJobStage = sourceJob?.currentStage || (sourceJobRunning ? '1차 시드 생성 실행중' : '');
  const sourceRowProgress = (row) => {
    const selected = selectedGs.has(row.gs);
    if (!isSourceSeedJob) {
      return selected
        ? { status: 'selected', percent: 0, label: '선택됨', detail: '앞으로가기 대기' }
        : { status: 'idle', percent: 0, label: '미선택', detail: '작업 제외' };
    }
    if (!selected) return { status: 'idle', percent: 0, label: '작업 제외', detail: '미선택 상품' };
    if (sourceJob.status === 'failed') return { status: 'failed', percent: sourceJobProgress, label: '실패', detail: sourceJob.error || '오류 확인' };
    if (sourceJob.status === 'completed') return { status: 'done', percent: 100, label: '완료', detail: '시드 생성 완료' };
    const active = sourceJob.currentGs && sourceJob.currentGs === row.gs;
    return {
      status: active ? 'running' : 'queued',
      percent: sourceJobProgress,
      label: active ? '진행중' : '대기/진행',
      detail: sourceJobStage || '작업 중',
    };
  };
  const modeLabel = mode === 'source'
    ? '원본 파일'
    : mode === 'seed-base'
      ? '1차 시드'
      : mode === 'seed-review'
        ? '2차 수정 시드'
    : mode === 'seed'
      ? '마켓 작업 시드'
      : '시드 파일';
  return (
    <div className={`import-preview surface import-preview--${isSeedView ? 'seed' : 'source'}`}>
      <div className="ip-row">
        <IconFile size={20}/>
        <div className="ip-name">
          <strong>{file.name}</strong>
          <small>{file.rows} 행 · 예상 GS코드 {file.gsCodes}개 · {(file.size/1024).toFixed(1)} KB</small>
        </div>
        <div className="select-tools">
          <button type="button" onClick={onSelectAll}>전체 선택</button>
          <button type="button" onClick={onClearAll}>전체 해제</button>
        </div>
        <span className="pill pill--uploaded">{modeLabel}</span>
        <button
          type="button"
          className="pill pill--targeted pill-button"
          onClick={() => openPreview(firstPreviewRow, mode === 'source' ? 'summary' : 'price')}
          disabled={!firstPreviewRow}>
          미리보기
        </button>
      </div>
      <table className="ip-table">
        <thead>
          <tr>
            <th className="check-col">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                readOnly
                onClick={(e) => {
                  e.stopPropagation();
                  allVisibleSelected ? onClearAll?.() : onSelectAll?.();
                }}/>
            </th>
            <th className="thumb-col">이미지</th>
            <th>GS코드</th>
            {mode === 'seed-base' ? (
              <>
                <th>이미지/OCR</th>
                <th>옵션 구분</th>
                <th>키워드 후보 풀</th>
                <th>정리 데이터</th>
              </>
            ) : mode === 'seed-review' ? (
              <>
                <th>변경 가격</th>
                <th>옵션 양식</th>
                <th>Cafe24 URL</th>
              </>
            ) : mode === 'seed' ? (
              <>
                <th>Cafe24</th>
                <th>키워드 후보</th>
                <th>마켓 작업</th>
              </>
            ) : (
              <>
                <th>약식 상품명</th>
                <th>가격</th>
                <th>옵션</th>
                <th>진행상황</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {visibleRows.length === 0 && (
            <tr>
              <td colSpan={previewColSpan} className="ip-empty">파일을 서버에서 읽는 중이거나 표시할 GS코드가 없습니다.</td>
            </tr>
          )}
          {visibleRows.map((r,i) => {
            const optionMeta = getOptionMeta(r);
            return (
            <tr key={i}>
              <td className="check-col">
                <input
                  type="checkbox"
                  checked={selectedGs.has(r.gs)}
                  readOnly
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleProduct?.(r.gs, i, e, visibleRows);
                  }}/>
              </td>
              <td className="thumb-col"><ProductThumb src={r.thumb} alt={r.name} compact/></td>
              <td className="mono">{r.gs}</td>
              {mode === 'seed-base' ? (
                <>
                  <td>
                    <button type="button" className="inline-pill-button" onClick={() => openPreview(r, 'ocr')}>
                      <Pill status={r.ocrStatus === 'loaded' ? 'uploaded' : 'targeted'}>
                      {(r.imageSize || '이미지 기준 없음')} · OCR {r.ocrStatus || '대기'}
                      </Pill>
                    </button>
                  </td>
                  <td>
                    <button type="button" className="option-status-button" onClick={() => openPreview(r, 'price')}>
                      <strong>{optionMeta.label}</strong>
                      <span>{optionMeta.summary}</span>
                    </button>
                  </td>
                  <td className="seed-keyword-pool">
                    <button type="button" className="inline-text-button" onClick={() => openPreview(r, 'keywords')}>
                      후보 {r.keywordCount || 0}개
                    </button>
                  </td>
                  <td>
                    <button type="button" className="inline-pill-button" onClick={() => openPreview(r, 'summary')}>
                      <Pill status={r.name ? 'targeted' : 'muted'}>{r.name ? '정리 데이터 있음' : '정리 데이터 대기'}</Pill>
                    </button>
                  </td>
                </>
              ) : mode === 'seed-review' ? (
                <>
                  <td className="mono">₩{r.price.toLocaleString()}</td>
                  <td><Pill status="targeted">{r.opt} · 확인 대상</Pill></td>
                  <td className={`seed-url ${r.cafe24Url ? '' : 'is-empty'}`}>
                    {r.cafe24Url ? <a href={r.cafe24Url} target="_blank" rel="noreferrer">{r.cafe24Url}</a> : 'URL 대기'}
                  </td>
                </>
              ) : mode === 'seed' ? (
                <>
                  <td><Pill status={r.cafe24Url ? 'uploaded' : 'muted'}>{r.cafe24Url ? 'URL 확보' : 'URL 대기'}</Pill></td>
                  <td className="seed-keyword-pool">후보 {r.keywordCount || 0}개</td>
                  <td><Pill status="targeted">마켓 선택 가능</Pill></td>
                </>
              ) : (
                <>
                  <td>{r.name}</td>
                  <td className="mono">₩{r.price.toLocaleString()}</td>
                  <td>
                    <button type="button" className="option-status-button compact" onClick={() => openPreview(r, 'price')}>
                      <strong>{optionMeta.label}</strong>
                      <span>{optionMeta.summary}</span>
                    </button>
                  </td>
                  <td>
                    {(() => {
                      const progress = sourceRowProgress(r);
                      return (
                        <div className={`source-row-progress is-${progress.status}`}>
                          <div>
                            <strong>{progress.label}</strong>
                            <span>{progress.detail}</span>
                          </div>
                          <span className="source-progress-track">
                            <i style={{width: `${progress.percent}%`}}/>
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                </>
              )}
            </tr>
          );})}
        </tbody>
      </table>
      {preview && (
        <SeedPreviewModal
          row={preview.row}
          tab={preview.tab}
          onTab={(tab) => setPreview((current) => current ? { ...current, tab } : current)}
          onClose={() => setPreview(null)}/>
      )}
    </div>
  );
}

function ViewSwitch({ view, onChange }) {
  return (
    <div className="view-switch" aria-label="화면 전환">
      <button
        type="button"
        className={view === 'basic' ? 'active' : ''}
        onClick={() => onChange('basic')}>
        기본화면
      </button>
      <button
        type="button"
        className={view === 'matrix' ? 'active' : ''}
        onClick={() => onChange('matrix')}>
        상세화면
      </button>
    </div>
  );
}

function WorkflowActionPanel({
  mode,
  file,
  markets,
  onToggleMarket,
}) {
  const [marketAccount, setMarketAccount] = useState('A');
  if (!file) return null;

  if (mode === 'seed-base') {
    return (
      <aside className="workflow-action-panel">
        <div className="wap-head">
          <span className="t-eyebrow">done · base_seed</span>
          <h3>1차 시드 생성 완료</h3>
        </div>
        <div className="seed-flow-steps">
          <span className="done">원본</span>
          <span className="done">사진/OCR</span>
          <span className="active">정리 데이터</span>
          <span>2차 수정 시드</span>
        </div>
        <div className="seed-done-list">
          <div><strong>{file.name}</strong><span>이미지 가공, OCR, 사진분석, 키워드 후보 풀 저장</span></div>
          <div><strong>다음 단계</strong><span>2차 수정 시드에서 가격/옵션 양식 확인</span></div>
        </div>
        <p className="step-nav-hint">아래 앞으로가기 버튼으로 2차 수정 시드로 이동한다.</p>
      </aside>
    );
  }

  if (mode === 'seed-review') {
    return (
      <aside className="workflow-action-panel">
        <div className="wap-head">
          <span className="t-eyebrow">review · second_seed</span>
          <h3>2차 수정 시드 확인</h3>
        </div>
        <div className="seed-flow-steps">
          <span className="done">1차 시드</span>
          <span className="active">가격/옵션</span>
          <span className="done">Cafe24 URL</span>
          <span>마켓 작업</span>
        </div>
        <div className="seed-done-list">
          <div><strong>표시 기준</strong><span>변경된 가격과 옵션 양식만 우선 확인</span></div>
          <div><strong>다음 처리</strong><span>마켓 선택 후 채널별 키워드 생성으로 이동</span></div>
        </div>
        <p className="step-nav-hint">아래 앞으로가기 버튼으로 마켓별 작업으로 이동한다.</p>
      </aside>
    );
  }

  if (mode === 'seed') {
    return (
      <aside className="workflow-action-panel">
        <div className="wap-head">
          <span className="t-eyebrow">next · seed_rework</span>
          <h3>마켓 선택</h3>
        </div>
        <div className="market-account-tabs">
          {['A', 'B'].map((account) => (
            <button
              type="button"
              key={account}
              className={marketAccount === account ? 'active' : ''}
              onClick={() => setMarketAccount(account)}>
              {account}계정
            </button>
          ))}
        </div>
        <div className="market-checks">
          <div className="market-check-group">
            <strong>{marketAccount}계정</strong>
            <div>
              {SELLING_MARKETS.map((market) => {
                const key = `${marketAccount}:${market}`;
                return (
                  <label className="check-row compact" key={key}>
                    <input
                      type="checkbox"
                      checked={markets[key] !== false}
                      onChange={() => onToggleMarket(key)}/>
                    <span>{market}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
        <p className="step-nav-hint">마켓 선택 후 아래 앞으로가기 버튼으로 키워드 생성 옵션을 연다.</p>
      </aside>
    );
  }

  return (
    <aside className="workflow-action-panel">
      <div className="wap-head">
        <span className="t-eyebrow">next · source_to_seed</span>
        <h3>1차 시드 파일 생성</h3>
      </div>
        <div className="seed-flow-steps">
          <span className="done">원본</span>
          <span className="active">사진/OCR</span>
          <span>정리 데이터</span>
          <span>2차 수정 시드</span>
        </div>
      <div className="check-list">
        <label className="check-row">
          <input type="checkbox" checked readOnly/>
          <span>대표/추가 이미지 다운로드 및 1000x1000 가공</span>
        </label>
        <label className="check-row">
          <input type="checkbox" checked readOnly/>
          <span>OCR + 사진분석 기본 데이터 저장</span>
        </label>
        <label className="check-row">
          <input type="checkbox" checked readOnly/>
          <span>상품 정체성/기능/사용처/문제해결/규격/동의어 후보 풀 생성</span>
        </label>
        <label className="check-row">
          <input type="checkbox" checked readOnly/>
          <span>가격/옵션 최소 정리</span>
        </label>
      </div>
      <p className="step-nav-hint">상품 선택 후 아래 앞으로가기 버튼으로 1차 시드를 생성한다.</p>
    </aside>
  );
}

/* ── product matrix ──────────────────────────────────────── */
const SELLING_MARKETS = ['네이버','쿠팡','롯데ON','11번가','ESM'];
const MARKETS = ['Cafe24', ...SELLING_MARKETS];

function AccountSummary({ counts }) {
  return (
    <div className="account-summary" aria-label="계정별 업로드 요약">
      {['A', 'B'].map((account) => (
        <div className="account-chip" key={account}>
          <strong>{account}계정</strong>
          <span>{counts?.[account]?.uploaded ?? 0} 업로드 완료</span>
        </div>
      ))}
    </div>
  );
}

function ProductMatrix({
  rows,
  selectedId,
  selectedGs = new Set(),
  onToggleProduct,
  onSelectAll,
  onClearAll,
  onSelect,
}) {
  const allVisibleSelected = rows.length > 0 && rows.every((row) => selectedGs.has(row.gs));
  return (
    <div className="matrix matrix--combined surface">
      <div className="matrix-head">
        <div className="mh-key">
          <div>상품</div>
          <label className="matrix-all-check">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              readOnly
              onClick={(e) => {
                e.stopPropagation();
                allVisibleSelected ? onClearAll?.() : onSelectAll?.();
              }}/>
            <span>전체</span>
          </label>
          <div className="select-tools select-tools--matrix">
            <button type="button" onClick={onSelectAll}>선택</button>
            <button type="button" onClick={onClearAll}>해제</button>
          </div>
        </div>
        {['A', 'B'].map((account) => (
          <div className="mh-account" key={account}>
            <div className="mh-account-title">{account}계정</div>
            <div className="mh-markets">{MARKETS.map(m => <span key={m}>{m}</span>)}</div>
          </div>
        ))}
      </div>
      <div className="matrix-body">
        {rows.map((row, index) => (
          <div key={row.id}
            className={`m-row ${selectedId === row.id ? 'is-selected' : ''}`}
            onClick={() => onSelect(row.id)}>
            <div className="m-key">
              <input
                className="row-check"
                type="checkbox"
                checked={selectedGs.has(row.gs)}
                readOnly
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleProduct?.(row.gs, index, e, rows);
                }}/>
              <ProductThumb src={row.thumb} alt={row.name} compact/>
              <div className="m-key-text">
                <span className="m-gs">{row.gs}</span>
                <span className="m-name">{row.name}</span>
              </div>
            </div>
            {['A', 'B'].map((account) => (
              <div className="m-account" key={account}>
                {row[account].map((s,i) => (
                  <div className="m-cell" key={`${account}-${i}`}><Pill status={s}/></div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function LogoDropCell({ label, value, preview, onFile, onPath }) {
  const inputRef = useRef(null);
  const [over, setOver] = useState(false);
  const applyFile = (file) => {
    if (!file) return;
    onFile(file);
  };
  return (
    <div className="logo-drop-wrap">
      <button
        type="button"
        className={`logo-drop ${over ? 'is-over' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          applyFile(e.dataTransfer.files?.[0]);
        }}>
        <span className="logo-preview">
          {preview ? <img src={preview} alt=""/> : <IconUpload size={18}/>}
        </span>
        <span className="logo-drop-text">
          <strong>{label}</strong>
          <small>{value || '로고 이미지 드래그 또는 클릭'}</small>
        </span>
        <IconUpload size={16}/>
      </button>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept=".png,.jpg,.jpeg,.webp,.bmp,image/*"
        onChange={(e) => applyFile(e.target.files?.[0])}/>
      <input
        className="logo-path-input"
        value={value || ''}
        onChange={(e) => onPath(e.target.value)}
        placeholder="서버 실행용 실제 로컬 경로"/>
    </div>
  );
}

function KeywordOptionsModal({
  initialOptions,
  marketSelection,
  onClose,
  onStart,
}) {
  const [draft, setDraft] = useState({
    ...initialOptions,
    concurrency: 50,
    imageSize: 1000,
  });
  const [logoPreviews, setLogoPreviews] = useState({ logoPath: '', logoPathB: '' });
  useEffect(() => () => {
    Object.values(logoPreviews).forEach((url) => {
      if (url) URL.revokeObjectURL(url);
    });
  }, [logoPreviews]);
  const setValue = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));
  const setNumber = (key, value) => setValue(key, Number(value));
  const setLogoFile = (key, file) => {
    if (!file) return;
    setValue(key, file.name);
    setLogoPreviews((prev) => {
      if (prev[key]) URL.revokeObjectURL(prev[key]);
      return { ...prev, [key]: URL.createObjectURL(file) };
    });
    try {
      const form = new FormData();
      form.append('file', file);
      fetch('/api/import-logo', { method: 'POST', body: form })
        .then((res) => res.ok ? res.json() : Promise.reject(new Error(`logo upload ${res.status}`)))
        .then((data) => {
          if (data?.ok && data.path) setValue(key, data.path);
        })
        .catch(() => {});
    } catch {}
  };
  const accountScope = draft.accountScope || '전체';
  const enabledChannels = Object.entries(marketSelection || {})
    .filter(([, enabled]) => enabled !== false)
    .filter(([key]) => !key.endsWith(':Cafe24'))
    .filter(([key]) => accountScope === '전체' || key.startsWith(`${accountScope}:`))
    .length;

  return (
    <div className="modal-scrim" onClick={onClose}>
      <aside className="keyword-options-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-head">
          <div>
            <span className="t-eyebrow">before_run · keyword_options</span>
            <h3>키워드 생성 옵션</h3>
          </div>
          <IconBtn icon={<IconClose size={18}/>} label="닫기" onClick={onClose}/>
        </div>

        <div className="keyword-options-grid">
          <section className="option-block">
            <h4>실행</h4>
            <div className="field-row">
              <span>계정 범위</span>
              <div className="option-seg">
                {['A', 'B', '전체'].map((scope) => (
                  <button
                    type="button"
                    key={scope}
                    className={accountScope === scope ? 'active' : ''}
                    onClick={() => setValue('accountScope', scope)}>
                    {scope === '전체' ? '전체' : `${scope}계정`}
                  </button>
                ))}
              </div>
            </div>
            <label className="field-row">
              <span>Codex 혼합 단위</span>
              <select value={draft.runUnit} onChange={(e) => setValue('runUnit', e.target.value)}>
                <option>상품단위</option>
                <option>마켓단위</option>
              </select>
            </label>
            <label className="field-row">
              <span>병렬 실행 수</span>
              <input type="number" min="1" max="50" value={draft.concurrency} readOnly/>
            </label>
            <div className="option-footnote">실행 채널 {enabledChannels}개</div>
          </section>

          <section className="option-block">
            <h4>이미지</h4>
            <label className="field-row">
              <span>이미지 크기</span>
              <input type="number" value={1000} readOnly/>
            </label>
            <div className="field-row split">
              <span>JPEG 품질</span>
              <input type="number" value={draft.jpegMin} onChange={(e) => setNumber('jpegMin', e.target.value)}/>
              <input type="number" value={draft.jpegMax} onChange={(e) => setNumber('jpegMax', e.target.value)}/>
            </div>
            <div className="option-checks">
              {[
                ['autoContrast', '자동대비'],
                ['sharpen', '샤프닝'],
                ['fixRotation', '미세회전'],
                ['mirror', '좌우반전'],
              ].map(([key, label]) => (
                <label className="check-row compact" key={key}>
                  <input
                    type="checkbox"
                    checked={!!draft[key]}
                    onChange={(e) => setValue(key, e.target.checked)}/>
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="option-block option-block--wide">
            <h4>로고 이미지</h4>
            <div className="logo-option-grid">
              <LogoDropCell
                label="A계정 기본 로고"
                value={draft.logoPath}
                preview={logoPreviews.logoPath}
                onFile={(file) => setLogoFile('logoPath', file)}
                onPath={(path) => setValue('logoPath', path)}/>
              <LogoDropCell
                label="B계정 기본 로고"
                value={draft.logoPathB}
                preview={logoPreviews.logoPathB}
                onFile={(file) => setLogoFile('logoPathB', file)}
                onPath={(path) => setValue('logoPathB', path)}/>
            </div>
            <div className="logo-tuning-grid">
              <label className="field-row">
                <span>로고 비율</span>
                <input type="number" min="1" max="60" value={draft.logoRatio} onChange={(e) => setNumber('logoRatio', e.target.value)}/>
              </label>
              <label className="field-row">
                <span>투명도</span>
                <input type="number" min="0" max="100" value={draft.logoOpacity} onChange={(e) => setNumber('logoOpacity', e.target.value)}/>
              </label>
              <label className="field-row">
                <span>위치</span>
                <select value={draft.logoPosition} onChange={(e) => setValue('logoPosition', e.target.value)}>
                  <option value="tr">오른쪽 위</option>
                  <option value="br">오른쪽 아래</option>
                  <option value="tl">왼쪽 위</option>
                  <option value="bl">왼쪽 아래</option>
                  <option value="c">가운데</option>
                </select>
              </label>
            </div>
            <small className="option-footnote">매칭: ListingImageSettings.LogoPath / LogoPathB / LogoRatio / LogoOpacity / LogoPosition</small>
          </section>

          <section className="option-block option-block--wide">
            <h4>상세 태그</h4>
            <label className="field-row wide">
              <span>상세태그 A</span>
              <input value={draft.detailTagA} onChange={(e) => setValue('detailTagA', e.target.value)}/>
            </label>
            <label className="field-row wide">
              <span>상세태그 B</span>
              <input value={draft.detailTagB} onChange={(e) => setValue('detailTagB', e.target.value)}/>
            </label>
          </section>

        </div>

        <div className="keyword-flow-footer">
          <GhostBtn type="button" onClick={onClose}>취소</GhostBtn>
          <AuroraBtn type="button" icon={<IconSync size={16}/>} onClick={() => onStart({...draft, concurrency:50, imageSize:1000})}>
            설정 저장 후 생성 시작
          </AuroraBtn>
        </div>
      </aside>
    </div>
  );
}

function KeywordWorkbench({
  rows,
  selectedGs,
  marketSelection,
  options,
  activeChannel,
  onChannelChange,
  activeProductId,
  onActiveProductChange,
  keywordJob = null,
  onStartKeyword,
  uploadQueue = {},
  onQueueUploadItem,
}) {
  const [logsOpen, setLogsOpen] = useState(false);
  const [channelAccount, setChannelAccount] = useState((activeChannel || 'A:네이버').split(':')[0] || 'A');
  const [mainImageByProduct, setMainImageByProduct] = useState({});
  const tableRef = useRef(null);
  const dragRef = useRef(null);
  const titleInputRef = useRef(null);
  const termsInputRef = useRef(null);
  const keywordRunning = ['queued', 'running'].includes(keywordJob?.status);
  const keywordFailed = keywordJob?.status === 'failed';
  const keywordProgress = Math.max(0, Math.min(100, Number(keywordJob?.progressPercent || 0)));
  const scopedChannels = Object.entries(marketSelection || {})
    .filter(([, enabled]) => enabled !== false)
    .filter(([key]) => !key.endsWith(':Cafe24'))
    .filter(([key]) => !options.accountScope || options.accountScope === '전체' || key.startsWith(`${options.accountScope}:`))
    .map(([key]) => {
      const [account, market] = key.split(':');
      return { key, account, market };
    });
  const accountTabs = [...new Set(scopedChannels.map((item) => item.account))];
  const currentAccount = accountTabs.includes(channelAccount) ? channelAccount : accountTabs[0] || 'A';
  const channels = scopedChannels.filter((item) => item.account === currentAccount);
  const visibleRows = rows.filter((row) => selectedGs.has(row.gs));
  const activeRow = visibleRows.find((row) => row.id === activeProductId) || visibleRows[0];
  const activeIndex = visibleRows.findIndex((row) => row.id === activeRow?.id);
  const channel = channels.find((item) => item.key === activeChannel) || channels[0] || { account:'A', market:'네이버', key:'A:네이버' };
  const getSavedVariant = (row, item) => {
    const saved = row?.marketKeywords?.[item.key] || row?.seedProduct?.marketKeywords?.[item.key];
    if (!saved) return null;
    const searchTerms = saved.searchTerms || saved.search_terms || (Array.isArray(saved.tags) ? saved.tags.join(', ') : '');
    return {
      title: saved.title || '',
      searchTerms,
      tags: Array.isArray(saved.tags) ? saved.tags : [],
      candidateCount: Number(saved.candidateCount || (Array.isArray(saved.tags) ? saved.tags.length : 0)),
      generated: Boolean(saved.title && searchTerms),
      provider: saved.provider || 'codex-cli',
      notes: saved.notes || '',
    };
  };
  const getVariant = (row, item) => {
    const saved = getSavedVariant(row, item);
    if (saved) return saved;
    return { title:'', searchTerms:'', tags:[], candidateCount:0, generated:false, provider:'codex-cli' };
  };
  const channelProgress = scopedChannels.map((item) => {
    const variants = visibleRows.map((row) => getVariant(row, item));
    const generated = variants.filter((variant) => variant.generated).length;
    const candidateCount = variants.reduce((sum, variant) => sum + Number(variant.candidateCount || 0), 0);
    const savedPercent = visibleRows.length ? Math.round((generated / visibleRows.length) * 100) : 0;
    const percent = keywordRunning ? Math.max(savedPercent, keywordProgress) : savedPercent;
    return {
      ...item,
      generated,
      total: visibleRows.length,
      candidateCount,
      percent,
      status: keywordFailed ? '실패' : visibleRows.length ? (percent >= 100 ? '생성 완료' : keywordRunning ? 'AI 생성 중' : '대기') : '대기',
    };
  });
  const activeChannelProgress = channelProgress.find((item) => item.key === channel.key) || {
    generated: 0,
    total: visibleRows.length,
    candidateCount: 0,
    percent: keywordRunning ? keywordProgress : 0,
    status: keywordRunning ? 'AI 생성 중' : '대기',
  };
  const imageKeyFor = (row) => `${channel.key}:${row?.id || row?.gs || 'none'}`;
  const getImageSlots = (row) => {
    if (!row) return [];
    const images = row.images || row.seedProduct?.images || {};
    const detailUrlSet = new Set(Array.isArray(images.detail) ? images.detail : []);
    const fromListingColumns = images.selectionSource === 'listing_image_columns_only';
    const productImage = (url) => (fromListingColumns || !detailUrlSet.has(url) ? url : '');
    const additional = (Array.isArray(images.additional) ? images.additional : [])
      .filter((url) => productImage(url));
    const urls = uniqueList([
      productImage(images.representative),
      productImage(images.sourceThumb),
      productImage(row.thumb),
      ...(Array.isArray(images.listingCandidates) ? images.listingCandidates : []),
      ...(Array.isArray(images.processed) ? images.processed : []),
      ...additional,
      ...(Array.isArray(row.listingImages) ? row.listingImages : []),
      ...(Array.isArray(row.additionalImages) ? row.additionalImages : []),
    ].filter(Boolean));
    const sourceUrls = urls.length ? urls : [row.thumb].filter(Boolean);
    return sourceUrls.map((src, index) => ({
      id: index === 0 ? 'main' : `image-${index}`,
      label: `${index + 1}번`,
      src,
    }));
  };
  const getMainImageId = (row) => mainImageByProduct[imageKeyFor(row)] || 'main';
  const setRowMainImage = (row, imageId) => {
    if (!row) return;
    setMainImageByProduct((prev) => ({ ...prev, [imageKeyFor(row)]: imageId }));
  };
  const activeSaved = activeRow ? getSavedVariant(activeRow, channel) : null;
  const activePct = activeSaved ? 100 : keywordRunning ? keywordProgress : 0;
  const activeDone = Boolean(activeSaved);
  const activeVariant = activeRow ? getVariant(activeRow, channel) : { title:'', searchTerms:'', candidateCount:0, generated:false };
  const activeMainImageId = activeRow ? getMainImageId(activeRow) : 'main';
  const activeQueueKey = activeRow ? `${channel.key}:${activeRow.gs}` : '';
  const activeQueued = Boolean(uploadQueue?.[activeQueueKey]);
  const overviewGridTemplate = `300px repeat(${scopedChannels.length}, 220px)`;
  const activeChannelIndex = Math.max(0, scopedChannels.findIndex((item) => item.key === channel.key));
  const focusOverviewCell = (rowIndex, channelIndex) => {
    const boundedRowIndex = Math.max(0, Math.min(visibleRows.length - 1, rowIndex));
    const boundedChannelIndex = Math.max(0, Math.min(scopedChannels.length - 1, channelIndex));
    const nextRow = visibleRows[boundedRowIndex];
    const nextChannel = scopedChannels[boundedChannelIndex];
    if (!nextRow || !nextChannel) return;
    setChannelAccount(nextChannel.account);
    onChannelChange(nextChannel.key);
    onActiveProductChange(nextRow.id);
    window.setTimeout(() => {
      const table = tableRef.current;
      const cell = table?.querySelector(`[data-row-index="${boundedRowIndex}"][data-channel-index="${boundedChannelIndex}"]`);
      cell?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    }, 0);
  };
  const handleOverviewKeyDown = (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const rowIndex = Math.max(0, visibleRows.findIndex((row) => row.id === activeRow?.id));
    const channelIndex = activeChannelIndex;
    if (event.key === 'ArrowLeft') focusOverviewCell(rowIndex, channelIndex - 1);
    if (event.key === 'ArrowRight') focusOverviewCell(rowIndex, channelIndex + 1);
    if (event.key === 'ArrowUp') focusOverviewCell(rowIndex - 1, channelIndex);
    if (event.key === 'ArrowDown') focusOverviewCell(rowIndex + 1, channelIndex);
    if (event.key === 'Home') focusOverviewCell(rowIndex, 0);
    if (event.key === 'End') focusOverviewCell(rowIndex, scopedChannels.length - 1);
  };
  const startTableDrag = (event) => {
    if (event.button !== 0) return;
    if (event.target.closest('button,input,textarea,select')) return;
    const table = tableRef.current;
    if (!table) return;
    dragRef.current = {
      x: event.clientX,
      left: table.scrollLeft,
    };
    table.classList.add('is-dragging');
    table.setPointerCapture?.(event.pointerId);
  };
  const moveTableDrag = (event) => {
    const drag = dragRef.current;
    const table = tableRef.current;
    if (!drag || !table) return;
    table.scrollLeft = drag.left - (event.clientX - drag.x);
  };
  const stopTableDrag = (event) => {
    const table = tableRef.current;
    dragRef.current = null;
    table?.classList.remove('is-dragging');
    table?.releasePointerCapture?.(event.pointerId);
  };
  const queueActiveItem = () => {
    if (!activeDone || !activeRow || !onQueueUploadItem) return;
    const items = [];
    visibleRows.forEach((row) => {
      scopedChannels.forEach((item) => {
        const saved = getSavedVariant(row, item);
        if (!saved) return;
        const variant = getVariant(row, item);
        const isActiveCell = row.id === activeRow.id && item.key === channel.key;
        const mainImageId = getMainImageId(row);
        const rowImageSlots = getImageSlots(row);
        const selectedImage = rowImageSlots.find((slot) => slot.id === mainImageId) || rowImageSlots[0];
        items.push({
          channelKey: item.key,
          account: item.account,
          market: item.market,
          gs: row.gs,
          baseGs: row.baseGs,
          sourceName: row.name,
          title: isActiveCell ? (titleInputRef.current?.value?.trim() || variant.title) : variant.title,
          searchTerms: isActiveCell ? (termsInputRef.current?.value?.trim() || variant.searchTerms) : variant.searchTerms,
          tags: variant.tags || [],
          candidateCount: variant.candidateCount || 0,
          mainImageId,
          mainImageLabel: selectedImage?.label || '1번',
          mainImageSrc: selectedImage?.src || row.thumb,
          thumb: row.thumb,
          price: row.price,
          optionSummary: row.opt,
        });
      });
    });
    onQueueUploadItem(items);
  };
  const imageSlots = getImageSlots(activeRow);

  return (
    <div className="keyword-workbench">
      <div className="channel-selector surface">
        <div className="channel-account-switch">
          {accountTabs.map((account) => (
            <button
              type="button"
              key={account}
              className={currentAccount === account ? 'active' : ''}
              onClick={() => {
                setChannelAccount(account);
                const first = scopedChannels.find((item) => item.account === account);
                if (first) onChannelChange(first.key);
              }}>
              {account}계정
            </button>
          ))}
        </div>
        <div className="channel-tabs">
          {channels.map((item) => (
            <button
              type="button"
              key={item.key}
              className={item.key === channel.key ? 'active' : ''}
              onClick={() => {
                setChannelAccount(item.account);
                onChannelChange(item.key);
              }}>
              <strong>{item.market}</strong>
              <span>
                {(channelProgress.find((progress) => progress.key === item.key)?.generated || 0)}/{visibleRows.length || 0}
              </span>
            </button>
          ))}
        </div>
        <div className="channel-work-status">
          <span className={`pill ${keywordFailed ? 'pill--failed' : activeChannelProgress.generated ? 'pill--uploaded' : 'pill--targeted'}`}>
            {channel.key} · {activeChannelProgress.generated}/{activeChannelProgress.total} 완료
          </span>
          <span className="channel-progress-line">
            <i style={{width:`${activeChannelProgress.percent}%`}}/>
          </span>
          <button
            type="button"
            className={`pill pill-button ${keywordRunning ? 'pill--uploaded' : 'pill--targeted'}`}
            onClick={onStartKeyword}
            disabled={keywordRunning || visibleRows.length === 0}>
            {keywordRunning ? `생성 중 ${keywordProgress}%` : '키워드 생성'}
          </button>
        </div>
      </div>

      <div className="keyword-layout keyword-layout--review">
        <section className="keyword-run-list surface">
          <div className="kw-panel-head">
          <div>
            <span className="t-eyebrow">{channel.key} · max_{options.concurrency}</span>
            <h3>상품 x 마켓 한눈 검수표</h3>
          </div>
          <button
            type="button"
            className={`pill pill-button ${keywordFailed ? 'pill--failed' : keywordRunning ? 'pill--uploaded' : 'pill--targeted'}`}
            onClick={onStartKeyword}
            disabled={keywordRunning || visibleRows.length === 0}>
            {keywordFailed ? '다시 생성' : keywordRunning ? 'AI 실행중' : '생성 시작'}
          </button>
          </div>

          <div
            className="kw-products keyword-overview-table"
            ref={tableRef}
            tabIndex={0}
            onKeyDown={handleOverviewKeyDown}
            onPointerDown={startTableDrag}
            onPointerMove={moveTableDrag}
            onPointerUp={stopTableDrag}
            onPointerCancel={stopTableDrag}
            onPointerLeave={stopTableDrag}>
            {visibleRows.length === 0 && (
              <div className="kw-empty">선택된 상품 없음</div>
            )}
            {visibleRows.length > 0 && (
              <div
                className="keyword-overview-row keyword-overview-head"
                style={{gridTemplateColumns: overviewGridTemplate}}
                aria-hidden="true">
                <span>상품 / 대표이미지</span>
                {scopedChannels.map((item) => (
                  <span key={item.key}>{item.account} {item.market}</span>
                ))}
              </div>
            )}
            {visibleRows.map((row, index) => {
              return (
                <div
                  className={`keyword-overview-row ${activeRow?.id === row.id ? 'active-row' : ''}`}
                  style={{gridTemplateColumns: overviewGridTemplate}}
                  key={row.id}>
                  <div className="overview-product-cell">
                    <ProductThumb src={row.thumb} alt={row.name} compact/>
                    <span className="overview-product-text">
                      <strong className="mono">{row.gs}</strong>
                      <b>{row.name}</b>
                      <small>대표 {getMainImageId(row) === 'main' ? '1' : getMainImageId(row).replace('detail-', '') * 1 + 1}번</small>
                    </span>
                    <span className="overview-image-picks">
                      {getImageSlots(row).slice(0, 4).map((slot, imageIndex) => {
                        const isMain = getMainImageId(row) === slot.id;
                        return (
                          <button
                            type="button"
                            key={slot.id}
                            className={isMain ? 'active' : ''}
                            onClick={() => {
                              setRowMainImage(row, slot.id);
                              onActiveProductChange(row.id);
                            }}>
                            {imageIndex + 1}
                          </button>
                        );
                      })}
                    </span>
                  </div>
                  {scopedChannels.map((item) => {
                    const variant = getVariant(row, item);
                    const saved = getSavedVariant(row, item);
                    const queued = Boolean(uploadQueue?.[`${item.key}:${row.gs}`]);
                    const pct = saved ? 100 : keywordRunning ? keywordProgress : 0;
                    const done = Boolean(saved);
                    const activeCell = activeRow?.id === row.id && channel.key === item.key;
                    return (
                      <button
                        type="button"
                        key={item.key}
                        data-row-index={index}
                        data-channel-index={scopedChannels.findIndex((candidate) => candidate.key === item.key)}
                        className={`overview-market-cell ${activeCell ? 'active' : ''} ${queued ? 'queued' : ''} ${done ? 'done' : keywordRunning ? 'running' : 'waiting'}`}
                        onClick={() => {
                          setChannelAccount(item.account);
                          onChannelChange(item.key);
                          onActiveProductChange(row.id);
                        }}>
                        <strong>{done ? variant.title : keywordFailed ? '실패' : keywordRunning ? '생성중' : '대기'}</strong>
                        <small>{queued ? `대기열 · ${variant.candidateCount || 0}개` : done ? `${variant.candidateCount}개` : `${pct}%`}</small>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </section>

        <section className={`keyword-review-panel surface ${activeDone ? '' : 'is-waiting'}`}>
          <div className="kw-panel-head">
            <div>
              <span className="t-eyebrow">{channel.key} · {activeRow?.gs || 'GS'} · {activePct}%</span>
              <h3>업로드 전 검수/수정</h3>
            </div>
            <span className={`pill ${activeDone ? 'pill--uploaded' : 'pill--muted'}`}>
              {activeDone ? '수정 가능' : '생성 대기'}
            </span>
          </div>

          <div className="keyword-review-body">
            <div className="review-edit-fields">
              <label>
                <span>상품명</span>
                <input
                  ref={titleInputRef}
                  key={`${channel.key}:${activeRow?.id}:keyword`}
                  defaultValue={activeVariant.title}
                  disabled={!activeDone}
                  placeholder="생성 완료 후 수정 가능"/>
              </label>
              <label>
                <span>{keywordFieldLabel(channel.market)}</span>
                <textarea
                  ref={termsInputRef}
                  key={`${channel.key}:${activeRow?.id}:terms`}
                  defaultValue={activeVariant.searchTerms}
                  disabled={!activeDone}
                  placeholder="표준어 + 현장명 + 별칭을 넓게 정리"/>
              </label>
              <small>상품명은 대표어 중심으로 줄이고, 태그/검색어는 상품명에 못 넣은 보조어와 동의어를 분리한다. 옵션값은 기본적으로 옵션 컬럼 우선이다.</small>
            </div>

            <div className="review-image-picker">
              <div className="review-image-head">
                <strong>이미지 매칭</strong>
                <span>대표 1개 · 나머지 추가</span>
              </div>
              <div className="review-thumbs">
                {imageSlots.map((slot) => {
                  const isMain = activeMainImageId === slot.id;
                  return (
                    <button
                      type="button"
                      key={slot.id}
                      className={`review-thumb ${isMain ? 'is-main' : ''}`}
                      onClick={() => activeDone && setRowMainImage(activeRow, slot.id)}
                      disabled={!activeDone && slot.id !== 'main'}>
                      <ProductThumb src={slot.src} alt={slot.label} compact/>
                      <span>{slot.label}</span>
                      <strong>{isMain ? '대표' : '추가'}</strong>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="review-actions">
            <GhostBtn disabled={!activeDone}>현재 상품 보류</GhostBtn>
            <AuroraBtn icon={<IconChevR size={16}/>} disabled={!activeDone} onClick={queueActiveItem}>
              {activeQueued ? '대기열 갱신 후 이동' : '업로드 대기열 반영'}
            </AuroraBtn>
          </div>
        </section>
      </div>

      <section className={`run-log-panel surface ${logsOpen ? 'is-open' : ''}`}>
        <button type="button" className="run-log-toggle" onClick={() => setLogsOpen((open) => !open)}>
          <span>실행 로그</span>
          <strong>{logsOpen ? '접기' : '펼치기'}</strong>
        </button>
        {logsOpen && (
          <div className="run-log-lines">
            {keywordJob?.tail?.length ? keywordJob.tail.slice(-8).map((line, index) => (
              <code key={index}>{line}</code>
            )) : (
              <>
                <code>seed loaded · {visibleRows.length} products · {channels.length} channels</code>
                <code>{keywordRunning ? 'codex keyword job running' : 'keyword result ready or not started'}</code>
                <code>{channel.key} · {activeRow?.gs || 'GS'} · 후보 {activeVariant.candidateCount}개</code>
              </>
            )}
          </div>
        )}
      </section>

    </div>
  );
}

function MarketUploadWorkbench({
  rows,
  selectedGs,
  marketSelection,
  options,
  activeChannel,
  onChannelChange,
  uploadQueue = {},
  onUploadHistoryChange,
  onRuntimeArtifact,
}) {
  const [uploadStatus, setUploadStatus] = useState({});
  const scopedChannels = Object.entries(marketSelection || {})
    .filter(([, enabled]) => enabled !== false)
    .filter(([key]) => !key.endsWith(':Cafe24'))
    .filter(([key]) => !options.accountScope || options.accountScope === '전체' || key.startsWith(`${options.accountScope}:`))
    .map(([key]) => {
      const [account, market] = key.split(':');
      return { key, account, market };
    });
  const rowByGs = new Map(rows.map((row) => [row.gs, row]));
  const selectedFallbackRows = rows.filter((row) => selectedGs.has(row.gs));
  const queuedItems = Object.values(uploadQueue || {}).filter((item) => item?.gs && item?.channelKey);
  const queuedItemMap = new Map(queuedItems.map((item) => [item.queueKey || `${item.channelKey}:${item.gs}`, item]));
  const uploadRows = uniqueList([
    ...queuedItems.map((item) => item.gs),
    ...selectedFallbackRows.map((row) => row.gs),
  ]).map((gs) => rowByGs.get(gs) || {
    id: gs,
    gs,
    name: queuedItems.find((item) => item.gs === gs)?.sourceName || gs,
    thumb: queuedItems.find((item) => item.gs === gs)?.thumb || '',
    price: queuedItems.find((item) => item.gs === gs)?.price || 0,
    opt: queuedItems.find((item) => item.gs === gs)?.optionSummary || '',
    marketKeywords: {},
  });
  const getCellKey = (row, channel) => `${channel.key}:${row.gs}`;
  const getSavedVariant = (row, channel) => {
    const saved = row?.marketKeywords?.[channel.key] || row?.seedProduct?.marketKeywords?.[channel.key] || {};
    const entry = queuedItemMap.get(getCellKey(row, channel));
    const tags = entry?.tags || saved.tags || [];
    return {
      title: entry?.title || saved.title || '',
      searchTerms: entry?.searchTerms || saved.searchTerms || saved.search_terms || (Array.isArray(tags) ? tags.join(', ') : ''),
      tags: Array.isArray(tags) ? tags : [],
      candidateCount: Number(entry?.candidateCount || saved.candidateCount || (Array.isArray(tags) ? tags.length : 0)),
      mainImageId: entry?.mainImageId || 'main',
      mainImageLabel: entry?.mainImageLabel || '1번',
      mainImageSrc: entry?.mainImageSrc || row?.thumb || '',
      cafe24Url: entry?.cafe24Url || row?.cafe24Url || `https://mall.cafe24.com/${row?.gs || ''}`,
    };
  };
  const isAvailable = (row, channel) => {
    if (queuedItemMap.has(getCellKey(row, channel))) return true;
    const variant = getSavedVariant(row, channel);
    return Boolean(variant.title && variant.searchTerms);
  };
  const initialSelectedKeys = queuedItems.map((item) => item.queueKey || `${item.channelKey}:${item.gs}`);
  const [uploadSelection, setUploadSelection] = useState(new Set(initialSelectedKeys));
  const queueSignature = initialSelectedKeys.sort().join('|');

  useEffect(() => {
    setUploadSelection(new Set(initialSelectedKeys));
  }, [queueSignature]);

  const availableKeys = uploadRows.flatMap((row) => scopedChannels
    .filter((channel) => isAvailable(row, channel))
    .map((channel) => getCellKey(row, channel)));
  const allSelected = availableKeys.length > 0 && availableKeys.every((key) => uploadSelection.has(key));
  const selectedCount = availableKeys.filter((key) => uploadSelection.has(key)).length;
  const excelSelectedCount = availableKeys.filter((key) => {
    const channel = scopedChannels.find((item) => key.startsWith(`${item.key}:`));
    return uploadSelection.has(key) && ['11번가', 'ESM'].includes(channel?.market);
  }).length;
  const apiSelectedCount = availableKeys.filter((key) => {
    const channel = scopedChannels.find((item) => key.startsWith(`${item.key}:`));
    return uploadSelection.has(key) && !['11번가', 'ESM'].includes(channel?.market);
  }).length;

  const toggleUpload = (key) => {
    setUploadSelection((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };
  const toggleRow = (row) => {
    const keys = scopedChannels.filter((channel) => isAvailable(row, channel)).map((channel) => getCellKey(row, channel));
    const selected = keys.length > 0 && keys.every((key) => uploadSelection.has(key));
    setUploadSelection((prev) => {
      const next = new Set(prev);
      keys.forEach((key) => selected ? next.delete(key) : next.add(key));
      return next;
    });
  };
  const toggleChannel = (channel) => {
    const keys = uploadRows.filter((row) => isAvailable(row, channel)).map((row) => getCellKey(row, channel));
    const selected = keys.length > 0 && keys.every((key) => uploadSelection.has(key));
    setUploadSelection((prev) => {
      const next = new Set(prev);
      keys.forEach((key) => selected ? next.delete(key) : next.add(key));
      return next;
    });
  };
  const buildSelectedEntries = (filterFn = () => true) => {
    return uploadRows.flatMap((row) => scopedChannels.map((channel) => {
      const key = getCellKey(row, channel);
      if (!uploadSelection.has(key) || !isAvailable(row, channel) || !filterFn(channel)) return null;
      const variant = getSavedVariant(row, channel);
      return { key, row, channel, variant };
    }).filter(Boolean));
  };
  const uploadStatusLabel = (status, available) => {
    if (status === 'running') return '서버처리';
    if (status === 'requested') return '요청됨';
    if (status === 'uploaded') return '완료';
    if (status === 'failed') return '실패';
    if (status === 'skipped') return '제외';
    if (status === 'exported') return '엑셀저장';
    return available ? '대기열' : '없음';
  };
  const storeUploadPayload = (entries, action) => {
    const payload = {
      action,
      createdAt: new Date().toISOString(),
      rows: entries.map(({ key, row, channel, variant }) => ({
        queueKey: key,
        account: channel.account,
        market: channel.market,
        channel: channel.key,
        gs: row.gs,
        sourceName: row.name,
        title: variant.title,
        searchTerms: variant.searchTerms,
        mainImage: variant.mainImageLabel,
        mainImageSrc: variant.mainImageSrc,
        cafe24Url: variant.cafe24Url,
      })),
    };
    try {
      localStorage.setItem('webocr.pipeline.marketUpload', JSON.stringify(payload, null, 2));
      window.WEBOCR_LAST_PIPELINE_PAYLOAD = payload;
    } catch {}
    return payload;
  };
  const applyUploadJobResults = (results = []) => {
    if (!Array.isArray(results) || !results.length) return;
    setUploadStatus((prev) => {
      const next = {...prev};
      results.forEach((item) => {
        const key = item.queueKey || `${item.channel}:${item.gs}`;
        next[key] = item.status || 'failed';
      });
      return next;
    });
    const grouped = results.reduce((acc, item) => {
      const status = item.status || 'failed';
      if (!acc[status]) acc[status] = [];
      acc[status].push({
        channelKey: item.channel,
        account: item.account,
        market: item.market,
        gs: item.gs,
        sourceName: item.sourceName,
        title: item.title,
        searchTerms: item.searchTerms,
        mainImageLabel: item.mainImage,
        mainImageSrc: item.mainImageSrc,
        cafe24Url: item.cafe24Url,
        error: item.error || '',
      });
      return acc;
    }, {});
    Object.entries(grouped).forEach(([status, items]) => onUploadHistoryChange?.(items, status));
  };
  const pollUploadJob = (jobId) => {
    window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        const job = await response.json();
        if (!response.ok || !job?.ok) throw new Error(job?.error || `job ${response.status}`);
        if (Array.isArray(job.results)) applyUploadJobResults(job.results);
        if (job.status === 'completed') {
          applyUploadJobResults(job.result?.results || []);
          return;
        }
        if (job.status === 'failed') {
          setUploadStatus((prev) => {
            const next = {...prev};
            Object.keys(next).forEach((key) => {
              if (next[key] === 'running') next[key] = 'failed';
            });
            return next;
          });
          return;
        }
        pollUploadJob(jobId);
      } catch (error) {
        setUploadStatus((prev) => {
          const next = {...prev};
          Object.keys(next).forEach((key) => {
            if (next[key] === 'running') next[key] = 'failed';
          });
          return next;
        });
      }
    }, 1200);
  };
  const runApiUpload = async () => {
    const entries = buildSelectedEntries((channel) => !['11번가', 'ESM'].includes(channel.market));
    const payload = storeUploadPayload(entries, 'apiMarketUploadQueue');
    setUploadStatus((prev) => {
      const next = {...prev};
      entries.forEach(({ key }) => { next[key] = 'running'; });
      return next;
    });
    onUploadHistoryChange?.(entries.map(({ row, channel, variant }) => ({
      channelKey: channel.key,
      account: channel.account,
      market: channel.market,
      gs: row.gs,
      sourceName: row.name,
      title: variant.title,
      searchTerms: variant.searchTerms,
      mainImageLabel: variant.mainImageLabel,
      mainImageSrc: variant.mainImageSrc,
      cafe24Url: variant.cafe24Url,
    })), 'running');
    try {
      const response = await fetch('/api/market-upload', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result?.ok) throw new Error(result?.error || `upload ${response.status}`);
      onRuntimeArtifact?.({ jobId: result.jobId });
      pollUploadJob(result.jobId);
    } catch (error) {
      setUploadStatus((prev) => {
        const next = {...prev};
        entries.forEach(({ key }) => { next[key] = 'failed'; });
        return next;
      });
    }
  };
  const downloadExcelData = async (market) => {
    const entries = buildSelectedEntries((channel) => channel.market === market);
    const payload = storeUploadPayload(entries, `${market}ExcelExportQueue`);
    try {
      const response = await fetch('/api/excel-export', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({...payload, market}),
      });
      const result = await response.json();
      if (!response.ok || !result?.ok) throw new Error(result?.error || `export ${response.status}`);
      onRuntimeArtifact?.({ path: result.export?.path });
      const link = document.createElement('a');
      link.href = result.export.url;
      link.download = result.export.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setUploadStatus((prev) => {
        const next = {...prev};
        entries.forEach(({ key }) => { next[key] = 'exported'; });
        return next;
      });
      onUploadHistoryChange?.(entries.map(({ row, channel, variant }) => ({
        channelKey: channel.key,
        account: channel.account,
        market: channel.market,
        gs: row.gs,
        sourceName: row.name,
        title: variant.title,
        searchTerms: variant.searchTerms,
        mainImageLabel: variant.mainImageLabel,
        mainImageSrc: variant.mainImageSrc,
        cafe24Url: variant.cafe24Url,
      })), 'exported');
    } catch (error) {
      setUploadStatus((prev) => {
        const next = {...prev};
        entries.forEach(({ key }) => { next[key] = 'failed'; });
        return next;
      });
    }
  };

  return (
    <div className="market-upload-workbench">
      <section className="upload-queue-summary surface">
        <div>
          <span className="t-eyebrow">UPLOAD_QUEUE · MARKET_TARGETS</span>
          <h3>업로드 대기열</h3>
        </div>
        <div className="upload-queue-stats">
          <span><b>{uploadRows.length}</b>상품</span>
          <span><b>{selectedCount}</b>선택</span>
          <span><b>{apiSelectedCount}</b>API</span>
          <span><b>{excelSelectedCount}</b>Excel</span>
        </div>
      </section>

      <section className="upload-table surface">
        <div className="upload-head">
          <div>
            <span className="t-eyebrow">상품 행 x 마켓 열</span>
            <h3>업로드 대상 체크표</h3>
          </div>
          <div className="upload-actions">
            <GhostBtn onClick={() => setUploadSelection(new Set())}>전체 해제</GhostBtn>
            <GhostBtn onClick={() => setUploadSelection(new Set(availableKeys))}>전체 선택</GhostBtn>
            <GhostBtn icon={<IconFile size={16}/>} onClick={() => downloadExcelData('11번가')} disabled={!buildSelectedEntries((channel) => channel.market === '11번가').length}>11번가 엑셀 저장</GhostBtn>
            <GhostBtn icon={<IconFile size={16}/>} onClick={() => downloadExcelData('ESM')} disabled={!buildSelectedEntries((channel) => channel.market === 'ESM').length}>ESM 엑셀 저장</GhostBtn>
            <AuroraBtn icon={<IconUpload size={16}/>} onClick={runApiUpload} disabled={!apiSelectedCount}>선택 API 업로드</AuroraBtn>
          </div>
        </div>

        {!uploadRows.length && (
          <div className="upload-empty">
            키워드 검수 화면에서 업로드 대기열 반영을 누르면 이 표에 상품이 쌓인다.
          </div>
        )}

        {!!uploadRows.length && (
          <div className="upload-queue-table">
            <div
              className="upload-queue-row upload-queue-head"
              style={{gridTemplateColumns: `250px repeat(${scopedChannels.length}, 190px)`}}>
              <label>
                <input
                  type="checkbox"
                  checked={allSelected}
                  readOnly
                  onClick={() => setUploadSelection(allSelected ? new Set() : new Set(availableKeys))}/>
                <span>상품</span>
              </label>
              {scopedChannels.map((channel) => {
                const keys = uploadRows.filter((row) => isAvailable(row, channel)).map((row) => getCellKey(row, channel));
                const checked = keys.length > 0 && keys.every((key) => uploadSelection.has(key));
                return (
                  <label key={channel.key}>
                    <input
                      type="checkbox"
                      checked={checked}
                      readOnly
                      onClick={() => toggleChannel(channel)}/>
                    <span>{channel.key}</span>
                  </label>
                );
              })}
            </div>

            {uploadRows.map((row) => {
              const rowKeys = scopedChannels.filter((channel) => isAvailable(row, channel)).map((channel) => getCellKey(row, channel));
              const rowChecked = rowKeys.length > 0 && rowKeys.every((key) => uploadSelection.has(key));
              return (
                <div
                  className="upload-queue-row"
                  key={row.gs}
                  style={{gridTemplateColumns: `250px repeat(${scopedChannels.length}, 190px)`}}>
                  <div className="upload-product upload-queue-product">
                    <input
                      type="checkbox"
                      checked={rowChecked}
                      readOnly
                      onClick={() => toggleRow(row)}/>
                    <ProductThumb src={row.thumb} alt={row.name} compact/>
                    <span>
                      <strong className="mono">{row.gs}</strong>
                      <small>{row.name}</small>
                    </span>
                  </div>
                  {scopedChannels.map((channel) => {
                    const key = getCellKey(row, channel);
                    const available = isAvailable(row, channel);
                    const variant = getSavedVariant(row, channel);
                    const status = uploadStatus[key] || queuedItemMap.get(key)?.status || (available ? 'queued' : 'muted');
                    return (
                      <button
                        type="button"
                        key={channel.key}
                        disabled={!available}
                        className={`upload-market-cell ${uploadSelection.has(key) ? 'selected' : ''} ${available ? '' : 'disabled'}`}
                        onClick={() => available && toggleUpload(key)}>
                        <span className="upload-cell-top">
                          <input type="checkbox" checked={uploadSelection.has(key)} readOnly tabIndex="-1"/>
                          <Pill status={status}>{uploadStatusLabel(status, available)}</Pill>
                        </span>
                        <strong>{available ? variant.title : '생성 없음'}</strong>
                        <small>{available ? `${variant.candidateCount || 0}개 · ${variant.mainImageLabel}` : '키워드 없음'}</small>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}

/* ── detail panel (right slide-in) ────────────────────────── */
function DetailModal({ product, onClose, onStatusChange }) {
  if (!product) return null;
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-scrim" onClick={onClose}>
    <aside className="detail detail--modal" onClick={(e) => e.stopPropagation()}>
      <div className="detail-head">
        <div>
          <span className="t-eyebrow">{product.gs}</span>
          <h3>{product.name}</h3>
        </div>
        <IconBtn icon={<IconClose size={18}/>} label="닫기" onClick={onClose}/>
      </div>

      <div className="detail-kv">
        <div><span>원본 상품명</span><strong>{product.originalName}</strong></div>
        <div><span>가격</span><strong className="mono">₩{product.price.toLocaleString()}</strong></div>
        <div><span>옵션</span><strong>{product.opt}</strong></div>
      </div>

      <div className="detail-section">
        <div className="ds-head">
          <h4>채널 상태</h4>
          <IconBtn icon={<IconEdit size={14}/>} label="일괄 편집"/>
        </div>
        {['A','B'].map(acc => (
          <div className="acc-block" key={acc}>
            <span className="acc-label">{acc}계정</span>
            <div className="acc-markets">
              {MARKETS.map((m,i) => {
                const s = product[acc][i];
                return (
                  <div className="acc-cell" key={m}>
                    <span className="acc-market">{m}</span>
                    <Pill status={s}/>
                    <IconBtn icon={<IconEdit size={12}/>} label="상태 변경"
                      onClick={() => onStatusChange(acc, i)}/>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="detail-section">
        <div className="ds-head"><h4>업로드 이력</h4></div>
        <ul className="history">
          {product.history.map((h,i) => (
            <li key={i}>
              <span className="h-time mono">{h.time}</span>
              <Pill status={h.status}/>
              <span className="h-where">{h.account} · {h.market}</span>
              {h.error && <span className="h-error">{h.error}</span>}
            </li>
          ))}
        </ul>
      </div>
    </aside>
    </div>
  );
}

const MARKET_CREDENTIALS = [
  { market: 'Cafe24', mode: 'key', accept: '.json,.txt,.env', hint: 'token/client key 파일' },
  { market: '네이버', mode: 'key', accept: '.json,.txt,.env', hint: 'Commerce API 키 파일' },
  { market: '쿠팡', mode: 'key', accept: '.json,.txt,.env', hint: 'WING access/secret 파일' },
  { market: '롯데ON', mode: 'key', accept: '.json,.txt,.env', hint: 'API 인증 파일' },
  { market: '11번가', mode: 'template', accept: '.xlsx,.xls', hint: '11번가 업로드 엑셀 서식' },
  { market: 'ESM', mode: 'template', accept: '.xlsx,.xls', hint: 'ESM 업로드 엑셀 서식' },
];

function SettingDropCell({ account, item, value, status, onFile }) {
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  const label = item.mode === 'template' ? '서식 파일' : '키 파일';
  const statusText = busy
    ? '저장 중'
    : status
      ? status.ok
        ? '호출 OK'
        : status.status === 'SKIP'
          ? '서식 확인'
          : '확인 필요'
      : value
        ? '저장됨'
        : '';
  const statusClass = busy ? 'is-busy' : status?.ok ? 'is-ok' : status?.status === 'SKIP' ? 'is-skip' : status ? 'is-fail' : value ? 'is-saved' : '';

  const handleFile = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      await onFile(`${account}:${item.market}`, file, item);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`setting-drop ${over ? 'is-over' : ''}`}
      onDragOver={(event) => { event.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        handleFile(event.dataTransfer.files?.[0]);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex="0">
      <div>
        <strong>{value || `${label} 드래그`}</strong>
        <span>{item.hint}</span>
        {statusText && <em className={`setting-status ${statusClass}`}>{statusText}</em>}
        {status?.message && <small className="setting-message">{status.message}</small>}
      </div>
      <IconUpload size={16}/>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={item.accept}
        onChange={(event) => handleFile(event.target.files?.[0])}/>
    </div>
  );
}

function SettingsModal({ onClose }) {
  const [files, setFiles] = useState({});
  const [statuses, setStatuses] = useState({});
  const [testing, setTesting] = useState(false);
  const [customMarkets, setCustomMarkets] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [newMarket, setNewMarket] = useState({ market: '', mode: 'key' });
  const credentialItems = [...MARKET_CREDENTIALS, ...customMarkets];

  const applyServerItems = (items = []) => {
    const nextFiles = {};
    items.forEach((item) => {
      if (item.account && item.market && item.fileName) {
        nextFiles[`${item.account}:${item.market}`] = item.fileName;
      }
    });
    setFiles(nextFiles);
  };
  const uploadFile = async (key, file, item) => {
    const [account, market] = key.split(':');
    const form = new FormData();
    form.append('account', account);
    form.append('market', market);
    form.append('mode', item.mode);
    form.append('file', file);
    const response = await fetch('/api/market-key', { method: 'POST', body: form });
    const payload = await response.json();
    if (!response.ok || !payload?.ok) throw new Error(payload?.error || `upload ${response.status}`);
    applyServerItems(payload.items || []);
    setStatuses((prev) => ({
      ...prev,
      [key]: { ok: true, status: 'SAVED', message: '서버 저장 완료' },
    }));
  };
  const testMarketKeys = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/market-key-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.ok) throw new Error(payload?.error || `test ${response.status}`);
      const next = {};
      (payload.results || []).forEach((result) => {
        next[`${result.account}:${result.market}`] = result;
      });
      setStatuses(next);
    } finally {
      setTesting(false);
    }
  };
  const addMarket = () => {
    const market = newMarket.market.trim();
    if (!market) return;
    const mode = newMarket.mode;
    const item = {
      market,
      mode,
      accept: mode === 'template' ? '.xlsx,.xls' : '.json,.txt,.env',
      hint: mode === 'template' ? `${market} 업로드 엑셀 서식` : `${market} API 인증 파일`,
      custom: true,
    };
    setCustomMarkets((prev) => prev.some((cur) => cur.market === market) ? prev : [...prev, item]);
    setNewMarket({ market: '', mode: 'key' });
    setAddOpen(false);
  };

  useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  useEffect(() => {
    fetch('/api/market-keys')
      .then((response) => response.json())
      .then((payload) => {
        if (payload?.ok) applyServerItems(payload.items || []);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="modal-scrim" onClick={onClose}>
      <aside className="settings-modal" onClick={(event) => event.stopPropagation()}>
        <div className="settings-head-wrap">
          <div className="settings-head">
            <div>
              <span className="t-eyebrow">settings · market_keys</span>
              <h3>마켓 키 / 엑셀 서식</h3>
            </div>
            <div className="settings-head-actions">
              <GhostBtn onClick={() => setAddOpen((open) => !open)}>마켓 추가</GhostBtn>
              <IconBtn icon={<IconClose size={18}/>} label="닫기" onClick={onClose}/>
            </div>
          </div>
          {addOpen && (
            <div className="market-add-panel">
              <label>
                <span>마켓명</span>
                <input
                  value={newMarket.market}
                  onChange={(event) => setNewMarket((prev) => ({ ...prev, market: event.target.value }))}
                  placeholder="예: 신규마켓"/>
              </label>
              <label>
                <span>연동 방식</span>
                <select
                  value={newMarket.mode}
                  onChange={(event) => setNewMarket((prev) => ({ ...prev, mode: event.target.value }))}>
                  <option value="key">API 키</option>
                  <option value="template">Excel 서식</option>
                </select>
              </label>
              <AuroraBtn icon={<IconFile size={16}/>} onClick={addMarket}>추가</AuroraBtn>
            </div>
          )}
        </div>

        <div className="settings-grid">
          <div className="settings-grid-head">마켓</div>
          <div className="settings-grid-head">A계정</div>
          <div className="settings-grid-head">B계정</div>

          {credentialItems.map((item) => (
            <React.Fragment key={item.market}>
              <div className="setting-market">
                <strong>{item.market}</strong>
                <span>{item.mode === 'template' ? 'Excel 서식' : 'API 키'}{item.custom ? ' · 추가됨' : ''}</span>
              </div>
              {['A', 'B'].map((account) => (
                <SettingDropCell
                  key={`${account}:${item.market}`}
                  account={account}
                  item={item}
                  value={files[`${account}:${item.market}`]}
                  status={statuses[`${account}:${item.market}`]}
                  onFile={uploadFile}/>
              ))}
            </React.Fragment>
          ))}
        </div>

        <div className="settings-actions">
          <GhostBtn onClick={onClose}>닫기</GhostBtn>
          <AuroraBtn icon={<IconSync size={16}/>} onClick={testMarketKeys} disabled={testing}>
            {testing ? '호출 테스트 중' : '전체 호출 테스트'}
          </AuroraBtn>
        </div>
      </aside>
    </div>
  );
}

Object.assign(window, {
  IconSearch, IconUpload, IconSync, IconSettings, IconEdit, IconClose, IconFile, IconFilter, IconCmd, IconChevR,
  AuroraBtn, VioletBtn, GhostBtn, IconBtn,
  Pill, Menu, MenuItem, MenuSection,
  TopBar, Sidebar, DropZone, ImportPreview, ProductMatrix, AccountSummary, DetailModal, ViewSwitch, WorkflowActionPanel, KeywordOptionsModal, KeywordWorkbench, MarketUploadWorkbench, SettingsModal,
  MARKETS, SELLING_MARKETS, STATUS_LABEL,
});
