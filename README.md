# 국방 디지털 군 보급품 통합 관리 시스템 (Military Supply Ledger)

> 대한민국 군 보급품의 공정하고 투명한 불출/사용 대장 기록을 위한 공개 웹 시스템입니다.
> 누구나 접속하여 군 보급품 사용 내역과 상세 메모를 등록하고 실시간으로 확인할 수 있습니다.

---

## 🛠 기술 스택
- **프론트엔드 (Frontend)**: HTML5, Tailwind CSS, Vanilla JavaScript, FontAwesome
- **데이터베이스 (Database)**: [Supabase](https://supabase.com/) (PostgreSQL & Realtime RLS)
- **호스팅 및 배포 (Deployment)**: [Vercel](https://vercel.com/) (글로벌 엣지 CDN 무료 배포)
- **버전 관리 (Version Control)**: [GitHub](https://github.com/)

---

## 🚀 빠른 시작 가이드 (초보자 맞춤)

### 1단계: Supabase 데이터베이스 생성 및 SQL 실행
1. [Supabase](https://supabase.com)에 로그인 후 **`New Project`**를 생성합니다.
2. 좌측 메뉴에서 **`SQL Editor`** 아이콘을 클릭합니다.
3. 프로젝트 내의 `supabase_setup.sql` 파일 내용 전체를 복사하여 붙여넣고 우측 하단의 **`Run`** 버튼을 클릭합니다.
4. 좌측 메뉴 **`Project Settings` -> `API`**로 이동하여:
   - `Project URL`
   - `Project API Keys`의 `anon public` 키를 복사합니다.

### 2단계: 웹사이트와 Supabase 연동
- 방법 A: `app.js` 파일을 열고 상단의 `DEFAULT_SUPABASE_URL`과 `DEFAULT_SUPABASE_ANON_KEY`에 복사한 값을 입력합니다.
- 방법 B: 브라우저에서 `index.html`을 열고 상단 배너의 **`[Supabase 키 직접 입력]`** 버튼을 눌러 바로 연결할 수도 있습니다.

### 3단계: GitHub에 소스코드 올리기
1. [GitHub](https://github.com)에서 **`New repository`**를 생성합니다. (예: `military-supply-ledger`)
2. 생성된 저장소 화면에서 **`uploading an existing file`**을 클릭하고, 이 폴더의 파일들을 드래그 앤 드롭으로 업로드한 후 **`Commit changes`**를 누릅니다.

### 4단계: Vercel에서 1분 만에 전 세계 배포 URL 만들기
1. [Vercel](https://vercel.com)에 로그인하고 **`Add New...` -> `Project`**를 클릭합니다.
2. 앞서 생성한 GitHub 레포지토리(`military-supply-ledger`)를 찾아 **`Import`** 버튼을 누릅니다.
3. 별도의 설정 변경 없이 바로 **`Deploy`** 버튼을 클릭합니다.
4. 약 10초 후 생성되는 고유 공개 URL(예: `https://military-supply-ledger.vercel.app`)로 누구나 접속할 수 있습니다!

---

## 📋 주요 기능
1. **실시간 보급품 통계 대시보드**: 누적 불출 건수, 금일 불출, 특이사항 메모 건수, 사용 중 물품 현황
2. **공개 군 보급품 사용 대장 작성**: 품목(피복/급양/장구/의무/통신 등), 수량, 불출자, 사용 목적, 상세 메모 등록
3. **실시간 대장 조회 및 검색**: 품목명/작성자/메모 키워드 검색 및 카테고리별 필터링
4. **상세 메모 팝업**: 각 보급품별 현장 특이사항 및 인수인계 메모 조회
5. **반납 및 상태 관리**: 사용 중 품목의 반납 완료 처리

