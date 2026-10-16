import pytest

from src.api import fallback_prediction


def test_fallback_prediction_returns_all_known_cluster_probabilities():
    """Fallback output must stay usable when TensorFlow artifacts are absent."""
    prediction = fallback_prediction([35, 4.9, 7.8, 7.3, 3.5])

    assert prediction["cluster_name"] == "Premium Loyal Customers"
    assert prediction["model_status"] == "heuristic fallback"
    assert len(prediction["probabilities"][0]) == 4
    assert sum(prediction["probabilities"][0]) == pytest.approx(1)


def test_fallback_prediction_labels_high_value_customers():
    """A high unit-price profile should not become an unnamed segment."""
    prediction = fallback_prediction([84, 0.7, 0.7, 0.7, 2500])

    assert prediction["cluster_name"] == "High-Value Customers"
    assert "curated bundles" in prediction["business_action"]
