import SwiftUI

struct EmptyState: View {
    let icon: String
    let title: String
    let description: String
    var action: (() -> Void)? = nil
    var actionLabel: String = "Başla"
    var accentColor: Color = Theme.Colors.brandPrimary

    var body: some View {
        VStack(spacing: 20) {
            // Icon orb
            ZStack {
                Circle()
                    .fill(accentColor.opacity(0.1))
                    .frame(width: 80, height: 80)
                Circle()
                    .stroke(accentColor.opacity(0.2), lineWidth: 1)
                    .frame(width: 80, height: 80)
                Image(systemName: icon)
                    .font(.system(size: 30, weight: .medium))
                    .foregroundColor(accentColor)
            }
            .accessibilityHidden(true)

            VStack(spacing: 8) {
                Text(title)
                    .font(Theme.Typography.h3)
                    .foregroundColor(Theme.Colors.textPrimary)
                    .multilineTextAlignment(.center)

                Text(description)
                    .font(Theme.Typography.body)
                    .foregroundColor(Theme.Colors.textMuted)
                    .multilineTextAlignment(.center)
                    .fixedSize(horizontal: false, vertical: true)
            }

            if let action {
                Button(actionLabel, action: action)
                    .auraButton(size: .md, fullWidth: false)
            }
        }
        .padding(Theme.Spacing.xl)
        .frame(maxWidth: .infinity)
        .accessibilityElement(children: .combine)
    }
}
