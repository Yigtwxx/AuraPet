import XCTest
@testable import AuraPet

final class AurionFormTests: XCTestCase {
    func testLevel0IsSparkForm() {
        XCTAssertEqual(AurionForm(level: 0), .spark)
    }

    func testLevel1IsSparkForm() {
        XCTAssertEqual(AurionForm(level: 1), .spark)
    }

    func testLevel2IsDriftForm() {
        XCTAssertEqual(AurionForm(level: 2), .drift)
    }

    func testLevel3IsGlimmerForm() {
        XCTAssertEqual(AurionForm(level: 3), .glimmer)
    }

    func testLevel4IsAetherForm() {
        XCTAssertEqual(AurionForm(level: 4), .aether)
    }

    func testLevel5IsNovaForm() {
        XCTAssertEqual(AurionForm(level: 5), .nova)
    }

    func testHighLevelIsNovaForm() {
        XCTAssertEqual(AurionForm(level: 99), .nova)
    }

    func testNegativeLevelIsSparkForm() {
        XCTAssertEqual(AurionForm(level: -1), .spark)
    }

    func testDisplayNamesExist() {
        for form in AurionForm.allCases {
            XCTAssertFalse(form.displayName.isEmpty)
            XCTAssertFalse(form.englishName.isEmpty)
        }
    }

    func testAllFormsHaveUniqueRawValues() {
        let rawValues = AurionForm.allCases.map(\.rawValue)
        XCTAssertEqual(rawValues.count, Set(rawValues).count)
    }
}
