import XCTest
@testable import AuraPet

/// Pet adı doğrulama kuralları — create ve rename'de ortak kullanılan saf
/// fonksiyon. Backend (mutations.py: 1–20 karakter) ile parite.
final class PetValidationTests: XCTestCase {

    func testValidNamePasses() {
        XCTAssertNil(PetValidation.nameError("Lyra"))
        XCTAssertTrue(PetValidation.isValid("Orion"))
    }

    func testEmptyOrWhitespaceNameIsRejected() {
        XCTAssertEqual(PetValidation.nameError(""), "İsim boş olamaz")
        XCTAssertEqual(PetValidation.nameError("   "), "İsim boş olamaz")
        XCTAssertEqual(PetValidation.nameError("\t\n"), "İsim boş olamaz")
        XCTAssertFalse(PetValidation.isValid("  "))
    }

    func testNameLongerThan20IsRejected() {
        XCTAssertNil(PetValidation.nameError(String(repeating: "x", count: 20)))
        XCTAssertEqual(
            PetValidation.nameError(String(repeating: "x", count: 21)),
            "En fazla 20 karakter"
        )
    }

    func testNameIsTrimmedBeforeLengthCheck() {
        // Baş/sondaki boşluklar sayılmaz: trim sonrası 20 karakter geçerli olmalı.
        let padded = "  " + String(repeating: "a", count: 20) + "  "
        XCTAssertNil(PetValidation.nameError(padded))
    }
}
