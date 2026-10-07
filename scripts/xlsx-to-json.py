"""docs/perfumes-draft.xlsx -> src/data/*.json

엑셀(perfumes, notes 시트)을 앱이 읽는 JSON으로 바꾼다. 수동 실행, 외부 API 호출 없음.
실행: python3 scripts/xlsx-to-json.py   (openpyxl 필요)
"""
import json
from pathlib import Path
from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parent.parent
XLSX = ROOT / "docs" / "perfumes-draft.xlsx"
OUT = ROOT / "src" / "data"

FAMILIES = [
    ("citrus", "시트러스", "레몬·베르가못·자몽"), ("fruity", "프루티", "복숭아·배·베리"),
    ("aqua", "아쿠아·오존", "바다·빗물·바람"), ("green", "그린", "풀잎·녹차·무화과잎"),
    ("aromatic", "아로마틱", "라벤더·로즈마리·민트"), ("floral", "플로럴", "장미·작약·은방울꽃"),
    ("whiteFloral", "화이트 플로럴", "자스민·튜베로즈·오렌지꽃"), ("powdery", "파우더리", "아이리스·바이올렛"),
    ("musk", "머스크·클린", "비누·갓 빤 빨래·살결"), ("spicy", "스파이시", "핑크페퍼·카다멈·시나몬"),
    ("woody", "우디", "시더·샌달우드·베티버"), ("amber", "앰버", "앰버·레진"),
    ("gourmand", "구르망", "바닐라·카라멜·꿀"), ("leather", "레더·스모키", "가죽·타바코·인센스"),
]
MOODS = [  # (id, 라벨, 연결 계열) — spec.md chips.json
    ("calm", "차분한", ["woody", "musk", "powdery", "aromatic"]), ("clean", "깨끗한", ["musk", "aqua", "citrus", "whiteFloral"]),
    ("cool", "시원한", ["aqua", "citrus", "green", "aromatic"]), ("cozy", "포근한", ["musk", "powdery", "gourmand", "amber"]),
    ("fresh", "싱그러운", ["green", "citrus", "fruity"]), ("zesty", "상큼한", ["citrus", "fruity"]),
    ("warm", "따뜻한", ["amber", "spicy", "woody", "gourmand"]), ("sweet", "달콤한", ["gourmand", "fruity", "amber"]),
    ("lovely", "사랑스러운", ["floral", "fruity", "whiteFloral", "powdery"]),
    ("elegant", "우아한", ["floral", "whiteFloral", "powdery"]), ("deep", "묵직한", ["woody", "leather", "amber"]),
    ("sensual", "매혹적인", ["leather", "spicy", "amber", "whiteFloral", "gourmand"]),
    ("soft", "보송한", ["powdery", "musk"]),
]
OBJECTS = [
    ("lemon", "레몬·귤", "citrus"), ("fruit", "과일", "fruity"), ("rain", "바람·비", "aqua"), ("grass", "풀잎·녹차", "green"),
    ("herb", "허브", "aromatic"), ("flower", "꽃", "floral"), ("whiteFlower", "하얀 꽃", "whiteFloral"), ("powder", "파우더", "powdery"),
    ("soap", "비누·빨래", "musk"), ("spice", "후추·향신료", "spicy"), ("forest", "숲·나무", "woody"), ("resin", "흙·나무", "amber"),
    ("vanilla", "바닐라·달콤", "gourmand"), ("smoky", "스모키", "leather"),
]
# 함께 고르면 어울리지 않는 분위기 쌍 (의미 기준으로 직접 정함). Select 화면에서 한쪽을 고르면 다른 쪽을 흐리게 한다.
MOOD_CONFLICTS = [
    ("cool", "warm"), ("cool", "cozy"), ("cool", "sensual"), ("cool", "deep"),
    ("clean", "sensual"), ("clean", "deep"),
    ("zesty", "deep"), ("zesty", "sensual"),
    ("fresh", "sensual"),
    ("soft", "sensual"),
    ("lovely", "sensual"), ("lovely", "deep"),
]
AVOIDS = [("tooSweet", "너무 단 향"), ("tooStrong", "너무 진한 향"), ("headache", "머리 아픈 향"),
          ("heavyFloral", "꽃향이 강한 향"), ("smoky", "스모키한 향"), ("powdery", "화장품 파우더 향"),
          ("spicy", "알싸한 향"), ("soapy", "비누·세제 같은 향")]
