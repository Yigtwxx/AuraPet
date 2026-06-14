import SwiftUI

struct AurionGlimmerShape: View {
    let color: Color

    var body: some View {
        Canvas { ctx, size in
            func pt(_ x: CGFloat, _ y: CGFloat) -> CGPoint { AurionDraw.pt(x, y, size: size) }
            func ellipseRect(_ cx: CGFloat, _ cy: CGFloat, _ rx: CGFloat, _ ry: CGFloat) -> CGRect { AurionDraw.ellipseRect(cx, cy, rx, ry, size: size) }
            func sw(_ w: CGFloat) -> CGFloat { AurionDraw.strokeWidth(w, size: size) }

            let inkColor = Color(red: 0.102, green: 0.114, blue: 0.141)
            let blush = Color(hex: "#FF8FA3")

            // curled tail
            var tail = Path()
            tail.move(to: pt(126, 154))
            tail.addCurve(to: pt(142, 185), control1: pt(148, 156), control2: pt(157, 177))
            tail.addCurve(to: pt(128, 171), control1: pt(133, 189), control2: pt(124, 180))
            ctx.stroke(tail, with: .color(color), style: StrokeStyle(lineWidth: sw(7), lineCap: .round))

            // puff wings
            var wings = Path()
            wings.addEllipse(in: ellipseRect(47,  122, 17, 22))
            wings.addEllipse(in: ellipseRect(153, 122, 17, 22))
            ctx.fill(wings, with: .color(color.opacity(0.82)))

            // soft wing highlights
            var wingHi = Path()
            wingHi.move(to: pt(44, 114)); wingHi.addCurve(to: pt(42, 132), control1: pt(40, 118), control2: pt(39, 126))
            wingHi.move(to: pt(156, 114)); wingHi.addCurve(to: pt(158, 132), control1: pt(160, 118), control2: pt(161, 126))
            ctx.stroke(wingHi, with: .color(.white.opacity(0.3)), style: StrokeStyle(lineWidth: sw(1.5), lineCap: .round))

            // round chubby body
            var body = Path()
            body.addEllipse(in: ellipseRect(100, 118, 46, 46))
            ctx.fill(body, with: .color(color))

            // tall spark antenna with glowing tip
            var antenna = Path()
            antenna.move(to: pt(100, 74))
            antenna.addCurve(to: pt(106, 40), control1: pt(99, 58), control2: pt(101, 46))
            ctx.stroke(antenna, with: .color(color), style: StrokeStyle(lineWidth: sw(5), lineCap: .round))

            var tipGlow = Path(); tipGlow.addEllipse(in: ellipseRect(106, 37, 9, 9))
            ctx.fill(tipGlow, with: .color(color))
            var tipCore = Path(); tipCore.addEllipse(in: ellipseRect(106, 37, 4.5, 4.5))
            ctx.fill(tipCore, with: .color(.white.opacity(0.6)))
            var tipSpark = Path(); tipSpark.addEllipse(in: ellipseRect(114, 30, 2, 2))
            ctx.fill(tipSpark, with: .color(.white.opacity(0.7)))

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
    .background(Color(hex: "#0F1514"))
}
