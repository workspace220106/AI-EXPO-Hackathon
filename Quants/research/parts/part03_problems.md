
---

## PART 3 — 28 REAL INDUSTRIAL PROBLEMS

Format for each: **Who** · **Economic impact** · **Technical impact** · **Why it exists** · **Current solution** · **Weakness** · **Relevant research** · **Available data** · **AI/ML solution** · **Optimization solution** · **Difficulty / Importance (1–5)** · **9-month prototype feasible?**

### P1. Years-long wait for grid interconnection
- **Who:** hyperscalers, colos (Equinix, Digital Realty), AI labs, neoclouds (CoreWeave, Crusoe).
- **Economic:** 2–7 years of delay on multi-$B sites; capital idle; PJM/ERCOT capacity prices at record highs; ~50% of 2026 US capacity slipping.
- **Technical:** sites sized for peak but running far below it most hours; oversized substations.
- **Why:** utilities plan for firm, inflexible peak load; queue processes are serial; transformers/switchgear scarce.
- **Current solution:** on-site gas turbines, behind-the-meter generation, BESS, "bring your own power", buying existing sites.
- **Weakness:** turbines have 7-year waits and emissions; BESS covers minutes–hours only; none reduce *contractual* peak demand.
- **Research:** Duke *Rethinking Load Growth*; "To Defer or To Shift?" (2604.05376); Google VCCs.
- **Data:** LBNL queue report; ISO queues; Duke curtailment headroom by BA.
- **ML:** forecast when curtailment will be called; predict flexibility a workload mix can deliver.
- **Optimization:** flexible-interconnection contracts (firm + curtailable tranche) sized by a stochastic program over workload and grid scenarios.
- **Difficulty 4 / Importance 5.** **Prototype:** yes — as a planning/backtesting model on public data.

### P2. Mandatory and voluntary curtailment with no workload-aware controller
- **Who:** every ≥75 MW load in ERCOT (SB6), Google's 1 GW DR fleet, DCFlex participants, EU operators facing grid codes.
- **Economic:** DR payments and faster power vs. the cost of slowed training and dropped inference; penalties for non-compliance.
- **Technical:** must shed X MW within 10–30 minutes and hold for hours, verifiably, without violating SLOs or thermal limits.
- **Why:** contracts arrived before software; the levers (job pause, DVFS, replica scaling, cooling setpoints, batteries) live in different teams and tools.
- **Current solution:** rule-based orchestration (Emerald Conductor, DSX Flex), manual playbooks, batteries.
- **Weakness:** rules are not optimal or explainable in cost terms; do not price goodput loss; do not co-optimize thermal/BESS; hard to tune for new workload mixes.
- **Research:** Emerald field demo (Nature Energy); Power-Flexible AI DC architecture (2606.25098); nvPAX; Google VCC.
- **Data:** NLR power profiles; Azure traces; ISO DR event histories; tariffs.
- **ML:** demand and price forecasting; job power–throughput surrogates; thermal identification.
- **Optimization:** hierarchical MPC / MILP with goodput and SLO costs (HEADROOM).
- **Difficulty 4 / Importance 5.** **Prototype:** yes, in simulation with public traces. **← The chosen problem.**

### P3. Grid-destabilizing power oscillations from synchronous training
- **Who:** frontier labs (OpenAI, Meta, xAI), Microsoft, NVIDIA, utilities (AESO ramp limits).
- **Economic:** utilities impose ramp limits or refuse connection; BESS and capacitor banks add capex.
- **Technical:** tens of MW swings at iteration frequency (0.1–10 Hz), harmonic content near grid-critical frequencies.
- **Why:** all-reduce phases idle GPUs simultaneously; larger jobs → larger synchronized swings.
- **Current solution:** GB300 power shelves (65 J/GPU), power-cap ramps, "power burner" mode, software power floors, batteries.
- **Weakness:** wastes energy (fake work), costs capex, does not coordinate across jobs or with inference.
- **Research:** Microsoft/OpenAI/NVIDIA 2508.14318; "Inference as Flexibility" 2606.21833.
- **Data:** NLR 0.1-s power profiles; GB300 documentation.
- **ML:** predict iteration phase timing from telemetry.
- **Optimization:** phase-staggering across jobs; inference batch-size modulation; BESS dispatch with ramp constraints.
- **Difficulty 4 / Importance 4.** **Prototype:** partially (simulation of waveforms; no real rack).

