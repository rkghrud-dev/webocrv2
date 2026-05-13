# WEBOCRV2

AI 마켓 관리자 새 작업 폴더.

기존 `webocrv1/_design_extract`의 디자인 UI kit를 가져와서 여기서부터 실제 화면 설계를 진행한다.

## 실행

```bat
RUN.BAT
```

기본 주소:

```text
http://localhost:5500/index.html
```

파일을 수정한 뒤 브라우저에서 `F5`로 바로 확인한다.

`RUN.BAT`은 단순 정적 서버가 아니라 `scripts/local_api_server.py`를 실행한다.

```text
GET  /api/health
POST /api/import-source
POST /api/import-logo
POST /api/source-to-seed
GET  /api/jobs/{jobId}
```

`1차 시드 파일 생성`은 `/api/source-to-seed`를 통해 기존 `KeywordOcr.App/Bridge/run_pipeline_bridge.py`와 `backend/app/services/pipeline.py`를 백그라운드로 실행한다.
실행 전 서버가 `selectedGs` 기준으로 임시 CSV를 만들고, 선택된 대표상품의 같은 베이스 코드 A/B/C 옵션 행만 기존 파이프라인에 넘긴다.

원본 Excel/CSV를 드래그하면 `/api/import-source`가 파일을 `data/uploads/`에 저장하고, 서버에서 바로 컬럼을 파싱해 화면 표에 실제 데이터를 돌려준다. 원본 표시 기준은 `GS+7자리+A` 대표상품이며, 같은 베이스 코드의 B/C/D 행은 옵션으로 묶는다.

## 현재 포함 파일

- `index.html`: 앱 진입점
- `app.jsx`: 화면 상태와 페이지 흐름
- `components.jsx`: UI 컴포넌트
- `pipeline_contracts.js`: WEBOCRV2 화면 액션과 기존 KeywordOCR C#/Python 파이프라인 매칭
- `kit.css`: 화면 스타일
- `colors_and_type.css`: 디자인 토큰
- `marble_aurora.css`: 마블/오로라 디자인 효과
- `assets/`: 임시 브랜드/빈 상태 자산
- `data/seeds/`: 생성된 시드 파일 저장소
- `data/uploads/`: 브라우저에서 드래그한 원본 파일 임시 저장소
- `data/logos/`: 브라우저에서 드래그한 로고 파일 저장소
- `data/jobs/`: 로컬 서버 작업 상태/로그
- `data/exports/`: 기존 파이프라인 실행 결과 루트
- `docs/KEYWORD_V4_PIPELINE_FLOW.md`: 기존 KeywordOCR V4 파이프라인과 코드 매칭표
- `docs/WEBOCRV2_PIPELINE_MATCHING.md`: 새 화면 버튼별 실제 실행 매칭표

## 작업 원칙

이 폴더는 디자인만 다시 만드는 폴더가 아니다.

화면을 짜면서 기존 KeywordOCR V4 파이프라인을 다시 검토하고, 아래 문제가 보이면 바로 개선 대상으로 잡는다.

```text
코드가 너무 큰 경우
상태 저장 위치가 흩어진 경우
V4/V5 명칭이 섞인 경우
같은 업로드 이력이 JSON/SQLite에 중복 저장되는 경우
화면 단계와 실제 실행 코드가 다르게 움직이는 경우
중단/이어하기가 불안정한 경우
```

새 화면의 각 버튼/페이지는 반드시 기존 코드 매칭표와 연결해서 만든다.

## 1차 기준 페이지

```text
원본 소스
시드 파일 생성
키워드 생성 실행
V4 작업 실행
결과 검수
마켓 매트릭스
업로드/대조
```

## 확정 파이프라인

```text
원본 파일
→ 1차 시드 파일 생성
→ 2차 수정 시드 파일 불러오기
→ 2차 데이터 수정 후 Cafe24 자동 업로드 및 URL 수집
→ 마켓별 키워드/이미지 작업
→ 마켓별 업로드
```

## 시드 파일 정의

`시드 파일`은 Cafe24 업로드 파일이 아니라, 원본 데이터를 분석해서 이후 마켓별 작업의 기준으로 쓰는 기본 데이터셋이다. 현재 생성 스키마는 `webocr.seed.v2`다.

1차 시드에 저장할 내용:

