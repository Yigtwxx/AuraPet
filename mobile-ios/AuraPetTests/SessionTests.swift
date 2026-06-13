import XCTest
@testable import AuraPet

final class SessionTests: XCTestCase {
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

    func testInitialSessionIsNil() {
        XCTAssertNil(Session.shared.userId)
    }

    func testSetAndGetUserId() {
        Session.shared.userId = "user-123"
        XCTAssertEqual(Session.shared.userId, "user-123")
    }

    func testClearRemovesUserId() {
        Session.shared.userId = "user-456"
        Session.shared.clear()
        XCTAssertNil(Session.shared.userId)
    }

    func testOverwriteUserId() {
        Session.shared.userId = "old-id"
        Session.shared.userId = "new-id"
        XCTAssertEqual(Session.shared.userId, "new-id")
    }
}
