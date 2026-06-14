import SwiftUI

struct AuroraBackground: View {
    var mood: Mood = .neutral
    @State private var phase: Double = 0

    private var moodColor: Color { Theme.Colors.moodColor(for: mood) }

    var body: some View {
        ZStack {
            Theme.Colors.canvas.ignoresSafeArea()

            // Aurora blobs
            GeometryReader { geo in
                ZStack {
                    // Blob 1 — mood tinted top-left
                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [moodColor.opacity(0.18), .clear],
                                center: .center,
                                startRadius: 0,
                                endRadius: geo.size.width * 0.5
                            )
                        )
                        .frame(width: geo.size.width * 0.8)
                        .offset(
                            x: -geo.size.width * 0.2 + sin(phase) * 20,
                            y: -geo.size.height * 0.15 + cos(phase * 0.7) * 18
                        )
                        .blur(radius: 40)

                    // Blob 2 — brand teal bottom-right
                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [Theme.Colors.brandPrimary.opacity(0.12), .clear],
                                center: .center,
                                startRadius: 0,
                                endRadius: geo.size.width * 0.45
                            )
                        )
                        .frame(width: geo.size.width * 0.7)
                        .offset(
                            x: geo.size.width * 0.35 + cos(phase * 0.9) * 16,
                            y: geo.size.height * 0.35 + sin(phase * 1.1) * 14
                        )
                        .blur(radius: 50)

                    // Blob 3 — soft center accent
                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [moodColor.opacity(0.07), .clear],
                                center: .center,
                                startRadius: 0,
                                endRadius: geo.size.width * 0.35
                            )
                        )
                        .frame(width: geo.size.width * 0.55)
                        .offset(
                            x: geo.size.width * 0.1 + sin(phase * 1.3) * 22,
                            y: geo.size.height * 0.55 + cos(phase * 0.8) * 18
                        )
                        .blur(radius: 60)
                }
                .ignoresSafeArea()
                .allowsHitTesting(false)
            }
        }
        .onAppear {
            withAnimation(.linear(duration: 12).repeatForever(autoreverses: false)) {
                phase = .pi * 2
            }
        }
        .animation(Theme.Motion.slow, value: mood)
    }
}
