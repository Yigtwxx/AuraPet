import SwiftUI

// MARK: - Variants & Sizes

enum AuraButtonVariant {
    case primary, secondary, ghost, danger, outline
}

enum AuraButtonSize {
    case sm, md, lg
}

// MARK: - Style

struct AuraButtonStyle: ButtonStyle {
    var variant: AuraButtonVariant = .primary
    var size: AuraButtonSize = .md
    var isLoading: Bool = false
    var fullWidth: Bool = true

    func makeBody(configuration: Configuration) -> some View {
        AuraButtonBody(
            configuration: configuration,
            variant: variant,
            size: size,
            isLoading: isLoading,
            fullWidth: fullWidth
        )
    }
}

// MARK: - Body

private struct AuraButtonBody: View {
    let configuration: ButtonStyleConfiguration
    let variant: AuraButtonVariant
    let size: AuraButtonSize
    let isLoading: Bool
    let fullWidth: Bool

    @Environment(\.isEnabled) private var isEnabled
    private var isPressed: Bool { configuration.isPressed }

    var body: some View {
        ZStack {
            // Background layer
            RoundedRectangle(cornerRadius: Theme.Radius.md)
                .fill(background)
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.Radius.md)
                        .stroke(borderColor, lineWidth: 1)
                )
                .shadow(color: glowColor, radius: isPressed ? 6 : 10, x: 0, y: isPressed ? 2 : 4)

            // Content
            Group {
                if isLoading {
                    ProgressView()
                        .scaleEffect(0.85)
                        .tint(foregroundColor)
                } else {
                    configuration.label
                        .font(labelFont)
                }
            }
            .foregroundColor(foregroundColor)
            .padding(.vertical, verticalPadding)
            .padding(.horizontal, horizontalPadding)
        }
        .frame(maxWidth: fullWidth ? .infinity : nil)
        .scaleEffect(isPressed ? 0.97 : 1.0)
        .opacity(isEnabled ? (isPressed ? 0.9 : 1.0) : 0.4)
        .animation(Theme.Motion.responsive, value: isPressed)
        .onChange(of: isPressed) { _, pressing in
            if pressing { Theme.Haptics.light() }
        }
    }

    // ── Computed style properties ────────────────────────────────────────

    private var background: AnyShapeStyle {
        switch variant {
        case .primary:
            // Düz marka rengi — gradient/glow yok (web tasarım dili paritesi).
            return AnyShapeStyle(Theme.Colors.brandPrimary)
        case .secondary:
            return AnyShapeStyle(Theme.Colors.glassStrong)
        case .ghost:
            return AnyShapeStyle(Color.clear)
        case .danger:
            return AnyShapeStyle(Theme.Colors.dangerSoft)
        case .outline:
            return AnyShapeStyle(Color.clear)
        }
    }

    private var foregroundColor: Color {
        switch variant {
        case .primary:   return .white
        case .secondary: return Theme.Colors.textPrimary
        case .ghost:     return Theme.Colors.textMuted
        case .danger:    return Theme.Colors.danger
        case .outline:   return Theme.Colors.brandPrimary
        }
    }

    private var borderColor: Color {
        switch variant {
        case .primary:   return .clear
        case .secondary: return Theme.Colors.borderStrong
        case .ghost:     return .clear
        case .danger:    return Theme.Colors.danger.opacity(0.35)
        case .outline:   return Theme.Colors.brandPrimary.opacity(0.5)
        }
    }

    private var glowColor: Color {
        switch variant {
        case .primary: return Color.black.opacity(isPressed ? 0.10 : 0.18)
        default:       return .clear
        }
    }

    private var labelFont: Font {
        switch size {
        case .sm: return Theme.Typography.eyebrow
        case .md: return Theme.Typography.h4
        case .lg: return .system(.body, design: .default, weight: .semibold)
        }
    }

    private var verticalPadding: CGFloat {
        switch size {
        case .sm: return 9
        case .md: return 13
        case .lg: return 17
        }
    }

    private var horizontalPadding: CGFloat {
        switch size {
        case .sm: return 14
        case .md: return 20
        case .lg: return 28
        }
    }
}

// MARK: - View modifier shorthand

extension View {
    func auraButton(
        variant: AuraButtonVariant = .primary,
        size: AuraButtonSize = .md,
        isLoading: Bool = false,
        fullWidth: Bool = true
    ) -> some View {
        buttonStyle(AuraButtonStyle(variant: variant, size: size, isLoading: isLoading, fullWidth: fullWidth))
    }
}
