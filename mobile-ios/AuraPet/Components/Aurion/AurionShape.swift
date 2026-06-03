import SwiftUI

// MARK: - Shared drawing helpers for all Aurion Canvas shapes

enum AurionDraw {
    static func pt(_ x: CGFloat, _ y: CGFloat, size: CGSize) -> CGPoint {
        CGPoint(x: x / 200 * size.width, y: y / 200 * size.height)
    }

    static func ellipseRect(
        _ cx: CGFloat, _ cy: CGFloat,
        _ rx: CGFloat, _ ry: CGFloat,
        size: CGSize
    ) -> CGRect {
        CGRect(
            x: (cx - rx) / 200 * size.width,
            y: (cy - ry) / 200 * size.height,
            width:  2 * rx / 200 * size.width,
            height: 2 * ry / 200 * size.height
        )
    }

    static func strokeWidth(_ w: CGFloat, size: CGSize) -> CGFloat {
        w / 200 * size.width
    }
}

// MARK: - Protocol

protocol AurionShapeDrawable {
    var color: Color { get }
    func draw(ctx: GraphicsContext, size: CGSize)
}

extension AurionShapeDrawable {
    // Convenience wrappers that bind size
    func pt(_ x: CGFloat, _ y: CGFloat, size: CGSize) -> CGPoint {
        AurionDraw.pt(x, y, size: size)
    }
    func ellipseRect(_ cx: CGFloat, _ cy: CGFloat, _ rx: CGFloat, _ ry: CGFloat, size: CGSize) -> CGRect {
        AurionDraw.ellipseRect(cx, cy, rx, ry, size: size)
    }
    func strokeWidth(_ w: CGFloat, size: CGSize) -> CGFloat {
        AurionDraw.strokeWidth(w, size: size)
    }
}
