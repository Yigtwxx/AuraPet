import SwiftUI

struct AnimatedCounter: View {
    let value: Int
    var font: Font = Theme.Typography.h3
    var color: Color = Theme.Colors.textPrimary

    @State private var displayed: Int = 0

    var body: some View {
        Text("\(displayed)")
            .font(font)
            .foregroundColor(color)
            .monospacedDigit()
            .contentTransition(.numericText())
            .onChange(of: value) { _, newVal in
                withAnimation(Theme.Motion.spring) { displayed = newVal }
            }
            .onAppear { displayed = value }
    }
}
