
---

## PART 6 — FIVE PROJECT CANDIDATES

All five are calibrated for a 3rd-year CSE student: simulation-driven, public data, laptop-scale, with an optional single-GPU hardware-in-the-loop demo.

---

### Candidate 1 — **HEADROOM: Grid-Interactive, Goodput-Aware Model-Predictive Control of AI Clusters**
- **Problem statement:** Deliver contracted power flexibility (DR events, price response, ramp limits) from a mixed training + inference GPU cluster at minimum total cost, choosing job power modes, inference replica counts, cooling setpoints and battery dispatch every 5 minutes under thermal, SLO, deadline and reliability constraints.
- **Target user:** cluster/energy operations teams at neoclouds, hyperscalers, colos with AI tenants; utilities' large-load programs; NVIDIA DSX Flex / Emerald-type platforms.
- **Why it matters now:** SB6 mandatory curtailment; Google's 1 GW DR; PJM at price cap and short of reliability; 2–7 year interconnection waits; flexibility is the fastest way to energize new capacity.
- **Existing systems:** Emerald Conductor, NVIDIA DSX Flex, Google VCCs, nvPAX, vendor BMS/EMS.
- **Research gap:** no open, cost-priced, forecast-driven controller that jointly uses training DVFS frontiers, inference replica scaling, cooling setpoints and storage; no open benchmark to compare policies.
- **Core innovation:** (i) *flexibility as a schedulable resource with a marginal-cost curve* derived from Perseus-style frontiers and TAPAS-style inference power curves; (ii) hierarchical MPC (day-ahead commitment MILP + 5-min operational MILP) with a lumped thermal model; (iii) open trace-driven benchmark (HeadroomBench) with rule-based, fair-cap, batch-shifting and RL baselines.
- **Quantitative objective:** minimize $ = energy + demand charge + DR shortfall penalties + delay cost of training (v_j × hours late) + SLO-violation cost + switching/reliability cost; report Pareto frontier of (cost, goodput loss, SLO attainment, carbon).
- **Optimization variables:** per-job power mode (incl. suspend), per-service replica count and config, coolant supply temperature, battery charge/discharge, DR commitment (day-ahead).
- **Constraints:** site cap & event reductions, ramp limits, rack temperature limits (RC dynamics), GPU capacity, SLO capacity (quantile demand), deadlines/work conservation, min-up/min-down, switching limits, checkpoint-before-suspend, battery SOC.
- **ML components:** LightGBM quantile forecasts of inference demand & price residuals; job power–throughput surrogate models; thermal grey-box identification; optional PPO baseline and imitation-learned fast policy.
- **Simulation environment:** HeadroomSim — SimPy discrete-event twin (jobs, replicas, power, thermal, prices, events, failures, coarse network).
- **Real-time architecture:** telemetry stream (Redis Streams/Kafka) → state estimator → forecaster → MPC service (HiGHS) → actuator (simulator API, optional `nvidia-smi` on a real GPU) → TimescaleDB → Grafana.
- **Metrics:** cost, MW·h shed vs commitment, response time, goodput loss, deadline misses, p99 TTFT/TPOT & SLO attainment, energy, PUE, peak power, ramp violations, thermal violation minutes, carbon, GPU utilization, switches, checkpoint overhead, queueing delay, fragmentation, network slowdown.
- **Data sources:** Azure LLM traces, Alibaba PAI, Acme, Philly, NLR H100 power profiles, Zeus/Perseus curves, ISO prices & DR histories, NOAA weather, tariffs, Electricity Maps.
- **Engineering complexity:** Medium-high (simulator + optimizer + streaming + dashboard).
- **Research complexity:** Medium-high (formulation, stochastic MPC, Pareto analysis, baselines).
- **9-month feasibility:** High — each month has a self-contained deliverable; MILP sizes solve in seconds with free HiGHS.
- **Biggest failure risks:** thermal model fidelity (mitigate: sensitivity analysis, published parameters); DR program rules complexity (mitigate: model two programs only — ERCOT ERS-like and PJM ELRP-like); overclaiming (mitigate: report frontiers, not single numbers).

---

### Candidate 2 — **COLDPLAN: Workload-Informed Cooling Control for Liquid-Cooled GPU Racks**
- **Problem statement:** Co-optimize job placement/power and CDU/coolant setpoints in 120–600 kW racks to minimize cooling energy and water while keeping chip temperatures and transient headroom (CDU fault runway) within limits.
- **Target user:** facility engineers, CDU/cooling vendors (Vertiv, CoolIT, Schneider), operators retrofitting for NVL72/Kyber.
- **Why now:** 19% liquid-cooling adoption heading to 55%; 600 kW racks in 2027; PUE stalling; water mandates.
- **Existing systems:** vendor BMS control, Google's ML cooling, TAPAS (inference).
- **Research gap:** cooling controllers do not see the workload plan; thermal-aware schedulers do not control the loop.
- **Core innovation:** joint MPC over placement × power × supply temperature with a physics-informed thermal-hydraulic model; "thermal runway" as a reliability constraint.
- **Quantitative objective:** min cooling energy + water + throttling loss s.t. T_chip ≤ limit and runway ≥ τ.
- **Variables:** placement, per-rack caps, supply temperature, pump speed.
- **Constraints:** thermal RC dynamics, flow limits, chiller COP, weather.
- **ML:** grey-box thermal identification; weather forecasting; anomaly detection on CDUs.
- **Simulation:** rack-level thermal simulator (RC network + flow model).
- **Real-time:** BMS-style loop at 10–60 s.
- **Metrics:** cooling kWh, WUE, thermal violations, throttling minutes, runway.
- **Data:** ASHRAE, vendor specs, NLR power profiles (heat load), weather.
- **Engineering:** Medium. **Research:** Medium-high (thermal modelling).
- **9-month feasibility:** Medium — needs careful thermal modelling with no ground truth.
- **Risks:** no real rack data; results may be dominated by model assumptions; smaller "AI" component.

