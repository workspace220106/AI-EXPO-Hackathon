
### P15. Heterogeneous fleets (H100/H200/B200/GB300/MI300X/TPU) and placement
- **Who:** clouds, neoclouds, labs with rolling upgrades.
- **Economic:** wrong placement wastes premium GPUs on cheap jobs or starves latency-critical work; older GPUs strand.
- **Technical:** different memory, interconnect, DVFS curves, power draw per unit throughput.
- **Why:** 12–18 month product cadence; 4–6 year depreciation.
- **Current solution:** Gavel/Sia-style heterogeneity-aware scheduling; manual pools.
- **Weakness:** no power-per-goodput awareness; no thermal awareness across generations.
- **Research:** Sia; Gavel; Sailor (2504.17096).
- **Data:** published throughput/power per GPU generation.
- **ML:** cross-generation throughput surrogates.
- **Optimization:** ILP placement with power efficiency.
- **Difficulty 3 / Importance 4.** **Prototype:** yes (as a config in a simulator).

### P16. Hardware lifecycle, depreciation and stranded older GPUs
- **Who:** clouds, CFOs, sustainability teams.
- **Economic:** depreciation schedules (3–6 years) vs. real economic life; A100 prices collapsed; embodied carbon.
- **Technical:** old GPUs have worse perf/W — under power constraints they are the first to become uneconomic.
- **Why:** perf/W improves ~2× per generation; power is capped.
- **Current solution:** move old GPUs to inference or internal use; resale.
- **Weakness:** no site-level optimization of *which* GPUs to run under a power cap.
- **Research:** Carbon Explorer; capacity-planning literature.
- **Data:** price indices; spec sheets.
- **ML:** price/perf forecasting.
- **Optimization:** power-constrained fleet retirement/replacement planning (MILP).
- **Difficulty 3 / Importance 3.** **Prototype:** yes (planning model).

### P17. Capacity planning under extreme demand uncertainty
- **Who:** clouds, labs, colos.
- **Economic:** over-build → stranded capex; under-build → lost revenue; 2026 deferrals/cancellations.
- **Technical:** demand is dominated by a few customers; lead times 2–5 years.
- **Why:** AI demand forecasts have 2× uncertainty; supply chains rigid.
- **Current solution:** scenario planning, options contracts, pre-leasing.
- **Weakness:** static; ignores flexibility as a substitute for capacity.
- **Research:** To Defer or To Shift; Duke.
- **Data:** ISO forecasts; public capex disclosures.
- **ML:** demand scenario generation.
- **Optimization:** stochastic capacity expansion with flexibility as a resource.
- **Difficulty 4 / Importance 4.** **Prototype:** planning model only.

### P18. Transformer/switchgear/turbine shortages and construction delays
- **Who:** developers, utilities, EPCs.
- **Economic:** 50% of 2026 builds delayed; equipment 2–5 years; turbines up to 7.
- **Technical:** cannot energize; racks installed but unpowered (stranded compute).
- **Why:** global supply chain; grain-oriented steel; labor.
- **Current solution:** modular/prefab electrical, used equipment, phased energization.
- **Weakness:** nothing software can fix directly — but *flexibility reduces required equipment size*.
- **Research:** industry reports.
- **Data:** trade reports.
- **ML:** limited.
- **Optimization:** phased energization sequencing under equipment arrival uncertainty.
- **Difficulty 2 (software) / Importance 5.** **Prototype:** no (not a software problem).

### P19. Behind-the-meter generation and battery integration economics
- **Who:** campuses with turbines/fuel cells/BESS (xAI Memphis, Pecos, Goodnight).
- **Economic:** capex of generation; fuel; emissions; arbitrage value of BESS.
- **Technical:** islanding, ramp limits, dispatch coordination with IT load.
- **Why:** grid too slow.
- **Current solution:** EMS from vendors; manual dispatch.
- **Weakness:** IT load treated as exogenous.
- **Research:** microgrid literature; Inference-as-Flexibility (BESS + batch size).
- **Data:** fuel prices; BESS specs.
- **ML:** load forecasting.
- **Optimization:** co-dispatch of BESS + workload (unit-commitment style MILP).
- **Difficulty 4 / Importance 4.** **Prototype:** yes as an extension of P2.

