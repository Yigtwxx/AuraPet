import SwiftUI

extension Theme {
    enum Colors {
        // ── Canvas & Surface (petrol kömürü / serin kâğıt — web globals.css ile uyumlu) ──
        static let canvas        = Color("Canvas",   bundle: nil).adaptive(dark: Color(hex: "#0F1514"),  light: Color(hex: "#F6FAF9"))
        static let elevated      = Color("Elevated", bundle: nil).adaptive(dark: Color(hex: "#1D2624"),  light: Color(hex: "#FFFFFF"))
        static let surfaceMuted  = Color("SurfaceMuted", bundle: nil).adaptive(dark: Color(hex: "#243029"), light: Color(hex: "#EDF3F1"))
        static let glass         = adaptiveColor(dark: Color(hex: "#EDF2F0").opacity(0.04), light: Color.white.opacity(0.72))
        static let glassStrong   = adaptiveColor(dark: Color(hex: "#EDF2F0").opacity(0.08), light: Color.white.opacity(0.88))

        // ── Borders ───────────────────────────────────────────────
        static let borderSubtle  = adaptiveColor(dark: Color(hex: "#EDF2F0").opacity(0.08), light: Color.black.opacity(0.08))
        static let borderStrong  = adaptiveColor(dark: Color(hex: "#EDF2F0").opacity(0.14), light: Color.black.opacity(0.14))

        // ── Text ──────────────────────────────────────────────────
        static let textPrimary   = adaptiveColor(dark: Color(hex: "#EDF2F0"), light: Color(hex: "#14201D"))
        static let textMuted     = adaptiveColor(dark: Color(hex: "#8C9893"), light: Color(hex: "#65736E"))
        static let textSubtle    = adaptiveColor(dark: Color(hex: "#5E6A66"), light: Color(hex: "#97A4A0"))
        static let textInverse   = adaptiveColor(dark: Color(hex: "#0F1514"), light: Color(hex: "#F6FAF9"))

        // ── Brand (petrol / derin teal) ───────────────────────────
        static let brandPrimary   = Color(hex: "#26A6A0")
        static let brandSecondary = Color(hex: "#1E8C87")
        static let brandSoft      = Color(hex: "#26A6A0").opacity(0.15)

        // ── Semantic status ───────────────────────────────────────
        static let success       = Color(hex: "#22c55e")
        static let successSoft   = Color(hex: "#22c55e").opacity(0.14)
        static let warning       = Color(hex: "#FBBF24")
        static let warningSoft   = Color(hex: "#FBBF24").opacity(0.14)
        static let danger        = Color(hex: "#ef4444")
        static let dangerSoft    = Color(hex: "#ef4444").opacity(0.14)
        static let info          = Color(hex: "#38bdf8")
        static let infoSoft      = Color(hex: "#38bdf8").opacity(0.14)

        // ── Mood ──────────────────────────────────────────────────
        static let moodHappy     = Color(hex: "#FFD700")
        static let moodNeutral   = Color(hex: "#95A5A6")
        static let moodSad       = Color(hex: "#5B9BD5")
        static let moodAnxious   = Color(hex: "#9B59B6")

        static func moodColor(for mood: Mood) -> Color {
            switch mood {
            case .happy:   return moodHappy
            case .neutral: return moodNeutral
            case .sad:     return moodSad
            case .anxious: return moodAnxious
            }
        }
        static func moodSoft(for mood: Mood) -> Color { moodColor(for: mood).opacity(0.12) }
        static func moodGlow(for mood: Mood) -> Color  { moodColor(for: mood).opacity(0.25) }

        // ── Adaptive helper ───────────────────────────────────────
        static func adaptiveColor(dark: Color, light: Color) -> Color {
            Color(UIColor { traits in
                traits.userInterfaceStyle == .dark
                    ? UIColor(dark)
                    : UIColor(light)
            })
        }
    }
}

extension Color {
    func adaptive(dark: Color, light: Color) -> Color {
        Theme.Colors.adaptiveColor(dark: dark, light: light)
    }
}

// Hex extension — single source of truth (removed duplicate from Mood.swift).
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let r = Double((int >> 16) & 0xFF) / 255
        let g = Double((int >> 8)  & 0xFF) / 255
        let b = Double(int         & 0xFF) / 255
        self.init(red: r, green: g, blue: b)
    }
}