```text
원본 엑셀의 GS코드/상품명/가격/옵션 최소 정리
대표이미지/추가이미지 다운로드
1000x1000 이미지 가공 및 로고/보정 처리
OCR 분석 결과
사진 분석 결과
상품별 키워드 후보 풀
```

시드 JSON의 상품별 기본 구조:

```text
products[].ocrAnalysis.rawText/fields
products[].photoAnalysis.facts
products[].keywordCandidatePool.identity
products[].keywordCandidatePool.function
products[].keywordCandidatePool.usePlace
products[].keywordCandidatePool.problemSolving
products[].keywordCandidatePool.materialSpec
products[].keywordCandidatePool.userSituation
products[].keywordCandidatePool.synonyms
products[].reviewFields.productName/searchTerms
```

키워드 후보 풀 분류:

```text
상품 정체성: 상품명, 표준명, 카테고리성 단어
기능: 고정, 보강, 방지, 연결, 수선 등
사용처: 신발, 콘센트함, 스위치 박스, 가구 등
문제 해결: 미끄럼방지, 누수방지, 흔들림방지 등
재질/식별 규격: EVA, ABS, PA66, M8, 86형 등
사용자/상황: DIY, 수리, 시공 등
동의어/다른 명칭: 항공나사, 고정핀, 밑창테이프 등
```

상품명은 정확하게 만들고, 검색어설정은 표준어 + 현장명 + 별칭을 넓게 섞는다.

사이즈/수량 처리:

```text
수량/구성은 유지 가능
단일 규격 사이즈는 유지 가능
옵션 목록의 사이즈는 키워드에서 제외하고 옵션 컬럼에서 처리
상품 식별 규격은 유지 가능
```

## 현재 화면 기준

