import SwiftUI

struct AurionDriftShape: View {
    let color: Color

    var body: some View {
        Canvas { ctx, size in
            func pt(_ x: CGFloat, _ y: CGFloat) -> CGPoint { AurionDraw.pt(x, y, size: size) }
            func ellipseRect(_ cx: CGFloat, _ cy: CGFloat, _ rx: CGFloat, _ ry: CGFloat) -> CGRect { AurionDraw.ellipseRect(cx, cy, rx, ry, size: size) }
            func sw(_ w: CGFloat) -> CGFloat { AurionDraw.strokeWidth(w, size: size) }

            // short wings
            var wings = Path()
            wings.move(to: pt(72, 124))
            wings.addCurve(to: pt(66, 138), control1: pt(50, 114), control2: pt(44, 134))
            wings.addLine(to: pt(72, 132))
            wings.closeSubpath()
            wings.move(to: pt(128, 124))
            wings.addCurve(to: pt(134, 138), control1: pt(150, 114), control2: pt(156, 134))
            wings.addLine(to: pt(128, 132))
            wings.closeSubpath()
            ctx.fill(wings, with: .color(color.opacity(0.9)))

            // tail
            var tail = Path()
            tail.move(to: pt(100, 170))
            tail.addCurve(to: pt(72, 163), control1: pt(88, 180), control2: pt(76, 175))
            tail.addCurve(to: pt(86, 150), control1: pt(68, 151), control2: pt(78, 142))
            ctx.stroke(tail, with: .color(color),
                       style: StrokeStyle(lineWidth: sw(8), lineCap: .round))

            // body
            var bodyParts = Path()
            bodyParts.addEllipse(in: ellipseRect(100, 140, 30, 32))
            bodyParts.addEllipse(in: ellipseRect(100, 83,  25, 23))
            ctx.fill(bodyParts, with: .color(color))

            // neck connector
            var neck = Path()
            neck.move(to: pt(87, 106))
            neck.addQuadCurve(to: pt(87, 126), control: pt(85, 116))
            neck.addLine(to: pt(113, 126))
            neck.addQuadCurve(to: pt(113, 106), control: pt(115, 116))
            neck.closeSubpath()
            ctx.fill(neck, with: .color(color))

            // scale shimmer
            var shimmer = Path()
            shimmer.addEllipse(in: ellipseRect(93,  145, 3.5, 3.5))
            shimmer.addEllipse(in: ellipseRect(107, 153, 2.5, 2.5))
            shimmer.addEllipse(in: ellipseRect(100, 160, 2.5, 2.5))
            ctx.fill(shimmer, with: .color(.white.opacity(0.25)))

            // horn
            var horn = Path()
            horn.move(to: pt(100, 60))
            horn.addLine(to: pt(96, 44))
            horn.addLine(to: pt(100, 36))
            horn.addLine(to: pt(104, 44))
            horn.closeSubpath()
            ctx.fill(horn, with: .color(color))

            var hornSheen = Path()
            hornSheen.move(to: pt(100, 36))
            hornSheen.addLine(to: pt(96, 44))
            hornSheen.addLine(to: pt(98.5, 42))
            hornSheen.closeSubpath()
            ctx.fill(hornSheen, with: .color(.white.opacity(0.5)))

            // sclera
            var sclera = Path()
            sclera.addEllipse(in: ellipseRect(88,  80, 9,   10))
            sclera.addEllipse(in: ellipseRect(112, 80, 9,   10))
            ctx.fill(sclera, with: .color(.white))

            // pupils
            let pupilColor = Color(red: 0.102, green: 0.114, blue: 0.141)
            var pupils = Path()
            pupils.addEllipse(in: ellipseRect(90,  81, 5.5, 6))
            pupils.addEllipse(in: ellipseRect(114, 81, 5.5, 6))
            ctx.fill(pupils, with: .color(pupilColor))

            var highlights = Path()
            highlights.addEllipse(in: ellipseRect(93,  77, 2.5, 2.5))
            highlights.addEllipse(in: ellipseRect(117, 77, 2.5, 2.5))
            ctx.fill(highlights, with: .color(.white))
        }
        .accessibilityIdentifier("aurion-drift")
    }
}

#Preview {
    HStack(spacing: 12) {
        AurionDriftShape(color: Color(hex: "#FFD700")).frame(width: 120, height: 120)
        AurionDriftShape(color: Color(hex: "#95A5A6")).frame(width: 120, height: 120)
        AurionDriftShape(color: Color(hex: "#5B9BD5")).frame(width: 120, height: 120)
        AurionDriftShape(color: Color(hex: "#9B59B6")).frame(width: 120, height: 120)
    }
    .padding()
    .background(Color(hex: "#0F1115"))
}
