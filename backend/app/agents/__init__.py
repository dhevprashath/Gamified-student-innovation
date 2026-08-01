"""AI agent packages.

Each subpackage hosts one LangGraph agent. They are implemented from Phase 6 onward;
these packages define the layout and responsibility boundaries now so the AI layer
grows predictably:

- ``research``       -> Literature / domain research agent (Phase 7)
- ``patent``         -> Patent prior-art / novelty search agent (Phase 8)
- ``competitor``     -> Competitor and market analysis agent (Phase 9)
- ``risk``           -> Technical / market / execution risk agent (Phase 10)
- ``pitch``          -> Pitch + slide content generator (Phase 11)
- ``orchestrator``   -> LangGraph state machine coordinating the pipeline above

Contract (agreed in architecture review)
- Every agent is a stateless callable that takes a typed ``AgentContext`` and returns a
  typed ``AgentResult``. Orchestration state is persisted by the service layer.
- Agents must not import HTTP/schema/UI code; they communicate through dataclasses.
"""
