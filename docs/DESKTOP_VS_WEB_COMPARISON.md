# C# 데스크톱 앱 vs WEBOCRV2 웹앱 — 파이프라인 단계별 비교

> 작성일: 2026-05-14  
> 범위: 소스파일 입력 → 가공 → 업로드까지의 전체 파이프라인

---

## 전체 파이프라인 흐름도

```
[1단계] 소스 CSV/Excel 입력 → 파싱 → GS코드 그룹화
[2단계] 1차 시드 생성 (OCR + 이미지 가공 + 키워드 풀)
[3단계] 마켓별 키워드/상품명 생성 (Claude Codex)
[4단계] 마켓 업로드 (네이버/쿠팡/롯데ON/11번가/ESM/Cafe24)
```

---

## 1단계: 소스 파일 입력 및 파싱

| 항목 | C# 데스크톱 | WEBOCRV2 | 차이/문제 |
|------|-----------|----------|----------|
| **파일 형식** | Excel(ClosedXML) 전용 | CSV + Excel(openpyxl) 둘 다 | 웹이 더 유연 |
| **인코딩** | UTF-8 기본 | utf-8-sig, cp949, utf-8 폴백 L1780 | 웹이 한글 CSV 대응 더 나음 |
| **GS코드 추출** | `Regex("GS\d{7}[A-Z0-9]*")` | `GS_CODE_RE = re.compile(r"(GS\d{7})([A-Z]?)")` L633 | **웹은 suffix 1자만 인식** (A~Z). C#은 `[A-Z0-9]*`로 다중 문자도 허용 |
| **옵션 그룹화** | 워크북 시트별로 분리 (분리추출후/B마켓) | `groups[base_gs]` 딕셔너리 그룹화 L1879 | C#은 시트 기반, 웹은 baseGs 기반 |
| **가격 컬럼** | 판매가 단일 | 판매가/공급가/소비자가 3가지 L1889 | 웹이 가격 정보 더 상세 |
| **이미지 URL 추출** | 목록/추가/상세 3종 분리 | 동일하게 3종 분리 L1891-1893 | **일치** |
| **상세 HTML** | 엑셀 셀 그대로 | `DETAIL_HTML_COLUMNS` 별도 정의 | 웹에서 HTML 컬럼 탐색 추가 |
| **옵션 파싱** | `옵션입력` 셀 → `|` 분리 | `옵션입력` → 자동 `옵션{A xxx|B yyy}` 생성 L1971-1975 | 웹이 자동 옵션 문자열 생성 |

### 1단계 문제점

| # | 문제 | 위치 | 설명 |
|---|------|------|------|
| 1 | **GS suffix 범위 차이** | WEBOCRV2 L633 vs C# | `GS0101352AB` 같은 2자리 suffix를 웹은 인식 못함. `[A-Z]?`(0~1자)만 매칭 |
| 2 | **시트 미참조** | WEBOCRV2 `read_excel_rows()` L1796 | `workbook.active` 한 시트만 읽음. C#은 `분리추출후`, `B마켓` 등 시트별 분리 처리. 웹은 B마켓 시트 데이터 누락 가능 |

---

## 2단계: 1차 시드 생성

| 항목 | C# 데스크톱 | WEBOCRV2 | 차이/문제 |
|------|-----------|----------|----------|
| **실행 방식** | `PipelineService.cs` 직접 호출 | `run_seed_job()` → subprocess `run_pipeline_bridge.py` 호출 L2186 | 웹은 subprocess 위임 |
| **OCR 엔진** | `OcrService.cs` (Tesseract 직접) | bridge.py가 OCR 실행 → 결과만 읽음 L1163 | **웹은 직접 OCR 불가**, 결과 파일만 파싱 |
| **이미지 가공** | `ListingImageService.cs` (1000x1000, 로고, 샤프닝 등) | bridge.py에 CLI args로 설정 전달 L2101-2141 | 웹은 설정만 전달, 실제 가공은 bridge |
| **진행률 추적** | 직접 `IProgress<string>` 콜백 | stdout 정규식 파싱 `infer_seed_progress()` L557 | 웹은 텍스트 패턴 기반 추정 |
| **결과 수신** | 반환값 직접 | `__RESULT__` prefix JSON from stdout L2252 | **magic string 의존** |
| **OCR 결과 병합** | 서비스 내부 직접 | `read_pipeline_ocr_summary()` → openpyxl로 OCR결과 시트 읽기 L1163 | **일치** (같은 엑셀 구조) |
| **키워드 풀 생성** | `KeywordBuilderService.cs` | `seed_keyword_pool_from_product()` L1126 | **로직은 유사하나 카테고리 힌트 목록 다름** |
| **시드 저장** | 엑셀 워크북 (.xlsx) | JSON 파일 (`.webseed.json`) L2301 | **형식 완전 다름** — 호환 불가 |
| **상품정보제공고시** | 수동 지정 또는 카테고리 API | OCR 텍스트 자동 추출 `build_naver_provided_notice()` L994 | 웹이 자동 추출 기능 추가 |

