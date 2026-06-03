import SwiftUI

struct ErrorBanner: View {
    let message: String
    var onRetry: (() -> Void)? = nil

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 16))
                .foregroundColor(Theme.Colors.danger)
                .accessibilityHidden(true)

            Text(message)
                .font(Theme.Typography.label)
                .foregroundColor(Theme.Colors.textPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)

            if let retry = onRetry {
                Button("Tekrar dene") { retry() }
                    .auraButton(variant: .outline, size: .sm, fullWidth: false)
            }
        }
        .padding(Theme.Spacing.md)
        .background(
            RoundedRectangle(cornerRadius: Theme.Radius.md)
                .fill(Theme.Colors.dangerSoft)
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.Radius.md)
                        .stroke(Theme.Colors.danger.opacity(0.3), lineWidth: 1)
                )
        )
        .accessibilityElement(children: .combine)
        .accessibilityLabel("Hata: \(message)")
    }
}
