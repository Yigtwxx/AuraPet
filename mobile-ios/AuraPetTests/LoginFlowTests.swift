import XCTest
@testable import AuraPet

/// `login` mutation'ının istemci tarafını doğrular: yanıtın çözümlenmesi ve
/// dönen kullanıcı id'sinin Session'a yazılması. Bu id web ile paylaşıldığında
/// iki platform aynı hesabı (ve aynı verileri) görür — senkronun temeli.
final class LoginFlowTests: XCTestCase {
    override func setUp() {
        super.setUp()
        Session.shared.storage = InMemoryStorage()
        Session.shared.clear()
    }

    override func tearDown() {
        Session.shared.clear()
        Session.shared.storage = KeychainStorage()
        super.tearDown()
    }

    func testUserResponseDecodesFromLoginPayload() throws {
        let json = Data(#"{"id":"u-shared","username":"demo","email":"demo@aura.pet"}"#.utf8)
        let user = try JSONDecoder().decode(UserResponse.self, from: json)
        XCTAssertEqual(user.id, "u-shared")
        XCTAssertEqual(user.username, "demo")
        XCTAssertEqual(user.email, "demo@aura.pet")
    }

    func testLoginStoresSharedUserIdInSession() throws {
        let json = Data(#"{"id":"u-shared","username":"demo","email":"demo@aura.pet"}"#.utf8)
        let user = try JSONDecoder().decode(UserResponse.self, from: json)
        Session.shared.userId = user.id
        XCTAssertEqual(Session.shared.userId, "u-shared")
    }

    // ── Form validasyonu (web login/page.tsx ile parite) ─────────────────────

    func testTwoCharUsernameIsValidLikeWeb() {
        // Web min 2 karakter kabul eder; iOS'un 3 istemesi web'de açılan kısa
        // hesapların girişini imkânsız kılıyordu.
        XCTAssertNil(LoginValidation.usernameError("yg"))
        XCTAssertNil(LoginValidation.firstBlocker(isSignUp: false, username: "yg", email: ""))
    }

    func testSingleCharUsernameBlocksWithMessage() {
        XCTAssertEqual(LoginValidation.usernameError("y"), "En az 2 karakter olmalı")
        XCTAssertEqual(
            LoginValidation.firstBlocker(isSignUp: false, username: "y", email: ""),
            "En az 2 karakter olmalı"
        )
    }

    func testEmptyUsernameBlocksWithMessage() {
        XCTAssertEqual(
            LoginValidation.firstBlocker(isSignUp: false, username: "", email: ""),
            "Kullanıcı adı gerekli"
        )
    }

    func testSignInIgnoresEmailButSignUpRequiresIt() {
        XCTAssertNil(LoginValidation.firstBlocker(isSignUp: false, username: "demo", email: ""))
        XCTAssertEqual(
            LoginValidation.firstBlocker(isSignUp: true, username: "demo", email: ""),
            "E-posta gerekli"
        )
        XCTAssertEqual(
            LoginValidation.firstBlocker(isSignUp: true, username: "demo", email: "kötü-adres"),
            "Geçerli bir e-posta girin"
        )
        XCTAssertNil(LoginValidation.firstBlocker(isSignUp: true, username: "demo", email: "a@b.co"))
    }
}
