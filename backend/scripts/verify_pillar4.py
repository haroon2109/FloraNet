"""
Verification harness for the AgriN pillar-4 additions.

Runs entirely against a MOCKED NASA POWER upstream, so the assertions are
deterministic and do not depend on whether a live network call happens to
succeed. It checks the three behaviours that matter most:

  1. a drought signal actually reorders the registry (indigenous millets rise);
  2. an unreachable upstream returns 503, never a fabricated ranking;
  3. the caller-supplied "30% uplift" stays labelled as a scenario.

Run:  cd backend && venv/bin/python scripts/verify_pillar4.py
"""

import random
import sys

sys.path.insert(0, ".")

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402
from app.services import real_data  # noqa: E402

random.seed(11)


def make_power_payload(dry_tail: bool) -> dict:
    """A synthetic 15-year POWER-shaped monthly series."""
    p, t = {}, {}
    for year in range(2010, 2026):
        for month in range(1, 13):
            key = f"{year}{month:02d}"
            monsoon = 6 <= month <= 9
            rain = (220 if monsoon else 8) + random.uniform(-25, 25)
            temp = 27 + random.uniform(-2, 2)
            if dry_tail and year == 2025 and month in (10, 11, 12):
                rain *= 0.12
                temp += 3
            p[key] = round(max(rain, 0), 2)
            t[key] = round(temp, 2)
    return {"properties": {"parameter": {"PRECTOTCORR": p, "T2M": t}}}


NORMAL = make_power_payload(dry_tail=False)
DRY = make_power_payload(dry_tail=True)

failures = []


def check(label: str, condition: bool, detail: str = "") -> None:
    if condition:
        print(f"  PASS  {label}")
    else:
        print(f"  FAIL  {label} {detail}")
        failures.append(label)


def soc_range(rec: dict) -> dict:
    return rec.get("socStockChangeTCPerHaPerYear") or {}


