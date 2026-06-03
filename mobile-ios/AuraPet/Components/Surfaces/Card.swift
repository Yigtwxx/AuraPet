import SwiftUI

// MARK: - Card Variant

enum CardVariant {
    case compact, standard, elevated, glass
}

// MARK: - AuraCard

struct AuraCard<Content: View>: View {
    var variant: CardVariant = .standard
    var moodColor: Color? = nil
    var padding: CGFloat? = nil
    let content: Content

    init(
        variant: CardVariant = .standard,
        moodColor: Color? = nil,
        padding: CGFloat? = nil,
        @ViewBuilder content: () -> Content
    ) {
        self.variant = variant
        self.moodColor = moodColor
        self.padding = padding
        self.content = content()
    }

    private var effectivePadding: CGFloat {
        if let p = padding { return p }
        switch variant {
        case .compact:  return Theme.Spacing.sm
        case .standard: return Theme.Spacing.lg
        case .elevated: return Theme.Spacing.xl
        case .glass:    return Theme.Spacing.lg
        }
    }

    private var cornerRadius: CGFloat {
        switch variant {
        case .compact: return Theme.Radius.md
        default:       return Theme.Radius.lg
        }
    }

    var body: some View {
        content
            .padding(effectivePadding)
            .background(cardBackground)
            .overlay(cardBorder)
            .shadow(color: glowShadow, radius: 18, x: 0, y: 4)
            .shadow(color: .black.opacity(elevationOpacity), radius: 10, x: 0, y: 3)
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
    }

    private var cardBackground: some View {
        Group {
            switch variant {
            case .glass:
                RoundedRectangle(cornerRadius: cornerRadius)
                    .fill(.ultraThinMaterial)
                    .overlay(
                        RoundedRectangle(cornerRadius: cornerRadius)
                            .fill(Theme.Colors.glass)
                    )
            case .elevated:
                RoundedRectangle(cornerRadius: cornerRadius)
                    .fill(Theme.Colors.elevated)
            default:
                RoundedRectangle(cornerRadius: cornerRadius)
                    .fill(Theme.Colors.elevated)
                    .overlay(
                        RoundedRectangle(cornerRadius: cornerRadius)
                            .fill(Theme.Colors.glass)
                    )
            }
        }
    }

    private var cardBorder: some View {
        RoundedRectangle(cornerRadius: cornerRadius)
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
    }

    private var glowShadow: Color {
        guard let mood = moodColor else { return .clear }
        return mood.opacity(0.22)
    }

    private var elevationOpacity: Double {
        switch variant {
        case .elevated: return 0.4
        default:        return 0.25
        }
    }
}

// MARK: - Convenience modifier

extension View {
    func auraCard(
        variant: CardVariant = .standard,
        moodColor: Color? = nil,
        padding: CGFloat? = nil
    ) -> some View {
        AuraCard(variant: variant, moodColor: moodColor, padding: padding) { self }
    }
}
