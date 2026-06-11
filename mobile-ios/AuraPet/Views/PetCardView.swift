import SwiftUI

struct PetCardView: View {
    let pet: Pet

    var body: some View {
        AuraCard(variant: .standard, moodColor: pet.currentMood.color) {
            HStack(spacing: Theme.Spacing.lg) {
                // Aurion with mood-glow halo
                ZStack {
                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [pet.currentMood.color.opacity(0.28), .clear],
                                center: .center, startRadius: 0, endRadius: 55
                            )
                        )
                        .frame(width: 110, height: 110)
                        .blur(radius: 10)
                    AurionView(pet: pet, size: 88)
                }
                .frame(width: 90, height: 90)
                .accessibilityHidden(true)

                // Info
                VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                    HStack(alignment: .top) {
                        Text(pet.name)
                            .font(Theme.Typography.h3)
                            .foregroundColor(Theme.Colors.textPrimary)
                        Spacer()
                        // Level badge
                        VStack(alignment: .trailing, spacing: 2) {
                            Text("SEVİYE")
                                .font(Theme.Typography.eyebrow)
                                .tracking(0.5)
                                .foregroundColor(Theme.Colors.textMuted)
                            AnimatedCounter(
                                value: pet.level,
                                font: Theme.Typography.h2,
                                color: pet.currentMood.color
                            )
                        }
                        .accessibilityLabel("Seviye \(pet.level)")
                    }

                    MoodChip(mood: pet.currentMood)
                        .accessibilityLabel("Ruh hali: \(pet.currentMood.label)")

                    XpBar(pet: pet)
                }
                .frame(maxWidth: .infinity)
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(pet.name), Seviye \(pet.level), \(pet.currentMood.label) ruh hali")
    }
}