def main() -> int:
    client = TestClient(app)

    print("\n== 1. /agrin/carbon-metadata ==")
    r = client.get("/api/v1/agrin/carbon-metadata")
    check("HTTP 200", r.status_code == 200, str(r.status_code))
    body = r.json()
    check("serves JSON-LD", r.headers["content-type"].startswith("application/ld+json"))
    check("has canonical @context", "@context" in body)
    records = body.get("records", [])
    check("returns records", len(records) > 0)
    check("disclaimer present", "disclaimer" in body)
    check(
        "every record is creditClaimable=false",
        all(rec.get("creditClaimable") is False for rec in records),
    )
    check("every record carries derivation", all("derivation" in rec for rec in records))
    check(
        "SOC figures are ranges not points",
        all(
            isinstance(soc_range(rec).get("low"), (int, float))
            and isinstance(soc_range(rec).get("high"), (int, float))
            for rec in records
        ),
    )
    check(
        "SOC low < high on every record",
        all(
            soc_range(rec)["low"] < soc_range(rec)["high"]
            for rec in records
            if soc_range(rec)
        ),
    )
    brazil = client.get("/api/v1/agrin/carbon-metadata?country=Brazil").json()
    check(
        "Brazil filter works (Embrapa legumes present)",
        len(brazil.get("records", [])) > 0
        and all(rec["institutionCode"] == "Embrapa" for rec in brazil["records"]),
    )
    legumes = client.get("/api/v1/agrin/carbon-metadata?fixesNitrogen=true").json()
    check(
        "N-fixing filter returns only legumes",
        all(rec.get("fixesNitrogen") is True for rec in legumes.get("records", [])),
    )

    print("\n== 2. /agrin/resilience-match — drought reorders the registry ==")

    async def mocked_dry(lat, lng, years=15):
        return DRY

    async def mocked_normal(lat, lng, years=15):
        return NORMAL

    real_data.nasa_power_monthly = mocked_dry
    r = client.get("/api/v1/agrin/resilience-match?lat=18.52&lng=73.85")
    check("HTTP 200", r.status_code == 200, str(r.status_code))
    dry_body = r.json()
    check("isReference=false (live computation)", dry_body.get("isReference") is False)
    check("records a SPEI", dry_body.get("droughtSignal", {}).get("index") is not None)
    check("severity > 0 under drought", (dry_body.get("droughtSeverityFactor") or 0) > 0)
    check("publishes scoring weights", "weights" in (dry_body.get("scoring") or {}))
    weight_sum = sum(dry_body["scoring"]["weights"].values())
    check(f"weights sum to 1.0 (got {weight_sum:.6f})", abs(weight_sum - 1.0) < 1e-9)
    check("carries limitations", len(dry_body.get("limitations") or []) > 0)
    check("no scenario claimed by default", dry_body.get("scenarioIsCallerSupplied") is False)
    check("no uplift recorded by default", dry_body.get("scenarioUpliftPct") is None)

    top_dry = [c["name"] for c in dry_body["rankedCandidates"][:5]]
    check(
        "top-5 under drought are indigenous millets",
        any("Millet" in n or "Bajra" in n or "Ragi" in n for n in top_dry),
        str(top_dry),
    )
    check(
        "every top candidate is open-access",
        all(c["openAccess"] for c in dry_body["rankedCandidates"][:5]),
    )
    check(
        "candidates carry explanations",
        all(c.get("whyRecommended") for c in dry_body["rankedCandidates"]),
    )
    check(
        "candidates flag traits as reference data",
        all(c.get("traitsAreReferenceData") is True for c in dry_body["rankedCandidates"]),
    )
    r_again = client.get("/api/v1/agrin/resilience-match?lat=18.52&lng=73.85").json()
    check(
        "ranking is deterministic across calls",
        [c["id"] for c in r_again["rankedCandidates"]]
        == [c["id"] for c in dry_body["rankedCandidates"]],
    )

    real_data.nasa_power_monthly = mocked_normal
    normal_body = client.get("/api/v1/agrin/resilience-match?lat=18.52&lng=73.85").json()
    check(
        "weights SHIFT between drought and normal",
        normal_body["scoring"]["weights"] != dry_body["scoring"]["weights"],
    )
    check(
        "drought weight is higher under drought",
        dry_body["scoring"]["weights"]["drought"]
        > normal_body["scoring"]["weights"]["drought"],
    )

    print("\n== 3. the '30% higher chance of drought' scenario ==")
    r = client.get(
        "/api/v1/agrin/resilience-match?lat=18.52&lng=73.85&scenarioUpliftPct=30"
    )
    scen = r.json()
    check("HTTP 200", r.status_code == 200, str(r.status_code))
    check("uplift recorded", scen.get("scenarioUpliftPct") == 30)
    check("flagged as caller-supplied", scen.get("scenarioIsCallerSupplied") is True)
    check(
        "observed SPEI is NOT overwritten by the scenario",
        scen["droughtSignal"]["index"] == normal_body["droughtSignal"]["index"],
    )
    check(
        "uplift does not reduce the severity factor",
        (scen.get("droughtSeverityFactor") or 0)
        >= (normal_body.get("droughtSeverityFactor") or 0),
    )
    check(
        "limitation states the uplift is not a forecast",
        any("CALLER-SUPPLIED" in l for l in scen.get("limitations", [])),
    )
    check(
        "out-of-range uplift is rejected",
        client.get(
            "/api/v1/agrin/resilience-match?lat=18.52&lng=73.85&scenarioUpliftPct=9999"
        ).status_code
        == 422,
    )

    print("\n== 4. upstream down must NOT fabricate a ranking ==")

    async def boom(lat, lng, years=15):
        raise RuntimeError("simulated POWER outage")

    real_data.nasa_power_monthly = boom
    r = client.get("/api/v1/agrin/resilience-match?lat=18.52&lng=73.85")
    check("returns 503 when POWER is unreachable", r.status_code == 503, str(r.status_code))
    check("503 body explains why", "unavailable" in r.json().get("detail", "").lower())
    check("no candidates in the 503 body", "rankedCandidates" not in r.json())

    print("\n== 5. short POWER series refuses to invent an index ==")

    async def stubby(lat, lng, years=15):
        return {
            "properties": {"parameter": {"PRECTOTCORR": {"202501": 10}, "T2M": {"202501": 25}}}
        }

    real_data.nasa_power_monthly = stubby
    body = client.get("/api/v1/agrin/resilience-match?lat=18.52&lng=73.85").json()
    sig = body.get("droughtSignal", {})
    check("signal marked unavailable", sig.get("available") is False)
    check("no fabricated index", sig.get("index") is None)
    check("reason is published", bool(sig.get("reason")))

    print("\n== 6. /agrin/schema advertises the new classes ==")
    r = client.get("/api/v1/agrin/schema")
    schema = r.json()
    ids = {c["id"] for c in schema.get("classes", [])}
    check(
        "CarbonSequestrationProfile in the profile",
        any("CarbonSequestrationProfile" in i for i in ids),
    )
    check("ResilienceMatch in the profile", any("ResilienceMatch" in i for i in ids))
    eps = schema.get("endpoints", {})
    check("schema lists carbon-metadata", "carbonMetadata" in eps)
    check("schema lists resilience-match", "resilienceMatch" in eps)

    print("\n== 7. /agrin/dataset advertises the new pillars ==")
    ds = client.get("/api/v1/agrin/dataset").json()
    pillars = ds.get("pillars", {})
    check("carbonSequestration pillar present", "carbonSequestration" in pillars)
    check("resilienceMatch pillar present", "resilienceMatch" in pillars)
    check(
        "carbon pillar count is populated",
        (pillars.get("carbonSequestration") or {}).get("count", 0) > 0,
    )

    print()
    if failures:
        print(f"{len(failures)} CHECK(S) FAILED: {failures}")
        return 1
    print("All pillar-4 checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())