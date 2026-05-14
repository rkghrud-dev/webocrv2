# 네이버 상품정보제공고시 OCR 매칭

작성일: 2026-05-14

## 결론

WEBOCRV2의 초반 OCR 결과는 네이버 스마트스토어 `productInfoProvidedNotice`를 일부 자동 채우는 데 사용할 수 있다.

전체 고시 항목을 100% 자동 입력하는 방식은 위험하다. 대신 OCR에서 라벨이 명확한 값만 구조화해서 `products[].naverProvidedNotice`에 저장하고, 네이버 업로드 시 `originProduct.detailAttribute.productInfoProvidedNotice`로 넘긴다.

현재 자동 매칭 대상은 아래 값이다.

- 소재/재질
- 수량
- 색상
- 사이즈
- 수입사/수입원
- 제조사/제조자/제조원
- 제조국/원산지
- A/S 또는 고객센터 연락처
- 상품명/GS코드 기반 품명, 모델명

## 현재 구현 위치

| 역할 | 파일/함수 | 내용 |
|---|---|---|
| OCR 결과 읽기 | `scripts/local_api_server.py::read_pipeline_ocr_summary` | OCR 워크북의 `OCR결과` 시트를 읽어 `ocrAnalysis.rawText/fields` 생성 |
| 고시정보 파싱 | `scripts/local_api_server.py::build_naver_provided_notice` | OCR 원문에서 라벨 기반으로 고시 후보 생성 |
| 시드 생성 | `scripts/local_api_server.py::build_seed_products` | 상품별 `naverProvidedNotice` 저장 |
| 기존 시드 보강 | `scripts/local_api_server.py::hydrate_seed_payload` | 예전 시드에도 OCR이 있으면 `naverProvidedNotice` 즉석 생성 |
| 화면 표시 | `components.jsx::SeedPreviewModal` | 미리보기 모달의 `상품고시` 탭 표시 |
| 업로드 대기열 | `components.jsx::storeUploadPayload` | `naverProvidedNotice`를 업로드 payload에 포함 |
| 서버 업로드 입력 | `scripts/local_api_server.py::normalize_upload_entries` | 업로드 요청에서 `naverProvidedNotice` 수신 |

## 데이터 흐름

```text
원본 엑셀/CSV
  -> 1차 시드 생성
  -> OCR 결과 읽기
  -> products[].ocrAnalysis.rawText/fields 저장
  -> build_naver_provided_notice()
  -> products[].naverProvidedNotice 저장
  -> 상품고시 탭에서 검수
  -> 업로드 대기열 payload에 포함
  -> 네이버 업로드 어댑터에서 productInfoProvidedNotice로 변환
```

## 예시 OCR 원문

```text
GS0101349
쿠션깔창
소프트 쿠션 깔창
소재 PU 에어메쉬
수량
1켤레(2PCS)
색상 앞면 블랙 뒷면 화이트
사이즈 A230/ B 240 / C 250 / D 260 / E 270
-위 5종 사이즈 중 선택
수입사 굿셀러스 제조국 중국
SIZE
A230-85mmX230mm
B240 - 90mmX244mm
C 250-90mmX254mm
D260-93mmX263mm
E270-94mmX278mm
홈런마켓
급배송
```

## 샘플 파싱 결과

위 OCR 원문은 현재 아래처럼 매칭된다.

```json
{
  "status": "partial",
  "source": "ocr_label_match",
  "productInfoProvidedNoticeType": "SHOES",
  "objectKey": "shoes",
  "matchedFields": {
    "material": "PU 에어메쉬",
    "quantity": "1켤레(2PCS)",
    "color": "앞면 블랙 뒷면 화이트",
    "size": "230 / 240 / 250 / 260 / 270",
    "sizeDetail": "A230-85mmX230mm / B240 - 90mmX244mm / C 250-90mmX254mm / D260-93mmX263mm / E270-94mmX278mm",
    "importer": "굿셀러스",
    "origin": "중국"
  }
}
```

옵션형 상품은 OCR의 상세 치수보다 원본 옵션값을 우선한다.

예를 들어 `A230-85mmX230mm` 같은 치수는 `sizeDetail` 보조값으로 보관하고, 네이버 고시의 대표 `size`에는 옵션값 `230 / 240 / 250 / 260 / 270`을 넣는다.

## 시드 저장 스키마

상품 시드에는 아래 필드가 추가된다.

