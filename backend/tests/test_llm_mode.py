"""Guards the --run-llm contract.

The test fixture installs a sentinel API key at import time so that a stubbed
call which escapes the fixture cannot quietly spend real quota. The trap this
file closes: if that sentinel is still installed when `--run-llm` is passed,
every provider call fails, the heuristic fallback fills in plausible scores,
and the suite goes green while having tested nothing. A green `--run-llm` run
is only meaningful if the real key is actually restored.
"""

import os

import pytest

SENTINEL = "test-key-not-real"


@pytest.fixture
def run_llm(request):
    return request.config.getoption("--run-llm")


def test_default_mode_installs_the_sentinel_key(run_llm):
    """Guards the other half: stubbed mode must not be able to spend money."""
    if run_llm:
        pytest.skip("--run-llm deliberately restores the real key")
    assert os.environ["AI_API_KEY"] == SENTINEL
    assert os.environ["AI_FALLBACK_API_KEY"] == SENTINEL


def test_run_llm_restores_the_real_key(run_llm, real_provider_key):
    if not run_llm:
        pytest.skip("only meaningful with --run-llm")

    assert os.environ["AI_API_KEY"] != SENTINEL, (
        "the sentinel key survived into a live run, so the providers were never "
        "actually called and the green result means nothing"
    )
    assert os.environ["AI_API_KEY"] == real_provider_key


@pytest.mark.llm
@pytest.mark.asyncio
async def test_live_provider_reports_a_real_model(run_llm):
    """Proves the live path reaches a provider instead of silently degrading."""
    if not run_llm:
        pytest.skip("only meaningful with --run-llm")

    from app.services.ai_service import AIService

    parsed, model = await AIService._call_llm_json(
        'Reply with only this JSON object and nothing else: {"ok": true}'
    )
    assert parsed is not None, f"provider returned nothing usable (model={model})"
    assert model and "heuristic" not in model, (
        f"fell back to heuristics instead of calling a provider (model={model})"
    )