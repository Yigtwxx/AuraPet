import SwiftUI
import UIKit

extension Theme {
    enum Haptics {
        static func light()     { UIImpactFeedbackGenerator(style: .light).impactOccurred() }
        static func medium()    { UIImpactFeedbackGenerator(style: .medium).impactOccurred() }
        static func success()   { UINotificationFeedbackGenerator().notificationOccurred(.success) }
        static func warning()   { UINotificationFeedbackGenerator().notificationOccurred(.warning) }
        static func error()     { UINotificationFeedbackGenerator().notificationOccurred(.error) }
        static func selection() { UISelectionFeedbackGenerator().selectionChanged() }
    }
}

// iOS 17+ .sensoryFeedback wrappers for declarative usage
extension View {
    func levelUpHaptic<V: Equatable>(trigger: V) -> some View {
        if #available(iOS 17.0, *) {
            return self.sensoryFeedback(.success, trigger: trigger)
        }
        return self
    }

    func selectionHaptic<V: Equatable>(trigger: V) -> some View {
        if #available(iOS 17.0, *) {
            return self.sensoryFeedback(.selection, trigger: trigger)
        }
        return self
    }
}
