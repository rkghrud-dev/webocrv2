# KeywordOCR V4 파이프라인 순서도 + 코드 매칭

이 문서는 새 웹앱 화면을 설계할 때 기존 KeywordOCR V4 기능을 어디에 매칭할지 확인하기 위한 기준 문서다.

> 주의: 현재 코드에는 `V4` 명칭과 `V5` 명칭이 섞여 있다. 기존 작업명은 V4지만, 일부 메서드 로그/폴더는 `V5`, `llm_result_v5_cli`를 사용한다. 새 웹앱에서는 내부 명칭을 하나로 정리해야 한다.

---

## 0. 전체 순서도

```text
[01 원본 CSV/Excel]
   ↓
[02 상품 목록 로드 / 선택 상품 필터]
   ↓
[03 작업 세션 저장 / 상품 DB 저장]
   ↓
[04 Phase 1: 이미지 다운로드 + 대표이미지 가공]
   ↓
[05 이미지 선택 / Codex 배치 스크립트 생성]
   ↓
[06 Codex CLI 실행: 상품명 + 키워드 + 카테고리 매칭]
   ↓
[07 배치 결과 병합 / 최종 V4 결과 자동 로드]
   ↓
[08 결과 검수 / 키워드 편집 / 작업 패키지 자동저장]
   ↓
[09 Cafe24 / 네이버 / 롯데ON / 쿠팡 / 11번가 / ESM 업로드]
   ↓
[10 업로드 이력 저장 / 총 데이터 대조로 확정]
```

---

## 1. 새 웹앱 페이지 기준

```text
원본 소스
  └─ CSV/Excel 등록, 상품 목록, 상품 선택

V4 작업 실행
  └─ 이미지 다운로드, 대표이미지 생성, Codex 배치 생성/실행

결과 검수
  └─ 최종 엑셀 로드, 상품명/키워드/카테고리 확인, 이미지 선택

마켓 매트릭스
  └─ GS코드 × 계정 × 마켓 상태 확인

업로드/대조
  └─ API/Excel 업로드, 업로드 이력, 총 데이터 대조
```

---

## 2. 단계별 코드 매칭표

