import XCTest
@testable import AuraPet

final class PetXPTests: XCTestCase {
    private func makePet(xp: Int, level: Int) -> Pet {
        Pet(id: "1", userId: "u1", name: "Test", level: level, xp: xp,
            currentMood: .neutral, colorTheme: "#7C5CFF")
    }

    func testXPThresholdsCount() {
        XCTAssertEqual(Pet.xpThresholds.count, 5)
        XCTAssertEqual(Pet.xpThresholds, [0, 100, 250, 500, 900])
    }

    func testLevel1ZeroXPProgressIsZero() {
        let pet = makePet(xp: 0, level: 1)
        XCTAssertEqual(pet.xpProgress, 0, accuracy: 0.001)
    }

    func testLevel1HalfwayProgress() {
        let pet = makePet(xp: 50, level: 1)
        XCTAssertEqual(pet.xpProgress, 0.5, accuracy: 0.001)
    }

    func testLevel1FullProgress() {
        let pet = makePet(xp: 100, level: 1)
        XCTAssertEqual(pet.xpProgress, 1.0, accuracy: 0.001)
    }

    func testLevel2Progress() {
        // Level 2: threshold 100→250, span = 150
        let pet = makePet(xp: 175, level: 2)
        XCTAssertEqual(pet.xpProgress, 0.5, accuracy: 0.001)
    }

    func testMaxLevelCheck() {
        let maxPet = makePet(xp: 900, level: 5)
        XCTAssertTrue(maxPet.isMaxLevel)
        let lowPet = makePet(xp: 0, level: 1)
        XCTAssertFalse(lowPet.isMaxLevel)
    }

    func testXPProgressClampedToOne() {
        let pet = makePet(xp: 9999, level: 1)
        XCTAssertEqual(pet.xpProgress, 1.0, accuracy: 0.001)
    }
}
