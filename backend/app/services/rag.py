"""
FloraNet RAG Engine — Enhanced Soil Advisory Module
Implements ICAR / Embrapa / ARC verified agricultural knowledge retrieval
using FAISS + local sentence-transformers embeddings, feeding a local
open-weights model (Ollama gateway) for 3-year crop rotation plans.

Fully open source and offline-capable:
  - Embeddings run in-process (sentence-transformers, no network, no keys)
  - The FAISS index is persisted to disk and only rebuilt when the corpus
    hash or embedding model changes
  - If the embedding model is unavailable, retrieval degrades to a
    deterministic TF-IDF keyword search instead of failing
"""

import os
import json
import hashlib
import httpx
import faiss
import numpy as np
from typing import List, Optional

from pydantic import BaseModel, Field

from app.services import llm

# ──────────────────────────────────────────────────────────────────────────────
# Knowledge corpus of verified BRICS regenerative agriculture guidelines
# Seeded inline (markdown) so the RAG works $0, no external DB needed.
# ──────────────────────────────────────────────────────────────────────────────
BRICS_KNOWLEDGE_CORPUS: list[dict] = [
    {
        "id": "icar-black-cotton",
        "source": "ICAR (India Council of Agricultural Research)",
        "region": "India · Deccan Plateau",
        "soil_type": "Black Cotton (Vertisol)",
        "content": """
ICAR Regenerative Protocol — Black Cotton Soil (Vertisol), Deccan Plateau, India
Key Characteristics: High clay shrink-swell, self-mulching, low organic matter (0.4–0.8%), pH 7.5–8.5.
Crop Rotation (3-Year):
  Year 1: Sorghum (Kharif) → Chickpea (Rabi) — Nitrogen fixation via legume, 40 kg N/acre savings.
  Year 2: Sunflower (Kharif) → Wheat (Rabi) — Diversify root depth; break pest cycles.
  Year 3: Maize (Kharif) → Lentil (Rabi) + Green Manure (Dhaincha) — SOC target +0.3% per cycle.
SOC Targets: 0.4% → 0.8% over 3 years via jeevamrutha (200 L/acre/season) + crop residue retention.
Irrigation: Deficit drip at 60% ETc during Rabi to build drought tolerance.
Pest Watch: Fall Armyworm (FAW) monitoring traps every 200m from June 15.
Carbon Benefit: 1.2 t CO2e/acre/year through reduced tillage + biochar application (0.5 t/acre).
        """,
    },
    {
        "id": "embrapa-cerrado",
        "source": "Embrapa (Brazil Agricultural Research Corp.)",
        "region": "Brazil · Mato Grosso (Cerrado)",
        "soil_type": "Cerrado Latosol (Oxisol)",
        "content": """
Embrapa Direct Planting Protocol — Cerrado Latosol (Oxisol), Mato Grosso, Brazil
Key Characteristics: Highly weathered, low P & Ca, acidic pH 4.5–6.0, excellent drainage, high SOC potential.
Crop Rotation (3-Year):
  Year 1: Soybean (Oct–Feb) + Brachiaria ruziziensis cover crop — N fixation 180 kg/ha; 8–10 t/ha biomass.
  Year 2: Maize (safrinha, Feb–Jun) + Crotalaria spectabilis — Break root-knot nematode cycles; add 80 kg N/ha.
  Year 3: Cotton (Oct–Feb) + Radish bio-drill cover — Deep root channel to 1.2m improves subsoil P uptake.
Soil Amendment: Lime to pH 6.0 (3 t/ha every 3 years) + Gypsum 2 t/ha for Ca, sub-soil Al correction.
SOC Targets: No-till raises SOC from 1.8% to 3.5% over 6 years.
Rust Management: Soybean rust (Phakopsora pachyrhizi) — 3-fungicide program starting at V4 + sentinel plots.
Carbon Benefit: 2.1 t CO2e/ha/year under no-till + permanent cover crops.
        """,
    },
    {
        "id": "arc-highveld",
        "source": "ARC (Agricultural Research Council, South Africa)",
        "region": "South Africa · Free State (Highveld)",
        "soil_type": "Highveld Plinthosol / Sandy Loam",
        "content": """
ARC Conservation Agriculture Protocol — Highveld, Free State, South Africa
Key Characteristics: Sandy loam, pH 5.5–7.0, low SOC (0.3–0.6%), high frost risk (April–August), erratic rainfall 400–600mm.
Crop Rotation (3-Year):
  Year 1: Maize (Oct–Apr) — 6.5 t/ha target with Bacillus subtilis seed treatment (reduces Fusarium 40%).
  Year 2: Sunflower (Nov–Apr) → Vetch cover (May–Sep) — Breaks Striga hermonthica cycle; N credit 45 kg/ha.
  Year 3: Sorghum (Nov–Mar) + Lucerne (perennial strips every 12m) — Moisture harvesting; +0.25% SOC.
Locust Protocol: Deploy pheromone traps April–September; buffer zone 5 km radius early warning.
SOC Targets: 0.3% → 0.7% via minimum tillage + kraal manure (5 t/ha alternate years).
Water Harvesting: Tied ridges + infiltration pits capture 22% more rainfall (ARC trial, 2022–2024).
Carbon Benefit: 0.9 t CO2e/ha/year (conservative semi-arid sequestration baseline).
        """,
    },
    {
        "id": "chernozem-russia",
        "source": "VNIIEA (All-Russia Research Institute for Economics of Agriculture)",
        "region": "Russia · Krasnodar / Volga Chernozem Belt",
        "soil_type": "Chernozem (Mollisol)",
        "content": """
Russian Chernozem Conservation Protocol — Krasnodar Krai, Russia
Key Characteristics: Deep humus horizon (80–120cm), pH 6.8–7.5, SOC 4–8%, high natural fertility.
Crop Rotation (3-Year):
  Year 1: Winter Wheat — 6 t/ha target; strip-till preserves moisture; Septoria leaf blotch fungicide at GS31.
  Year 2: Sunflower → Rapeseed cover — 4-year break prevents Sclerotinia; deep root channels at 1.5m.
  Year 3: Sugar Beet / Barley + Clover under-sow — Clover fixes 120 kg N/ha; reduces synthetic input costs 35%.
SOC Maintenance: Stubble retention + 10 t/ha straw incorporation every 3 years prevents SOC decline from 6% to 5.8%.
Water: Snow retention strips (Kuloisy) increase spring soil water 40 mm/m.
Carbon Benefit: Chernozem maintained at 4%+ SOC locks 180 t CO2e/ha in perpetuity (preservation, not gain).
        """,
    },
    {
        "id": "china-loess",
        "source": "CAAS (Chinese Academy of Agricultural Sciences)",
        "region": "China · Loess Plateau / Pearl River Delta",
        "soil_type": "Loessial Soil / Paddy Soil",
        "content": """
CAAS Smart Irrigation + Rotation Protocol — Loess Plateau, China
Key Characteristics: Loessial soils pH 7.5–8.5, erosion-prone; Paddy soils (south) pH 5.5–6.5, high P saturation.
Crop Rotation (3-Year):
  Year 1: Rice (submerged May–Sep) → Winter Wheat — Water-table management reduces CH4 38%; alternate wet-dry AWD saves 30% water.
  Year 2: Maize (terraced, drip-fed) + Soybean intercrop — 12% yield gain; N fixation 50 kg/ha.
  Year 3: Sorghum + Green Manure (purple sesbania) — Restores Zn and B micro-nutrients depleted by paddy monoculture.
SOC Targets: Biochar (1.5 t/ha) + paddy straw return raises SOC 0.5% over 5 years.
Erosion Control: Contour bunding + vetiver strips on >5° slopes reduce soil loss from 48 t/ha to 8 t/ha.
Carbon Benefit: 1.5 t CO2e/ha/year via AWD rice + biochar application.
        """,
    },
]

