ALLOWED_TRANSITIONS = {
    "submitted": frozenset({"in_review"}),
    "in_review": frozenset({"approved", "rejected"}),
    "approved": frozenset({"in_review"}),
    "rejected": frozenset({"in_review"}),
}


def can_transition(current: str, target: str) -> bool:
    return target in ALLOWED_TRANSITIONS.get(current, frozenset())
