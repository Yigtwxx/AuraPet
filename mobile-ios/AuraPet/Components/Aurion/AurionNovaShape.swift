import SwiftUI

struct AurionNovaShape: View {
    let color: Color

    var body: some View {
        Canvas { ctx, size in
            func pt(_ x: CGFloat, _ y: CGFloat) -> CGPoint { AurionDraw.pt(x, y, size: size) }
            func ellipseRect(_ cx: CGFloat, _ cy: CGFloat, _ rx: CGFloat, _ ry: CGFloat) -> CGRect { AurionDraw.ellipseRect(cx, cy, rx, ry, size: size) }
            func sw(_ w: CGFloat) -> CGFloat { AurionDraw.strokeWidth(w, size: size) }

            // halo ring (drawn first — behind head)
            let haloRect = ellipseRect(100, 44, 36, 9)
            var halo = Path()
            halo.addEllipse(in: haloRect)
            ctx.stroke(halo, with: .color(.white.opacity(0.55)),
                       style: StrokeStyle(lineWidth: sw(2.5)))

            // very wide wings
            var wings = Path()
            wings.move(to: pt(60, 114))
            wings.addCurve(to: pt(44, 156), control1: pt(18, 88), control2: pt(4, 140))
            wings.addLine(to: pt(60, 144))
            wings.closeSubpath()
            wings.move(to: pt(140, 114))
            wings.addCurve(to: pt(156, 156), control1: pt(182, 88), control2: pt(196, 140))
            wings.addLine(to: pt(140, 144))
            wings.closeSubpath()
            ctx.fill(wings, with: .color(color.opacity(0.8)))

            // wing veins
            var veins = Path()
            veins.move(to: pt(60, 114)); veins.addCurve(to: pt(44, 140), control1: pt(38, 104), control2: pt(22, 124))
            veins.move(to: pt(60, 114)); veins.addCurve(to: pt(44, 132), control1: pt(46, 106), control2: pt(32, 120))
            veins.move(to: pt(60, 114)); veins.addCurve(to: pt(50, 126), control1: pt(50, 108), control2: pt(40, 118))
            veins.move(to: pt(140, 114)); veins.addCurve(to: pt(156, 140), control1: pt(162, 104), control2: pt(178, 124))
            veins.move(to: pt(140, 114)); veins.addCurve(to: pt(156, 132), control1: pt(154, 106), control2: pt(168, 120))
            veins.move(to: pt(140, 114)); veins.addCurve(to: pt(150, 126), control1: pt(150, 108), control2: pt(160, 118))
            ctx.stroke(veins, with: .color(.white.opacity(0.25)),
                       style: StrokeStyle(lineWidth: sw(1), lineCap: .round))

            // tail
            var tail = Path()
            tail.move(to: pt(108, 182))
            tail.addCurve(to: pt(40, 168), control1: pt(80, 206), control2: pt(44, 194))
            tail.addCurve(to: pt(74, 144), control1: pt(36, 146), control2: pt(58, 130))
            ctx.stroke(tail, with: .color(color),
                       style: StrokeStyle(lineWidth: sw(10), lineCap: .round))

            // tail tip orb glow
            var orbGlow = Path()
            orbGlow.addEllipse(in: ellipseRect(40, 168, 11, 11))
            ctx.fill(orbGlow, with: .color(color.opacity(0.55)))

            var orbCore = Path()
            orbCore.addEllipse(in: ellipseRect(40, 168, 6, 6))
            ctx.fill(orbCore, with: .color(.white.opacity(0.5)))

            // body + neck + head
            var parts = Path()
            parts.addEllipse(in: ellipseRect(100, 146, 38, 38))
            parts.addEllipse(in: ellipseRect(100, 96,  15, 26))
            parts.addEllipse(in: ellipseRect(100, 56,  26, 24))
            ctx.fill(parts, with: .color(color))

            // scale grid (most detailed)
            var shimmer = Path()
            shimmer.addEllipse(in: ellipseRect(91,  130, 3.5, 3.5))
            shimmer.addEllipse(in: ellipseRect(109, 130, 3.5, 3.5))
            shimmer.addEllipse(in: ellipseRect(100, 143, 3.5, 3.5))
            shimmer.addEllipse(in: ellipseRect(91,  156, 3,   3))
            shimmer.addEllipse(in: ellipseRect(109, 156, 3,   3))
            shimmer.addEllipse(in: ellipseRect(100, 168, 3,   3))
            shimmer.addEllipse(in: ellipseRect(91,  178, 2.5, 2.5))
            shimmer.addEllipse(in: ellipseRect(109, 178, 2.5, 2.5))
            ctx.fill(shimmer, with: .color(.white.opacity(0.22)))

            // double horns (tallest)
            var horns = Path()
            horns.move(to: pt(92, 34)); horns.addLine(to: pt(87, 12)); horns.addLine(to: pt(92, 3)); horns.addLine(to: pt(96, 12)); horns.closeSubpath()
            horns.move(to: pt(108, 34)); horns.addLine(to: pt(113, 12)); horns.addLine(to: pt(108, 3)); horns.addLine(to: pt(104, 12)); horns.closeSubpath()
            ctx.fill(horns, with: .color(color))

            var hornSheen = Path()
            hornSheen.move(to: pt(92, 3)); hornSheen.addLine(to: pt(87, 12)); hornSheen.addLine(to: pt(90, 10)); hornSheen.closeSubpath()
            hornSheen.move(to: pt(108, 3)); hornSheen.addLine(to: pt(113, 12)); hornSheen.addLine(to: pt(110, 10)); hornSheen.closeSubpath()
            ctx.fill(hornSheen, with: .color(.white.opacity(0.55)))

            // sclera
            var sclera = Path()
            sclera.addEllipse(in: ellipseRect(87,  53, 10, 11))
            sclera.addEllipse(in: ellipseRect(113, 53, 10, 11))
            ctx.fill(sclera, with: .color(.white))

            // pupils
            let pupilColor = Color(red: 0.102, green: 0.114, blue: 0.141)
            var pupils = Path()
            pupils.addEllipse(in: ellipseRect(89,  54, 6, 7))
            pupils.addEllipse(in: ellipseRect(115, 54, 6, 7))
            ctx.fill(pupils, with: .color(pupilColor))

            var highlights = Path()
            highlights.addEllipse(in: ellipseRect(93,  50, 3, 3))
            highlights.addEllipse(in: ellipseRect(119, 50, 3, 3))
            ctx.fill(highlights, with: .color(.white))
        }
        .accessibilityIdentifier("aurion-nova")
    }
}

#Preview {
    HStack(spacing: 12) {
        AurionNovaShape(color: Color(hex: "#FFD700")).frame(width: 120, height: 120)
        AurionNovaShape(color: Color(hex: "#95A5A6")).frame(width: 120, height: 120)
        AurionNovaShape(color: Color(hex: "#5B9BD5")).frame(width: 120, height: 120)
        AurionNovaShape(color: Color(hex: "#9B59B6")).frame(width: 120, height: 120)
    }
    .padding()
    .background(Color(hex: "#0F1115"))
}
