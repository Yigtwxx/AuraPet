import SwiftUI

struct AurionAetherShape: View {
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

            // curled tail
            var tail = Path()
            tail.move(to: pt(130, 152))
            tail.addCurve(to: pt(148, 187), control1: pt(154, 155), control2: pt(164, 178))
            tail.addCurve(to: pt(133, 172), control1: pt(139, 191), control2: pt(129, 181))
            ctx.stroke(tail, with: .color(color), style: StrokeStyle(lineWidth: sw(8), lineCap: .round))

            // large puff wings
            var wings = Path()
            wings.addEllipse(in: ellipseRect(42,  120, 19, 24))
            wings.addEllipse(in: ellipseRect(158, 120, 19, 24))
            ctx.fill(wings, with: .color(color.opacity(0.8)))

            // soft wing highlights
            var wingHi = Path()
            wingHi.move(to: pt(38, 110)); wingHi.addCurve(to: pt(36, 134), control1: pt(33, 116), control2: pt(32, 126))
            wingHi.move(to: pt(162, 110)); wingHi.addCurve(to: pt(164, 134), control1: pt(167, 116), control2: pt(168, 126))
            ctx.stroke(wingHi, with: .color(.white.opacity(0.3)), style: StrokeStyle(lineWidth: sw(1.6), lineCap: .round))

            // rounded ears
            var ears = Path()
            ears.addEllipse(in: ellipseRect(80,  68, 12, 17))
            ears.addEllipse(in: ellipseRect(120, 68, 12, 17))
            ctx.fill(ears, with: .color(color))

            // round chubby body
            var body = Path()
            body.addEllipse(in: ellipseRect(100, 118, 47, 46))
            ctx.fill(body, with: .color(color))

            // inner ears
            var innerEars = Path()
            innerEars.addEllipse(in: ellipseRect(80,  70, 5.5, 9))
            innerEars.addEllipse(in: ellipseRect(120, 70, 5.5, 9))
            ctx.fill(innerEars, with: .color(blush.opacity(0.4)))

            // floating sparkle stars
            var stars = Path()
            star(&stars, 36, 98, 5)
            star(&stars, 164, 142, 4.5)
            ctx.fill(stars, with: .color(.white.opacity(0.5)))

            // belly sparkles
            var belly = Path()
            belly.addEllipse(in: ellipseRect(100, 150, 2.5, 2.5))
            belly.addEllipse(in: ellipseRect(86,  156, 1.8, 1.8))
            belly.addEllipse(in: ellipseRect(114, 156, 1.8, 1.8))
            ctx.fill(belly, with: .color(.white.opacity(0.28)))

            // sclera
            var sclera = Path()
            sclera.addEllipse(in: ellipseRect(83,  122, 12.5, 14.5))
            sclera.addEllipse(in: ellipseRect(117, 122, 12.5, 14.5))
            ctx.fill(sclera, with: .color(.white))

            // pupils
            var pupils = Path()
            pupils.addEllipse(in: ellipseRect(84,  124, 7.5, 9))
            pupils.addEllipse(in: ellipseRect(116, 124, 7.5, 9))
            ctx.fill(pupils, with: .color(inkColor))

            // eye highlights (big + small)
            var highlights = Path()
            highlights.addEllipse(in: ellipseRect(88,  118, 3.5, 3.5))
            highlights.addEllipse(in: ellipseRect(112, 118, 3.5, 3.5))
            highlights.addEllipse(in: ellipseRect(80,  128, 1.7, 1.7))
            highlights.addEllipse(in: ellipseRect(120, 128, 1.7, 1.7))
            ctx.fill(highlights, with: .color(.white))

            // rosy cheeks
            var cheeks = Path()
            cheeks.addEllipse(in: ellipseRect(67,  136, 7.5, 5))
            cheeks.addEllipse(in: ellipseRect(133, 136, 7.5, 5))
            ctx.fill(cheeks, with: .color(blush.opacity(0.4)))

            // smile
            var smile = Path()
            smile.move(to: pt(92, 140))
            smile.addQuadCurve(to: pt(108, 140), control: pt(100, 148))
            ctx.stroke(smile, with: .color(inkColor), style: StrokeStyle(lineWidth: sw(2.5), lineCap: .round))
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
    .background(Color(hex: "#0F1514"))
}
