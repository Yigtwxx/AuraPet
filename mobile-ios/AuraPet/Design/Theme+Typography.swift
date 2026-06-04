import SwiftUI

extension Theme {
    enum Typography {
        // Dynamic Type-compatible scale using text styles + relative sizes.
        // These scale automatically with the user's preferred text size.
        static let display = Font.system(.largeTitle, design: .rounded, weight: .bold)
        static let h1      = Font.system(.title,      design: .rounded, weight: .bold)
        static let h2      = Font.system(.title2,     design: .rounded, weight: .bold)
        static let h3      = Font.system(.title3,     design: .default, weight: .semibold)
        static let h4      = Font.system(.callout,    design: .default, weight: .semibold)
        static let body    = Font.system(.body,       design: .default, weight: .regular)
        static let label   = Font.system(.subheadline,design: .default, weight: .medium)
        static let caption = Font.system(.caption,    design: .default, weight: .regular)
        static let mono    = Font.system(.subheadline,design: .monospaced, weight: .regular)
        static let eyebrow = Font.system(.caption2,   design: .default, weight: .semibold)
    }
}

// Convenience modifier for tracking/line-height control
extension View {
    func auraFont(_ font: Font, tracking: CGFloat = 0) -> some View {
        self.font(font).tracking(tracking)
    }
}
