def generate_customer_recommendation(
    cluster_name
):
    """Create a summary and suggested action for a customer segment.

    Args:
        cluster_name: Human-readable customer segment label.

    Returns:
        Dictionary containing a segment summary and business action.
    """
    recommendations = {
        "Premium Loyal Customers": {
            "summary": (
                "Highly engaged customer with "
                "strong purchasing behavior."
            ),
            "business_action": (
                "Recommend premium products, "
                "VIP rewards, and loyalty programs."
            )
        },
        "Regular Customers": {
            "summary": (
                "Moderately active customer "
                "with stable purchasing patterns."
            ),
            "business_action": (
                "Recommend personalized offers "
                "and engagement campaigns."
            )
        },
        "High-Value Customers": {
            "summary": (
                "High-spend customer with strong value potential."
            ),
            "business_action": (
                "Offer curated bundles, early access, and tailored "
                "high-value product recommendations."
            )
        },
        "Dormant Customers": {
            "summary": (
                "Inactive customer with low "
                "recent engagement."
            ),
            "business_action": (
                "Send re-engagement emails, "
                "discounts, and win-back campaigns."
            )
        }
    }

    return recommendations.get(
        cluster_name,
        {
            "summary": "Unknown customer type.",
            "business_action": (
                "Further analysis required."
            )
        }
    )
