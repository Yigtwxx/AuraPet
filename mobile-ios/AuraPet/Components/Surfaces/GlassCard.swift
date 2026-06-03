import SwiftUI

struct GlassCard<Content: View>: View {
    var moodColor: Color?
    var glowIntensity: Double = 0
    let content: Content

    init(moodColor: Color? = nil, glowIntensity: Double = 0, @ViewBuilder content: () -> Content) {
        self.moodColor = moodColor
        self.glowIntensity = glowIntensity
        self.content = content()
    }

    var body: some View {
        content
            .background(
                RoundedRectangle(cornerRadius: Theme.Radius.lg)
                    .fill(.ultraThinMaterial)
                    .overlay(
                        RoundedRectangle(cornerRadius: Theme.Radius.lg)
                            .fill(Theme.Colors.glass)
                    )
            )
            .overlay(
                RoundedRectangle(cornerRadius: Theme.Radius.lg)
                    .stroke(
                        LinearGradient(
                            stops: [
                                .init(color: Theme.Colors.borderStrong, location: 0),
                                .init(color: Theme.Colors.borderSubtle, location: 1),
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            )
            .shadow(
                color: moodColor?.opacity(glowIntensity > 0 ? glowIntensity * 0.25 : 0) ?? .clear,
                radius: 20, x: 0, y: 4
            )
            .shadow(color: .black.opacity(0.3), radius: 12, x: 0, y: 4)
            .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.lg))
    }
}

extension View {
    func glassCard(moodColor: Color? = nil, glowIntensity: Double = 0) -> some View {
        GlassCard(moodColor: moodColor, glowIntensity: glowIntensity) { self }
    }
}
