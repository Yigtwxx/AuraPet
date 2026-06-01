import SwiftUI

struct AurionAetherShape: View {
    let color: Color

    var body: some View {
        Canvas { ctx, size in
            func pt(_ x: CGFloat, _ y: CGFloat) -> CGPoint { AurionDraw.pt(x, y, size: size) }
            func ellipseRect(_ cx: CGFloat, _ cy: CGFloat, _ rx: CGFloat, _ ry: CGFloat) -> CGRect { AurionDraw.ellipseRect(cx, cy, rx, ry, size: size) }
            func sw(_ w: CGFloat) -> CGFloat { AurionDraw.strokeWidth(w, size: size) }

            // wide open wings
            var wings = Path()
            wings.move(to: pt(64, 120))
            wings.addCurve(to: pt(50, 152), control1: pt(28, 100), control2: pt(16, 140))
            wings.addLine(to: pt(64, 142))
            wings.closeSubpath()
            wings.move(to: pt(136, 120))
            wings.addCurve(to: pt(150, 152), control1: pt(172, 100), control2: pt(184, 140))
            wings.addLine(to: pt(136, 142))
            wings.closeSubpath()
            ctx.fill(wings, with: .color(color.opacity(0.82)))

            // wing veins
            var veins = Path()
            veins.move(to: pt(64, 120))
            veins.addCurve(to: pt(50, 142), control1: pt(44, 112), control2: pt(30, 130))
            veins.move(to: pt(64, 120))
            veins.addCurve(to: pt(50, 138), control1: pt(50, 114), control2: pt(38, 128))
            veins.move(to: pt(136, 120))
            veins.addCurve(to: pt(150, 142), control1: pt(156, 112), control2: pt(170, 130))
            veins.move(to: pt(136, 120))
            veins.addCurve(to: pt(150, 138), control1: pt(150, 114), control2: pt(162, 128))
            ctx.stroke(veins, with: .color(.white.opacity(0.28)),
                       style: StrokeStyle(lineWidth: sw(1.2), lineCap: .round))

            // tail
            var tail = Path()
            tail.move(to: pt(106, 182))
            tail.addCurve(to: pt(46, 168), control1: pt(82, 202), control2: pt(50, 192))
            tail.addCurve(to: pt(74, 148), control1: pt(42, 148), control2: pt(60, 136))
            ctx.stroke(tail, with: .color(color),
                       style: StrokeStyle(lineWidth: sw(10), lineCap: .round))

            // body + neck + head
            var parts = Path()
            parts.addEllipse(in: ellipseRect(100, 148, 35, 36))
            parts.addEllipse(in: ellipseRect(100, 100, 14, 24))
            parts.addEllipse(in: ellipseRect(100, 62,  23, 21))
            ctx.fill(parts, with: .color(color))

            // scale pattern
            var shimmer = Path()
            shimmer.addEllipse(in: ellipseRect(92,  135, 3.5, 3.5))
            shimmer.addEllipse(in: ellipseRect(108, 135, 3.5, 3.5))
            shimmer.addEllipse(in: ellipseRect(100, 148, 3.5, 3.5))
            shimmer.addEllipse(in: ellipseRect(92,  161, 3,   3))
            shimmer.addEllipse(in: ellipseRect(108, 161, 3,   3))
            shimmer.addEllipse(in: ellipseRect(100, 172, 2.5, 2.5))
            ctx.fill(shimmer, with: .color(.white.opacity(0.24)))

            // double horns
            var horns = Path()
            horns.move(to: pt(93, 41))
            horns.addLine(to: pt(89, 22))
            horns.addLine(to: pt(93, 14))
            horns.addLine(to: pt(97, 22))
            horns.closeSubpath()
            horns.move(to: pt(107, 41))
            horns.addLine(to: pt(111, 22))
            horns.addLine(to: pt(107, 14))
            horns.addLine(to: pt(103, 22))
            horns.closeSubpath()
            ctx.fill(horns, with: .color(color))

            var hornSheen = Path()
            hornSheen.move(to: pt(93, 14)); hornSheen.addLine(to: pt(89, 22)); hornSheen.addLine(to: pt(91.5, 20)); hornSheen.closeSubpath()
            hornSheen.move(to: pt(107, 14)); hornSheen.addLine(to: pt(111, 22)); hornSheen.addLine(to: pt(108.5, 20)); hornSheen.closeSubpath()
            ctx.fill(hornSheen, with: .color(.white.opacity(0.5)))

            // sclera
            var sclera = Path()
            sclera.addEllipse(in: ellipseRect(88,  60, 9,   10))
            sclera.addEllipse(in: ellipseRect(112, 60, 9,   10))
            ctx.fill(sclera, with: .color(.white))

            // pupils
            let pupilColor = Color(red: 0.102, green: 0.114, blue: 0.141)
            var pupils = Path()
            pupils.addEllipse(in: ellipseRect(90,  61, 5.5, 6.5))
            pupils.addEllipse(in: ellipseRect(114, 61, 5.5, 6.5))
            ctx.fill(pupils, with: .color(pupilColor))

            var highlights = Path()
            highlights.addEllipse(in: ellipseRect(93,  57, 2.5, 2.5))
            highlights.addEllipse(in: ellipseRect(117, 57, 2.5, 2.5))
            ctx.fill(highlights, with: .color(.white))
        }
        .accessibilityIdentifier("aurion-aether")
    }
}

#Preview {
    HStack(spacing: 12) {
        AurionAetherShape(color: Color(hex: "#FFD700")).frame(width: 120, height: 120)
        AurionAetherShape(color: Color(hex: "#95A5A6")).frame(width: 120, height: 120)
        AurionAetherShape(color: Color(hex: "#5B9BD5")).frame(width: 120, height: 120)
        AurionAetherShape(color: Color(hex: "#9B59B6")).frame(width: 120, height: 120)
    }
    .padding()
    .background(Color(hex: "#0F1115"))
}
