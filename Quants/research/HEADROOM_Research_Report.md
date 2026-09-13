# HEADROOM — Grid-Interactive, Goodput-Aware Control of AI Clusters

**A research investigation and 9-month project definition for AI data-center optimization**
*Prepared as of September 2026 · Calibrated for a 3rd-year CSE student (solo or 2-person team, laptop/Colab-scale, public data only)*

---

## 0. Executive summary (read this first)

**The one-sentence project:** *When the power grid tells an AI data center "cut 25% for the next three hours" — or when electricity prices spike, or a cooling loop is losing capacity — which training jobs should slow down, which should pause, how many inference replicas should stay up, and how warm can the coolant run, so that the cluster loses the least money and breaks the fewest promises?*

**Why this is the strongest opportunity in 2026:**

1. **Power, not GPUs, is the binding constraint on AI growth.** Grid interconnection takes 2–7 years; PJM's December 2025 capacity auction cleared at the $333/MW-day price cap and fell 6.6 GW short of its reliability target, with data centers driving 94% of load growth; ERCOT's large-load queue grew from 63 GW to 226 GW in one year; roughly half of planned 2026 US data-center capacity is delayed by transformer and switchgear lead times of 2–5 years.
2. **Flexibility is the fastest path to power.** Duke's *Rethinking Load Growth* study showed the existing US grid can absorb 76–126 GW of new load if it is curtailable 0.25–1% of hours. Google has now contracted 1 GW of data-center demand response with five utilities; Texas SB6 makes curtailment *mandatory* for ≥75 MW loads; EPRI's DCFlex runs nine demonstration sites; NVIDIA shipped DSX Flex and rack-level power smoothing in GB300; Emerald AI's Phoenix demo (25% reduction for 3 h on 256 GPUs) was published in *Nature Energy*.
3. **The industry has proven the concept but not the optimization.** Every public system (Google VCCs, Emerald Conductor, nvPAX, TAPAS, Perseus) solves *one slice*: batch shifting, or rule-based throttling, or fair power capping, or inference thermal placement, or per-job energy bloat. **No open system decides, jointly and optimally, how to split a power reduction across training goodput, inference SLOs, cooling setpoints and energy storage, at a stated price, under thermal and ramp-rate constraints, with forecasts.** That gap is small enough to close in nine months and large enough to matter.

**The chosen project — HEADROOM** — is a *hierarchical model-predictive controller* backed by a *trace-driven digital twin*. It turns three published curves (Perseus's job time-vs-energy frontier, POLCA/TAPAS's inference power-vs-load curve, and a lumped thermal model of a liquid-cooled rack) into a mixed-integer program that is re-solved every five minutes, fed by probabilistic forecasts of inference demand and electricity prices. It is evaluated on public traces (Azure LLM inference 2023/2024, Alibaba PAI, Shanghai AI Lab Acme, Philly), public prices (ERCOT/PJM/CAISO), public weather, and a public 0.1-second H100 power-profile dataset. Everything runs on a laptop; a free MILP solver (HiGHS) solves each step in seconds.

**Why professors will understand and like it:** it uses discrete-event simulation (OS/networks), mixed-integer programming (optimization/OR), forecasting with gradient boosting (ML), model-predictive control (control systems), and cost modelling (economics) — every piece is a standard undergraduate concept, assembled into a genuinely open research problem with a live demo where you press "grid emergency" and watch the controller respond.

**Reading map:** Parts 1–5 are the investigation (papers, industry, 28 problems, the coupled problem, the research-to-problem matrix). Parts 6–9 generate, score, attack and pick the project. Parts 10–15 and the Final Output specify it completely (math, ML, twin, evaluation, architecture, 9-month plan, stack, paper, demo).

---

## PART 1 — THE FIVE STRONGEST RESEARCH PAPERS

### 1.1 How the longlist was screened

Thirty candidate papers across the requested areas were scored on the eleven criteria (significance, depth, evidence, industry relevance, novelty, reproducibility, influence, current relevance, hyperscale applicability, unresolved limitations, extensibility). Citation count was deliberately *not* a criterion. The longlist, with the reason each was or was not selected:

