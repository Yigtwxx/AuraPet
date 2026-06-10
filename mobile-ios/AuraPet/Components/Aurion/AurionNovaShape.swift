import SwiftUI

struct AurionNovaShape: View {
    let color: Color

    var body: some View {
        Canvas { ctx, size in
            func pt(_ x: CGFloat, _ y: CGFloat) -> CGPoint { AurionDraw.pt(x, y, size: size) }
            func ellipseRect(_ cx: CGFloat, _ cy: CGFloat, _ rx: CGFloat, _ ry: CGFloat) -> CGRect { AurionDraw.ellipseRect(cx, cy, rx, ry, size: size) }
            func sw(_ w: CGFloat) -> CGFloat { AurionDraw.strokeWidth(w, size: size) }

            let inkColor = Color(red: 0.102, green: 0.114, blue: 0.141)
            let blush = Color(hex: "#FF8FA3")

            func star(_ p: inout Path, _ cx: CGFloat, _ cy: CGFloat, _ r: CGFloat) {
                p.move(to: pt(cx, cy - r))
                p.addQuadCurve(to: pt(cx + r, cy), control: pt(cx, cy))
                p.addQuadCurve(to: pt(cx, cy + r), control: pt(cx, cy))
                p.addQuadCurve(to: pt(cx - r, cy), control: pt(cx, cy))
                p.addQuadCurve(to: pt(cx, cy - r), control: pt(cx, cy))
                p.closeSubpath()
            }

            // soft halo (drawn first — behind head)
            var haloOuter = Path(); haloOuter.addEllipse(in: ellipseRect(100, 40, 38, 12))
            ctx.stroke(haloOuter, with: .color(.white.opacity(0.25)), style: StrokeStyle(lineWidth: sw(1.5)))
            var haloInner = Path(); haloInner.addEllipse(in: ellipseRect(100, 40, 32, 9))
            ctx.stroke(haloInner, with: .color(.white.opacity(0.6)), style: StrokeStyle(lineWidth: sw(3)))

            // glowing tail with orb tip
            var tail = Path()
            tail.move(to: pt(128, 152))
            tail.addCurve(to: pt(154, 188), control1: pt(152, 154), control2: pt(164, 174))
            ctx.stroke(tail, with: .color(color), style: StrokeStyle(lineWidth: sw(9), lineCap: .round))

            var orbGlow = Path(); orbGlow.addEllipse(in: ellipseRect(154, 188, 10, 10))
            ctx.fill(orbGlow, with: .color(color.opacity(0.6)))
            var orbCore = Path(); orbCore.addEllipse(in: ellipseRect(154, 188, 5.5, 5.5))
            ctx.fill(orbCore, with: .color(.white.opacity(0.5)))

            // large puff wings
            var wings = Path()
            wings.addEllipse(in: ellipseRect(36,  116, 22, 28))
            wings.addEllipse(in: ellipseRect(164, 116, 22, 28))
            ctx.fill(wings, with: .color(color.opacity(0.8)))

            // soft wing highlights
            var wingHi = Path()
            wingHi.move(to: pt(31, 104)); wingHi.addCurve(to: pt(29, 134), control1: pt(25, 112), control2: pt(24, 124))
            wingHi.move(to: pt(169, 104)); wingHi.addCurve(to: pt(171, 134), control1: pt(175, 112), control2: pt(176, 124))
            ctx.stroke(wingHi, with: .color(.white.opacity(0.3)), style: StrokeStyle(lineWidth: sw(1.8), lineCap: .round))

            // rounded ears
            var ears = Path()
            ears.addEllipse(in: ellipseRect(80,  66, 13, 18))
            ears.addEllipse(in: ellipseRect(120, 66, 13, 18))
            ctx.fill(ears, with: .color(color))

            // round chubby body
            var body = Path()
            body.addEllipse(in: ellipseRect(100, 118, 48, 47))
            ctx.fill(body, with: .color(color))

            // inner ears
            var innerEars = Path()
            innerEars.addEllipse(in: ellipseRect(80,  68, 6, 9.5))
            innerEars.addEllipse(in: ellipseRect(120, 68, 6, 9.5))
            ctx.fill(innerEars, with: .color(blush.opacity(0.4)))

            // floating sparkle stars
            var stars = Path()
            star(&stars, 34, 100, 5)
            star(&stars, 166, 108, 4.5)
            star(&stars, 150, 154, 4)
            ctx.fill(stars, with: .color(.white.opacity(0.45)))

            // belly sparkles
            var belly = Path()
            belly.addEllipse(in: ellipseRect(100, 150, 2.5, 2.5))
            belly.addEllipse(in: ellipseRect(86,  156, 1.8, 1.8))
            belly.addEllipse(in: ellipseRect(114, 156, 1.8, 1.8))
            ctx.fill(belly, with: .color(.white.opacity(0.28)))

            // sclera (large & sparkly)
            var sclera = Path()
            sclera.addEllipse(in: ellipseRect(83,  122, 13.5, 15.5))
            sclera.addEllipse(in: ellipseRect(117, 122, 13.5, 15.5))
            ctx.fill(sclera, with: .color(.white))

            // pupils
            var pupils = Path()
            pupils.addEllipse(in: ellipseRect(84,  124, 8, 9.5))
            pupils.addEllipse(in: ellipseRect(116, 124, 8, 9.5))
            ctx.fill(pupils, with: .color(inkColor))

            // eye highlights (big + small)
            var highlights = Path()
            highlights.addEllipse(in: ellipseRect(88,  117, 4, 4))
            highlights.addEllipse(in: ellipseRect(112, 117, 4, 4))
            highlights.addEllipse(in: ellipseRect(79,  129, 1.9, 1.9))
            highlights.addEllipse(in: ellipseRect(121, 129, 1.9, 1.9))
            ctx.fill(highlights, with: .color(.white))

            // rosy cheeks
            var cheeks = Path()
            cheeks.addEllipse(in: ellipseRect(66,  137, 8, 5.5))
            cheeks.addEllipse(in: ellipseRect(134, 137, 8, 5.5))
            ctx.fill(cheeks, with: .color(blush.opacity(0.4)))

            // smile
            var smile = Path()
            smile.move(to: pt(91, 140))
            smile.addQuadCurve(to: pt(109, 140), control: pt(100, 150))
            ctx.stroke(smile, with: .color(inkColor), style: StrokeStyle(lineWidth: sw(2.8), lineCap: .round))
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