| 단계 | 기존 V4 동작 | 현재 코드 매칭 | 새 웹앱에서 매칭할 페이지/기능 | 생성/저장 데이터 |
|---|---|---|---|---|
| 01 | CSV/Excel 선택 | `KeywordOcr.App/MainWindow.xaml.cs:1340` `SelectFile_Click` | `원본 소스 > 파일 등록` | 원본 파일 경로 |
| 02 | 파일 로드 | `MainWindow.xaml.cs:1351` `LoadFile` | `원본 소스 > 현재 파일` | `_sourcePath` |
| 03 | 상품 목록 로드 | `MainWindow.xaml.cs:1361` `LoadProductList` | `원본 소스 > 상품 목록` | `_products` |
| 04 | 선택 상품만 필터링 | `MainWindow.xaml.cs:1717` `CreateFilteredFile` | `원본 소스 > 선택 상품 실행` | `*_filtered.csv/xlsx` |
| 05 | 작업 세션 생성 | `MainWindow.xaml.cs:2301` `CreateWorkSession` | `V4 작업 실행 > 작업 생성` | `work_sessions` |
| 06 | 상품 DB 저장 | `MainWindow.xaml.cs:2305` `UpsertProduct` | `원본 소스 > 상품 원장` | `products` |
| 07 | Python 파이프라인 호출 | `PythonPipelineBridgeService.cs:25` `RunPipelineAsync` | `V4 작업 실행 > 서버 작업 시작` | subprocess job |
| 08 | phase 전달 | `PythonPipelineBridgeService.cs:85` `--phase` | `V4 작업 실행 > 실행 모드` | `images/full/analysis/ocr_only` |
| 09 | Python CLI 인자 파싱 | `Bridge/run_pipeline_bridge.py:83` `--phase` | 서버 라우터/작업자 | `PipelineConfig` |
| 10 | PipelineConfig 생성 | `Bridge/run_pipeline_bridge.py:98` | 서버 작업자 설정 | 모델, 이미지 설정, B마켓 설정 |
| 11 | 메인 파이프라인 시작 | `backend/app/services/pipeline.py:1154` `run_pipeline` | 백엔드 작업자 | `EXPORT` 작업 폴더 |
| 12 | 이미지 모드면 키워드 스킵 | `pipeline.py:3661` `phase == "images"` | `V4 작업 실행 > Phase 1` | 이미지 준비만 수행 |
| 13 | 대표이미지 생성 | `pipeline.py:5191` 이후 `process_listing_images_global` | `결과 검수 > 이미지` | `listing_images/`, `listing_images_B/` |
| 14 | phase images 반환 | `pipeline.py:5301` | `V4 작업 실행 > 이미지 준비 완료` | `output_root` |
| 15 | 이미지 탭 로드 | `MainWindow.xaml.cs:2341`, `3062` `LoadListingImagesFromRoot` | `결과 검수 > 이미지 선택` | 이미지 목록 |
| 16 | 이미지 선택 저장 | `MainWindow.xaml.cs:7501` `SaveImageSelectionsToFile` | `결과 검수 > 대표/추가 이미지 저장` | `image_selections.json` |
| 17 | Codex 준비 | `MainWindow.xaml.cs:3045` `OnTestV4ImageCliReady` | `V4 작업 실행 > 배치 준비` | 업로드용 엑셀 연결 |
| 18 | Codex 명령 생성 | `MainWindow.xaml.cs:3081` `RefreshV4ImageCliCodexCommands` | `V4 작업 실행 > 배치 목록` | `_codexCommands` |
| 19 | 스킬 MD 생성 | `MainWindow.xaml.cs:2809` `WriteV4ImageCliSkillMd` | 서버 작업자 프롬프트 템플릿 | `keyword_skill_v4_image_cli.md` |
| 20 | 상품 배치 구성 | `MainWindow.xaml.cs:3149` `CollectV4ImageCliGroups` | `V4 작업 실행 > 배치 분할` | batch 목록 |
| 21 | Codex 순차 실행 | `MainWindow.xaml.cs:3630` `RunCodexCommandsAsync` | `V4 작업 실행 > 순차 실행` | 배치별 결과 엑셀 |
| 22 | Codex 병렬 실행 | `MainWindow.xaml.cs:3815`, `3835` `RunAllParallel_Click`, `RunCodexCommandsParallelAsync` | `V4 작업 실행 > 병렬 실행` | 배치별 결과 엑셀 |
| 23 | PowerShell 실행 | `MainWindow.xaml.cs:4000` `RunPowerShellCommandAsync` | 백엔드 작업자 실행기 | `v4_codex_cli/*.ps1` |
| 24 | 결과 병합 | `MainWindow.xaml.cs:4086` `TryMergeV4ImageCliBatchResults` | `결과 검수 > 결과 병합` | 최종 `*_llm_*_cli.xlsx` |
| 25 | 카테고리 병합 | `MainWindow.xaml.cs:4156` `MergeBatchCategoryMatchFiles` | `결과 검수 > 카테고리 매칭` | `category_match_*.xlsx` |
| 26 | 최종 결과 자동 로드 | `MainWindow.xaml.cs:4351` `TryAutoLoadLatestV4Result` | `결과 검수 > 최신 결과 선택` | `_testLlmResultFile` |
| 27 | 엑셀 보정 | `MainWindow.xaml.cs:4503` `NormalizeUploadWorkbookBeforeUse` | `결과 검수 > 업로드 전 보정` | 판매가/상품가 보정 |
| 28 | 작업 편집기 로드 | `MainWindow.xaml.cs:1133` `TryLoadWorkspaceEditor` | `결과 검수 > 키워드 편집` | 편집 가능한 워크북 |
| 29 | 작업 패키지 자동저장 | `MainWindow.xaml.cs:973` `AutoSaveWorkspacePackage` | `작업 보관 > 자동저장` | ZIP 작업 패키지 |
| 30 | Cafe24 이미지/가격 업로드 | `MainWindow.xaml.cs:5030` `Cafe24Upload_Click` | `업로드/대조 > Cafe24 수정 업로드` | 업로드 로그 |
| 31 | Cafe24 신규등록 | `MainWindow.xaml.cs:5174` `Cafe24Create_Click` | `업로드/대조 > Cafe24 신규등록` | 마켓 상품 생성 |
| 32 | 네이버 중복 확인 | `MainWindow.xaml.cs:7136` `CheckNaverDuplicatesAsync` | `업로드/대조 > 중복 체크` | 중복 상품 목록 |
| 33 | 네이버 직접등록 | `MainWindow.xaml.cs:4722`, `4814` `NaverUploadService` | `업로드/대조 > 네이버` | 네이버 상품번호 |
| 34 | 롯데ON 직접등록 | `MainWindow.xaml.cs:4849` `LotteOnUploadService` | `업로드/대조 > 롯데ON` | 롯데ON 상품번호 |
| 35 | 쿠팡 업로드 | `MainWindow.xaml.cs:4652`, `5444` `CoupangUploadService` | `업로드/대조 > 쿠팡` | 쿠팡 상품번호 |
| 36 | 11번가/ESM 엑셀 생성 | `MainWindow.xaml.cs:6982` `MarketExcelExportService` | `업로드/대조 > Excel 생성` | 11번가 Excel/ZIP, ESM Excel |
| 37 | 업로드 상태 갱신 | `MainWindow.xaml.cs:1168` `RefreshWorkspaceUploadStatuses` | `마켓 매트릭스 > 상태 반영` | 화면 상태 |
| 38 | 업로드 이력 저장 | `ProductDatabase.cs:35`, `UploadHistoryStore.cs:9`, `MarketUploadStateStore.cs:10` | `마켓 매트릭스 > 업로드 이력` | SQLite/JSON 이력 |

