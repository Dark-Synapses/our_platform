"""Conservative lexical coverage; never infer facts from uncovered text."""


def uncovered_spans(message: str, quotes: list[str]) -> list[str]:
    """Keep the entire message if any meaningful text lacks exact coverage.

    Questions and repeated facts may be retained. Coverage is not entailment.
    Keeping the full message avoids splitting decimals, clauses or negations.
    """
    covered = [False] * len(message)
    for quote in quotes:
        if not quote.strip():
            continue
        # Repeated quotes are ambiguous; do not assume all occurrences match.
        start = message.find(quote)
        if start < 0 or message.find(quote, start + 1) >= 0:
            continue
        covered[start:start + len(quote)] = [True] * len(quote)
    if any(not flag and not char.isspace()
           for char, flag in zip(message, covered, strict=True)):
        return [message]
    return []


def acknowledge_evidence(state, topic_id: str, text: str):
    """Explicit caller-owned acknowledgement; never promotes text to facts.

    Only call after a trusted review or user confirmation. The caller must
    persist the returned state using the normal optimistic revision check.
    """
    from app.modules.karen.context import KarenSessionState

    candidate = KarenSessionState.model_validate_json(state.model_dump_json())
    candidate.unresolved_evidence = [
        entry for entry in candidate.unresolved_evidence
        if (entry.topic_id, entry.text) != (topic_id, text)
    ]
    return candidate