KNOWLEDGE_DIR = os.path.join(os.path.dirname(__file__), "..", "knowledge")

# Persisted index location (rebuilt only when corpus/model changes)
INDEX_DIR = os.path.join(os.path.dirname(__file__), ".rag_index")
INDEX_FILE = os.path.join(INDEX_DIR, "index.faiss")
DOCS_FILE = os.path.join(INDEX_DIR, "docs.json")


# ──────────────────────────────────────────────────────────────────────────────
# Structured advisory schema (validated by the LLM gateway)
# ──────────────────────────────────────────────────────────────────────────────
class AdvisoryLocation(BaseModel):
    lat: float
    lng: float
    country: str


class AdvisorySoilProfile(BaseModel):
    type: str
    live_moisture_pct: Optional[float] = None
    temp_c: Optional[float] = None


class RotationYear(BaseModel):
    year: int = Field(description="Rotation year, 1-3")
    kharif_rabi: str = Field(description="Crops for the year, e.g. 'Sorghum → Chickpea'")
    rationale: str = Field(description="Agronomic justification grounded in the knowledge base")
    n_saving_kg_acre: float = Field(description="Estimated nitrogen saving, kg/acre")
    soc_gain_pct: float = Field(description="Estimated soil organic carbon gain, %")


class SoilAdvisory(BaseModel):
    advisory_id: str
    location: AdvisoryLocation
    soil_profile: AdvisorySoilProfile
    rotation_plan: List[RotationYear] = Field(description="Exactly 3 rotation years")
    soc_3yr_target_pct: float
    carbon_credit_t_co2e_acre_yr: float
    pest_management: str
    water_advisory: str
    input_cost_reduction_pct: float
    sources: List[str]


