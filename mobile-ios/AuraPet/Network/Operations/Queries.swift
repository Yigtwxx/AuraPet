import Foundation

// ---------------------------------------------------------------------------
// MARK: – Raw GraphQL query strings
// ---------------------------------------------------------------------------

enum GQLQuery {
    static let getUserPets = """
    query GetUserPets($userId: ID!) {
      getUserPets(userId: $userId) {
        id
        name
        level
        xp
        currentMood
        colorTheme
      }
    }
    """

    static let getLogs = """
    query GetLogs($userId: ID!) {
      getLogs(userId: $userId) {
        id
        entryText
        sentimentScore
        createdAt
      }
    }
    """
}

// ---------------------------------------------------------------------------
// MARK: – Raw GraphQL mutation strings
// ---------------------------------------------------------------------------

enum GQLMutation {
    static let createUser = """
    mutation CreateUser($username: String!, $email: String!) {
      createUser(username: $username, email: $email) {
        id
        username
        email
      }
    }
    """

    static let createPet = """
    mutation CreatePet($userId: ID!, $name: String!) {
      createPet(userId: $userId, name: $name) {
        id
        name
        level
        xp
        currentMood
        colorTheme
      }
    }
    """

    static let updatePet = """
    mutation UpdatePet($petId: ID!, $name: String!) {
      updatePet(petId: $petId, name: $name) {
        id
        name
        level
        xp
        currentMood
        colorTheme
      }
    }
    """

    static let deletePet = """
    mutation DeletePet($petId: ID!) {
      deletePet(petId: $petId)
    }
    """

    static let addLogEntry = """
    mutation AddLogEntry($userId: ID!, $entryText: String!) {
      addLogEntry(userId: $userId, entryText: $entryText) {
        sentimentLabel
        sentimentScore
        pet {
          id
          name
          level
          xp
          currentMood
          colorTheme
        }
      }
    }
    """
}

// ---------------------------------------------------------------------------
// MARK: – Decodable response types
// ---------------------------------------------------------------------------

struct PetResponse: Decodable {
    let id: String
    let name: String
    let level: Int
    let xp: Int
    let currentMood: String
    let colorTheme: String

    func toPet(userId: String) -> Pet {
        Pet(
            id: id,
            userId: userId,
            name: name,
            level: level,
            xp: xp,
            currentMood: Mood.from(currentMood),
            colorTheme: colorTheme
        )
    }
}

struct UserResponse: Decodable {
    let id: String
    let username: String
    let email: String
}

struct LogResponse: Decodable {
    let id: String
    let entryText: String
    let sentimentScore: Double
    let createdAt: String

    func toEntry(userId: String) -> LogEntry {
        LogEntry(
            id: id,
            userId: userId,
            entryText: entryText,
            sentimentScore: sentimentScore,
            createdAt: createdAt
        )
    }
}

/// `addLogEntry` mutation sonucu — backend'in `LogAnalysisResult` tipini yansıtır.
/// Web istemcisindeki `ADD_LOG_ENTRY` sorgusuyla aynı alan seçimini kullanır.
struct LogAnalysisResponse: Decodable {
    let sentimentLabel: String   // "POSITIVE" | "NEGATIVE" | "NEUTRAL"
    let sentimentScore: Double   // -1.0 .. +1.0
    let pet: PetResponse
}
