# WEBOCRV2 실제 파이프라인 매칭표

이 문서는 화면 버튼을 기존 KeywordOCR 코드와 어떻게 연결할지 고정한 기준이다.

## 버튼별 매칭

| 화면 | 버튼/동작 | 액션 ID | 기존 코드 매칭 | 저장/출력 |
|---|---|---|---|---|
| 원본 기본화면 | 1차 시드 파일 생성 | `sourceToSeed` | `PythonPipelineBridgeService.RunPipelineAsync` → `run_pipeline_bridge.py` → `pipeline.py::run_pipeline` | `.webseed.json`, 썸네일, OCR, 사진분석, 키워드 후보 풀 |
| 키워드 옵션 | 다음: 생성 시작 | `keywordSeed` | `RefreshV4ImageCliCodexCommands`, `RunCodexCommandsParallelAsync`, `keyword_builder.py`, `market_keywords.py` | 상품명, 검색어설정, 마켓별 변형, 이미지 선택 |
| 2차 수정 시드 | Cafe24 자동 업로드 | `cafe24Create` | `Cafe24CreateProductService.CreateAsync`, `CreateBMarketAsync` | Cafe24 상품번호, Cafe24 URL |
| 마켓 업로드 | 선택 업로드 | `apiMarketUpload` | `NaverUploadService.UploadAsync`, `CoupangUploadService.UploadAsync`, `LotteOnUploadService.UploadAsync` | 상품별 성공/실패, 마켓 상품번호 |
| 마켓 업로드 | 엑셀 데이터 다운로드 | `excelMarketExport` | `MarketExcelExportService.Export` | 11번가 Excel/ZIP, ESM Excel, 검수리포트 |

## 이미지/로고 옵션 매칭

WEBOCRV2 옵션은 기존 `ListingImageSettings` 필드명으로 변환한다.

| WEBOCRV2 옵션 | 기존 필드 | 기준값 |
|---|---|---|
| 이미지 크기 | `ListingSize` | `1000` 고정 |
| A계정 기본 로고 | `LogoPath` | 경로 입력 또는 드래그 파일명 |
| B계정 기본 로고 | `LogoPathB` | 경로 입력 또는 드래그 파일명 |
| 로고 비율 | `LogoRatio` | 기본 `14` |
| 로고 투명도 | `LogoOpacity` | 기본 `65` |
| 로고 위치 | `LogoPosition` | 기본 `tr` |
| 자동대비 | `UseAutoContrast` | 기본 `true` |
| 샤프닝 | `UseSharpen` | 기본 `true` |
| 미세회전 | `UseSmallRotate` | 기본 `true` |
| 좌우반전 | `FlipLeftRight` | UI 체크값 |
| JPEG 품질 | `JpegQualityMin`, `JpegQualityMax` | `88`, `92` |
| 상세태그 A/B | `ImgTag`, `ImgTagB` | UI 입력값 |

## 브라우저 저장 위치

실행 버튼을 누르면 마지막 payload가 아래에 저장된다.

```text
localStorage.webocr.pipeline.sourceToSeed
localStorage.webocr.pipeline.keywordSeed
localStorage.webocr.pipeline.marketUpload
window.WEBOCR_LAST_PIPELINE_PAYLOAD
```

서버 API를 붙일 때는 이 payload를 그대로 POST 본문으로 넘기면 된다.

## 현재 매칭 리스크

아래 항목은 V3/V4 기존 동작과 WEBOCRV2 연결 상태를 대조한 기준이다.

| 번호 | 발견 내용 | 현재 처리 |
|---|---|---|
| 1 | Cafe24 상품 생성 흐름이 웹에 완전히 붙지 않아 11번가/ESM용 Cafe24 이미지 URL 체인이 끊길 수 있음 | 별도 구현 필요 |
| 2 | 업로드 결과가 stdout 정규식 파싱에 의존함 | 임시 유지. C# 결과 JSON 출력으로 교체 필요 |
| 3 | Cafe24 토큰 파일명이 A계정 기준으로 고정될 수 있음 | 웹 키 오버레이에서 계정별 Cafe24 토큰 파일을 같이 반영 |
| 4 | 웹의 카테고리 코드는 일부 패턴 하드코딩임 | C#의 API/카테고리맵 조회 흐름 연결 필요 |
| 5 | 11번가/ESM 엑셀은 실템플릿/이미지 ZIP/Cafe24 URL 매핑이 핵심임 | 웹 export가 `MarketExcelExportService` 공식 템플릿 경로를 호출하도록 연결됨. Cafe24 URL이 없으면 11번가는 ZIP fallback, ESM은 Cafe24 URL 확보가 여전히 중요 |
| 6 | GS코드 suffix 처리 범위 차이 | WEBOCRV2 파서는 `GS + 7자리 + 다중 영문/숫자 suffix` 기준으로 보정 |
| 7 | 키워드 프롬프트가 C#/Python/웹에 이중 관리됨 | 단일 프롬프트 파일로 통합 필요 |
| 8 | subprocess 무응답 시 영구 대기 가능 | 마켓 API 업로드 subprocess에 15분 timeout 적용 |

## 전처리 고정 기준

- 가격: 원본 `공급가`가 있으면 V3 기준 배율을 적용해 `판매가`, `소비자가`를 만든다. 공급가 20,000 이상은 1.6배, 10,000 이상은 1.8배, 그 외는 2.0배다.
- 옵션: `GS\d{7}` base 단위로 묶고 대표행은 A suffix를 우선한다. 옵션명은 상품명에서 base 상품명을 제거한 나머지로 만들고, `옵션{A 값|B 값}` 형식과 `옵션추가금`을 같이 유지한다.
- 대표/추가 이미지: `이미지등록(상세)`는 V3처럼 대표이미지 순차 다운로드 원천으로도 사용한다. 상세페이지 원본과 혼동하지 않는다.
- 상세페이지: 진짜 상세페이지 HTML은 `상품 상세설명`, `상세설명`, `상품상세설명`, `모바일 상품 상세설명`에서만 가져온다.
- 업로드 엑셀: `이미지등록(목록)`, `이미지등록(추가)`, `이미지등록(상세)`, `상품 상세설명`, `판매가`, `소비자가`, `옵션입력`, `옵션추가금`은 기계적으로 비면 안 된다.