class FloraNetRAG:
    """
    Production FAISS-backed RAG engine for FloraNet.
    Embeds BRICS agricultural corpus + local markdown knowledge files with a
    local sentence-transformers model, supports hybrid nearest-neighbour
    retrieval with a TF-IDF keyword fallback.
    """

    def __init__(self):
        self.index: Optional[faiss.Index] = None
        self.documents: List[str] = []
        self.metadata: List[dict] = []
        self.index_mode: str = "unbuilt"  # unbuilt | vector | keyword

        self._load_or_build_index()

    # ──────────────────────────────────────────────────────────────────────────
    def _collect_documents(self) -> tuple[List[str], List[dict]]:
        """Gather the inline BRICS corpus + local markdown knowledge files."""
        texts, metas = [], []

        for doc in BRICS_KNOWLEDGE_CORPUS:
            texts.append(doc["content"].strip())
            metas.append({
                "id": doc["id"],
                "source": doc["source"],
                "region": doc["region"],
                "soil_type": doc["soil_type"],
            })

        if os.path.exists(KNOWLEDGE_DIR):
            for fn in sorted(os.listdir(KNOWLEDGE_DIR)):
                if fn.endswith(".md"):
                    fpath = os.path.join(KNOWLEDGE_DIR, fn)
                    with open(fpath, "r", encoding="utf-8") as f:
                        content = f.read().strip()
                    if content:
                        texts.append(content)
                        metas.append({
                            "id": fn,
                            "source": "local-knowledge",
                            "region": "BRICS",
                            "soil_type": "mixed",
                        })
        return texts, metas

    @staticmethod
    def _corpus_hash(texts: List[str]) -> str:
        hasher = hashlib.sha256()
        hasher.update(llm.EMBEDDING_MODEL_NAME.encode("utf-8"))
        hasher.update(llm.OLLAMA_EMBED_MODEL.encode("utf-8"))
        for t in texts:
            hasher.update(t.encode("utf-8"))
        return hasher.hexdigest()

    # ──────────────────────────────────────────────────────────────────────────
    def _load_or_build_index(self):
        """Reuse a persisted FAISS index when the corpus hash matches; else rebuild."""
        texts, metas = self._collect_documents()
        if not texts:
            print("[FloraNet RAG] No documents to index.")
            return

        corpus_hash = self._corpus_hash(texts)

        # 1) Try the persisted index (instant boot, no embedding compute)
        try:
            if os.path.exists(INDEX_FILE) and os.path.exists(DOCS_FILE):
                with open(DOCS_FILE, "r", encoding="utf-8") as f:
                    saved = json.load(f)
                if saved.get("corpus_hash") == corpus_hash:
                    self.index = faiss.read_index(INDEX_FILE)
                    self.documents = saved["documents"]
                    self.metadata = saved["metadata"]
                    self.index_mode = "vector"
                    print(f"[FloraNet RAG] Loaded persisted index: {len(self.documents)} chunks.")
                    return
        except Exception as exc:
            print(f"[FloraNet RAG] Persisted index unreadable, rebuilding: {exc}")

        # 2) Rebuild: embed locally, persist for next boot
        self.documents = texts
        self.metadata = metas
        embeddings = llm.embed_texts(texts)

        if embeddings is not None and embeddings.shape[0] == len(texts):
            dim = embeddings.shape[1]
            self.index = faiss.IndexFlatL2(dim)
            self.index.add(embeddings)
            self.index_mode = "vector"
            try:
                os.makedirs(INDEX_DIR, exist_ok=True)
                faiss.write_index(self.index, INDEX_FILE)
                with open(DOCS_FILE, "w", encoding="utf-8") as f:
                    json.dump({"corpus_hash": corpus_hash, "documents": texts, "metadata": metas}, f)
                print(f"[FloraNet RAG] Index built and persisted: {len(texts)} chunks ({dim}-dim).")
            except Exception as exc:
                print(f"[FloraNet RAG] Index persistence skipped ({exc}).")
        else:
            self.index = None
            self.index_mode = "keyword"
            print(f"[FloraNet RAG] Embeddings unavailable — using TF-IDF keyword retrieval "
                  f"over {len(texts)} chunks.")

    # ──────────────────────────────────────────────────────────────────────────
    @staticmethod
    def _keyword_search(query: str, texts: List[str], top_k: int) -> List[int]:
        """Deterministic TF-IDF cosine ranking — the no-model fallback."""
        import re
        from math import log, sqrt

        def tokenize(text: str) -> List[str]:
            return [w for w in re.findall(r"[a-z]{3,}", text.lower())]

        doc_tokens = [tokenize(t) for t in texts]
        n_docs = len(texts)
        df: dict[str, int] = {}
        for tokens in doc_tokens:
            for term in set(tokens):
                df[term] = df.get(term, 0) + 1

        def tfidf(tokens: List[str]) -> dict[str, float]:
            counts: dict[str, float] = {}
            for tok in tokens:
                counts[tok] = counts.get(tok, 0.0) + 1.0
            return {
                term: (1.0 + log(freq)) * log(n_docs / df[term])
                for term, freq in counts.items()
                if term in df
            }

        q_vec = tfidf(tokenize(query))
        if not q_vec:
            return list(range(min(top_k, n_docs)))

        scores: List[tuple[float, int]] = []
        for i, tokens in enumerate(doc_tokens):
            d_vec = tfidf(tokens)
            dot = sum(w * d_vec.get(t, 0.0) for t, w in q_vec.items())
            q_norm = sqrt(sum(w * w for w in q_vec.values())) or 1.0
            d_norm = sqrt(sum(w * w for w in d_vec.values())) or 1.0
            scores.append((dot / (q_norm * d_norm), i))

        scores.sort(reverse=True)
        return [i for _, i in scores[:top_k]]

    # ──────────────────────────────────────────────────────────────────────────
    def retrieve_context(self, query: str, top_k: int = 3) -> tuple[str, List[dict]]:
        """
        Retrieve top-k most relevant knowledge chunks for a query.
        Returns: (concatenated_context_string, list_of_source_metadata)
        """
        if not self.documents:
            return "No local RAG context available.", []

        if self.index is not None:
            q_emb = llm.embed_texts([query])
            if q_emb is not None:
                _, indices = self.index.search(q_emb, min(top_k, len(self.documents)))
                order = [int(i) for i in indices[0] if 0 <= i < len(self.documents)]
            else:
                order = self._keyword_search(query, self.documents, top_k)
        else:
            order = self._keyword_search(query, self.documents, top_k)

        retrieved = [self.documents[i] for i in order]
        sources = [self.metadata[i] for i in order]
        return "\n\n---\n\n".join(retrieved), sources

    # ──────────────────────────────────────────────────────────────────────────
    def status(self) -> dict:
        """Diagnostics for /healthz-style probes. Never raises."""
        st_model = llm.get_embedder() is not None
        return {
            "chunks": len(self.documents),
            "mode": self.index_mode,
            "persisted": os.path.exists(INDEX_FILE),
            "embedding_model": (
                llm.EMBEDDING_MODEL_NAME if st_model else f"ollama:{llm.OLLAMA_EMBED_MODEL}"
            ),
        }

    # ──────────────────────────────────────────────────────────────────────────
    async def get_soil_advisory(
        self,
        lat: float,
        lng: float,
        soil_type: str = "unknown",
        current_crop: str = "unknown",
        country: str = "India",
    ) -> dict:
        """
        Full local RAG pipeline:
        1. Fetch live Open-Meteo soil moisture for lat/lng
        2. Retrieve BRICS knowledge context
        3. Generate a 3-year crop rotation plan with SOC targets on the
           local open-weights model
        Returns structured advisory JSON.
        """
        # 1) Live soil moisture from Open-Meteo
        live_moisture = None
        try:
            async with httpx.AsyncClient(timeout=6.0) as client:
                r = await client.get(
                    "https://api.open-meteo.com/v1/forecast",
                    params={
                        "latitude": lat,
                        "longitude": lng,
                        "hourly": "soil_moisture_0_to_1cm,soil_temperature_0cm",
                        "forecast_days": 1,
                    },
                )
                data = r.json()
                sm = data.get("hourly", {}).get("soil_moisture_0_to_1cm", [])
                st = data.get("hourly", {}).get("soil_temperature_0cm", [])
                live_moisture = {
                    "moisture_pct": round((sm[0] if sm else None) * 100, 1) if sm else None,
                    "temp_c": round(st[0], 1) if st else None,
                    "available": bool(sm or st),
                }
        except Exception as e:
            print(f"[FloraNet RAG] Open-Meteo fetch error: {e}")
            live_moisture = {"moisture_pct": None, "temp_c": None, "available": False}

        # 2) RAG retrieval — top-2 keeps the local-model prompt compact; the full
        # corpus is only 5 institutional protocols + local knowledge files.
        query = f"{country} {soil_type} {current_crop} crop rotation soil carbon regenerative agriculture"
        context, sources = self.retrieve_context(query, top_k=2)
        source_names = [s.get("source", "") for s in sources]

        if not llm.is_available():
            # No local model: return real live-soil data with an explicit "no AI
            # plan" flag instead of a fabricated rotation plan.
            return {
                "advisory_id": f"fln-{lat:.2f}-{lng:.2f}",
                "location": {"lat": lat, "lng": lng, "country": country},
                "soil_profile": {"type": soil_type, **live_moisture},
                "rotation_plan": [],
                "pest_management": "",
                "water_advisory": "",
                "sources": source_names,
                "live_data": live_moisture,
                "_note": "Local model server (Ollama) not reachable — live soil readings above are real; rotation plan requires AI generation and is omitted.",
            }

        # 3) Structured generation via the local model gateway
        prompt = f"""You are FloraNet's Senior Agronomist AI, specializing in BRICS regenerative agriculture.

FARMER CONTEXT:
- Location: Latitude {lat:.4f}, Longitude {lng:.4f}
- Country: {country}
- Soil Type: {soil_type}
- Current Crop: {current_crop}
- Live Soil Moisture: {live_moisture['moisture_pct']}% (Open-Meteo API)
- Soil Temperature: {live_moisture['temp_c']}°C

VERIFIED AGRICULTURAL KNOWLEDGE (ICAR / Embrapa / ARC / CAAS / VNIIEA):
{context}

TASK:
Generate a practical, science-backed 3-Year Crop Rotation Plan to:
1. Maximize Soil Organic Carbon (SOC) buildup
2. Break pest and disease cycles
3. Reduce synthetic fertilizer costs by >=30%
4. Provide estimated carbon credit earnings (t CO2e/acre/year)

Ground every recommendation in the knowledge base above and set "sources"
to the institutions you actually used. The advisory_id must be
"fln-{lat:.2f}-{lng:.2f}"."
"""

        try:
            advisory = llm.generate_json(
                prompt,
                schema=SoilAdvisory,
                system="You are a precise agronomy assistant. Respond with valid JSON only.",
                temperature=0.2,
            )
            return advisory.model_dump()
        except llm.LLMUnavailableError as e:
            print(f"[FloraNet RAG] Local model generation error: {e}")
            return {
                "advisory_id": f"fln-{lat:.2f}-{lng:.2f}",
                "location": {"lat": lat, "lng": lng, "country": country},
                "soil_profile": {"type": soil_type, **live_moisture},
                "rotation_plan": [],
                "pest_management": "",
                "water_advisory": "",
                "sources": source_names,
                "live_data": live_moisture,
                "_note": f"Local model generation failed ({e}) — live soil readings above are real; rotation plan omitted rather than fabricated.",
            }
        except Exception as e:
            # Schema validation failure etc. — surface honestly.
            return {"error": str(e), "location": {"lat": lat, "lng": lng}}


# ──────────────────────────────────────────────────────────────────────────────
# Singleton — imported by the soil advisory router
# ──────────────────────────────────────────────────────────────────────────────
rag_service = FloraNetRAG()
