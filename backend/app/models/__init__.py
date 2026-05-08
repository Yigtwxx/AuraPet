from __future__ import annotations


def bson_to_str(doc: dict) -> dict:
    """
    MongoDB dökümanındaki tüm ObjectId alanlarını str'ye dönüştürür.
    Pydantic v2 model_validate() çağrısından önce kullanılmalıdır.
    """
    result = {}
    for key, value in doc.items():
        # ObjectId sınıfı adıyla tanımlıyoruz — bson importu gerektirmez
        result[key] = str(value) if type(value).__name__ == "ObjectId" else value
    return result
