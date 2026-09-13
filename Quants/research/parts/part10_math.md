
---

## PART 10 — MATHEMATICAL FORMULATION

### 10.1 Structure: three timescales, two optimizers, one hardware layer

| Layer | Horizon / step | Decides | Method |
|---|---|---|---|
| **L0 Day-ahead commitment** | 24–36 h / 1 h | DR commitment $F_h$ per hour, cooling mode, planned batch windows | Two-stage stochastic MILP (scenarios of demand/price) |
| **L1 Operational MPC** (the core) | 2 h / 5 min, re-solved every 5 min | Job power modes & suspensions, inference replicas/configs, coolant supply setpoint, battery power | Deterministic or scenario-based MILP, receding horizon |
| **L2 Sub-second smoothing** | ms–s | Ramp shaping within a 5-min step | Delegated to hardware (GB300 power shelves, firmware caps); represented in L1 only as ramp-rate constraints. *Out of scope to implement; simulated as a constraint.* |

### 10.2 Sets and indices
- $t \in \mathcal{T} = \{1,\dots,H\}$: MPC steps, $\Delta = 5$ min, $H = 24$ (2 h).
- $j \in \mathcal{J}$: training jobs (rigid GPU count $n_j$; elastic variant in §10.9).
- $k \in \mathcal{K} = \{0,1,\dots,K\}$: power modes; $k=0$ suspended, $k=K$ uncapped.
- $s \in \mathcal{S}$: inference services; $c \in \mathcal{C}_s$: configurations (e.g., FP8 vs FP16, TP degree).
- $r \in \mathcal{R}$: racks (or CDU zones).

### 10.3 Parameters (all obtainable from public data or profiling)
- $p_{jk}$: per-GPU power (W) of job $j$ in mode $k$; $\rho_{jk} \in [0,1]$: relative throughput in mode $k$ (from Zeus/Perseus-style frontier; $\rho_{j0}=0$, $\rho_{jK}=1$). Concavity: $\rho$ falls slower than $p$ in the "bloat" region.
- $W_j$: remaining work (in full-speed GPU-step units), $D_j$: deadline step (may exceed $H$), $v_j$: delay cost ($/h), $\kappa_j$: checkpoint cost (work units lost + energy) when suspending.
- $\lambda_{s,t}^{q}$: $q$-quantile forecast of demand (req/s) for service $s$ at $t$; $\mu_{s,c}$: per-replica capacity at SLO (req/s) in config $c$; $g_{s,c}$: GPUs per replica; $a_{s,c}, b_{s,c}$: idle and per-request power coefficients (POLCA/DynamoLLM linear power-vs-load model); $u_s$: cost per dropped request; $m_s^{\min}$: minimum replicas (availability); $\delta_s$: max replica change per step.
- Thermal (rack $r$): $\alpha_r, \beta_r, \gamma_r$ from RC identification; $T_r^{\max}$ limit; $T^{sup} \in [T^{lo},T^{hi}]$ supply-temperature range; cooling power $P^{cool}_t = \kappa_0 + \kappa_1 P^{IT}_t + \kappa_2 (T^{hi} - T^{sup}_t)$ (lower supply temperature costs chiller energy; piecewise-linear from COP curves and weather).
- Grid: $\pi_t$ energy price ($/kWh); $\pi^{D}$ demand charge ($/kW of horizon peak, pro-rated); $P^{cap}_t$ site cap; $E_t \in \{0,1\}$ event flag; $F_t$ committed reduction (from L0); $\phi$ shortfall penalty ($/kWh); $R^{\max}$ ramp limit (kW per step); $CI_t$ carbon intensity; $\pi^{C}$ carbon price (optional).
- Battery: capacity $\bar{E}$, power $\bar{P}^{B}$, efficiency $\eta$, degradation cost $\pi^{B}$ ($/kWh throughput).
- Reliability: $N^{sw}_j$ max mode switches per horizon; $\tau^{up}, \tau^{dn}$ min-up/min-down (steps); $\mathcal{J}^{frag}$ jobs on suspect ("lemon") nodes that must not be throttled.