- 파일을 드래그하면 바로 `기본화면`으로 이동한다.
- `기본화면`은 서버가 실제 Excel/CSV를 읽어 만든 소스 표 형태다.
- 실제 파싱 컬럼 기준은 `자체 상품코드/GS코드`, `상품명/상품명(관리용)`, `판매가/상품가`, `옵션입력`, `이미지등록(목록)`이다.
- 원본 화면은 `GS0101352A` 같은 A행을 대표상품으로 보여주고, `GS0101352B/C/...`는 같은 상품의 옵션으로 접어 넣는다.
- 모든 주요 페이지 하단에는 공통 실행 로그가 표시된다.
- `상세화면`은 A계정 6마켓 + B계정 6마켓을 한 번에 보는 매트릭스다.
- 상단 중앙의 `기본화면 / 상세화면` 버튼으로 전환한다.
- `기본화면`과 `상세화면`은 같은 GS코드 선택 상태를 공유한다.
- 상품 체크박스는 `전체 선택 / 전체 해제 / Shift 범위 선택`을 지원한다.
- 상단 `초기화` 버튼은 파일, 선택값, 필터, 마켓 선택값을 첫 화면 기준으로 되돌린다.
- 일반 Excel/CSV를 넣으면 `1차 시드 파일 생성` 단계로만 간다.
- 원본 파일 흐름에서는 마켓 선택을 보여주지 않는다.
- 1차 시드 생성은 체크된 상품만 대상으로 하며, 선택된 `GS+7자리+A`의 B/C/D 옵션 행은 함께 포함한다.
- 원본에서 만든 1차 시드는 이미지/OCR/사진분석/키워드 후보 풀까지 저장한다.
- 2차 수정 시드 화면에서는 변경된 가격과 옵션 양식만 우선 보여준다.
- 2차 데이터 수정 후 Cafe24 업로드는 자동으로 처리하고 URL을 수집한다.
- `.webseed.json` 시드 파일을 넣으면 2차 수정 시드 화면으로 들어간다.
- 2차 수정 시드에서 마켓별 작업을 시작하면 A/B 계정 탭에서 마켓별 체크박스를 선택하고 키워드 만들기 단계로 간다.
- 원본 파일 화면과 시드 파일 화면은 배경색과 표 컬럼을 다르게 표시한다.
- 이전 자동등록 버튼 흐름은 `시드 파일 생성`과 `V5 이미지 CLI 키워드 생성`으로 분리한다.
- 키워드 만들기는 즉시 실행하지 않고 `옵션 확인 모달`을 먼저 연다.
- 키워드 옵션은 병렬 실행 수 `50`을 기본 고정값으로 둔다.
- 이미지 가공 기준 크기는 반드시 `1000x1000`으로 둔다.
- 키워드 옵션의 로고 이미지는 A계정/B계정별로 드래그앤드롭 또는 경로 입력을 지원한다.
- 로고 옵션은 기존 `ListingImageSettings`의 `LogoPath`, `LogoPathB`, `LogoRatio`, `LogoOpacity`, `LogoPosition`으로 매칭한다.
- 키워드 옵션에서 `A계정 / B계정 / 전체` 범위를 선택한다.
- A계정 또는 B계정만 선택하면 실행 채널은 해당 계정의 6개 마켓만 나온다.
- 전체 범위에서도 키워드 실행 화면은 `A/B 계정 스위치`로 나누고, 한 번에 6개 마켓만 보여준다.
- 키워드 단계의 `뒤로가기 / 앞으로가기`는 항상 화면 아래쪽에 둔다.
- 키워드 생성 실행 화면은 `채널 탭 / 상품별 진행률 / 이미지 선택 / 접힌 로그` 4영역으로 구성한다.
- 상품명 시드는 상품별로 진행률과 함께 하나씩 채워지는 리스트 형태로 보여준다.
- 키워드 생성 완료 상품은 하단 검수 영역에서 `상품명/키워드`, `검색어설정`, `대표이미지/추가이미지`를 수정한다.
- 대표이미지는 1개만 선택하고, 나머지 선택 이미지는 추가이미지로 본다.
- 생성 전 상품은 기본 1번 이미지를 대표이미지로 고정한다.
- 키워드 단계에서 `앞으로가기`를 누르면 마켓별 업로드 화면으로 이동한다.
- API형 마켓은 상품별 `성공 / 실패 / 대기` 상태를 바로 표시한다.
- Excel형 마켓은 같은 화면에서 `엑셀 데이터 다운로드` 버튼으로 업로드용 데이터를 내려받는다.
- 시드 파일 확장자는 `.webseed.json`을 기준으로 한다.
- 시드 파일 생성 후 저장 기준 폴더는 `data/seeds/`다.
- 썸네일 파일은 `data/thumbs/{GS코드}.jpg` 기준으로 캐시한다.
- 시드 파일에는 원본 이미지 자체가 아니라 대표 썸네일 경로를 저장한다.
- 왼쪽 사이드바의 `시드 파일` 목록에서 날짜별 시드를 바로 불러온다.
- 왼쪽 필터는 `계정 / 마켓`만 남긴다.
- 상태는 매트릭스 셀 안에서 `미등록 / 등록 / 업로드 완료` 3개로만 표시한다.
- 원본 CSV/Excel 외에 `시드 파일(1차 수정본)`도 같은 진입점에서 받는다.
- 설정 버튼에서 A/B계정별 마켓 키 파일을 드래그앤드롭으로 등록한다.
- 11번가와 ESM은 API 키 대신 업로드 엑셀 서식 파일을 등록한다.
- 설정 화면은 추후 마켓 추가를 전제로 하며, `마켓 추가`에서 API 키 방식 또는 Excel 서식 방식을 선택한다.
- 추가된 마켓도 A/B계정별 키 파일 또는 서식 파일을 따로 등록한다.

## 실제 코드 매칭

브라우저에서 주요 실행 버튼을 누르면 마지막 실행 payload를 `localStorage`와 `window.WEBOCR_LAST_PIPELINE_PAYLOAD`에 남긴다.

```text
1차 시드 파일 생성 → webocr.pipeline.sourceToSeed
마켓별 키워드 생성 → webocr.pipeline.keywordSeed
마켓별 업로드 → webocr.pipeline.marketUpload
```

매칭 정의는 `pipeline_contracts.js`에 둔다.

```text
sourceToSeed → PythonPipelineBridgeService.RunPipelineAsync → run_pipeline_bridge.py → pipeline.py
keywordSeed → RefreshV4ImageCliCodexCommands / RunCodexCommandsParallelAsync → keyword_builder.py / market_keywords.py
cafe24Create → Cafe24CreateProductService.CreateAsync / CreateBMarketAsync
apiMarketUpload → NaverUploadService / CoupangUploadService / LotteOnUploadService
excelMarketExport → MarketExcelExportService.Export
```

## 테스트 시드 파일

```text
WEBOCRV2/data/seeds/test_seed_20260512.webseed.json
C:\Users\rkghr\Desktop\WEBOCRV2_test_seed_20260512.webseed.json
```

바탕화면 파일은 브라우저 드래그 테스트용이다.
