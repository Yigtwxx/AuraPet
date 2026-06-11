import SwiftUI

struct SplashView: View {
    @Binding var isLoggedIn: Bool
    @State private var appeared = false
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        ZStack {
            AuroraBackground(mood: .neutral)
                .ignoresSafeArea()

            VStack(spacing: 0) {
                Spacer()

                // Mascot
                ZStack {
                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [Theme.Colors.brandPrimary.opacity(0.35), .clear],
                                center: .center, startRadius: 0, endRadius: 70
                            )
                        )
                        .frame(width: 140, height: 140)
                        .blur(radius: 20)
                        .accessibilityHidden(true)

                    AurionSparkShape(color: Theme.Colors.brandPrimary)
                        .frame(width: 88, height: 88)
                        .shadow(color: Theme.Colors.brandPrimary.opacity(0.55), radius: 14)
                        .accessibilityHidden(true)
                }
                .scaleEffect(appeared ? 1.0 : (reduceMotion ? 1.0 : 0.72))
                .opacity(appeared ? 1.0 : 0)

                Spacer().frame(height: 32)

                // Headline
                VStack(spacing: 12) {
                    Text("AuraPet")
                        .font(Theme.Typography.display)
                        .foregroundStyle(
                            LinearGradient(
                                colors: [Theme.Colors.textPrimary, Theme.Colors.brandPrimary],
                                startPoint: .leading, endPoint: .trailing
                            )
                        )
                        .accessibilityAddTraits(.isHeader)

                    Text("Duygularınla evrilen dijital evcil hayvanın")
                        .font(Theme.Typography.body)
                        .foregroundColor(Theme.Colors.textMuted)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, Theme.Spacing.xl)
                }
                .opacity(appeared ? 1 : 0)
                .offset(y: appeared ? 0 : (reduceMotion ? 0 : 10))

                Spacer().frame(height: 48)

                // CTA
                NavigationLink(destination: LoginView(isLoggedIn: $isLoggedIn)) {
                    HStack(spacing: Theme.Spacing.sm) {
                        Text("Başla")
                            .font(.system(.body, design: .default, weight: .semibold))
                        Image(systemName: "arrow.right")
                            .font(.system(size: 15, weight: .semibold))
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 17)
                    .background(
                        LinearGradient(
                            colors: [Theme.Colors.brandPrimary, Theme.Colors.brandSecondary],
                            startPoint: .topLeading, endPoint: .bottomTrailing
                        )
                    )
                    .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.md))
                    .shadow(color: Theme.Colors.brandPrimary.opacity(0.3), radius: 10, y: 4)
                }
                .padding(.horizontal, Theme.Spacing.xxl)
                .opacity(appeared ? 1 : 0)
                .offset(y: appeared ? 0 : (reduceMotion ? 0 : 14))

                Spacer()

                // Footer
                Text("v2.0 · Türkçe Sentiment AI")
                    .font(Theme.Typography.caption)
                    .foregroundColor(Theme.Colors.textSubtle)
                    .padding(.bottom, Theme.Spacing.xl)
                    .opacity(appeared ? 1 : 0)
            }
            .padding(.horizontal, Theme.Spacing.xl)
        }
        .navigationBarHidden(true)
        .onAppear {
            let anim: Animation = reduceMotion
                ? .linear(duration: 0.01)
                : Theme.Motion.spring.delay(0.1)
            withAnimation(anim) { appeared = true }
        }
    }
}
