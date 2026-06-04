import Foundation

struct Pet: Identifiable, Hashable {
    let id: String
    let userId: String
    var name: String
    var level: Int
    var xp: Int
    var currentMood: Mood
    var colorTheme: String

    static let xpThresholds = [0, 100, 250, 500, 900]

    var xpProgress: Double {
        let current = Pet.xpThresholds[safe: level - 1] ?? 0
        let next    = Pet.xpThresholds[safe: level]    ?? xp
        guard next > current else { return 1 }
        return min(Double(xp - current) / Double(next - current), 1)
    }

    var isMaxLevel: Bool { level >= 5 }
}

extension Array {
    subscript(safe index: Int) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}
