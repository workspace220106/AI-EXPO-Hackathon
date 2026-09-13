
---

## PART 2 — BEYOND THE PAPERS: THE INDUSTRY IN SEPTEMBER 2026

Primary and near-primary sources were used wherever available (DOE/LBNL, IEA, PJM, ERCOT/PUCT, EPRI, Uptime Institute, NVIDIA, Google, Microsoft, Meta, arXiv, Nature Energy). Trade-press figures are marked as such.

### 2.1 Electricity demand: the macro numbers
- **United States (LBNL/DOE, Dec 2024):** data centers used **176 TWh in 2023 (4.4% of US electricity)**, projected **325–580 TWh by 2028 (6.7–12%)**; CAGR 13–27% for 2023–2028, up from 7% in 2014–2018.
- **Global (IEA, *Energy and AI* 2025 and 2026 update):** **415 TWh in 2024 (~1.5%)**, **~485 TWh in 2025**, heading to **~950 TWh by 2030 (~3%)** and ~1,200 TWh by 2035; AI-focused data-center consumption grew **~50% in 2025** and roughly triples by 2030. Per-task energy is falling by an order of magnitude per year — total demand grows anyway because volume grows faster.

### 2.2 The grid is the bottleneck
- **Interconnection:** securing grid power for a new site takes **24–72 months**, **5–7 years** in constrained regions; PJM's average from application to commercial operation has risen from under two years (2008) to **over eight years (2025)**. LBNL's 2025 queue report counts **2,061 GW** of generation/storage waiting nationwide.
- **ERCOT:** the large-load interconnection queue went from **63 GW to 226 GW in one year**.
- **PJM capacity market:** the **2027/28 auction (Dec 2025) cleared at the FERC-approved cap of $333.44/MW-day** and **fell 6,623–6,625 MW short of the reliability requirement** (14.8% reserve margin vs ~20% target) — the first shortfall in PJM history; **data centers account for 94% of projected load growth**. Capacity prices have risen ~10× in two auctions.
- **2026 construction slippage:** of ~12–16 GW of US capacity planned for 2026, only one-third to 5 GW is in active construction; analysts expect **30–50% to slip** to 2027+. **Large power transformer lead times are 2–5 years; medium-voltage switchgear is effectively sold out through 2028; gas turbines have up to 7-year waits.** Hyperscalers are responding with dedicated generation (e.g., the 2.5 GW Chevron–Microsoft Pecos plant, Brookfield partnerships) and behind-the-meter turbines.

### 2.3 Regulation is turning flexibility from "nice to have" into "mandatory"
- **Texas SB6 (signed June 2025; rules in 2026):** loads ≥75 MW must disclose, pay interconnection costs, and **curtail or switch to backup during grid emergencies**; loads energized after **31 Dec 2025 must install remote-disconnect equipment**; ERCOT must create a **voluntary, competitively procured large-load demand-response service with ≥24 h notice**; PUCT adopted 16 TAC §25.205 on **26 Mar 2026** and ruled on 24 Jul 2026 (Docket 59220) that curtailment obligations for co-located loads are *not* capped by the paired generator's capacity.
- **Alberta (AESO)** has classified large AI facilities as *non-conforming loads* requiring ramp-rate limits (cited in arXiv 2606.21833).
- **Water:** more than 200 state bills on data centers were introduced in 2025 (40+ enacted); several states (California, Iowa, Michigan) are moving to mandatory water reporting and some (South Carolina, Kansas) toward closed-loop cooling mandates; EPA released WRAP 2.0 in April 2026.

