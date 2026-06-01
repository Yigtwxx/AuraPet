import SwiftUI

struct XpBar: View {
    let pet: Pet

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
            HStack {
                Text("XP \(pet.xp)")
                    .font(Theme.Typography.caption)
                    .foregroundColor(Theme.Colors.textMuted)
                Spacer()
                if pet.isMaxLevel {
                    Text("Maks Seviye!")
                        .font(Theme.Typography.caption)
                        .fontWeight(.bold)
                        .foregroundColor(pet.currentMood.color)
                } else {
                    let next = Pet.xpThresholds[safe: pet.level] ?? pet.xp
                    Text("Sonraki \(next)")
                        .font(Theme.Typography.caption)
                        .foregroundColor(Theme.Colors.textMuted)
                }
            }

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    // Track
                    RoundedRectangle(cornerRadius: Theme.Radius.xs)
                        .fill(Theme.Colors.borderSubtle)
                        .frame(height: 6)

                    // Fill with gradient
                    RoundedRectangle(cornerRadius: Theme.Radius.xs)
                        .fill(
                            LinearGradient(
                                colors: [
                                    pet.currentMood.color.opacity(0.8),
                                    pet.currentMood.color,
                                ],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: max(geo.size.width * pet.xpProgress, 0), height: 6)
                        .shadow(color: pet.currentMood.color.opacity(0.5), radius: 4, x: 0, y: 0)
                        .animation(Theme.Motion.gentle, value: pet.xpProgress)
                }
            }
            .frame(height: 6)
        }
    }
}
