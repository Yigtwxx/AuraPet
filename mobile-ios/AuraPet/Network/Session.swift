import Foundation

protocol SessionStorage {
    func getString(forKey key: String) -> String?
    func setString(_ value: String, forKey key: String)
    func removeString(forKey key: String)
}

// MARK: - Keychain storage (production)

struct KeychainStorage: SessionStorage {
    func getString(forKey key: String) -> String? {
        Keychain.get(forKey: key)
    }
    func setString(_ value: String, forKey key: String) {
        try? Keychain.set(value, forKey: key)
    }
    func removeString(forKey key: String) {
        Keychain.delete(forKey: key)
    }
}

// MARK: - In-memory storage (tests)

final class InMemoryStorage: SessionStorage {
    private var store: [String: String] = [:]
    func getString(forKey key: String) -> String? { store[key] }
    func setString(_ value: String, forKey key: String) { store[key] = value }
    func removeString(forKey key: String) { store.removeValue(forKey: key) }
}

// MARK: - Session

final class Session {
    static let shared = Session()
    private let key = "aurapet_user_id"
    var storage: SessionStorage = KeychainStorage()

    private init() {}

    var userId: String? {
        get { storage.getString(forKey: key) }
        set {
            if let v = newValue { storage.setString(v, forKey: key) }
            else { storage.removeString(forKey: key) }
        }
    }

    func clear() { userId = nil }
}
