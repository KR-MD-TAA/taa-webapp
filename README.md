# KR-MD & TAA Dashboard

https://KR-MD-TAA.github.io/taa-webapp

한국형 거시경제 데이터(KR-MD)를 활용한 거시경제 국면 식별과 전술적 자산배분(TAA) 결과를 탐색하는 **정적 웹 대시보드**입니다. 

## 주요 기능

| 탭 | 기능 | 제공되는 조작 |
|---|---|---|
| **Overview** | Global 국면의 5년 이동 Vintage 그래프, 선택 월 국면, 비중, 전략 성과 | 거시지표, 월별 Vintage 슬라이더, Naive/BL/Ridge |
| **KR-MD Explorer** | 13개 그룹의 204개 거시지표 월별 순환성분 | 지표 그룹, 개별 지표 |
| **Regime Analysis** | Global / Grouped 국면 타임라인, 5개 국면 확률, 국면 전이행렬, 국면 특성 히트맵 | PCA 방식, 기준 월 |
| **TAA** | 전략별 누적수익률, Sharpe, MDD, 자산군 비중과 월별 이력 | Global/Grouped, 4개 배분 케이스, 3개 방법 |
| **Methodology** | 방법론 요약 및 국면 정의 | 탭 전환 |

- 국면: R0 위기, R1 침체, R2 안정, R3 금융불안, R4 과열
- 국면 매핑은 Global과 Grouped를 구분하고 과거 Vintage의 수정 이력을 이용합니다.
- Overview의 Vintage 이후 회색 구간은 **국면 예측이 아닌**, 해당 시점 이후 실제 거시지표를 보여주는 영역입니다.
- TAA 수익률·성과는 원본 **Position Check** 결과를 사용하며, 현금성+예금 20%를 제외한 위험자산 80% 기준으로 계산된 성과입니다.




## 데이터 및 재현 범위

- 데이터는 업로드된 최종 Dash 프로젝트의 **고정 스냅샷**이며, 실시간 경제지표를 자동 업데이트하지 않습니다. 포함된 국면 Vintage의 최신 시점은 **2026-07**입니다.
- **Python 코드를 웹상에서 재실행하지 않습니다.** 국면 분류(PCA/Clustering), 최적화, Black-Litterman, Ridge 등은 원본 프로젝트의 이미 계산된 출력값을 표시합니다. 새로운 원천 데이터를 반영하려면 웹에 게시할 정적 데이터 스냅샷을 다시 생성해야 합니다.

> 이 대시보드는 연구 결과의 시각화용이며 금융상품 추천이나 투자자문을 제공하지 않습니다.

License
© 2026 Beomseok Seo
This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License.
Free for noncommercial research and educational use.
Attribution is required.
Commercial use requires prior written permission.
Third-party datasets and software remain subject to their respective licenses.

For details, see LICENSE or the CC BY-NC 4.0 License.
