import SwiftUI

struct AurionGlimmerShape: View {
    let color: Color

    var body: some View {
        Canvas { ctx, size in
            func pt(_ x: CGFloat, _ y: CGFloat) -> CGPoint { AurionDraw.pt(x, y, size: size) }
            func ellipseRect(_ cx: CGFloat, _ cy: CGFloat, _ rx: CGFloat, _ ry: CGFloat) -> CGRect { AurionDraw.ellipseRect(cx, cy, rx, ry, size: size) }
            func sw(_ w: CGFloat) -> CGFloat { AurionDraw.strokeWidth(w, size: size) }

            // half-open wings
            var wings = Path()
            wings.move(to: pt(68, 128))
            wings.addCurve(to: pt(58, 148), control1: pt(40, 112), control2: pt(30, 140))
            wings.addLine(to: pt(68, 140))
            wings.closeSubpath()
            wings.move(to: pt(132, 128))
            wings.addCurve(to: pt(142, 148), control1: pt(160, 112), control2: pt(170, 140))
            wings.addLine(to: pt(132, 140))
            wings.closeSubpath()
            ctx.fill(wings, with: .color(color.opacity(0.85)))

            // wing veins
            var veins = Path()
            veins.move(to: pt(68, 128))
            veins.addCurve(to: pt(58, 140), control1: pt(52, 122), control2: pt(44, 136))
            veins.move(to: pt(132, 128))
            veins.addCurve(to: pt(142, 140), control1: pt(148, 122), control2: pt(156, 136))
            ctx.stroke(veins, with: .color(.white.opacity(0.3)),
                       style: StrokeStyle(lineWidth: sw(1), lineCap: .round))

            // tail
            var tail = Path()
            tail.move(to: pt(100, 180))
            tail.addCurve(to: pt(56, 172), control1: pt(80, 196), control2: pt(60, 188))
            tail.addCurve(to: pt(78, 154), control1: pt(52, 156), control2: pt(66, 144))
            ctx.stroke(tail, with: .color(color),
                       style: StrokeStyle(lineWidth: sw(9), lineCap: .round))

            // body + neck + head
            var parts = Path()
            parts.addEllipse(in: ellipseRect(100, 148, 32, 34))
            parts.addEllipse(in: ellipseRect(100, 106, 16, 20))
            parts.addEllipse(in: ellipseRect(100, 72,  24, 22))
            ctx.fill(parts, with: .color(color))

            // scale shimmer
            var shimmer = Path()
            shimmer.addEllipse(in: ellipseRect(92,  140, 3.5, 3.5))
            shimmer.addEllipse(in: ellipseRect(108, 140, 3.5, 3.5))
            shimmer.addEllipse(in: ellipseRect(100, 154, 3,   3))
            shimmer.addEllipse(in: ellipseRect(93,  166, 2.5, 2.5))
            shimmer.addEllipse(in: ellipseRect(107, 166, 2.5, 2.5))
            ctx.fill(shimmer, with: .color(.white.opacity(0.24)))

            // single horn (taller)
            var horn = Path()
            horn.move(to: pt(100, 50))
            horn.addLine(to: pt(96, 32))
            horn.addLine(to: pt(100, 24))
            horn.addLine(to: pt(104, 32))
            horn.closeSubpath()
            ctx.fill(horn, with: .color(color))

            var hornSheen = Path()
            hornSheen.move(to: pt(100, 24))
            hornSheen.addLine(to: pt(96, 32))
            hornSheen.addLine(to: pt(98.5, 30))
            hornSheen.closeSubpath()
            ctx.fill(hornSheen, with: .color(.white.opacity(0.55)))

            // sclera
            var sclera = Path()
            sclera.addEllipse(in: ellipseRect(88,  69, 9,   10))
            sclera.addEllipse(in: ellipseRect(112, 69, 9,   10))
            ctx.fill(sclera, with: .color(.white))

            // pupils
            let pupilColor = Color(red: 0.102, green: 0.114, blue: 0.141)
            var pupils = Path()
            pupils.addEllipse(in: ellipseRect(90,  70, 5.5, 6.5))
            pupils.addEllipse(in: ellipseRect(114, 70, 5.5, 6.5))
            ctx.fill(pupils, with: .color(pupilColor))

            var highlights = Path()
            highlights.addEllipse(in: ellipseRect(93,  66, 2.5, 2.5))
            highlights.addEllipse(in: ellipseRect(117, 66, 2.5, 2.5))
            ctx.fill(highlights, with: .color(.white))
        }
        .accessibilityIdentifier("aurion-glimmer")
    }
}

#Preview {
    HStack(spacing: 12) {
        AurionGlimmerShape(color: Color(hex: "#FFD700")).frame(width: 120, height: 120)
        AurionGlimmerShape(color: Color(hex: "#95A5A6")).frame(width: 120, height: 120)
        AurionGlimmerShape(color: Color(hex: "#5B9BD5")).frame(width: 120, height: 120)
        AurionGlimmerShape(color: Color(hex: "#9B59B6")).frame(width: 120, height: 120)
    }
    .padding()
    .background(Color(hex: "#0F1115"))
}
