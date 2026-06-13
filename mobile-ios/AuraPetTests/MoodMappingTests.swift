import XCTest
@testable import AuraPet

final class MoodMappingTests: XCTestCase {
    func testMoodFromValidString() {
        XCTAssertEqual(Mood.from("HAPPY"),   .happy)
        XCTAssertEqual(Mood.from("NEUTRAL"), .neutral)
        XCTAssertEqual(Mood.from("SAD"),     .sad)
        XCTAssertEqual(Mood.from("ANXIOUS"), .anxious)
    }

    func testMoodFromInvalidStringFallsBackToNeutral() {
        XCTAssertEqual(Mood.from("UNKNOWN"),  .neutral)
        XCTAssertEqual(Mood.from(""),         .neutral)
        XCTAssertEqual(Mood.from("happy"),    .neutral)
    }

    func testAllMoodsHaveNonEmptyLabels() {
        for mood in Mood.allCases {
            XCTAssertFalse(mood.label.isEmpty)
        }
    }

    func testAllMoodsHaveNonEmptyLottieNames() {
        for mood in Mood.allCases {
            XCTAssertFalse(mood.lottieName.isEmpty)
            XCTAssertEqual(mood.lottieName, mood.rawValue.lowercased())
        }
    }

    func testMoodCaseIterable() {
        XCTAssertEqual(Mood.allCases.count, 4)
    }
}