### 10.4 Decision variables
- $z_{jkt} \in \{0,1\}$: job $j$ in mode $k$ at $t$ (one-hot).
- $y_{jt} \in \{0,1\}$: job $j$ changed mode at $t$; $w_{jt}\in\{0,1\}$: suspended-start indicator (triggers checkpoint).
- $m_{sct} \in \mathbb{Z}_{\ge 0}$: replicas of $s$ in config $c$ at $t$; $d_{st} \ge 0$: dropped request rate.
- $T_{rt}$: rack temperature; $T^{sup}_t$: supply setpoint.
- $b^{+}_t, b^{-}_t \ge 0$: battery charge/discharge power; $e_t$: state of charge.
- $P^{IT}_t, P^{cool}_t, P^{grid}_t \ge 0$; $P^{pk} \ge 0$: horizon peak; $\sigma_t \ge 0$: event shortfall; $\zeta_j \ge 0$: work shortfall at deadline.

### 10.5 Objective (minimize expected cost over the horizon)

$$
\min \;
\underbrace{\sum_{t} \pi_t P^{grid}_t \Delta}_{\text{energy}}
+ \underbrace{\pi^{D} P^{pk}}_{\text{demand charge}}
+ \underbrace{\phi \sum_t \sigma_t \Delta}_{\text{DR shortfall}}
+ \underbrace{\sum_j v_j \,\ell_j}_{\text{training delay}}
+ \underbrace{\sum_{s,t} u_s\, d_{st}\Delta}_{\text{SLO loss}}
+ \underbrace{\sum_{j,t} \big(c^{sw} y_{jt} + \kappa_j w_{jt}\big)}_{\text{switching / checkpoint}}
+ \underbrace{\pi^{B}\sum_t (b^{+}_t + b^{-}_t)\Delta}_{\text{battery wear}}
+ \underbrace{\pi^{C}\sum_t CI_t P^{grid}_t \Delta}_{\text{carbon (optional)}}
$$

where the delay cost uses a *terminal value*: $\ell_j = \dfrac{W_j - \sum_{t}\sum_{k} \rho_{jk} z_{jkt}\Delta\, n_j}{n_j \cdot \bar\rho}$ (hours of full-speed work not done in the horizon, priced at $v_j$; jobs with deadlines inside the horizon additionally pay $v^{dl}_j \zeta_j$). This is what makes the MPC prefer to slow *cheap* jobs and keep *valuable* ones fast.

### 10.6 Hard constraints

**Mode selection and switching**
$$\sum_k z_{jkt} = 1 \quad \forall j,t;\qquad y_{jt} \ge z_{jkt} - z_{jk,t-1},\; y_{jt} \ge z_{jk,t-1} - z_{jkt} \;\forall k;\qquad \sum_t y_{jt} \le N^{sw}_j$$
$$w_{jt} \ge z_{j0t} - z_{j0,t-1};\qquad z_{jKt} = 1 \;\; \forall j \in \mathcal{J}^{frag}$$
Min-up/min-down (unit-commitment form): $\sum_{\tau=t}^{t+\tau^{dn}-1} z_{j0\tau} \ge \tau^{dn} w_{jt}$.

**Power balance and grid**
$$P^{IT}_t = \sum_j n_j \sum_k p_{jk} z_{jkt} + \sum_{s,c}\Big(a_{s,c}\, m_{sct} + b_{s,c}\,(\lambda^{q}_{s,t} - d_{st})\,\tfrac{m_{sct}}{\sum_{c'} m_{sc't}}\Big) + P^{misc}$$
(the second term is linearized by assigning service load to configurations via auxiliary flow variables $x_{sct} \le \mu_{s,c} m_{sct}$ with $\sum_c x_{sct} = \lambda^{q}_{s,t} - d_{st}$, giving $\sum_{s,c} (a_{s,c} m_{sct} + b_{s,c} x_{sct})$).
$$P^{grid}_t = P^{IT}_t + P^{cool}_t + b^{+}_t - b^{-}_t$$
$$P^{grid}_t \le P^{cap}_t - E_t F_t + \sigma_t,\qquad P^{pk} \ge P^{grid}_t,\qquad |P^{grid}_{t+1} - P^{grid}_t| \le R^{\max}$$

**Inference SLO (chance constraint via quantile forecast)**
$$\sum_c \mu_{s,c}\, m_{sct} \ge \lambda^{q}_{s,t} - d_{st},\qquad \sum_c m_{sct} \ge m^{\min}_s,\qquad \Big|\sum_c m_{sc,t+1} - \sum_c m_{sct}\Big| \le \delta_s$$
$$\sum_j n_j (1 - z_{j0t}) + \sum_{s,c} g_{s,c} m_{sct} \le G \quad(\text{GPU capacity; per-rack version with placement matrix})$$