| # | Paper (venue, year) | Area | Verdict |
|---|---|---|---|
| 1 | Pollux — Qiao et al. (OSDI 2021, best paper) | GPU scheduling / goodput | **Selected (#2)** |
| 2 | Perseus — Chung et al. (SOSP 2024) | Training energy | **Selected (#1)** |
| 3 | TAPAS — Stojkovic et al. (ASPLOS 2025) | Inference thermal/power | **Selected (#3)** |
| 4 | Carbon-Aware Computing for Datacenters — Radovanović et al. (IEEE TPS 2023; arXiv 2021) | Grid/carbon-aware load shaping | **Selected (#4)** |
| 5 | Revisiting Reliability in Large-Scale ML Research Clusters — Kokolis et al. (HPCA 2025) | Reliability | **Selected (#5)** |
| 6 | Sia — Jayaram Subramanya et al. (SOSP 2023) | Heterogeneity-aware goodput scheduling | Runner-up; direct descendant of Pollux |
| 7 | Zeus — You et al. (NSDI 2023) | GPU energy/DVFS | Runner-up; precursor to Perseus |
| 8 | POLCA — Patel et al. (ASPLOS 2024) | Power oversubscription for LLMs | Runner-up; complementary to TAPAS |
| 9 | DynamoLLM — Stojkovic et al. (HPCA 2025) | Inference energy management | Runner-up; same group as TAPAS |
| 10 | Power Stabilization for AI Training Datacenters — Microsoft/OpenAI/NVIDIA (arXiv 2508.14318, 2025) | Fast power oscillation | Industry problem statement; not a full research evaluation |
| 11 | Turning AI Data Centers into Grid-Interactive Assets — Emerald AI et al. (Nature Energy; arXiv 2507.00909) | Field demo of flexibility | Excellent evidence, limited method disclosure |
| 12 | Data center cooling using MPC — Lazic et al. (NeurIPS 2018) | Cooling control | Foundational for the thermal layer; older |
| 13 | Characterization of LLM Development in the Datacenter — Hu et al. (NSDI 2024) | Workload/failure characterization | Key *data source* (Acme traces) |
| 14 | MegaScale — Jiang et al. (NSDI 2024) | 10k-GPU training systems | Systems engineering; less optimization |
| 15 | Splitwise — Patel et al. (ISCA 2024) | Inference disaggregation | Released Azure traces |
| 16 | DistServe — Zhong et al. (OSDI 2024) | Prefill/decode disaggregation | Heavily built upon; crowded |
| 17 | Mooncake — Qin et al. (FAST 2025, best paper) | KV-cache-centric serving | Crowded area |
| 18 | Aegaeon — Alibaba (SOSP 2025) | Token-level GPU pooling (82% GPU reduction) | Strong; inference-only |
| 19 | Llumnix — Sun et al. (OSDI 2024) | Inference request scheduling | Crowded |
| 20 | Gavel — Narayanan et al. (OSDI 2020) | Heterogeneity-aware scheduling | Superseded by Sia |
| 21 | Tiresias — Gu et al. (NSDI 2019) | DL job scheduling | Foundational; older |
| 22 | Philly analysis — Jeon et al. (ATC 2019) | Cluster characterization | Data source |
| 23 | RDMA over Ethernet at Meta scale — Gangidi et al. (SIGCOMM 2024) | Training networking | Networking layer reference |
| 24 | Alibaba HPN — Qian et al. (SIGCOMM 2024) | Training network topology | Networking layer reference |
| 25 | Let's Wait Awhile — Wiesner et al. (Middleware 2021) | Carbon-aware shifting | Simpler than Google's |
| 26 | Carbon Explorer — Acun et al. (ASPLOS 2023) | Carbon-aware DC design | Planning-level |
| 27 | Fragmentation Gradient Descent — Weng et al. (ATC 2023) | GPU fragmentation | Narrow |
| 28 | nvPAX — Sivan et al. (arXiv 2605.01837, 2026) | Hierarchical power allocation | Fairness-only, no cost/SLO/thermal |
| 29 | Inference as Flexibility: Ramp Management — Liang (arXiv 2606.21833, 2026) | Ramp control with batch size + BESS | Narrow but directly adjacent |
| 30 | Power-Flexible AI Data Centers — Williams, Colangelo et al. (arXiv 2606.25098, 2026) | Architecture + 130 kW deployment | Architecture paper; no optimization formulation |

### 1.2 The five deep dives

---

#### Paper A — **Perseus: Reducing Energy Bloat in Large Model Training**
- **Authors:** Jae-Won Chung, Yile Gu, Insu Jang, Luoxi Meng, Nikhil Bansal, Mosharaf Chowdhury (University of Michigan)
- **Year / venue:** 2024, ACM SOSP '24 (arXiv 2312.06902)
- **Why it is exceptional:** It reframes energy in training from "a cost you pay for throughput" to "a quantity with a large slack component that can be removed for free". It is the first work to compute the *iteration-time-vs-energy Pareto frontier* of a large hybrid-parallel training job and to exploit it operationally. This frontier is exactly the "supply curve" that any power-flexibility scheme needs.
- **Core research problem:** In pipeline/data-parallel training, many GPUs finish their stage work early and wait (intrinsic bloat from stage imbalance), or run fast while a straggler replica holds everyone back (extrinsic bloat). Energy spent running faster than the critical path is wasted.
- **Mathematical/technical approach:** Model one training iteration as a DAG of forward/backward computations with per-op frequency choices (each op has a time–energy curve from profiling). Finding the minimum-energy assignment for a given iteration deadline is solved with an efficient *graph-cut (min-cut) based algorithm* that iteratively slows the non-critical ops; sweeping the deadline yields the whole frontier. At runtime, Perseus picks the frontier point that matches the current critical path (or the slowest replica).
- **Dataset / environment:** GPT-3 (multiple scales), Bloom, BERT, T5, Wide-ResNet, on A100 GPUs, with emulation for scale; uses the open-source Zeus energy-measurement library.
- **Main result:** Up to **30% training energy reduction with zero throughput loss** and no hardware change; robust across models and parallelism configurations.
- **Major limitation:** Per-job and per-iteration only — it never asks "how should *N* jobs share a *cluster-wide* power budget?", never models time-varying budgets, prices, thermal state or grid events; relies on fine-grained frequency control (per-op) and profiling; results are on A100 (Hopper/Blackwell DVFS behaviour and NVL72 power delivery differ).
- **What industry can actually use:** The frontier concept and the open-source Zeus/Perseus tooling; frontier points are a "power-shedding menu" with known throughput cost — the missing input for demand response.
- **What remains unsolved:** Cluster-level, multi-job, time-varying allocation of power along job frontiers; combining bloat removal with *deliberate* slowdowns during grid events; interaction with checkpointing and failures.
- **2026 extension:** Use each job's frontier as an input curve to a cluster-level MPC that meets a time-varying power envelope at minimum total goodput loss (this is HEADROOM's core mechanism).

---

#### Paper B — **Pollux: Co-adaptive Cluster Scheduling for Goodput-Optimized Deep Learning**
- **Authors:** Aurick Qiao, Sang Keun Choe, Suhas Jayaram Subramanya, Willie Neiswanger, Qirong Ho, Hao Zhang, Gregory R. Ganger, Eric P. Xing (CMU / Petuum)
- **Year / venue:** 2021, USENIX OSDI '21 (Jay Lepreau Best Paper Award)
- **Why it is exceptional:** It invented the metric everyone now uses to reason about DL cluster efficiency — **goodput = system throughput × statistical efficiency** — and showed that scheduler and job must co-adapt. Reproducible (open-source AdaptDL + simulator), rigorous (statistical efficiency derived from gradient noise scale), and influential (Sia, Alibaba/ByteDance elastic training, many follow-ons).
- **Core research problem:** Cluster schedulers allocate GPUs without knowing whether a job can *use* them; jobs pick batch sizes without knowing what the cluster can *give*. The result is low real progress per GPU-hour.
- **Mathematical/technical approach:** Throughput model fitted online (compute time + synchronization time as a function of #GPUs and per-GPU batch); statistical-efficiency model from the pre-conditioned gradient noise scale (PGNS); per-job goodput surface; cluster-level allocation via a genetic-algorithm search that maximizes aggregate (fairness-weighted) goodput with re-allocation costs.
- **Dataset / environment:** 64-GPU AWS testbed plus a discrete-event simulator driven by a Microsoft Philly-derived workload.
- **Main result:** **37–50% average JCT reduction** versus Tiresias/Optimus, plus lower energy, without hyper-parameter tuning by users.
- **Major limitation:** Requires jobs to tolerate batch-size/learning-rate co-adaptation (not universally true for frontier LLM pre-training recipes); data-parallel only (Sia adds hybrid parallelism and heterogeneity); ignores power, thermal, network topology, and reliability entirely.
- **What industry can actually use:** Goodput as the objective for any allocation decision; the simulator methodology; AdaptDL.
- **What remains unsolved:** Goodput under *power-constrained* allocation ("goodput per watt"), and the coupling between allocation, DVFS, and communication contention.
- **2026 extension:** Treat GPU power level as an allocation dimension alongside GPU count; maximize goodput subject to a power envelope; extend the statistical-efficiency model to post-training/RL workloads that dominate 2026 clusters.

---

#### Paper C — **TAPAS: Thermal- and Power-Aware Scheduling for LLM Inference in Cloud Platforms**
- **Authors:** Jovan Stojkovic, Chaojie Zhang, Íñigo Goiri, Esha Choukse, Haoran Qiu, Rodrigo Fonseca, Josep Torrellas, Ricardo Bianchini (UIUC / Microsoft Azure Research)
- **Year / venue:** 2025, ACM ASPLOS '25 (arXiv 2501.02600)
- **Why it is exceptional:** First paper to treat thermal and power headroom as *schedulable resources* for LLM inference at cloud scale, with real production telemetry. It exploits the millisecond-scale prefill (compute-bound, hot) versus decode (memory-bound, cooler) phases and configuration knobs (parallelism, quantization, model variant) to place workloads so that cooling and power infrastructure can be oversubscribed safely, and to survive cooling/power emergencies.
- **Core research problem:** Legacy thermal/power management (rack-level caps, reactive throttling) is blind to LLM inference phases and configurations; it either wastes infrastructure headroom or throttles at the wrong moment.
- **Mathematical/technical approach:** Historical temperature and power trend models per server/rack; phase-aware power/thermal profiles per configuration; a placement/scaling policy that selects placements and configurations to keep peak temperature and power under limits; emergency handlers that reconfigure (e.g., lower parallelism/quantize) instead of shedding.
- **Dataset / environment:** Azure production LLM inference traces plus a real GPU rack testbed with thermal telemetry; large-cluster simulation.
- **Main result:** Materially reduces peak temperatures and thermal/power throttling events and enables higher oversubscription (more inference capacity per unit of cooling and power); handles cooling/power failures with far fewer SLO violations than reactive baselines (per the paper).
- **Major limitation:** Inference-only (no training jobs, whose power behaviour is very different); air-cooled server model, not liquid-cooled NVL72-class racks; static infrastructure limits — no time-varying grid signals, prices, or explicit dollar objective; relies on proprietary telemetry.
- **What industry can actually use:** Phase-aware power modelling of inference; configuration downgrades as an emergency lever; oversubscription sizing.
- **What remains unsolved:** Unified control of training + inference under a shared, time-varying, priced power/thermal envelope; liquid-cooling dynamics; market participation.
- **2026 extension:** Fold TAPAS-style inference power curves into a cluster-wide MPC with training jobs and a thermal RC model of liquid-cooled racks; replace static limits with grid-driven envelopes.

---

#### Paper D — **Carbon-Aware Computing for Datacenters**
- **Authors:** Ana Radovanović, Ross Koningstein, Ian Schneider, Bokan Chen, Alexandre Duarte, Binz Roy, Diyue Xiao, Maya Haridasan, Patrick Hung, Nick Care, Saurav Talukdar, Eric Mullen, Kendal Smith, MariEllen Cottman, Walfredo Cirne (Google)
- **Year / venue:** IEEE Transactions on Power Systems 38(2), 2023 (arXiv 2106.11750, 2021)
- **Why it is exceptional:** The only peer-reviewed description of a *fleet-wide, production* system that shapes data-center load in response to an external grid signal, running continuously since 2020. It defines the cleanest interface between grid and scheduler ever published: the **Virtual Capacity Curve (VCC)** — an hourly cap on capacity available to temporally flexible work, preserving daily totals.
- **Core research problem:** How to shift flexible compute toward low-carbon (and low-cost) hours without violating job deadlines, capacity limits, or reliability, across hundreds of heterogeneous clusters.
- **Mathematical/technical approach:** Day-ahead carbon-intensity forecasts (from Electricity Maps), day-ahead per-cluster demand forecasts (flexible vs inflexible), and a *risk-aware optimization* that computes VCCs minimizing carbon and infrastructure cost subject to serving all flexible work within the day; the cluster manager (Borg) enforces the VCC.
- **Dataset / environment:** Google's global fleet; measured production impact.
- **Main result:** Demonstrated fleet-wide shifting of flexible load away from carbon-intensive hours (several percent of hourly power) with no SLO impact; established the day-ahead VCC pattern later reused for demand response.
- **Major limitation:** Day-ahead, hourly granularity only; treats workloads as opaque "capacity" with no performance model (no goodput cost); only batch/flexible workloads (no inference, no training-specific power levers such as DVFS); nothing about thermal state; unpublished optimizer details.
- **What industry can actually use:** The VCC abstraction as a contract between energy team and scheduler; the forecasting pipeline design.
- **What remains unsolved:** Intra-hour and event-driven response; explicit goodput/SLO pricing of flexibility; GPU-specific levers.
- **2026 extension:** Replace hourly VCCs with 5-minute power envelopes computed by an MPC that knows each job's power–throughput curve and each service's SLO — Google's own 2025–2026 demand-response deals are the demand for exactly this.

---

#### Paper E — **Revisiting Reliability in Large-Scale Machine Learning Research Clusters**
- **Authors:** Apostolos Kokolis, Michael Kuchnik, John Hoffman, Adithya Kumar, Parth Malani, Faye Ma, Zachary DeVito, Shubho Sengupta, Kalyan Saladi, Carole-Jean Wu (Meta)
- **Year / venue:** 2025, IEEE HPCA '25 (arXiv 2410.21680, 2024)
- **Why it is exceptional:** Eleven months of failure data from two multi-tenant research clusters (tens of thousands of GPUs), a failure taxonomy, and two metrics that make reliability *optimizable*: **MTTF as a function of job size** and **Effective Training Time Ratio (ETTR)**. It is the quantitative backbone for any simulator that claims to model failures realistically.
- **Core research problem:** As jobs grow, failures dominate wall-clock; without a taxonomy and metrics, systems cannot decide where to invest (checkpointing, spares, "lemon" node detection).
- **Mathematical/technical approach:** Empirical hazard analysis by failure class (GPU Xid, HBM, NVLink, network, host, software); MTTF scaling with #GPUs (approximately inverse); ETTR modelling from restart cost, checkpoint interval, and failure rate; identification of "lemon" nodes that cause disproportionate failures.
- **Dataset / environment:** Meta RSC clusters; corroborated by the Llama 3 paper (419 unexpected interruptions in 54 days on 16,384 H100s — one every ~3 hours; 58.7% GPU-related, including 17.2% HBM3).
- **Main result:** Large jobs are the most vulnerable but small jobs dominate the job count and must be in the objective; ETTR near 0.9 is achievable for the largest jobs with fast checkpointing plus lemon detection; a small fraction of nodes causes a large fraction of failures.
- **Major limitation:** Proprietary data; A100-era hardware; no link between reliability and *power/thermal management* decisions (e.g., whether throttling or power cycling changes hazard rates); no optimization, only characterization.
- **What industry can actually use:** The metrics (MTTF(n), ETTR), the taxonomy, and lemon detection.
- **What remains unsolved:** Joint optimization of checkpoint interval, spare capacity and power management; whether flexibility actions (suspend/resume, DVFS) affect failure hazard.
- **2026 extension:** Parametrize a simulator's failure process from these numbers and add reliability constraints (max power-mode switches, no throttling of suspect nodes, checkpoint-before-suspend) to a flexibility controller.

### 1.3 Ranking and rationale

| Rank | Paper | Rationale |
|---|---|---|
| **#1** | **Perseus (SOSP '24)** | Provides the single most reusable mathematical object for 2026's binding constraint (power): the job-level time–energy frontier. Fully open-source, reproducible, model-agnostic, and its central limitation (per-job only) is exactly the gap a new project can fill. |
| **#2** | **Pollux (OSDI '21)** | Defines the objective (goodput) that turns "slow the job down" into a measurable cost; best-paper rigor; open simulator methodology that a student can replicate. Older, and blind to power/thermal — but foundational. |
| **#3** | **TAPAS (ASPLOS '25)** | Most current, most industry-embedded, and the only one coupling *thermal* and *power* with LLM inference phases; limited to inference and proprietary telemetry. |
| **#4** | **Google Carbon-Aware Computing (TPS '23)** | The proof that grid-aware load shaping works at fleet scale, and the cleanest interface (VCC); ranked below the others because the method is coarse (hourly, opaque workloads) and details are undisclosed. |
| **#5** | **Meta Reliability (HPCA '25)** | Indispensable for realism (failure rates, ETTR) but a characterization paper with no optimization contribution; ranked fifth for that reason, not for lack of quality. |

**Why this set:** together they span the four coupled dimensions the final project must control — *training power ↔ throughput* (A, B), *inference power ↔ thermal ↔ SLO* (C), *grid signal ↔ scheduler* (D), and *reliability* (E) — and each leaves precisely the gap that a unified controller closes.