### 2단계 문제점

| # | 문제 | 위치 | 설명 |
|---|------|------|------|
| 3 | **시드 형식 호환 불가** | WEBOCRV2 L2301 | 웹은 `.webseed.json`, C#은 `.xlsx`. 상호 직접 사용 불가 |
| 4 | **`__RESULT__` magic string** | WEBOCRV2 L2252 | bridge.py stdout에서 `__RESULT__`로 시작하는 줄만 결과로 인식. bridge 출력 형식 변경 시 깨짐 |
| 5 | **카테고리 힌트 동기화** | WEBOCRV2 L753-784 vs C# KeywordBuilderService | 웹의 `CATEGORY_HINTS`와 `SYNONYM_SEEDS`는 Python에 하드코딩. C# 쪽 변경 시 수동 동기화 필요 |
| 6 | **model 하드코딩** | WEBOCRV2 L2138 | `--model claude-sonnet-4-6` 고정. C# 쪽 모델 변경과 연동 안됨 |

---

## 3단계: 마켓별 키워드/상품명 생성

| 항목 | C# 데스크톱 | WEBOCRV2 | 차이/문제 |
|------|-----------|----------|----------|
| **실행 엔진** | `MainWindow.xaml.cs` → `RunCodexCommandsParallelAsync` | `run_keyword_job()` → `codex.cmd exec` subprocess L2357 | 둘 다 Codex CLI 사용 |
| **프롬프트** | 코드 내장 (C# 쪽) | `build_keyword_prompt()` L1582 Python 내장 | **프롬프트 내용 다를 수 있음** |
| **출력 스키마** | 엑셀 컬럼 기반 (홈런_Cafe24검색어설정 등 10개) | JSON `webocr.keyword.v1` L1734 `{channels: {"A:네이버": {...}}}` | **완전 다른 스키마** |
| **결과 검증** | 없음 (직접 엑셀 기록) | `validate_keyword_result()` L1688 | 웹에 검증 로직 추가됨 |
| **기존 결과 보호** | 덮어쓰기 | `current_score > next_score + 18`이면 기존 유지 L1764 | 웹에 품질 비교 로직 있음 |
| **채널 범위** | 엑셀 컬럼 10개 고정 | 동적: `normalize_keyword_channels()` L1519 | 웹이 더 유연 |
| **단품 수량 제거** | 없음 | `strip_low_value_single_quantity()` L1659 — `1개`, `1입`, `1p` 제거 | 웹에 추가됨 |
| **금지어 필터** | 없음 | `BANNED_MARKETING_TERMS` L126 — `무료배송`, `할인` 등 제거 | 웹에 추가됨 |
| **복합어 띄어쓰기** | 없음 | `COMPOUND_SPACING_RULES` L97 — `카라비너릴고리` → `카라비너 릴고리` | 웹에 추가됨 |
| **상품명 길이 제한** | 없음 (자유) | 프롬프트에 명시: 네이버 35-48자, 쿠팡 60-80자, 11번가/ESM 45-62자 | 웹에 규칙 추가 |

### 3단계 문제점

| # | 문제 | 위치 | 설명 |
|---|------|------|------|
| 7 | **프롬프트 이중 관리** | C# 코드 내 vs WEBOCRV2 L1582 | 키워드 생성 프롬프트가 C#과 Python 양쪽에 별도 존재. 규칙 변경 시 양쪽 수동 동기화 필요 |
| 8 | **결과 스키마 불일치** | C# 엑셀 컬럼 vs WEBOCRV2 JSON | C# `홈런_스마트스토어태그` 엑셀 컬럼 ↔ 웹 `A:네이버.tags[]` JSON. 상호 직접 사용 불가 |
| 9 | **Codex CLI 의존** | WEBOCRV2 L2411 | `codex.cmd`가 PATH에 없으면 실패. 에러 메시지가 `"codex failed with exit code"`로만 나옴 |

---

## 4단계: 마켓 업로드

### 4-1. API 마켓 업로드 (네이버/쿠팡/롯데ON)

| 항목 | C# 데스크톱 | WEBOCRV2 | 차이/문제 |
|------|-----------|----------|----------|
| **네이버 업로드** | `NaverUploadService.UploadAsync()` — 직접 API 호출 | subprocess `dotnet run --direct-market-upload --naver` L3041-3048 | **웹은 C#을 subprocess로 호출** |
| **쿠팡 업로드** | `CoupangUploadService.UploadAsync()` — 직접 API 호출 | subprocess `dotnet run --direct-market-upload --coupang` | 동일 패턴 |
| **롯데ON 업로드** | `LotteOnUploadService.UploadAsync()` — 직접 API 호출 | subprocess `dotnet run --direct-market-upload --lotteon --force` L3050-3051 | 웹은 항상 `--force` 포함 |
| **입력 데이터** | 엑셀 워크북 직접 읽기 | `write_direct_upload_workbook()` L2814 → 임시 .xlsx 생성 → C#에 전달 | **웹이 임시 엑셀 생성 후 전달** |
| **API 키 로드** | `DesktopKeyStore.GetPath()` → `~/Desktop/key/` | `market_key_overlay()` L2946 → Desktop/key/ 덮어쓰기 후 복원 | **키 파일 임시 교체 방식** |
| **결과 수신** | `NaverUploadResult` record 직접 반환 | stdout 정규식 파싱 `parse_direct_upload_result()` L2998 | **정규식 파싱 의존** |
| **DryRun 지원** | 옵션으로 전달 | `--dry-run` CLI flag L3052 | **일치** |
| **카테고리 코드** | C# 서비스 내부에서 API 조회 | `infer_direct_upload_categories()` L2750 — 키워드 패턴 매칭 | **웹은 하드코딩 카테고리**, C#은 동적 API 조회 |
| **Cafe24 키 처리** | 직접 로드 | `market_key_overlay`에서 `cafe24_token_rkghrud1.json` 고정 복사 L2984 | **웹은 A계정 토큰 파일명 하드코딩** |
| **롯데ON 기본값** | `TrGrpCd="SR"`, `TrNo="LO10064395"` 등 L42-48 | C# 쪽 값 그대로 사용 (subprocess) | **일치** (C# 코드 그대로 실행) |
| **업로드 이력 확인** | `UploadHistoryStore.cs` 이중 업로드 방지 | `find_active_market_upload_job()` L3190 — 2시간 이내 중복 방지 | 방식 다름: C#은 GS별, 웹은 Job 단위 |

### 4-2. 엑셀 마켓 (11번가/ESM)

| 항목 | C# 데스크톱 | WEBOCRV2 | 차이/문제 |
|------|-----------|----------|----------|
| **11번가 엑셀** | `MarketExcelExportService.Export()` — 템플릿 기반 생성, 이미지 ZIP | `write_market_export()` L3203 — 기본 헤더만 | **웹은 최소 구현만** |
| **ESM 엑셀** | `MarketExcelExportService.Export()` — `NEW 일반상품` 시트, 노출코드 | 미구현 | **웹에 없음** |
| **이미지 ZIP** | 생성 + 600px 검증 | 미구현 | **웹에 없음** |
| **카테고리 코드** | 엑셀에 기록 (naver, auction, gmarket) | 없음 | **웹에 없음** |
| **재고수량** | 99999 기본값 | 없음 | **웹에 없음** |

### 4-3. Cafe24

| 항목 | C# 데스크톱 | WEBOCRV2 | 차이/문제 |
|------|-----------|----------|----------|
| **상품 생성** | `Cafe24CreateProductService.cs` — A/B마켓별 | 없음 | **웹에 완전 누락** |
| **옵션 매핑** | variants 생성 | 없음 | **웹에 완전 누락** |
| **URL 수집** | 생성 후 URL 자동 수집 | 없음 | **웹에 완전 누락** |
| **토큰 갱신** | `Cafe24TokenRefreshSupport.cs` | `refresh_cafe24_access_token()` L398 — 키 테스트용만 | 웹은 테스트 전용, 업로드용 아님 |

### 4단계 문제점

| # | 문제 | 위치 | 심각도 | 설명 |
|---|------|------|--------|------|
| 10 | **정규식 결과 파싱 깨짐 위험** | L2998-3034 | **높음** | C# stdout 형식: `[네이버] row=1 status=OK id=12345 error=`. 이 형식이 바뀌면 웹 결과 인식 완전 실패 |
| 11 | **카테고리 하드코딩** | L2750-2811 | **중간** | 웹은 `깔창→50000667`, `카라비너→50002646` 등 6가지만 패턴 매칭. 새 상품군 추가 시 코드 수정 필요. C#은 API 동적 조회 |
| 12 | **Cafe24 토큰 파일명 하드코딩** | L2984 | **중간** | `cafe24_token_rkghrud1.json` 고정. B계정 Cafe24 토큰은 `cafe24_token_heypoppy10.json`인데 처리 안됨 |
| 13 | **키 파일 교체 경쟁 조건** | L2946-2995 | **중간** | `MARKET_KEY_OVERLAY_LOCK`으로 보호하지만, 동시에 데스크톱 앱도 같은 키 파일 읽을 경우 충돌 가능 |
| 14 | **롯데ON 항상 --force** | L3050-3051 | **낮음** | 웹은 항상 `--force` 전달. C#은 옵션. 이미 올린 상품도 강제 재업로드됨 |
| 15 | **Cafe24 완전 누락** | 전체 | **높음** | 웹에서 Cafe24 상품 생성 불가 → 네이버/쿠팡 업로드 시 Cafe24 URL 기반 이미지 참조 불가능할 수 있음 |
| 16 | **11번가/ESM 엑셀 미구현** | L3203 | **중간** | `write_market_export()`는 기본 정보만. 템플릿, 이미지ZIP, 카테고리코드, 재고 등 핵심 누락 |
| 17 | **subprocess timeout 없음** | L3056-3090 | **중간** | `dotnet run` 프로세스에 timeout이 없어서 API 응답 무한 대기 가능 |

---

## 데이터 흐름 상세 비교

### 업로드 엔트리 생성 (웹 전용 로직)

웹은 시드 데이터를 받아 업로드용 임시 엑셀을 생성하는 추가 단계가 있음:

```
[웹 전용] 시드 JSON → normalize_upload_entries() → write_direct_upload_workbook()
          → 임시 api_upload_{id}.xlsx → dotnet run --direct-market-upload
```

| 엑셀 컬럼 | 값 출처 | C#과의 차이 |
|----------|--------|-----------|
| `상품코드` / `자체 상품코드` | entry.gs | **일치** |
| `상품명` / `공급사 상품명` | `clean_product_title(entry.title)` | 웹이 마케팅어 제거 후 전달 |
| `홈런_네이버상품명` | 해당 마켓일 때만 기록 L2874 | C#은 모든 마켓명 컬럼에 값 존재 |
| `이미지등록(목록)` | `direct_upload_image_ref()` → 로컬 경로 or URL | **로컬 경로 전달 가능** |
| `이미지등록(상세)` | `public_image_url()` → URL만 | **로컬 파일은 무시됨** |
| `상품 상세설명` | 이미지 URL → `<img>` 태그 조합 L2849-2853 | 웹 자체 조합 |
| `브랜드` | `"샤플라이"` 하드코딩 L2905 | C#은 엑셀 원본 값 사용 |
| `판매가` | `parse_upload_price()` → 정수 | C#은 원본 그대로 |
| `옵션입력` | `option_summary_to_input()` L2606 | 옵션 요약을 파싱해서 재구성 |

### 결과 파싱 비교

C# stdout 형식과 Python 정규식 매칭:

| 마켓 | C# 출력 형식 (App.Tests/Program.cs) | Python 파싱 패턴 (L3007-3013) | 일치 여부 |
|------|-----------------------------------|----------------------------|----------|
| 네이버 | `[네이버] row={Row} status={Status} id={ProductId} error={Error}` L75 | `r"\[네이버\]\s+row=\d+\s+status=(\S+)\s+id=(.*?)\s+error=(.*)"` | **일치** |
| 쿠팡 | `[쿠팡] row={Row} status={Status} id={SellerProductId} category={Category} error={Error}` L103 | `r"\[쿠팡\]\s+row=\d+\s+status=(\S+)\s+id=(.*?)\s+category=.*?\s+error=(.*)"` | **일치** |
| 롯데ON | `[롯데ON] row={Row} status={Status} spdNo={SpdNo} error={Error}` L90 | `r"\[롯데ON\]\s+row=\d+\s+status=(\S+)\s+spdNo=(.*?)\s+error=(.*)"` | **일치** |

> 현재는 일치하지만 C# 출력 형식에 JSON 구조가 아니라 텍스트 형식이므로, C# 코드 변경 시 연쇄 파싱 실패 위험

---

## 설정값 동기화 현황

| 설정 | C# 기본값 | WEBOCRV2 기본값 | 일치 | 위치 |
|------|----------|---------------|------|------|
| 리스팅 이미지 크기 | 1000 | 1000 | **O** | pipeline_contracts.js L56 |
| 패딩 | 20 | 20 | **O** | pipeline_contracts.js L57 |
| 로고 비율 | 14% | 14 | **O** | app.jsx L17 |
| 로고 불투명도 | 65% | 65 | **O** | app.jsx L18 |
| JPEG 품질 | 88-92 | 88-92 | **O** | app.jsx L15-16 |
| A상품명 길이 | 80-100자 | 80-100 | **O** | pipeline_contracts.js L77-78 |
| B상품명 길이 | 63-98자 | 63-98 | **O** | pipeline_contracts.js L79-80 |
| A태그 수 | 20 | 20 | **O** | pipeline_contracts.js L81 |
| B태그 수 | 14 | 14 | **O** | pipeline_contracts.js L82 |
| KeywordVersion | 3.0 | 3.0 | **O** | pipeline_contracts.js L83 |
| 브랜드명 | 엑셀 원본 | `"샤플라이"` 하드코딩 | **X** | local_api_server.py L2905 |
| 롯데ON --force | 옵션 | 항상 true | **X** | local_api_server.py L3051 |
| Cafe24 토큰 파일명 | 동적 | `cafe24_token_rkghrud1.json` 고정 | **X** | local_api_server.py L2984 |
| AI 모델 | 동적 | `claude-sonnet-4-6` 고정 | **X** | local_api_server.py L2138 |

---

## 핵심 문제 요약 (우선순위순)

| 순위 | 문제 | 영향 | 수정 방안 |
|------|------|------|----------|
| **1** | Cafe24 상품 생성 완전 누락 | Cafe24 URL 없이는 11번가/ESM 이미지 참조 불가 | C# subprocess 호출 추가 또는 Python 직접 구현 |
| **2** | 업로드 결과 stdout 정규식 의존 | C# 출력 변경 시 결과 인식 전면 실패 | C#에서 JSON 구조 출력으로 변경 |
| **3** | Cafe24 토큰 파일명 하드코딩 | B계정 업로드 시 A계정 토큰 사용됨 | 계정별 동적 파일명 매핑 |
| **4** | 카테고리 코드 6가지만 하드코딩 | 새 상품군 업로드 시 카테고리 없음 → 실패 | C# 카테고리 API 호출 연동 |
| **5** | 11번가/ESM 엑셀 최소 구현 | 템플릿/이미지ZIP/카테고리 누락 | C# MarketExcelExportService subprocess 연동 |
| **6** | GS suffix 1자 제한 | 2자리 suffix 상품 인식 불가 | 정규식 `[A-Z]?` → `[A-Z0-9]*` 변경 |
| **7** | 프롬프트 이중 관리 | 규칙 변경 시 C#/Python 양쪽 수동 동기화 필요 | 공통 프롬프트 파일 분리 |
| **8** | subprocess timeout 없음 | API 무응답 시 영구 대기 | timeout 파라미터 추가 |
