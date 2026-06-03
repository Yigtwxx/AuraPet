import SwiftUI

// MARK: - Toast model

enum ToastType { case success, error, info, warning }

struct ToastItem: Identifiable, Equatable {
    let id = UUID()
    let message: String
    let type: ToastType
}

// MARK: - Toast manager

@MainActor
final class ToastManager: ObservableObject {
    static let shared = ToastManager()
    @Published var current: ToastItem?

    private var dismissTask: Task<Void, Never>?

    func show(_ message: String, type: ToastType = .info) {
        dismissTask?.cancel()
        switch type {
        case .success: Theme.Haptics.success()
        case .error:   Theme.Haptics.error()
        case .warning: Theme.Haptics.warning()
        case .info:    break
        }
        withAnimation(Theme.Motion.spring) {
            current = ToastItem(message: message, type: type)
        }
        dismissTask = Task {
            try? await Task.sleep(for: .seconds(3.5))
            guard !Task.isCancelled else { return }
            dismiss()
        }
    }

    func dismiss() {
        withAnimation(Theme.Motion.fast) { current = nil }
    }
}

// MARK: - Toast overlay modifier

struct ToastOverlay: ViewModifier {
    @ObservedObject private var manager = ToastManager.shared

    func body(content: Content) -> some View {
        content.overlay(alignment: .top) {
            if let toast = manager.current {
                ToastBubble(item: toast)
                    .transition(.move(edge: .top).combined(with: .opacity))
                    .padding(.top, 56)
                    .padding(.horizontal, 20)
                    .onTapGesture { manager.dismiss() }
                    .id(toast.id)
            }
        }
        .animation(Theme.Motion.spring, value: manager.current)
    }
}

extension View {
    func auraToast() -> some View {
        modifier(ToastOverlay())
    }
}

// MARK: - Toast bubble

private struct ToastBubble: View {
    let item: ToastItem

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: iconName)
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(iconColor)
                .accessibilityHidden(true)

            Text(item.message)
                .font(Theme.Typography.label)
                .foregroundColor(Theme.Colors.textPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .background(
            RoundedRectangle(cornerRadius: Theme.Radius.md)
                .fill(Theme.Colors.elevated)
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.Radius.md)
                        .stroke(accentColor.opacity(0.3), lineWidth: 1)
                )
                .shadow(color: accentColor.opacity(0.15), radius: 12, x: 0, y: 4)
                .shadow(color: .black.opacity(0.35), radius: 8, x: 0, y: 3)
        )
        .accessibilityElement(children: .combine)
        .accessibilityLabel(item.message)
        .accessibilityAddTraits(.isStaticText)
    }

    private var accentColor: Color {
        switch item.type {
        case .success: return Theme.Colors.success
        case .error:   return Theme.Colors.danger
        case .warning: return Theme.Colors.warning
        case .info:    return Theme.Colors.info
        }
    }

    private var iconColor: Color { accentColor }

    private var iconName: String {
        switch item.type {
        case .success: return "checkmark.circle.fill"
        case .error:   return "xmark.circle.fill"
        case .warning: return "exclamationmark.triangle.fill"
        case .info:    return "info.circle.fill"
        }
    }
}