---

### Candidate 3 — **ETTR-MAX: Failure-Aware Training Orchestration**
- **Problem statement:** Maximize effective training time ratio across a cluster by jointly choosing checkpoint intervals, hot-spare pools, restart/placement policies and node-health-aware allocation under a cost budget.
- **Target user:** AI labs, neoclouds, HPC centers.
- **Why now:** one failure per ~3 h at 16k GPUs; Blackwell/Rubin early-life failures; SPARe-scale clusters.
- **Existing systems:** static checkpointing, SuperBench health checks, Gemini in-memory checkpoints, lemon detection.
- **Research gap:** no joint optimization of interval × spares × placement with failure prediction; no coupling with power/thermal policy.
- **Core innovation:** hazard-model-driven checkpoint scheduling + spare sizing as a stochastic optimization; telemetry-based failure prediction.
- **Objective:** max ETTR − spare cost.
- **Variables:** checkpoint intervals, spare count, placement, restart policy.
- **Constraints:** storage bandwidth, capacity.
- **ML:** survival models / gradient boosting on telemetry for failure prediction.
- **Simulation:** failure process (Weibull, lemon nodes) + training progress simulator.
- **Real-time:** hazard updates every minute.
- **Metrics:** ETTR, restarts, checkpoint overhead, spare utilization.
- **Data:** Acme failure logs; Meta/Llama rates; synthetic telemetry.
- **Engineering:** Medium. **Research:** Medium.
- **Feasibility:** High.
- **Risks:** limited public telemetry for failure prediction; narrower systems story; less multi-objective coupling.

---

### Candidate 4 — **PACKWATT: Fragmentation- and Power-Aware Placement for Heterogeneous GPU Clusters**
- **Problem statement:** Place mixed training/inference jobs across H100/B200/GB300 pools and NVLink domains to maximize allocatable capacity and goodput-per-watt while limiting network contention.
- **Target user:** cloud schedulers (Kueue, Volcano, Run:ai, Slurm).
- **Why now:** heterogeneous fleets, NVL72 domain constraints, 5–50% utilization.
- **Existing systems:** FGD, HiveD, Gavel/Sia.
- **Gap:** fragmentation metrics ignore power; heterogeneity-aware schedulers ignore topology contention.
- **Innovation:** unified ILP with fragmentation gradient, perf/W and contention terms.
- **Objective:** max goodput/W − fragmentation − contention penalty.
- **Variables:** placement, GPU counts, parallelism configs.
- **Constraints:** domains, memory, topology.
- **ML:** duration and shape prediction.
- **Simulation:** cluster simulator with topology.
- **Real-time:** scheduler plugin.
- **Metrics:** utilization, fragmentation, JCT, energy.
- **Data:** Alibaba PAI, Acme.
- **Engineering:** Medium. **Research:** Medium-low (crowded).
- **Feasibility:** High.
- **Risks:** hard to differentiate from Sia/FGD; no power/grid story.

---

### Candidate 5 — **SKYFLEX: Price- and Carbon-Aware Geo-Distributed LLM Serving with Spot GPUs**
- **Problem statement:** Route inference and place replicas across regions/spot pools to minimize cost and carbon under latency SLOs and preemption risk.
- **Target user:** API providers, enterprises.
- **Why now:** regional price/carbon spreads, spot volatility, token price collapse.
- **Existing systems:** SkyServe, SpotServe, Mélange.
- **Gap:** joint price/carbon/preemption/latency optimization is thin; cross-region DR interplay unexplored.
- **Innovation:** robust replica placement with preemption forecasts and grid signals.
- **Objective:** min cost + carbon s.t. SLO and availability.
- **Variables:** replicas per region, routing weights.
- **Constraints:** latency, capacity, availability.
- **ML:** preemption and demand forecasting.
- **Simulation:** multi-region serving simulator.
- **Real-time:** router.
- **Metrics:** cost, carbon, SLO, availability.
- **Data:** Azure traces, spot price histories, Electricity Maps.
- **Engineering:** Medium. **Research:** Medium (crowded).
- **Feasibility:** High.
- **Risks:** SkyServe/SpotServe already cover much; weaker infrastructure (power/thermal) story.

