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