TIPS = [
    "1번부터 가벼운 향 순서로 맡아요. 진한 향을 먼저 맡으면 코가 금방 둔해져요.",
    "시향지에 향수 이름을 적어 두세요.",
    "마음에 드는 하나만 손목에 뿌리고, 30분 뒤 잔향을 다시 맡아보세요.",
    '"잔향 맡아보고 올게요"라고 말하고 매장을 나와도 괜찮아요.',
]

def split(v):
    return [x.strip() for x in str(v).split(",") if x and x.strip()] if v else []

def empty(v):
    return v is None or str(v).strip() == ""

wb = load_workbook(XLSX, data_only=True)
notes = {}
for r in wb["notes"].iter_rows(min_row=2, values_only=True):
    if r[0]:
        notes[r[0]] = {"en": r[0], "ko": r[1], "feel": r[2], "family": r[3]}

ws = wb["perfumes"]
head = [c.value for c in ws[1]]
perfumes, missing = [], set()
for row in ws.iter_rows(min_row=2, values_only=True):
    d = dict(zip(head, row))
    if empty(d["id"]):
        continue
    tiers = {}
    for key, col in (("top", "top_notes"), ("middle", "middle_notes"), ("base", "base_notes")):
        items = []
        for n in split(d[col]):
            if n in notes:
                items.append(notes[n])
            else:
                missing.add(n)
        tiers[key] = items
    kr = None
    if not empty(d["kr_krw"]) and not empty(d["kr_ml"]):
        kr = {"ml": int(d["kr_ml"]), "krw": int(d["kr_krw"]),
              "checkedAt": str(d["kr_checked_at"]) if not empty(d["kr_checked_at"]) else None,
              "source": d["kr_source_url"]}
    ch = d["channels"]
    # 앱에는 근거 신뢰도가 '높음/보통'인 채널만 보여준다 (낮음·미확인은 엑셀에만 남김)
    ch_ok = str(d.get("channels_status") or "").startswith(("높음", "보통"))
    perfumes.append({
        "id": d["id"], "brand": d["brand"], "brandKo": d["brand_ko"], "name": d["name"], "nameKo": d["name_ko"],
        "concentration": d["concentration"] or None, "notes": tiers,
        "family": d["family"], "subFamilies": split(d["sub_families"]), "moods": split(d["moods"]),
        "avoidFlags": split(d["avoid_flags"]), "intensity": d["intensity"], "polarizing": d["polarizing"],
        "seasonOccasion": d["season_occasion"], "summary": d["summary"], "drydown": d["drydown"], "checkPoint": d["check_point"],
        "krPrice": kr, "storeQuery": d["store_query"],
        "channels": split(ch) if ch_ok and not empty(ch) and "확인 필요" not in str(ch) else [],
        "image": {"file": d["image_file"], "source": d["image_source_url"]} if not empty(d["image_file"]) else None,
        "dataStatus": "verified" if "확인 완료" in str(d["data_status"] or "") else "draft",
    })
if missing:
    raise SystemExit(f"notes 시트에 없는 노트: {sorted(missing)}")

OUT.mkdir(parents=True, exist_ok=True)
def dump(name, data):
    (OUT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
dump("perfumes.json", perfumes)
dump("families.json", [{"id": i, "name": n, "order": k + 1, "examples": e} for k, (i, n, e) in enumerate(FAMILIES)])
dump("chips.json", {"moods": [{"id": i, "label": l, "affinity": a} for i, l, a in MOODS],
                    "objects": [{"id": i, "label": l, "family": f} for i, l, f in OBJECTS],
                    "avoids": [{"id": i, "label": l} for i, l in AVOIDS],
                    "conflicts": [list(c) for c in MOOD_CONFLICTS]})
dump("tips.json", TIPS)
print(f"perfumes {len(perfumes)}, with price {sum(1 for p in perfumes if p['krPrice'])}, with image {sum(1 for p in perfumes if p['image'])}")
