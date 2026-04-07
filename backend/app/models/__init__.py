from __future__ import annotations


def bson_to_str(doc: dict) -> dict:
    """
    MongoDB dökümanındaki ObjectId alanlarını str'ye dönüştürür.
    Pydantic v2 model_validate() çağrısından önce kullanılmalıdır.
    """
    result = dict(doc)
    for key in ("_id", "user_id"):
        if key in result:
            result[key] = str(result[key])
    return result
