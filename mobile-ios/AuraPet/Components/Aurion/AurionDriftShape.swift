import SwiftUI

struct AurionDriftShape: View {
    let color: Color

    var body: some View {
        Canvas { ctx, size in
            func pt(_ x: CGFloat, _ y: CGFloat) -> CGPoint { AurionDraw.pt(x, y, size: size) }
            func ellipseRect(_ cx: CGFloat, _ cy: CGFloat, _ rx: CGFloat, _ ry: CGFloat) -> CGRect { AurionDraw.ellipseRect(cx, cy, rx, ry, size: size) }
            func sw(_ w: CGFloat) -> CGFloat { AurionDraw.strokeWidth(w, size: size) }

            let inkColor = Color(red: 0.102, green: 0.114, blue: 0.141)
            let blush = Color(hex: "#FF8FA3")

            // little curled tail
            var tail = Path()
            tail.move(to: pt(122, 154))
            tail.addCurve(to: pt(136, 181), control1: pt(142, 156), control2: pt(150, 174))
            tail.addCurve(to: pt(124, 169), control1: pt(128, 185), control2: pt(120, 177))
            ctx.stroke(tail, with: .color(color), style: StrokeStyle(lineWidth: sw(6), lineCap: .round))

            // puff wings
            var wings = Path()
            wings.addEllipse(in: ellipseRect(52,  126, 15, 18))
            wings.addEllipse(in: ellipseRect(148, 126, 15, 18))
            ctx.fill(wings, with: .color(color.opacity(0.85)))

            // round chubby body
            var body = Path()
            body.addEllipse(in: ellipseRect(100, 118, 45, 45))
            ctx.fill(body, with: .color(color))

            // spark antenna with glowing tip
            var antenna = Path()
            antenna.move(to: pt(100, 76))
            antenna.addCurve(to: pt(105, 46), control1: pt(99, 62), control2: pt(101, 52))
            ctx.stroke(antenna, with: .color(color), style: StrokeStyle(lineWidth: sw(5), lineCap: .round))

            var tipGlow = Path(); tipGlow.addEllipse(in: ellipseRect(105, 43, 8, 8))
            ctx.fill(tipGlow, with: .color(color))
            var tipCore = Path(); tipCore.addEllipse(in: ellipseRect(105, 43, 4, 4))
            ctx.fill(tipCore, with: .color(.white.opacity(0.6)))

            // belly sparkles
            var belly = Path()
            belly.addEllipse(in: ellipseRect(100, 150, 2.5, 2.5))
            belly.addEllipse(in: ellipseRect(86,  156, 1.8, 1.8))
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
    .background(Color(hex: "#0F1514"))
}