### 2.4 Flexibility has moved from research to contracts
- **Duke Nicholas Institute, *Rethinking Load Growth* (Feb 2025):** the largest 22 US balancing authorities could host **76 GW (0.25% curtailment), 98 GW (0.5%), 126 GW (1%)** of new flexible load with no new generation; PJM alone 18 GW at 0.5%.
- **Google:** first ML-workload demand-response contracts with **Indiana Michigan Power and TVA (Aug 2025)**, now **1 GW of DR capacity across five utilities** (adding Entergy Arkansas, Minnesota Power, DTE) — Google *pauses or reschedules* ML training when asked, but says inference/Search/Cloud tiers have hard limits on flexibility.
- **Emerald AI (NVIDIA-backed):** Phoenix demo with Oracle Cloud, NVIDIA, Salt River Project and EPRI — a **256-GPU A100 cluster cut power 25% for 3 hours** with a 15-minute ramp and no QoS violations; published in **Nature Energy** (arXiv 2507.00909). A 2026 architecture paper (arXiv 2606.25098, 18 authors) reports a **130 kW cluster deployment** with rapid curtailment, sustained curtailment, carbon-aware operation and cross-cluster shifting. A commercial multi-MW pilot with **Silicon Valley Power** (58 data centers in 20 sq mi) is under way.
- **EPRI DCFlex:** expanded to **nine demonstration sites** (US + Europe) on 2 Feb 2026; launched the **Flex MOSAIC** framework to define flexibility by magnitude, timing, duration and frequency; the **96 MW "Aurora AI Factory" in Manassas, VA** (EPRI, NVIDIA, Emerald AI, Digital Realty) targets late-2026 commissioning as a data center *designed for flexibility*.
- **NVIDIA DSX (GTC Washington, Oct 2025; GA on build.nvidia.com):** *Omniverse DSX* digital-twin blueprint for gigawatt AI factories; **DSX Flex** (grid collaboration, "~100 GW of underutilized capacity" claim, integrated with Emerald Conductor) and **DSX Boost** ("up to 30% more GPU throughput at the same power").
- **Academic 2026:** "To Defer or To Shift?" (arXiv 2604.05376) finds flexible AI loads cut grid investment/operating cost **3–21%** with diminishing returns on longer deferral; "When Market Prices Drive the Load" (arXiv 2604.06924) warns that price-chasing data centers can *create* grid-security problems — a caution that any controller must include ramp and coordination constraints.

### 2.5 Power quality: the sub-second problem
- **Microsoft/OpenAI/NVIDIA, *Power Stabilization for AI Training Datacenters* (arXiv 2508.14318, Aug 2025):** synchronous training alternates compute-heavy and communication-heavy phases, producing large periodic power swings; the swing *spectrum* can align with grid-critical frequencies and physically damage infrastructure. Mitigations span software ("fake work"/power floors), GPU firmware, and rack energy storage.
- **NVIDIA GB300 NVL72 (2025–26):** power shelves with electrolytic capacitors (**~65 J per GPU**), a **power-cap ramp** at workload start, energy-storage smoothing in steady state, and a **"power burner" ramp-down mode**; NVIDIA reports **~30% lower grid-facing peaks** for identical training versus GB200.
- **"Inference as Flexibility" (arXiv 2606.21833):** for a 150 MW site under a 10 MW/min ramp limit, using inference batch-size modulation alongside a battery cut BESS discharge energy **71%** and peak discharge power **51%**.

### 2.6 GPUs: supply, prices, utilization
- **Utilization:** Cast AI's 2026 report over ~23,000 Kubernetes clusters (AWS/GCP/Azure) finds **GPU utilization ~5%** in non-optimized clusters (CPU 8%, memory 20%); a VentureBeat survey of 573 technical leaders finds **86% of enterprises run own GPU infrastructure at ≤50% utilization**; independent analyses put typical enterprise AI clusters at 30–50%.
- **Prices (Sept 2026, trade data):** H100 rentals **$1.4–3.5/GPU-h** on marketplaces, **$11–12/h** on hyperscaler on-demand; B200 list **$3.5–14/h**, spot ≈ **$5.66/h (Aug 2026)**; cloud H200 prices rose ~15% in 2026 — the first broad *increase* in compute pricing in two decades; inference cost per token fell ~10×/year through 2025, expected to slow to 3–5×/year.
- **Serving efficiency:** Alibaba's **Aegaeon (SOSP 2025)** cut GPUs for its model marketplace from **1,192 to 213 (–82%)** via token-level pooling; NVIDIA claims DSX Boost adds 30% throughput per watt. Memory is the new wall: HBM supply is constrained, KV-cache growth for long contexts is pushing CXL-attached KV-cache tiers (announced at GTC 2026).

