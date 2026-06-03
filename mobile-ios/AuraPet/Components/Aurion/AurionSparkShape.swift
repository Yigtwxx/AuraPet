import SwiftUI

struct AurionSparkShape: View {
    let color: Color

    var body: some View {
        Canvas { ctx, size in
            func pt(_ x: CGFloat, _ y: CGFloat) -> CGPoint { AurionDraw.pt(x, y, size: size) }
            func ellipseRect(_ cx: CGFloat, _ cy: CGFloat, _ rx: CGFloat, _ ry: CGFloat) -> CGRect { AurionDraw.ellipseRect(cx, cy, rx, ry, size: size) }

            // wing nubs
            var wings = Path()
            wings.move(to: pt(55, 108))
            wings.addCurve(to: pt(52, 120), control1: pt(38, 100), control2: pt(34, 118))
            wings.addLine(to: pt(58, 115))
            wings.closeSubpath()
            wings.move(to: pt(145, 108))
            wings.addCurve(to: pt(148, 120), control1: pt(162, 100), control2: pt(166, 118))
            wings.addLine(to: pt(142, 115))
            wings.closeSubpath()
            ctx.fill(wings, with: .color(color))

            // body — egg teardrop
            var body = Path()
            body.move(to: pt(100, 68))
            body.addCurve(to: pt(54, 112), control1: pt(72, 68), control2: pt(54, 87))
            body.addCurve(to: pt(100, 158), control1: pt(54, 139), control2: pt(74, 158))
            body.addCurve(to: pt(146, 112), control1: pt(126, 158), control2: pt(146, 139))
            body.addCurve(to: pt(100, 68), control1: pt(146, 87), control2: pt(128, 68))
            body.closeSubpath()
            ctx.fill(body, with: .color(color))

            // scale shimmer dots
            var shimmer = Path()
            shimmer.addEllipse(in: ellipseRect(90,  140, 3,   3))
            shimmer.addEllipse(in: ellipseRect(100, 148, 2.5, 2.5))
            shimmer.addEllipse(in: ellipseRect(110, 140, 3,   3))
            ctx.fill(shimmer, with: .color(.white.opacity(0.3)))

            // horn
            var horn = Path()
            horn.move(to: pt(100, 68))
            horn.addLine(to: pt(97, 54))
            horn.addLine(to: pt(100, 47))
            horn.addLine(to: pt(103, 54))
            horn.closeSubpath()
            ctx.fill(horn, with: .color(color))

            var hornSheen = Path()
            hornSheen.move(to: pt(100, 47))
            hornSheen.addLine(to: pt(97, 54))
            hornSheen.addLine(to: pt(99, 53))
            hornSheen.closeSubpath()
            ctx.fill(hornSheen, with: .color(.white.opacity(0.5)))

            // sclera
            var sclera = Path()
            sclera.addEllipse(in: ellipseRect(83,  110, 11,  13))
            sclera.addEllipse(in: ellipseRect(117, 110, 11,  13))
            ctx.fill(sclera, with: .color(.white))

            // pupils
            let pupilColor = Color(red: 0.102, green: 0.114, blue: 0.141)
            var pupils = Path()
            pupils.addEllipse(in: ellipseRect(85,  111, 6.5, 7.5))
            pupils.addEllipse(in: ellipseRect(119, 111, 6.5, 7.5))
            ctx.fill(pupils, with: .color(pupilColor))

            // eye highlights
            var highlights = Path()
            highlights.addEllipse(in: ellipseRect(89,  107, 2.5, 2.5))
            highlights.addEllipse(in: ellipseRect(123, 107, 2.5, 2.5))
            ctx.fill(highlights, with: .color(.white))
        }
        .accessibilityIdentifier("aurion-spark")
    }
}

#Preview {
    HStack(spacing: 12) {
        AurionSparkShape(color: Color(hex: "#FFD700")).frame(width: 120, height: 120)
        AurionSparkShape(color: Color(hex: "#95A5A6")).frame(width: 120, height: 120)
        AurionSparkShape(color: Color(hex: "#5B9BD5")).frame(width: 120, height: 120)
        AurionSparkShape(color: Color(hex: "#9B59B6")).frame(width: 120, height: 120)
    }
    .padding()
    .background(Color(hex: "#0F1115"))
}
