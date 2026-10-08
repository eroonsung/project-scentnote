"""[사용 중지 2026-10-08] 분위기 태그를 향수마다 재검토(apply-review.py)한 뒤로는 이 스크립트를 다시 돌리지 않는다(자동 확장이 재검토 결과를 덮어씀).
분위기 태그 확장 (규칙 A): 향수의 대표 계열(family)을 affinity로 가진 분위기 칩을 추가한다.
 - 강도 조건: strong 향수에는 가벼운 분위기(깨끗한·시원한·싱그러운·상큼한), light 향수에는 무거운 분위기(묵직한·매혹적인)를 추가하지 않는다.
 - 이미 있는 태그와 어울리지 않는 칩(MOOD_CONFLICTS)은 추가하지 않는다.
사용: python scripts/expand-moods.py [--write]   (--write 없으면 통계만 출력)"""
import itertools, sys
import openpyxl

src = open("scripts/xlsx-to-json.py", encoding="utf-8").read()
# MOODS / MOOD_CONFLICTS만 필요하므로 소스에서 해당 리터럴만 평가
import re, ast
def lit(name):
    m = re.search(rf"^{name} = (\[.*?^\])", src, re.S | re.M)
    return ast.literal_eval(m.group(1))
MOODS = lit("MOODS"); CONF = [tuple(c) for c in lit("MOOD_CONFLICTS")]
AFF = {i: set(a) for i, _, a in MOODS}
LABEL = {i: l for i, l, _ in MOODS}
LIGHT = {"clean", "cool", "fresh", "zesty"}; HEAVY = {"deep", "sensual"}
conflict = lambda a, b: (a, b) in CONF or (b, a) in CONF

wb = openpyxl.load_workbook("docs/perfumes-draft.xlsx")
ws = wb["perfumes"]
col = {c.value: i + 1 for i, c in enumerate(ws[1])}
rows = []
for r in range(2, ws.max_row + 1):
    pid = ws.cell(r, col["id"]).value
    if not pid: continue
    rows.append(dict(r=r, id=pid, family=ws.cell(r, col["family"]).value, inten=ws.cell(r, col["intensity"]).value,
                     old=[x.strip() for x in (ws.cell(r, col["moods"]).value or "").split(",") if x.strip()]))
for p in rows:
    new = list(p["old"])
    for mid, _, _ in MOODS:
        if mid in new or p["family"] not in AFF[mid]: continue
        if p["inten"] == "strong" and mid in LIGHT: continue
        if p["inten"] == "light" and mid in HEAVY: continue
        if any(conflict(mid, t) for t in new): continue
        new.append(mid)
    p["new"] = new

def stats(key):
    combos = [c for c in itertools.combinations([m[0] for m in MOODS], 3) if not any(conflict(a, b) for a, b in itertools.combinations(c, 2))]
    cnt = [sum(set(c) <= set(p[key]) for p in rows) for c in combos]
    n = len(cnt)
    return dict(avg_tags=sum(len(p[key]) for p in rows) / len(rows), combos=n, zero=sum(x == 0 for x in cnt) / n,
                lt3=sum(x < 3 for x in cnt) / n, avg=sum(cnt) / n)
for k in ("old", "new"): print(k, {a: round(b, 2) for a, b in stats(k).items()})
# 의심 목록: 이유가 되는 경우만
print("\n[검토 필요] 대표 계열과 분위기 강도가 어긋나 보이는 향수")
for p in rows:
    added = [m for m in p["new"] if m not in p["old"]]
    flag = []
    if p["inten"] == "strong" and p["old"] and set(p["old"]) & LIGHT: flag.append("strong인데 기존 태그에 가벼운 분위기")
    if p["inten"] == "light" and set(p["old"]) & HEAVY: flag.append("light인데 기존 태그에 무거운 분위기")
    if len(added) >= 4: flag.append(f"추가 태그가 {len(added)}개로 많음")
    if flag: print(f"- {p['id']} ({p['family']}/{p['inten']}): {'; '.join(flag)} → 기존 {','.join(p['old'])} / 추가 {','.join(added)}")
if "--write" in sys.argv:
    for p in rows: ws.cell(p["r"], col["moods"]).value = ", ".join(p["new"])
    wb.save("docs/perfumes-draft.xlsx"); print("\n엑셀 moods 열 저장 완료")
