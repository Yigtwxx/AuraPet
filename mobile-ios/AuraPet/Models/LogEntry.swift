import Foundation

struct LogEntry: Identifiable {
    let id: String
    let userId: String
    let entryText: String
    let sentimentScore: Double
    let createdAt: String

    var moodColor: Mood {
        if sentimentScore > 0.25  { return .happy }
        if sentimentScore >= -0.25 { return .neutral }
        if sentimentScore >= -0.65 { return .sad }
        return .anxious
    }

    var formattedDate: String {
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let date = iso.date(from: createdAt) else { return createdAt }
        let f = DateFormatter()
        f.locale = Locale(identifier: "tr_TR")
        f.dateStyle = .medium
        f.timeStyle = .short
        return f.string(from: date)
    }

    var scoreString: String {
        String(format: sentimentScore >= 0 ? "+%.2f" : "%.2f", sentimentScore)
    }
}
