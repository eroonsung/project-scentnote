"""피하고 싶은 칩 추가 태그(spicy 알싸한 향 / soapy 비누·세제 같은 향)와 headache 재정리.
노트·계열·강도 규칙으로 avoid_flags 열에 플래그를 더한다(기존 플래그는 유지, headache만 규칙으로 다시 계산).
사용: python scripts/tag-avoids.py [--write]  (--write 없으면 통계·목록만 출력)"""
import sys
import openpyxl

SPICE = ("black pepper", "szechuan", "cinnamon", "cardamom", "clove", "saffron", "cumin", "ginger")  # 핑크페퍼·육두구는 은은해서 제외
SOAP = ("aldehyde", "soap", "cotton", "white musk", "clean musk", "linen")
HEADACHE_NOTES = ("tuberose", "oud", "gardenia", "incense", "patchouli", "tobacco")

wb = openpyxl.load_workbook("docs/perfumes-draft.xlsx")
ws = wb["perfumes"]
col = {c.value: i + 1 for i, c in enumerate(ws[1])}
g = lambda r, k: (ws.cell(r, col[k]).value or "")
sp = lambda s: [x.strip() for x in s.split(",") if x.strip()]
rows = []
for r in range(2, ws.max_row + 1):
    if not g(r, "id"): continue
    notes = " ".join(g(r, k) for k in ("top_notes", "middle_notes", "base_notes")).lower()
    fam, subs, inten = g(r, "family"), sp(g(r, "sub_families")), g(r, "intensity")
    old = sp(g(r, "avoid_flags")); new = [f for f in old if f != "headache"]
    add = []
    if fam == "spicy" or "spicy" in subs or (inten != "light" and any(w in notes for w in SPICE)): add.append("spicy")
    if (fam == "musk" and "clean" in g(r, "moods")) or any(w in notes for w in SOAP): add.append("soapy")
    if inten == "strong" and (fam == "whiteFloral" or any(w in notes for w in HEADACHE_NOTES)): add.append("headache")
    new += [a for a in add if a not in new]
    rows.append(dict(r=r, id=g(r, "id"), fam=fam, inten=inten, old=old, new=new, add=add))
cnt = lambda key, f: sum(f in p[key] for p in rows)
print("플래그별 향수 수 (이전→이후)")
for f in ("tooSweet", "tooStrong", "headache", "heavyFloral", "smoky", "powdery", "spicy", "soapy"):
    print(f"  {f}: {cnt('old', f)} → {cnt('new', f)}")
for f in ("spicy", "soapy", "headache"):
    print(f"\n[{f}] 부여 목록")
    for p in rows:
        if f in p["new"]: print(f"  - {p['id']} ({p['fam']}/{p['inten']})")
if "--write" in sys.argv:
    for p in rows: ws.cell(p["r"], col["avoid_flags"]).value = ", ".join(p["new"]) or None
    o = wb["options"]
    for r in range(1, 40):
        if o.cell(r, 11).value == "powdery":
            o.cell(r + 1, 11).value, o.cell(r + 1, 12).value = "spicy", "알싸한 향"
            o.cell(r + 2, 11).value, o.cell(r + 2, 12).value = "soapy", "비누·세제 같은 향"
            break
    wb.save("docs/perfumes-draft.xlsx"); print("\n엑셀 저장 완료")