### P4. Enterprise GPU utilization of 5–50%
- **Who:** enterprises, cloud tenants, universities/HPC.
- **Economic:** at $2–3/GPU-h, a 1,000-GPU cluster at 30% utilization wastes ~$12–18M/year.
- **Technical:** reservations idle, fragmentation, data-pipeline stalls, poor bin-packing, no preemption.
- **Why:** organizational (team-owned GPUs), scheduler immaturity, fear of preemption.
- **Current solution:** Kubernetes + Kueue/Volcano/Run:ai, MIG slicing, spot markets, Cast AI-style optimizers.
- **Weakness:** treats symptoms; ignores power/thermal; utilization metrics (SM active) mislead.
- **Research:** Pollux, Sia, FGD (ATC'23), Aegaeon.
- **Data:** Alibaba PAI, Acme, Philly traces; Cast AI report.
- **ML:** job-duration and resource-need prediction; idle-window prediction.
- **Optimization:** goodput-maximizing elastic scheduling with preemption and fragmentation-aware packing.
- **Difficulty 3 / Importance 4.** **Prototype:** yes — but crowded and hard to differentiate.

### P5. Low MFU in large-scale training (stragglers, communication)
- **Who:** AI labs, hyperscalers.
- **Economic:** 10–20 points of MFU on a $1B cluster is ~$100–200M of effective capacity.
- **Technical:** pipeline bubbles, straggler ranks, network incast, thermal throttling variability.
- **Why:** hardware variability, topology mismatch, imperfect parallelism plans.
- **Current solution:** MegaScale-style engineering, Perseus/Zeus, custom collectives, straggler detection (OSDI'25 what-if analysis).
- **Weakness:** per-job tuning; no cluster-level power/thermal coordination.
- **Research:** MegaScale; Perseus; Understanding Stragglers (OSDI 2025).
- **Data:** Acme profiling traces; public benchmarks (MLPerf).
- **ML:** straggler prediction from telemetry.
- **Optimization:** joint placement + parallelism + DVFS planning.
- **Difficulty 5 / Importance 4.** **Prototype:** only partially without a real cluster.

### P6. Hardware failures every few hours at scale
- **Who:** frontier labs, neoclouds, HPC centers.
- **Economic:** lost ETTR (10–20% of wall-clock at 16k GPUs); spare pools; SLAs.
- **Technical:** GPU Xid, HBM ECC, NVLink, optics; restart cost dominated by checkpoint reload and re-warm.
- **Why:** 700–1,400 W parts at thermal limits; immature Blackwell/Rubin firmware; scale.
- **Current solution:** frequent checkpointing, hot spares, lemon-node detection, health checks (SuperBench).
- **Weakness:** static checkpoint intervals; reliability not linked to power/thermal policy.
- **Research:** Meta HPCA'25; Llama 3; SPARe; Gemini (SOSP'23) in-memory checkpoints; Oobleck.
- **Data:** Acme failure logs; Meta published rates.
- **ML:** failure hazard prediction from telemetry.
- **Optimization:** checkpoint-interval and spare-capacity optimization (ETTR-max) under cost.
- **Difficulty 4 / Importance 5.** **Prototype:** yes in simulation (hazard models).

### P7. Thermal transients and hotspots in 120–600 kW liquid-cooled racks
- **Who:** operators deploying NVL72/NVL144, Kyber; colos retrofitting.
- **Economic:** throttling loses throughput; CDU/pump oversizing; outage risk (Uptime: 47% had impactful outages).
- **Technical:** coolant supply temp vs chip temp; pump/CDU failure has seconds-to-minutes thermal runway; GPU-to-GPU variance.
- **Why:** density rose 10× in three years; controls are rack-local and reactive.
- **Current solution:** conservative setpoints, N+1 CDUs, vendor firmware throttling.
- **Weakness:** conservative setpoints waste chiller energy; no coordination with workload.
- **Research:** TAPAS; Lazic MPC cooling; thermal-aware scheduling literature.
- **Data:** ASHRAE guidelines; vendor specs (NVIDIA DSX 45 °C inlet); OCP liquid-cooling specs; public RC-model parameters.
- **ML:** grey-box thermal identification; anomaly detection on CDUs.
- **Optimization:** joint cooling-setpoint + workload placement MPC.
- **Difficulty 4 / Importance 4.** **Prototype:** yes with lumped thermal models; no real rack.

### P8. Cooling energy and PUE stagnation
- **Who:** all operators; Uptime reports PUE gains stalling.
- **Economic:** each 0.05 PUE on a 100 MW site ≈ 5 MW ≈ $3–4M/year.
- **Technical:** chiller COP vs supply temperature; free-cooling hours vs weather; liquid vs air split.
- **Why:** legacy facilities; conservative thermal margins; no workload awareness.
- **Current solution:** warm-water cooling (45 °C), economizers, Google-style MPC/ML cooling control.
- **Weakness:** cooling control is decoupled from what the GPUs are about to do.
- **Research:** Lazic et al. 2018; DeepMind cooling; TAPAS.
- **Data:** NOAA weather; chiller COP curves (public manufacturer data).
- **ML:** cooling-load forecasting from scheduled workload.
- **Optimization:** supply-temperature setpoint optimization coupled with power caps.
- **Difficulty 3 / Importance 3.** **Prototype:** yes (as a sub-model).

### P9. Water consumption and disclosure mandates
- **Who:** hyperscalers (Google 10.9B gal), operators in arid regions, regulators.
- **Economic:** permitting delays ($130B+ of projects delayed/abandoned in Q1 2026 per trade reports); community opposition.
- **Technical:** evaporative cooling saves energy but consumes water; dry/closed-loop saves water but costs energy.
- **Why:** WUE/PUE trade-off is location- and weather-dependent.
- **Current solution:** closed-loop D2C, air-side economizers, reporting.
- **Weakness:** static choices; no hour-by-hour optimization of water vs energy vs carbon.
- **Research:** LBNL WUE projections; ITIF 2026.
- **Data:** Company ESG reports; LBNL; weather.
- **ML:** weather-conditioned water/energy models.
- **Optimization:** multi-objective (water, energy, carbon, cost) cooling-mode scheduling.
- **Difficulty 3 / Importance 3.** **Prototype:** yes as an extension.

### P10. Inference economics: idle capacity in diurnal troughs, cost per token
- **Who:** AI labs, API providers, enterprises self-hosting.
- **Economic:** provisioning for peak leaves 30–60% of inference GPUs idle at night; token prices falling 3–10×/year squeeze margins.
- **Technical:** replica autoscaling lags; cold-start of large models takes minutes; KV-cache memory limits batching.
- **Why:** demand is diurnal and bursty; models are large; SLOs are tight.
- **Current solution:** autoscalers, Aegaeon-style pooling, disaggregated prefill/decode, quantized variants.
- **Weakness:** energy/power not part of the autoscaling objective; night-time GPUs are neither powered down nor lent to training.
- **Research:** DynamoLLM; Aegaeon; Splitwise; Mooncake; Festina (2606.30391).
- **Data:** Azure LLM traces 2023/2024; BurstGPT; Mooncake traces.
- **ML:** probabilistic demand forecasting.
- **Optimization:** SLO-constrained replica + power-mode scheduling; training/inference co-location in troughs.
- **Difficulty 3 / Importance 5.** **Prototype:** yes.

### P11. LLM inference tail latency under interference
- **Who:** serving teams.
- **Economic:** SLO violations → user churn; over-provisioning to hide tails.
- **Technical:** prefill/decode interference, HoL blocking, KV-cache evictions, thermal throttling.
- **Why:** heterogeneous request lengths; batching trade-offs.
- **Current solution:** disaggregation, chunked prefill, Llumnix migration.
- **Weakness:** power/thermal-induced tails ignored.
- **Research:** DistServe; Llumnix; TAPAS.
- **Data:** Azure traces.
- **ML:** latency prediction per batch composition.
- **Optimization:** scheduling with tail-latency constraints.
- **Difficulty 4 / Importance 4.** **Prototype:** yes but crowded.

### P12. HBM capacity/bandwidth and KV-cache memory wall
- **Who:** serving teams, chipmakers (SK hynix, Samsung, Micron), NVIDIA/AMD.
- **Economic:** HBM shortage raises accelerator cost; long-context serving is memory-bound.
- **Technical:** KV cache scales with context × batch; bandwidth limits decode.
- **Why:** memory scaling lags compute scaling.
- **Current solution:** KV quantization, CXL tiers, SSD offload, prefix caching (Mooncake).
- **Weakness:** adds latency; tier management is heuristic.
- **Research:** Mooncake; ITME (2606.12556); TurboQuant.
- **Data:** Mooncake traces.
- **ML:** cache-hit prediction.
- **Optimization:** tiered-memory placement.
- **Difficulty 4 / Importance 4.** **Prototype:** possible but hardware-specific.

### P13. Network congestion for collectives at scale
- **Who:** training clusters (Meta, ByteDance, Alibaba).
- **Economic:** 10–30% of iteration time in communication at scale.
- **Technical:** incast, ECMP collisions, PFC storms, rail-optimized topology limits.
- **Why:** bursty synchronized traffic; commodity Ethernet at RDMA scale.
- **Current solution:** RoCE tuning, HPN dual-plane, UEC, custom collectives, topology-aware placement.
- **Weakness:** placement is static; no coupling with power/DVFS (slower compute → less bursty traffic).
- **Research:** Meta RoCE (SIGCOMM'24); HPN; Sia.
- **Data:** public topology descriptions; synthetic traffic models.
- **ML:** congestion prediction.
- **Optimization:** topology-aware placement and job staggering.
- **Difficulty 5 / Importance 4.** **Prototype:** coarse model only.

### P14. Fragmentation and stranded GPUs
- **Who:** shared clusters, clouds.
- **Economic:** 10–20% of GPUs unallocatable at any time in mixed workloads.
- **Technical:** partial-node allocations, NVLink-domain constraints (NVL72 = 72-GPU domains), MIG slices.
- **Why:** heterogeneous job shapes.
- **Current solution:** FGD, gang scheduling, defragmentation via migration.
- **Weakness:** migration is expensive; no power-aware packing.
- **Research:** FGD (ATC'23); HiveD (OSDI'20).
- **Data:** Alibaba traces.
- **ML:** job-shape prediction.
- **Optimization:** bin-packing with fragmentation metrics.
- **Difficulty 3 / Importance 3.** **Prototype:** yes, crowded.

