def validate_recommendation(candidate_category: str, allowed_categories: list[str]) -> bool:
    return candidate_category in allowed_categories

def validate_gemini_response(gemini_merchants: list, allowed_categories: list[str]) -> list:
    valid = []
    for m in gemini_merchants:
        if m.get('category') in allowed_categories:
            valid.append(m)
    return valid
