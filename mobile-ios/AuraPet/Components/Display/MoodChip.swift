import SwiftUI

struct MoodChip: View {
    let mood: Mood

    var body: some View {
        Text(mood.label)
            .font(Theme.Typography.caption)
            .fontWeight(.semibold)
            .foregroundColor(mood.color)
            .padding(.horizontal, Theme.Spacing.sm + 2)
            .padding(.vertical, Theme.Spacing.xs)
            .background(
                Capsule()
                    .fill(mood.color.opacity(0.12))
                    .overlay(
                        Capsule()
                            .stroke(mood.color.opacity(0.3), lineWidth: 1)
                    )
            )
            .shadow(color: mood.color.opacity(0.2), radius: 4, x: 0, y: 0)
    }
}

// Backward compatibility alias so existing code using MoodBadge still compiles
typealias MoodBadge = MoodChip