```json
{
  "products": [
    {
      "gs": "GS0101349A",
      "sourceName": "쿠션깔창",
      "ocrAnalysis": {
        "status": "loaded",
        "rawText": "...",
        "fields": {}
      },
      "naverProvidedNotice": {
        "status": "partial",
        "source": "ocr_label_match",
        "productInfoProvidedNoticeType": "SHOES",
        "objectKey": "shoes",
        "productInfoProvidedNotice": {
          "productInfoProvidedNoticeType": "SHOES",
          "shoes": {
            "returnCostReason": "0",
            "noRefundReason": "0",
            "qualityAssuranceStandard": "0",
            "compensationProcedure": "0",
            "troubleShootingContents": "0",
            "warrantyPolicy": "0",
            "afterServiceDirector": "0",
            "caution": "0",
            "material": "PU 에어메쉬",
            "color": "앞면 블랙 뒷면 화이트",
            "size": "230 / 240 / 250 / 260 / 270",
            "height": "해당사항 없음",
            "manufacturer": "굿셀러스"
          }
        },
        "extractedFields": {
          "itemName": "쿠션 깔창",
          "modelName": "GS0101349A",
          "material": "PU 에어메쉬",
          "quantity": "1켤레(2PCS)",
          "color": "앞면 블랙 뒷면 화이트",
          "size": "230 / 240 / 250 / 260 / 270",
          "importer": "굿셀러스",
          "origin": "중국"
        },
        "matchedFields": {
          "material": "PU 에어메쉬",
          "quantity": "1켤레(2PCS)",
          "color": "앞면 블랙 뒷면 화이트",
          "size": "230 / 240 / 250 / 260 / 270",
          "importer": "굿셀러스",
          "origin": "중국"
        },
        "needsReview": [
          "수입사를 제조자/수입자로 임시 사용했습니다.",
          "A/S 전화번호는 OCR에서 명확히 확인되지 않았습니다.",
          "카테고리 API 연동 전까지 OCR 문구로 고시 상품군을 추정했습니다."
        ]
      }
    }
  ]
}
```

## 네이버 업로드 매핑

실제 네이버 상품 등록 payload에서는 아래 위치로 들어간다.

```json
{
  "originProduct": {
    "detailAttribute": {
      "productInfoProvidedNotice": {
        "productInfoProvidedNoticeType": "SHOES",
        "shoes": {
          "material": "PU 에어메쉬",
          "color": "앞면 블랙 뒷면 화이트",
          "size": "230 / 240 / 250 / 260 / 270",
          "height": "해당사항 없음",
          "manufacturer": "굿셀러스"
        }
      }
    }
  }
}
```

현재 WEBOCRV2는 실제 네이버 업로드 어댑터가 아직 연결 전이다. 그래서 지금 상태는 `시드 -> 화면 검수 -> 업로드 대기열 payload`까지 연결된 상태다.

다음에 `NaverUploadService`를 붙일 때는 업로드 entry의 `naverProvidedNotice.productInfoProvidedNotice`를 그대로 `originProduct.detailAttribute.productInfoProvidedNotice`에 넣으면 된다.

## 자동 추정 기준

현재 상품군 추정은 OCR/상품명 텍스트 기반이다.

| 조건 | 고시 상품군 | 객체 키 |
|---|---|---|
| 깔창, 인솔, 신발, 운동화, 구두, 슬리퍼, 부츠 | `SHOES` | `shoes` |
| 가방, 백팩, 파우치, 숄더백, 토트백 | `BAG` | `bag` |
| 의류, 티셔츠, 셔츠, 바지, 자켓, 점퍼, 원피스, 스커트 | `WEAR` | `wear` |
| 그 외 | `ETC` | `etc` |

이 추정은 카테고리 API 연동 전의 임시 판단이다.

정확도를 올리려면 네이버 카테고리 ID가 잡힌 뒤 `GET /v1/products-for-provided-notice?categoryId={대카테고리ID}`로 추천 고시 상품군을 가져와야 한다.

## 검수 기준

자동 매칭값은 아래 경우 `partial`로 표시하고 검수를 요구한다.

- 수입사는 있으나 제조사가 없어서 수입사를 제조자/수입자로 임시 사용한 경우
- A/S 전화번호가 명확히 OCR에 없는 경우
- 카테고리 API 없이 상품군을 OCR/상품명으로 추정한 경우
- 상세 치수와 옵션 사이즈가 같이 있어 옵션값을 우선한 경우

OCR에서 아래 문구는 고시값으로 쓰지 않는다.

- 배송, 급배송, 무료배송, 당일 발송
- 판매자명, 마켓명, 창고 안내
- 구매대행 아님, 묶음배송, 방문수령
- 문의 전화번호가 A/S 번호로 명시되지 않은 경우
- 캘리퍼스 눈금, 이미지 배경 숫자, `IN/MM`, `ON`, `OFF`, `ZERO`

## 다음 단계

1. 네이버 카테고리 매칭 결과를 시드에 저장한다.
2. 카테고리의 대카테고리 ID로 네이버 상품정보제공고시 추천 상품군을 조회한다.
3. 현재 OCR 추정 상품군과 네이버 추천 상품군이 다르면 화면에서 경고한다.
4. `NaverUploadService`에서 `naverProvidedNotice.productInfoProvidedNotice`를 실제 등록 payload에 넣는다.
5. 업로드 실패 응답의 `invalidInputs`를 저장해 어떤 고시 필드가 틀렸는지 상품별로 보여준다.
