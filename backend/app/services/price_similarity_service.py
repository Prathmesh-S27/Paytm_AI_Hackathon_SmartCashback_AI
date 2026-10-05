def calculate_price_similarity(user_avg: float, merchant_avg: float) -> float:
    if user_avg == 0 and merchant_avg == 0:
        return 1.0
    if user_avg == 0 or merchant_avg == 0:
        return 0.0
        
    diff = abs(user_avg - merchant_avg)
    max_val = max(user_avg, merchant_avg)
    similarity = 1.0 - (diff / max_val)
    
    return max(0.0, min(1.0, similarity))
