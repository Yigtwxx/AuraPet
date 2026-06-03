import SwiftUI

// MARK: - Skeleton

struct Skeleton: View {
    var width: CGFloat? = nil
    var height: CGFloat = 16
    var radius: CGFloat = 8

    @State private var phase: CGFloat = 0

    var body: some View {
        RoundedRectangle(cornerRadius: radius)
            .fill(shimmerGradient)
            .frame(width: width, height: height)
            .onAppear {
                withAnimation(.linear(duration: 1.4).repeatForever(autoreverses: false)) {
                    phase = 1
                }
            }
    }

    private var shimmerGradient: LinearGradient {
        LinearGradient(
            stops: [
                .init(color: Theme.Colors.borderSubtle, location: max(0, phase - 0.35)),
                .init(color: Theme.Colors.borderStrong,  location: phase),
                .init(color: Theme.Colors.borderSubtle, location: min(1, phase + 0.35)),
            ],
            startPoint: .leading,
            endPoint: .trailing
        )
    }
}

// MARK: - Pet card skeleton

struct PetCardSkeleton: View {
    var body: some View {
        AuraCard(variant: .standard) {
            HStack(spacing: 16) {
                Skeleton(width: 72, height: 72, radius: 36)

                VStack(alignment: .leading, spacing: 10) {
                    Skeleton(width: 120, height: 14)
                    Skeleton(width: 80, height: 10)
                    Spacer().frame(height: 4)
                    Skeleton(height: 8, radius: 4)
                    Skeleton(width: 160, height: 8, radius: 4)
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                Skeleton(width: 44, height: 44, radius: 10)
            }
        }
    }
}

// MARK: - History item skeleton

struct HistoryItemSkeleton: View {
    var body: some View {
        AuraCard(variant: .compact) {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Skeleton(width: 60, height: 10)
                    Spacer()
                    Skeleton(width: 50, height: 18, radius: 9)
                }
                Skeleton(height: 12)
                Skeleton(width: 180, height: 12)
            }
        }
    }
}
