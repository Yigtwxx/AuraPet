import SwiftUI

extension Theme {
    enum Motion {
        // Primary spring — used for most UI transitions
        static let spring       = Animation.spring(response: 0.45, dampingFraction: 0.7)
        // Bouncy — used for celebratory or entry animations
        static let springBouncy = Animation.spring(response: 0.38, dampingFraction: 0.6)
        // Responsive — fast, tight spring for button presses / toggles
        static let responsive   = Animation.spring(response: 0.3, dampingFraction: 0.85)
        // Gentle easeInOut for fades and content changes
        static let gentle       = Animation.easeInOut(duration: 0.35)
        // Fast easeOut for micro-interactions
        static let fast         = Animation.easeOut(duration: 0.18)
        // Slow for ambient / decorative transitions
        static let slow         = Animation.easeInOut(duration: 0.55)
        // Smooth cubic — for overlay appearances
        static let smooth       = Animation.timingCurve(0.16, 1, 0.3, 1, duration: 0.42)
    }
}
