import Foundation

// ---------------------------------------------------------------------------
// MARK: – Minimal GraphQL HTTP client (no codegen required)
// ---------------------------------------------------------------------------
// Bu dosya Apollo iOS SDK'sını simgeler ama bağımlılık gerektirmez.
// Gerçek Apollo iOS entegrasyonu için README'deki adımları izleyin.
// ---------------------------------------------------------------------------

struct GraphQLError: Decodable, Error, LocalizedError {
    let message: String
    var errorDescription: String? { message }
}

struct GraphQLResponse<T: Decodable>: Decodable {
    let data: T?
    let errors: [GraphQLError]?
}

final class AuraGraphQL {
    static let shared = AuraGraphQL()
    private let url: URL
    private init() {
        let raw = Bundle.main.object(forInfoDictionaryKey: "AURAPET_GRAPHQL_URL") as? String
            ?? "http://localhost:8000/graphql"
        url = URL(string: raw)!
    }

    /// Ortak istek + GraphQL hata kontrolü; yanıtın `data` düğümünü döndürür.
    private func dataNode(query: String, variables: [String: Any]) async throws -> [String: Any] {
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONSerialization.data(withJSONObject: [
            "query": query,
            "variables": variables,
        ])

        let (data, _) = try await URLSession.shared.data(for: req)
        let raw = try JSONDecoder().decode([String: AnyCodable].self, from: data)

        // Check for errors
        if let errorsArr = raw["errors"]?.value as? [[String: Any]],
           let firstMsg = errorsArr.first?["message"] as? String {
            throw GraphQLError(message: firstMsg)
        }

        guard let node = raw["data"]?.value as? [String: Any] else {
            throw GraphQLError(message: "Yanıt verisi bulunamadı")
        }
        return node
    }

    /// Bir nesne/dizi döndüren query veya mutation'lar için.
    func perform<T: Decodable>(
        query: String,
        variables: [String: Any] = [:],
        decodingPath: String,
        as _: T.Type
    ) async throws -> T {
        let node = try await dataNode(query: query, variables: variables)
        guard let target = node[decodingPath] else {
            throw GraphQLError(message: "Yanıt verisi bulunamadı: \(decodingPath)")
        }
        let targetData = try JSONSerialization.data(withJSONObject: target)
        return try JSONDecoder().decode(T.self, from: targetData)
    }

    /// Skaler boolean döndüren mutation'lar için (ör. deletePet).
    /// `JSONSerialization` top-level fragment'ları desteklemediğinden değer
    /// doğrudan ayrıştırılmış düğümden okunur.
    func performBool(
        query: String,
        variables: [String: Any] = [:],
        decodingPath: String
    ) async throws -> Bool {
        let node = try await dataNode(query: query, variables: variables)
        if let flag = node[decodingPath] as? Bool { return flag }
        if let number = node[decodingPath] as? NSNumber { return number.boolValue }
        throw GraphQLError(message: "Beklenen boolean yanıt alınamadı: \(decodingPath)")
    }
}

// ---------------------------------------------------------------------------
// MARK: – AnyCodable helper
// ---------------------------------------------------------------------------

struct AnyCodable: Codable {
    let value: Any

    init(_ value: Any) { self.value = value }

    init(from decoder: Decoder) throws {
        let c = try decoder.singleValueContainer()
        if let v = try? c.decode(Bool.self) { value = v }
        else if let v = try? c.decode(Int.self) { value = v }
        else if let v = try? c.decode(Double.self) { value = v }
        else if let v = try? c.decode(String.self) { value = v }
        else if let v = try? c.decode([String: AnyCodable].self) {
            value = v.mapValues { $0.value }
        }
        else if let v = try? c.decode([AnyCodable].self) {
            value = v.map { $0.value }
        }
        else { value = NSNull() }
    }

    func encode(to encoder: Encoder) throws {
        var c = encoder.singleValueContainer()
        switch value {
        case let v as Bool:   try c.encode(v)
        case let v as Int:    try c.encode(v)
        case let v as Double: try c.encode(v)
        case let v as String: try c.encode(v)
        case let v as [String: Any]:
            try c.encode(v.mapValues { AnyCodable($0) })
        case let v as [Any]:
            try c.encode(v.map { AnyCodable($0) })
        default:
            try c.encodeNil()
        }
    }
}