---

## 3. 현재 저장소와 새 DB 매칭

| 현재 저장 위치 | 현재 역할 | 새 웹앱 DB 후보 |
|---|---|---|
| `ProductDatabase.cs` `products` | GS코드 상품 원장 | `source_products` |
| `ProductDatabase.cs` `work_sessions` | 실행 단위 기록 | `source_batches` 또는 `jobs` |
| `ProductDatabase.cs` `upload_history` | 업로드 이력 | `upload_attempts` |
| `UploadHistoryStore.cs` | GS코드 기준 간단 업로드 JSON | `upload_attempts`로 통합 |
| `MarketUploadStateStore.cs` | 마켓 업로드 상태 JSON | `listing_status`로 통합 |
| `image_selections.json` | 대표/추가 이미지 선택 | `listing_images` 또는 `image_selections` |
| `job_history.json` | 실행 이력 | `jobs`, `job_events` |
| `llm_result_v4_cli/`, `llm_result_v5_cli/` | 키워드 결과 파일 | `listing_variants` + 파일 보관 |
| `category_match_*.xlsx` | 마켓 카테고리 매칭 | `category_matches` |

---

## 4. 새 웹앱 핵심 키 구조

```text
원본 파일:
source_batch_id

상품 원장:
GS코드 + 약식 상품명

마켓 상태:
GS코드 + account_id + market_code

변형 결과:
GS코드 + account_id + market_code + variant_type

업로드 이력:
GS코드 + account_id + market_code + attempt_no
```

---

## 5. 페이지별로 기능을 추가할 위치

### 원본 소스

- 파일 드래그앤드롭
- CSV/Excel 선택
- 상품 목록
- 상품 선택/제외
- 원본 분석 기록
- 매칭 코드:
  - `SelectFile_Click`
  - `LoadFile`
  - `LoadProductList`
  - `CreateFilteredFile`

### V4 작업 실행

- 실행 모드 선택
- Phase 1 이미지 준비
- Codex 배치 생성
- 순차/병렬 실행
- 중단/이어하기
- 매칭 코드:
  - `TestRunOcrOnly_Click`
  - `PythonPipelineBridgeService.RunPipelineAsync`
  - `run_pipeline_bridge.py`
  - `pipeline.py run_pipeline`
  - `RunCodexCommandsAsync`
  - `RunCodexCommandsParallelAsync`

### 결과 검수

- 최종 결과 엑셀 로드
- 상품명/키워드/카테고리 검수
- 대표이미지/추가이미지 선택
- 수정 저장
- 매칭 코드:
  - `TryAutoLoadLatestV4Result`
  - `NormalizeUploadWorkbookBeforeUse`
  - `TryLoadWorkspaceEditor`
  - `LoadListingImagesFromRoot`
  - `SaveImageSelectionsToFile`

### 마켓 매트릭스

- 상품별 A/B계정 상태판
- Cafe24/네이버/쿠팡/롯데ON/11번가/ESM 상태
- 미등록/대상/준비/업로드완료/실패/누락의심
- 매칭 코드:
  - `RefreshWorkspaceUploadStatuses`
  - `ProductDatabase`
  - `UploadHistoryStore`
  - `MarketUploadStateStore`

### 업로드/대조

- Cafe24 이미지/가격 수정 업로드
- Cafe24 신규등록
- 네이버/롯데ON/쿠팡 직접등록
- 11번가/ESM 엑셀 생성
- 총 데이터 import 대조
- 매칭 코드:
  - `Cafe24Upload_Click`
  - `Cafe24Create_Click`
  - `NaverUploadService`
  - `LotteOnUploadService`
  - `CoupangUploadService`
  - `MarketExcelExportService`

---

## 6. 설계상 체크해야 할 것

```text
[ ] V4/V5 명칭 통일
[ ] llm_result_v4_cli / llm_result_v5_cli 폴더명 통일
[ ] JSON 업로드 이력과 SQLite 업로드 이력 통합
[ ] GS코드 A/B/C/D 접미사 처리 기준 확정
[ ] A계정/B계정과 기존 홈런마켓/준비몰 매칭 확정
[ ] 마켓별 상태값 enum 확정
[ ] 총 데이터 import 시 GS코드 기준 대조 규칙 확정
```

