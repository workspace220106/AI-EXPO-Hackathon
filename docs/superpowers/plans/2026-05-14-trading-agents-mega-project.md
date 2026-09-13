# TradingAgents Mega Project Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a high-end trading platform integrating a Python multi-agent LangGraph backend with a cinematically animated React/Framer Motion frontend.

**Architecture:** A FastAPI WebSocket bridge connects a LangGraph-driven trading agent system to a React frontend. The frontend implements two distinct visual modes: "Quant-Elite" (data-dense tool) and "Neural-Cyber" (visual agent showcase).

**Tech Stack:** Python (FastAPI, LangGraph), React 19, Tailwind CSS, Framer Motion, Zustand, TradingView Lightweight Charts, WebSockets.

---

## File Map

### Backend (Python)
- `backend/main.py`: FastAPI entry point and WebSocket handler.
- `backend/bridge.py`: Bridge between LangGraph events and WebSocket streams.
- `backend/agents/trading_graph.py`: The `TradingAgentsGraph` implementation (integrating the provided repo).
- `backend/agents/state.py`: State definitions for the trading agent graph.
- `backend/config.env`: Environment variables for LLMs and APIs.

### Frontend (React)
- `frontend/src/store/useStore.ts`: Zustand store for global state (tickers, agent status).
- `frontend/src/hooks/useWebSocket.ts`: WebSocket connection and event handling hook.
- `frontend/src/components/layout/MainLayout.tsx`: Root layout handling mode switching.
- `frontend/src/components/warroom/WarRoom.tsx`: Quant-Elite Command Center view.
- `frontend/src/components/warroom/TradingChart.tsx`: TradingView chart integration.
- `frontend/src/components/arena/AgentArena.tsx`: Neural-Cyber visualization canvas.
- `frontend/src/components/arena/NeuralNode.tsx`: Individual agent nodes with physics animations.
- `frontend/src/components/arena/SentimentPendulum.tsx`: Neon-glow sentiment gauge.
- `frontend/src/components/shared/GlassPanel.tsx`: Reusable glassmorphic UI component.
- `frontend/src/styles/globals.css`: Tailwind styles and custom SVG filters (glow/blur).

---

## Implementation Phases

### Phase 1: Backend Core & WebSocket Bridge
Goal: Establish a real-time communication channel between the LLM agents and the frontend.

#### Task 1: Backend Infrastructure & WebSocket Setup
**Files:**
- Create: `backend/main.py`
- Create: `backend/bridge.py`

- [ ] **Step 1: Implement basic FastAPI app with WebSocket endpoint**
```python
# backend/main.py
from fastapi import FastAPI, WebSocket
from backend.bridge import AgentBridge

app = FastAPI()
bridge = AgentBridge()

@app.websocket("/ws/agents")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # Handle ticker requests here
            await bridge.send_event(websocket, {"type": "TICKER_REQUEST", "payload": data})
    except Exception as e:
        print(f"WebSocket error: {e}")
```

- [ ] **Step 2: Implement AgentBridge to manage connections and event routing**
```python
# backend/bridge.py
import asyncio
from typing import Any

class AgentBridge:
    def __init__(self):
        self.connections = []

    async def send_event(self, websocket, event: Any):
        # In a real scenario, this would trigger the LangGraph
        await websocket.send_json({"event": "agent_thought", "data": "Initializing analysis..."})

    async def broadcast(self, message: Any):
        for conn in self.connections:
            await conn.send_json(message)
```

- [ ] **Step 3: Verify WebSocket connectivity**
Run: `uvicorn backend.main:app --reload`
Test using a tool like `wscat` or browser console: `new WebSocket('ws://localhost:8000/ws/agents')`
Expected: Connection established and "Initializing analysis..." received.

- [ ] **Step 4: Commit**
`git add backend/main.py backend/bridge.py && git commit -m "feat: setup fastapi websocket bridge"`

#### Task 2: LangGraph Integration
**Files:**
- Create: `backend/agents/trading_graph.py`
- Create: `backend/agents/state.py`
- Modify: `backend/bridge.py`

- [ ] **Step 1: Define the Trading State**
```python
# backend/agents/state.py
from typing import TypedDict, List, Annotated
import operator

class TradingState(TypedDict):
    ticker: str
    analysis_reports: Annotated[List[str], operator.add]
    sentiment: float
    decision: str
    logs: List[str]
```

- [ ] **Step 2: Implement the TradingAgentsGraph with event streaming**
```python
# backend/agents/trading_graph.py
from langgraph.graph import StateGraph, END
from backend.agents.state import TradingState

def analyst_node(state: TradingState):
    # Simulate agent thought
    return {"analysis_reports": ["Technical analysis: Bullish"], "logs": ["Analyst started..."]}

def researcher_node(state: TradingState):
    return {"analysis_reports": ["Researcher: Confirmed Bullish"], "logs": ["Researcher debating..."]}

workflow = StateGraph(TradingState)
workflow.add_node("analyst", analyst_node)
workflow.add_node("researcher", researcher_node)
workflow.set_entry_point("analyst")
workflow.add_edge("analyst", "researcher")
workflow.add_edge("researcher", END)
graph = workflow.compile()
```

- [ ] **Step 3: Connect LangGraph to WebSocket bridge to stream "thoughts"**
Modify `backend/bridge.py` to call `graph.stream()` and push each step to the WebSocket.