**Thermal dynamics (linear RC, per rack)**
$$T_{r,t+1} = \alpha_r T_{rt} + \beta_r P^{IT}_{rt} + \gamma_r T^{sup}_t,\qquad T_{rt} \le T^{\max}_r,\qquad T^{lo} \le T^{sup}_t \le T^{hi}$$
$$P^{cool}_t = \kappa_0 + \kappa_1 P^{IT}_t + \kappa_2 (T^{hi} - T^{sup}_t)$$

**Battery**
$$e_{t+1} = e_t + \eta b^{+}_t \Delta - b^{-}_t \Delta/\eta,\qquad 0 \le e_t \le \bar E,\qquad b^{\pm}_t \le \bar P^{B}$$

**Work conservation / deadlines**
$$\sum_{t \le D_j}\sum_k \rho_{jk} z_{jkt}\, n_j \Delta + \zeta_j \ge W_j \quad \forall j : D_j \le H;\qquad \text{checkpoint loss: } W_j \leftarrow W_j + \kappa^{w}_j \sum_t w_{jt}$$

### 10.7 Soft constraints (penalized)
DR shortfall $\sigma_t$, dropped requests $d_{st}$, deadline shortfall $\zeta_j$, switching $y_{jt}$, thermal excursion above a *comfort* band (a second, lower limit $T^{soft}_r$ with slack $\theta_{rt}$ penalized at $\pi^{\theta}$), battery cycling.

### 10.8 Why this is the right mathematical form
- **Mixed-integer:** power modes, suspensions and replica counts are inherently discrete; min-up/min-down and switching limits are classic unit-commitment structure. With $|\mathcal{J}|=40$, $K=4$, $H=24$, $|\mathcal{S}|=10$, $|\mathcal{C}_s|=2$ the model has ≈4k binaries and ≈1k integers; HiGHS solves such instances in 1–10 s (Gurobi academic in <1 s).
- **Convex/PWL:** power-vs-mode and throughput-vs-mode are tabulated (no nonconvexity in the model); cooling COP is piecewise-linear; thermal dynamics are linear. Nothing is forced into a nonconvex NLP.
- **MPC (online):** re-solving every 5 minutes with updated state (temperatures, SOC, work done, actual demand) gives feedback and robustness to forecast errors; the horizon terminal cost ($\ell_j$) prevents myopic behaviour.
- **Stochastic:** demand and price uncertainty are handled two ways and compared: (a) *quantile-robust* ($q = 0.9$ demand, price expectation) — cheap; (b) *two-stage scenario MILP* (5–10 scenarios sampled from the quantile forecasts; first-stage = decisions at $t = 1..3$, recourse afterwards).
- **Bayesian optimization:** used where the objective is a black box — tuning MPC hyper-parameters ($H$, $q$, penalty weights, switching cost) against long simulator runs (20–60 evaluations with a GP surrogate) rather than grid search.
- **Reinforcement learning:** *not* the primary method (constraints are hard, dynamics are known, and sample efficiency matters) but included as a baseline (PPO on the Gymnasium wrapper) to answer the reviewer question "why not RL?" with evidence.
- **Multi-objective:** the weighted-sum objective is the operational form; the *research* result is the Pareto frontier from ε-constraint sweeps: minimize cost subject to goodput loss ≤ ε₁ and SLO violations ≤ ε₂, sweeping ε.

### 10.9 Elastic extension (optional, month 6+)
Allow $n_{jt} \in \mathcal{N}_j$ (e.g., {64, 128, 256}) with Pollux-style goodput $G_j(n,k)$ tabulated; adds binaries $z_{jnkt}$ and a resizing cost (checkpoint + all-reduce group change); network contention represented by a per-spine capacity constraint on the sum of resized jobs' bandwidth demand.

### 10.10 Day-ahead layer (L0)
$$\min_{F_h,\, \text{mode}_h} \; \mathbb{E}_{\omega}\Big[\text{L1 cost}(\omega \mid F, \text{mode})\Big] - \sum_h \pi^{F}_h F_h$$
solved as a scenario MILP with hourly aggregation (24 steps, aggregated job classes rather than individual jobs), where $\pi^{F}_h$ is the DR capacity payment. Output: committed $F_h$ and cooling mode, passed to L1 as parameters.

