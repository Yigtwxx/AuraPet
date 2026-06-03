import SwiftUI

extension Theme {
    enum Elevation {
        struct ShadowStyle {
            let color: Color
            let radius: CGFloat
            let x: CGFloat
            let y: CGFloat
        }

        static let level1 = ShadowStyle(color: .black.opacity(0.12), radius: 4,  x: 0, y: 2)
        static let level2 = ShadowStyle(color: .black.opacity(0.18), radius: 12, x: 0, y: 6)
        static let level3 = ShadowStyle(color: .black.opacity(0.28), radius: 24, x: 0, y: 12)
        static let popover = ShadowStyle(color: .black.opacity(0.35), radius: 32, x: 0, y: 16)
    }
}

extension View {
    func auraElevation(_ level: Theme.Elevation.ShadowStyle) -> some View {
        self.shadow(color: level.color, radius: level.radius, x: level.x, y: level.y)
    }
}
