import SwiftUI

enum Mood: String, CaseIterable {
    case happy   = "HAPPY"
    case neutral = "NEUTRAL"
    case sad     = "SAD"
    case anxious = "ANXIOUS"

    var label: String {
        switch self {
        case .happy:   return "Mutlu 😄"
        case .neutral: return "Nötr 😐"
        case .sad:     return "Üzgün 😔"
        case .anxious: return "Endişeli 😰"
        }
    }

    var color: Color {
        switch self {
        case .happy:   return Color(hex: "#FFD700")
        case .neutral: return Color(hex: "#95A5A6")
        case .sad:     return Color(hex: "#5B9BD5")
        case .anxious: return Color(hex: "#9B59B6")
        }
    }

    var lottieName: String { rawValue.lowercased() }

    static func from(_ string: String) -> Mood {
        return Mood(rawValue: string) ?? .neutral
    }
}

// Color(hex:) is defined in Design/Theme+Colors.swift — single source of truth.