- [ ] **Step 4: Verify streaming flow**
Run: `uvicorn backend.main:app --reload`
Expected: WebSocket receives a sequence of "thought" events as the graph progresses.

- [ ] **Step 5: Commit**
`git add backend/agents/trading_graph.py backend/agents/state.py backend/bridge.py && git commit -m "feat: integrate langgraph agent pipeline with streaming"`

---

### Phase 2: Frontend Core & "Quant-Elite" Mode
Goal: Build the high-performance command center.

#### Task 3: Frontend Architecture & State
**Files:**
- Create: `frontend/src/store/useStore.ts`
- Create: `frontend/src/hooks/useWebSocket.ts`

- [ ] **Step 1: Implement Zustand store for trading state**
```typescript
// frontend/src/store/useStore.ts
import { create } from 'zustand';

interface TradingState {
  mode: 'quant' | 'neural';
  currentTicker: string;
  agentStatus: Record<string, 'idle' | 'working' | 'done'>;
  sentiment: number; // -1 to 1
  setMode: (mode: 'quant' | 'neural') => void;
  setTicker: (ticker: string) => void;
}

export const useStore = create<TradingState>((set) => ({
  mode: 'quant',
  currentTicker: 'BTCUSDT',
  agentStatus: {},
  sentiment: 0,
  setMode: (mode) => set({ mode }),
  setTicker: (ticker) => set({ currentTicker: ticker }),
}));
```

- [ ] **Step 2: Implement WebSocket hook for real-time event handling**
```typescript
// frontend/src/hooks/useWebSocket.ts
import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export function useWebSocket() {
  const { setTicker } = useStore();

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/agents');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Agent Event:', data);
      // Update Zustand store based on event type
    };
    return () => ws.close();
  }, []);

  return { sendTicker: (ticker: string) => { /* ws.send... */ } };
}
```

- [ ] **Step 3: Commit**
`git add frontend/src/store/useStore.ts frontend/src/hooks/useWebSocket.ts && git commit -m "feat: setup frontend state and websocket hooks"`

#### Task 4: War Room UI (Quant-Elite)
**Files:**
- Create: `frontend/src/components/layout/MainLayout.tsx`
- Create: `frontend/src/components/warroom/WarRoom.tsx`
- Create: `frontend/src/components/warroom/TradingChart.tsx`
- Create: `frontend/src/components/shared/GlassPanel.tsx`

- [ ] **Step 1: Implement GlassPanel for the Quant-Elite look**
```tsx
// frontend/src/components/shared/GlassPanel.tsx
export const GlassPanel = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 ${className}`}>
    {children}
  </div>
);
```

- [ ] **Step 2: Implement the War Room layout with TradingView charts**
Use `lightweight-charts` to render the main price action.

- [ ] **Step 3: Apply Framer Motion for "Quant" transitions**
Use `layout` prop for smooth panel resizing and `animate={{ y: 0 }}` for sliding elements.

- [ ] **Step 4: Commit**
`git add frontend/src/components/... && git commit -m "feat: implement quant-elite war room ui"`

---

### Phase 3: The "Crazy" Visuals (Neural-Cyber Mode)
Goal: Implement the cinematic agent showcase.

#### Task 5: The Neural Map & Agent Nodes
**Files:**
- Create: `frontend/src/components/arena/AgentArena.tsx`
- Create: `frontend/src/components/arena/NeuralNode.tsx`

- [ ] **Step 1: Implement NeuralNode with floating physics**
```tsx
// frontend/src/components/arena/NeuralNode.tsx
import { motion } from 'framer motion';

export const NeuralNode = ({ name, status }: { name: string, status: string }) => (
  <motion.div 
    animate={{ y: [0, -10, 0] }} 
    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
    className="w-16 h-16 rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] flex items-center justify-center text-white text-xs"
  >
    {name}
  </motion.div>
);
```

- [ ] **Step 2: Implement the Agent Arena canvas and connection lines**
Use SVG lines that "pulse" using `stroke-dasharray` and `animate` to simulate data flow between nodes.

- [ ] **Step 3: Implement the Sentiment Pendulum**
A rotating SVG element with a `blur` filter and glowing gradient, bound to the `sentiment` value from the Zustand store.

- [ ] **Step 4: Commit**
`git add frontend/src/components/arena/... && git commit -m "feat: implement neural-cyber agent arena animations"`

#### Task 6: Final Polish & Integration
**Files:**
- Modify: `frontend/src/styles/globals.css`
- Modify: `frontend/src/components/layout/MainLayout.tsx`

- [ ] **Step 1: Add custom SVG filters for the "Cyber" glow**
```css
/* frontend/src/styles/globals.css */
.cyber-glow {
  filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.8));
}
```

- [ ] **Step 2: Implement the mode switch animation**
Use Framer Motion's `AnimatePresence` to morph the UI from the War Room (grid-based) to the Arena (canvas-based).

- [ ] **Step 3: Final end-to-end test: Ticker $\rightarrow$ Agent Debate $\rightarrow$ Visual Reaction $\rightarrow$ Decision.**

- [ ] **Step 4: Commit**
`git add . && git commit -m "feat: final polish and integration of mega project"`

---

## Self-Review Checklist
- [ ] WebSocket bridge emits LangGraph events?
- [ ] Neural-Cyber mode maintains 60fps?
- [ ] Quant-Elite mode feels professional and low-latency?
- [ ] TradingView charts integrate correctly?
- [ ] Mode transition is seamless?
