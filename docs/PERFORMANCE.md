# Performance

## 1. Budget для UI

- initial main page < 1 s на локальной машине после cold DB;
- dispatch preview < 50 ms для demo graph;
- delivery transaction < 100 ms без animation;
- analytics 80×3 simulations < 1–2 s на обычном CPU;
- no layout overflow at 1280×720.

## 2. Routing complexity

Demo graph мал. Dijkstra выполняется для каждой candidate pair. При росте:

- cache static adjacency;
- precompute empty shortest paths;
- use A* with admissible heuristic;
- batch candidate routing;
- move large optimization to OR-Tools/service.

## 3. Simulation

Monte Carlo samples независимы. Upgrade path:

- worker threads;
- background queue;
- sample batching;
- store summary only for UI;
- deterministic sharding by seed range.

## 4. SQLite

- indexes in `0002_indexes.sql`;
- WAL;
- one writer transaction at a time;
- small transactions;
- avoid storing thousands of samples in request path.

## 5. AI

- compact mission context;
- max tool turns 4;
- max output 1400;
- no full event history in prompt;
- analytics tool returns aggregates;
- no AI call on every UI selection.
