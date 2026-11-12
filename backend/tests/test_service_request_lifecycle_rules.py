import pytest

from app.modules.service_requests.lifecycle import can_transition


@pytest.mark.parametrize(
    ("current", "target"),
    [
        ("submitted", "in_review"),
        ("in_review", "approved"),
        ("in_review", "rejected"),
        ("approved", "in_review"),
        ("rejected", "in_review"),
    ],
)
def test_allowed_transitions(current, target):
    assert can_transition(current, target)


@pytest.mark.parametrize(
    ("current", "target"),
    [
        ("submitted", "submitted"),
        ("submitted", "approved"),
        ("submitted", "rejected"),
        ("in_review", "in_review"),
        ("approved", "approved"),
        ("approved", "rejected"),
        ("rejected", "rejected"),
        ("rejected", "approved"),
        ("unknown", "in_review"),
    ],
)
def test_rejected_transitions(current, target):
    assert not can_transition(current, target)