### P20. Carbon accounting and 24/7 CFE pressure
- **Who:** hyperscalers with 24/7 CFE goals; EU operators (Energy Efficiency Directive reporting).
- **Economic:** RECs/PPAs cost; reputational.
- **Technical:** hourly matching requires shifting load to clean hours.
- **Why:** AI growth outpaces clean supply.
- **Current solution:** Google VCCs; PPAs; batteries.
- **Weakness:** batch-only shifting; no GPU-level levers.
- **Research:** Google CICS; Wait Awhile; Carbon Explorer.
- **Data:** Electricity Maps; EIA.
- **ML:** carbon-intensity forecasting.
- **Optimization:** carbon-weighted scheduling.
- **Difficulty 3 / Importance 3.** **Prototype:** yes (as an objective term).

### P21. Power capping's hidden performance cost
- **Who:** operators using rack/PDU caps (POLCA-style oversubscription).
- **Economic:** uniform caps slow the wrong jobs; lost goodput unmeasured.
- **Technical:** cap → clock reduction → sub-linear slowdown depending on memory-boundness; different for prefill vs decode vs training phases.
- **Why:** caps are enforced by firmware without job context.
- **Current solution:** nvPAX-style fair allocation; static per-rack caps.
- **Weakness:** fairness ≠ value; no throughput model.
- **Research:** POLCA; nvPAX; Zeus; AGFT (2508.01744).
- **Data:** Zeus/Perseus curves; NLR profiles.
- **ML:** per-job slowdown-vs-cap surrogate.
- **Optimization:** value-weighted cap allocation (LP/MILP).
- **Difficulty 3 / Importance 4.** **Prototype:** yes — core of P2.