### 2.7 Density, cooling, water
- **Racks:** GB200/GB300 NVL72 at **~120–140 kW**; **Vera Rubin NVL144 (2H 2026) ~120–130 kW**, same Oberon rack; **Rubin Ultra "Kyber" 600 kW racks in 2027**, fully liquid-cooled, two-phase, with a power/cooling sidecar; megawatt racks expected before 2030.
- **Uptime Institute 2026 survey (1,600+ respondents, released 29 Jul 2026):** **19% have adopted liquid cooling; 36% plan to within 12–24 months**; PUE improvement has **stalled**; **47%** of operators had an impactful outage in the past three years; one in ten outages is serious/severe; recruiting/retention pressure persists.
- **Water:** Google used **10.9 billion gallons in 2025 (+34% YoY)**; AWS fleet WUE **0.12 L/kWh**, Microsoft **0.30**; LBNL projects US aggregate site WUE rising to **0.45–0.48 L/kWh by 2028** even as the newest closed-loop liquid designs approach zero. NVIDIA DSX runs **45 °C inlet coolant** to avoid chillers year-round — which is exactly the thermal-vs-energy knob a controller can exploit. Trade-offs are real: less water often means more energy (dry coolers) unless warm-water cooling is used.

### 2.8 Reliability at scale
- **Llama 3 (Meta, 2024):** 466 interruptions in 54 days on 16,384 H100s, **419 unexpected (~1 per 3 h)**; 58.7% GPU-related (30.1% GPU/NVLink, 17.2% HBM3); only 2 CPU failures.
- **Meta HPCA 2025:** MTTF shrinks roughly with 1/#GPUs; "lemon" nodes; ETTR as the metric. **2026 follow-ons:** SPARe (fault-tolerant pretraining for 100k+ GPUs, arXiv 2603.00357) and an operational analysis of pre-training on 504 GPUs (arXiv 2605.09370) confirm the pattern on Hopper/Blackwell.

### 2.9 Networking and memory
- Meta's RoCE-based backend fabrics (SIGCOMM 2024) and Alibaba HPN show that collective traffic is bursty and congestion-prone at scale; Ultra Ethernet 1.0 (2025) is being adopted; rail-optimized Clos topologies remain standard. Co-packaged optics arrive with Feynman (2028). For a cluster controller the practical implication is simple: *moving or resizing jobs has a network cost that must be modelled at least coarsely.*

### 2.10 Public data now available (critical for a student project)
| Dataset | Content | Use in project |
|---|---|---|
| **Azure LLM Inference Traces 2023 & 2024** (Splitwise/DynamoLLM) | Per-request timestamps, context/generated tokens, for multiple services | Inference demand & load profiles |
| **Alibaba PAI GPU traces (2020, 2023)** | Training+inference jobs, GPU requests, durations | Training job arrival/size distributions |
| **Shanghai AI Lab Acme traces (NSDI 2024)** | 6 months, 4,704 A100s, LLM dev jobs, failures | LLM workload mix, failure logs |
| **Microsoft Philly (ATC 2019)** | DL job traces | Historical baseline |
| **NLR H100 power profiles (arXiv 2604.07345, 2026)** | **0.1 s power measurements** for training, fine-tuning, inference (MLCommons/vLLM) | Per-job power waveforms; fast-timescale realism |
| **Zeus / Perseus repos (ml.energy)** | Frequency–power–throughput measurements | Job time–energy frontiers |
| **gridstatus / ISO APIs** (ERCOT, PJM, CAISO, MISO) | 5-min & day-ahead LMPs, load, DR event histories | Prices, events |
| **Electricity Maps / WattTime** (free tiers) | Hourly carbon intensity | Carbon metric |
| **NOAA ISD / Open-Meteo** | Hourly weather | Cooling COP, free-cooling hours |
| **Utility tariffs (public)** | Demand charges, 4CP, ERS/ELRP rules | Cost model |

**Bottom line of Part 2:** every dimension the prompt lists — GPU shortage, low utilization, power/grid constraints, cooling density, water, reliability, memory/network — now *meets* at one operational question: **how does a cluster deliver a guaranteed, priced amount of power flexibility without wrecking training progress, inference SLOs, thermal margins or hardware health?** The industry is signing contracts for this today with rule-based software.

