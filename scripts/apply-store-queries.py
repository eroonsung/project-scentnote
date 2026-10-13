"""브랜드별 네이버 지도 검색어와 시향 가능 채널을 엑셀에 반영한다 (2026-10-13 조사 결과).

입력: decision.json (브랜드 -> {query, derived}) — 네이버 지도 검색 결과를 직접 확인해 만든 값
실행: python3 scripts/apply-store-queries.py <decision.json>   (openpyxl 필요)
그다음 python3 scripts/xlsx-to-json.py 로 JSON을 다시 만든다.
"""
import json
import sys
from pathlib import Path
from urllib.parse import quote
from openpyxl import load_workbook

XLSX = Path(__file__).resolve().parent.parent / "docs" / "perfumes-draft.xlsx"
decision = json.load(open(sys.argv[1], encoding="utf8"))
FALL = "백화점 향수"
FALL_OY = "올리브영 향수"  # 올리브영 브랜드관만 확인된 브랜드(매장 재고는 매장마다 다름)
MANUAL = {  # 검색 결과만으로 채널 이름을 정할 수 없는 브랜드
    "논픽션": ["브랜드 매장"],
    "니샤네": ["편집숍(퍼퓸갤러리)"],
    "제르조프": ["편집숍(퍼퓸갤러리)"],
}
NOTE = "네이버 지도 검색(2026-10-13)에서 이 브랜드의 매장·카운터(화장품·향수 분류)가 확인됨. 공식 매장 목록은 아님."
NOTE_MANUAL = {
    "논픽션": "네이버 지도에서 논픽션 삼청·성수·신사가 '화장품,향수'로 확인됨(2026-10-13). 매거진 보도와 일치. 공식 목록은 아님.",
    "니샤네": "네이버 지도에서 '니샤네' 검색 시 퍼퓸갤러리 매장이 표시됨(2026-10-13). 2024년 퍼퓸갤러리 공식 런칭 보도(mydaily). 공식 매장 목록은 아님.",
    "제르조프": "네이버 지도에서 '제르조프' 검색 시 퍼퓸갤러리 매장이 표시됨(2026-10-13). 브랜드 취급 여부는 매장 확인 필요.",
}
wb = load_workbook(XLSX)
ws = wb["perfumes"]
H = [c.value for c in ws[1]]
ix = {h: i + 1 for i, h in enumerate(H)}
changed_ch = {}
for row in range(2, ws.max_row + 1):
    ko = ws.cell(row, ix["brand_ko"]).value
    if ko not in decision:
        continue
    d = decision[ko]
    ws.cell(row, ix["store_query"]).value = d["query"]
    status = str(ws.cell(row, ix["channels_status"]).value or "")
    if status.startswith(("높음", "보통")):
        continue  # 이미 근거가 확인된 채널은 그대로 둔다
    chs = MANUAL.get(ko) or d["derived"]
    if chs and d["query"] not in (FALL, FALL_OY):
        ws.cell(row, ix["channels"]).value = ", ".join(chs)
        ws.cell(row, ix["channels_status"]).value = "보통 (앱에 표시)"
        changed_ch[d["en"]] = (ko, d["query"], chs)
wc = wb["channels"]
for r in range(2, wc.max_row + 1):
    en = wc.cell(r, 1).value
    if en in changed_ch:
        ko, q, chs = changed_ch[en]
        wc.cell(r, 2).value = "보통"
        wc.cell(r, 3).value = "표시"
        wc.cell(r, 4).value = ", ".join(chs)
        wc.cell(r, 5).value = "https://map.naver.com/p/search/" + quote(q)
        wc.cell(r, 6).value = NOTE_MANUAL.get(ko, NOTE)
wb.save(XLSX)
print("채널 갱신:", {en: v[2] for en, v in changed_ch.items()})