### P22. Checkpointing overhead and storage bandwidth
- **Who:** labs, HPC.
- **Economic:** checkpoint I/O steals 2–10% of training time at scale.
- **Technical:** TB-scale state; storage bursts; interaction with failures.
- **Why:** failure rates force frequent checkpoints.
- **Current solution:** async/in-memory checkpoints (Gemini), hierarchical storage.
- **Weakness:** interval chosen statically; not coordinated with planned suspensions (DR events).
- **Research:** Gemini (SOSP'23); CheckFreq.
- **Data:** Acme; published checkpoint sizes.
- **ML:** failure-hazard-aware interval selection.
- **Optimization:** checkpoint timing coupled with suspension schedules.
- **Difficulty 3 / Importance 3.** **Prototype:** yes (in simulation).

### P23. Queueing delay and fairness in shared research clusters
- **Who:** universities, national labs, internal research clusters.
- **Economic:** researcher time; idle reservations.
- **Technical:** long queues for large jobs, starvation.
- **Why:** gang scheduling; rigid jobs.
- **Current solution:** Slurm with fairshare/backfill; Tiresias/Pollux ideas.
- **Weakness:** no elasticity; no power context.
- **Research:** Tiresias; Pollux; Themis.
- **Data:** Philly, Acme, PAI traces.
- **ML:** duration prediction.
- **Optimization:** fairness-aware elastic scheduling.
- **Difficulty 3 / Importance 3.** **Prototype:** yes; crowded.

### P24. Preemptible/spot instability for inference
- **Who:** cost-sensitive serving teams.
- **Economic:** spot is 60–90% cheaper but preemption breaks SLOs.
- **Technical:** replica loss, cold start.
- **Why:** capacity oversubscription in clouds.
- **Current solution:** SpotServe, SkyServe, mixed pools.
- **Weakness:** no power/grid dimension.
- **Research:** SpotServe (ASPLOS'24); SkyServe.
- **Data:** spot price histories.
- **ML:** preemption prediction.
- **Optimization:** robust replica placement.
- **Difficulty 3 / Importance 3.** **Prototype:** yes; crowded.

### P25. Missing unified, sub-second power/thermal/workload telemetry
- **Who:** operators, utilities that require real-time load telemetry (SB6 DR).
- **Economic:** cannot verify DR delivery → cannot get paid; cannot diagnose oscillations.
- **Technical:** DCGM at 1 s, PDUs at 1–60 s, BMS at minutes; clocks unsynchronized.
- **Why:** siloed vendors.
- **Current solution:** Prometheus/DCGM exporters; BMS integration projects.
- **Weakness:** no state estimation across layers.
- **Research:** Power-Flexible AI DC architecture paper.
- **Data:** NLR profiles show what 0.1-s data looks like.
- **ML:** state estimation (Kalman) across asynchronous sources.
- **Optimization:** n/a (enabler).
- **Difficulty 3 / Importance 4.** **Prototype:** yes (in the twin).

### P26. Cross-region workload shifting versus performance and data gravity
- **Who:** multi-region clouds and labs.
- **Economic:** price/carbon differences across regions are large; migration costs and latency are real.
- **Technical:** checkpoint transfer, data locality, inference latency.
- **Why:** regional grids differ.
- **Current solution:** manual region choice; Emerald cross-cluster shifting.
- **Weakness:** no joint optimization with local flexibility.
- **Research:** Sailor; SkyPilot; To Defer or To Shift.
- **Data:** ISO prices across regions.
- **ML:** price/carbon forecasts.
- **Optimization:** spatial-temporal shifting MILP.
- **Difficulty 4 / Importance 3.** **Prototype:** yes as a Phase-2 extension.

### P27. Firmware/thermal-induced performance variability
- **Who:** all GPU operators.
- **Economic:** 5–15% throughput variance node-to-node inflates straggler losses.
- **Technical:** clock throttling from temperature/power; silicon lottery.
- **Why:** parts run at limits.
- **Current solution:** node health scoring; replacing "lemons".
- **Weakness:** not exploited by schedulers.
- **Research:** PAL (2408.11919); Meta lemons.
- **Data:** limited public.
- **ML:** variability prediction.
- **Optimization:** variability-aware placement.
- **Difficulty 3 / Importance 3.** **Prototype:** partly.

### P28. Regulatory reporting and verification of flexibility (Flex MOSAIC, SB6 telemetry)
- **Who:** operators participating in DR; utilities; regulators.
- **Economic:** payments depend on measurement & verification (baseline methodology).
- **Technical:** baselines for a load that changes with workload are hard to define; gaming risk.
- **Why:** DR programs were designed for HVAC and industrial loads.
- **Current solution:** ISO baseline rules; Flex MOSAIC definitions.
- **Weakness:** baselines for AI loads are ill-posed.
- **Research:** EPRI Flex MOSAIC; "When Market Prices Drive the Load".
- **Data:** ISO DR rules.
- **ML:** counterfactual baseline estimation (what would the load have been?).
- **Optimization:** commitment sizing under M&V uncertainty.
- **Difficulty 3 / Importance 3.** **Prototype:** yes as a metric in the twin.

### Summary heat-map (Importance × Feasibility for a 9-month student prototype)

| Problem | Importance | Difficulty | Prototype feasible | Distinctive? |
|---|---|---|---|---|
| **P2 Curtailment control (workload-aware)** | 5 | 4 | **Yes** | **Yes** |
| P10 Inference troughs/cost | 5 | 3 | Yes | Medium (crowded) |
| P6 Failures/ETTR | 5 | 4 | Yes (sim) | Medium |
| P21 Power-cap performance cost | 4 | 3 | Yes | Yes (as part of P2) |
| P7 Liquid-cooling thermal transients | 4 | 4 | Yes (lumped) | Yes |
| P3 Power oscillations | 4 | 4 | Partial | Yes but needs hardware |
| P4 GPU utilization | 4 | 3 | Yes | No (crowded) |
| P19 BESS + workload co-dispatch | 4 | 4 | Yes | Yes (extension) |
| P1/P17/P18 Interconnection & construction | 5 | — | Planning only | No (not software) |

