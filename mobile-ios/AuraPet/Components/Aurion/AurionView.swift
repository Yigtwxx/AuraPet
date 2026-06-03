import SwiftUI

struct AurionView: View {
    let pet: Pet
    let size: CGFloat

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var bobUp = false
    @State private var prevLevel: Int = 0
    @State private var flashing = false

    private var moodColor: Color { Color(hex: pet.colorTheme) }
    private var form: AurionForm { AurionForm(level: pet.level) }

    var body: some View {
        ZStack {
            // Mood-glow halo
            Circle()
                .fill(
                    RadialGradient(
                        colors: [moodColor.opacity(0.2), .clear],
                        center: .center,
                        startRadius: 0,
                        endRadius: size * 0.6
                    )
                )
                .frame(width: size * 1.4, height: size * 1.4)
                .blur(radius: size * 0.1)

            // Level-up ring flash
            if flashing {
                Circle()
                    .stroke(moodColor.opacity(0.8), lineWidth: 2)
                    .frame(width: size * 1.3, height: size * 1.3)
                    .scaleEffect(flashing ? 1.4 : 1.0)
                    .opacity(flashing ? 0 : 0.8)
                    .animation(reduceMotion ? nil : .easeOut(duration: 0.8), value: flashing)
            }

            // Pet shape
            formShape
                .frame(width: size, height: size)
                .id(pet.level)
                .transition(
                    reduceMotion ? .identity :
                        .asymmetric(
                            insertion: .scale(scale: 0.8).combined(with: .opacity),
                            removal:   .scale(scale: 0.8).combined(with: .opacity)
                        )
                )
        }
        .frame(width: size, height: size)
        .offset(y: bobUp ? -4 : 0)
        .animation(
            reduceMotion ? nil : .easeInOut(duration: 2.4).repeatForever(autoreverses: true),
            value: bobUp
        )
        .animation(
            reduceMotion ? nil : Theme.Motion.gentle,
            value: pet.level
        )
        .onAppear {
            prevLevel = pet.level
            guard !reduceMotion else { return }
            bobUp = true
        }
        .onChange(of: pet.level) { old, new in
            guard new > old, !reduceMotion else { return }
            flashing = true
            Task {
                try? await Task.sleep(nanoseconds: 800_000_000)
                await MainActor.run { flashing = false }
            }
        }
    }

    @ViewBuilder
    private var formShape: some View {
        switch form {
        case .spark:   AurionSparkShape(color: moodColor)
        case .drift:   AurionDriftShape(color: moodColor)
        case .glimmer: AurionGlimmerShape(color: moodColor)
        case .aether:  AurionAetherShape(color: moodColor)
        case .nova:    AurionNovaShape(color: moodColor)
        }
    }
}

#Preview("5 Form × 4 Mood") {
    let moods: [(String, String)] = [
        ("#FFD700", "HAPPY"), ("#95A5A6", "NEUTRAL"), ("#5B9BD5", "SAD"), ("#9B59B6", "ANXIOUS"),
    ]
    let forms: [(String, Int)] = [
        ("Kıvılcım", 1), ("Süzgün", 2), ("Parıltı", 3), ("Esir", 4), ("Nova", 5)
    ]
    return ScrollView {
        VStack(spacing: 16) {
            ForEach(forms, id: \.0) { formName, level in
                HStack(spacing: 8) {
                    Text(formName).font(.caption2).foregroundColor(.white).frame(width: 52)
                    ForEach(moods, id: \.1) { hex, mood in
                        let fakePet = Pet(
                            id: "\(level)-\(hex)", userId: "preview", name: formName,
                            level: level, xp: 0,
                            currentMood: Mood.from(mood), colorTheme: hex
                        )
                        AurionView(pet: fakePet, size: 72)
                    }
                }
            }
        }
        .padding()
    }
    .background(Theme.Colors.canvas)
}
