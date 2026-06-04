import Foundation

// ---------------------------------------------------------------------------
// MARK: – High-level API façade
// ---------------------------------------------------------------------------

final class AuraPetAPI {
    static let shared = AuraPetAPI()
    private let gql = AuraGraphQL.shared
    private init() {}

    // MARK: Users

    func createUser(username: String, email: String) async throws -> UserResponse {
        try await gql.perform(
            query: GQLMutation.createUser,
            variables: ["username": username, "email": email],
            decodingPath: "createUser",
            as: UserResponse.self
        )
    }

    // MARK: Pets

    func getUserPets(userId: String) async throws -> [PetResponse] {
        try await gql.perform(
            query: GQLQuery.getUserPets,
            variables: ["userId": userId],
            decodingPath: "getUserPets",
            as: [PetResponse].self
        )
    }

    func createPet(userId: String, name: String) async throws -> PetResponse {
        try await gql.perform(
            query: GQLMutation.createPet,
            variables: ["userId": userId, "name": name],
            decodingPath: "createPet",
            as: PetResponse.self
        )
    }

    func updatePet(petId: String, name: String) async throws -> PetResponse {
        try await gql.perform(
            query: GQLMutation.updatePet,
            variables: ["petId": petId, "name": name],
            decodingPath: "updatePet",
            as: PetResponse.self
        )
    }

    @discardableResult
    func deletePet(petId: String) async throws -> Bool {
        try await gql.performBool(
            query: GQLMutation.deletePet,
            variables: ["petId": petId],
            decodingPath: "deletePet"
        )
    }

    func addLogEntry(userId: String, entryText: String) async throws -> LogAnalysisResponse {
        try await gql.perform(
            query: GQLMutation.addLogEntry,
            variables: ["userId": userId, "entryText": entryText],
            decodingPath: "addLogEntry",
            as: LogAnalysisResponse.self
        )
    }

    // MARK: Logs

    func getLogs(userId: String) async throws -> [LogResponse] {
        try await gql.perform(
            query: GQLQuery.getLogs,
            variables: ["userId": userId],
            decodingPath: "getLogs",
            as: [LogResponse].self
        )
    }
}
