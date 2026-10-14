# KR-MD & TAA Dashboard — Jekyll / GitHub Pages Edition

한국형 거시경제 데이터(KR-MD)를 활용한 거시경제 국면 식별과 전술적 자산배분(TAA) 결과를 탐색하는 **정적 웹 대시보드**입니다. 원본 `1012_DASHBOARD_PUR_Dark_v6_fix1/app.ipynb`의 Dash 인터페이스를 JavaScript + Plotly.js 기반으로 이식했습니다.

**웹페이지 실행 시 Python, Dash, Colab, Jupyter, Flask 또는 별도 API 서버가 필요하지 않습니다.** GitHub Pages의 Jekyll 기본 배포 기능으로 운영할 수 있습니다. 데이터와 그래프 라이브러리가 프로젝트에 포함되어 있어 외부 CDN이나 외부 데이터 요청도 필요하지 않습니다.

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

## GitHub Pages 배포

1. GitHub에 새 저장소를 만듭니다. 예: `KR-MD-TAA-Dashboard`.
2. **이 ZIP의 내부 파일들(`index.html`, `_config.yml`, `assets/`, `README.md`)을 저장소 최상위에** 업로드합니다. ZIP 파일 자체를 업로드하지 마세요.
3. 저장소의 **Settings → Pages → Build and deployment**에서 `Deploy from a branch`를 선택합니다.
4. Branch를 `main`, 폴더를 `/(root)`로 선택하고 저장합니다.
5. 배포 후 `https://<username>.github.io/<repository>/`로 접속합니다.

`index.html`은 Jekyll이 지원하는 정적 HTML 엔트리 파일입니다. CSS/JS를 상대경로로 참조하므로 `username.github.io` 저장소와 일반 프로젝트 저장소 양쪽에서 `_config.yml`의 `baseurl` 수정 없이 사용할 수 있습니다. 별도의 GitHub Actions 구성이나 Jekyll 플러그인 설치도 필요하지 않습니다.

### Git 명령으로 업로드

프로젝트 폴더에서(Windows PowerShell 또는 터미널):

```bash
git init
git add .
git commit -m "Publish KR-MD TAA static Jekyll dashboard"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

`USERNAME/REPOSITORY`를 실제 GitHub 사용자명/저장소명으로 바꿔주세요. GitHub는 HTTPS push에서 계정 비밀번호 대신 Personal Access Token 또는 인증된 Git Credential Manager를 사용합니다.

## 로컬 미리보기 (Python 불필요)

- 일반적인 환경에서는 `index.html`을 브라우저로 열어 볼 수 있습니다.
- 브라우저가 로컬 파일 보안정책을 적용하는 경우 **VS Code Live Server** 확장 프로그램 또는 Node.js의 `npx serve .`를 이용하세요.
- Jekyll이 설치된 환경에서는 `bundle exec jekyll serve`로도 확인할 수 있습니다(선택 사항).

## 파일 구조

```text
KRMD_TAA_Jekyll/
├── _config.yml
├── index.html
├── Gemfile                   # 선택적 로컬 Jekyll 미리보기
├── README.md
├── THIRD_PARTY_NOTICES.md
└── assets/
    ├── css/
    │   ├── dashboard.css          # 원본 PUR Dark v6 기본 스타일
    │   └── static-overrides.css  # 브라우저 네이티브 인터랙션용 스타일
    └── js/
        ├── dashboard.js          # 5개 탭 및 Plotly 그래프 구현
        ├── dashboard-data.js     # 원본 CSV/PKL/XLSM에서 사전 추출한 정적 데이터
        └── plotly.min.js         # 로컬 Plotly.js (MIT)
```

## 데이터 및 재현 범위

- 데이터는 업로드된 최종 Dash 프로젝트의 **고정 스냅샷**이며, 실시간 경제지표를 자동 업데이트하지 않습니다. 포함된 국면 Vintage의 최신 시점은 **2026-07**입니다.
- 모든 표시용 데이터(`df_cycle.pkl`의 204개 변수, Excel 변수 메타데이터, Vintage 국면 매핑, 확률/히트맵/전이행렬, 24개 전략의 비중·성과·월별 수익률)는 `dashboard-data.js`에 변환되어 포함되어 있습니다.
- **Python 코드를 웹상에서 재실행하지 않습니다.** 국면 분류(PCA/Clustering), 최적화, Black-Litterman, Ridge 등은 원본 프로젝트의 이미 계산된 출력값을 표시합니다. 새로운 원천 데이터를 반영하려면 웹에 게시할 정적 데이터 스냅샷을 다시 생성해야 합니다.
- 원본 `app.ipynb`, `*.pkl`, `*.xlsm`은 배포 패키지에 넣지 않았습니다. `dashboard-data.js` 자체는 공개 웹자산이며 모든 방문자가 열람할 수 있으므로 GitHub 공개 전에 원자료 재배포 권한을 점검하세요.
- 원본 README에서 **Methodology 설명문은 검토 전 v5 원문을 보존**했다고 명시한 상태입니다. 현재 페이지도 해당 요약문을 실질적으로 유지하므로 공개 전 내용 검토를 권장합니다.

> 이 대시보드는 연구 결과의 시각화용이며 금융상품 추천이나 투자자문을 제공하지 않습니다.
