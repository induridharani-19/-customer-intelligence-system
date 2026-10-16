def build_customer_hierarchy():
    """Build a high-level hierarchy for customer segments.

    Args:
        None.

    Returns:
        Nested dictionary describing active and inactive segment groups.
    """
    hierarchy = {
        "Customers": {
            "Active": [
                "Premium Loyal Customers",
                "High-Value Customers",
                "Regular Customers"
            ],
            "Inactive": [
                "Dormant Customers"
            ]
        }
    }

    return hierarchy
