import SwiftUI

enum AuraTab: String, CaseIterable {
    case dashboard = "Dashboard"
    case log       = "Günlük"
    case history   = "Geçmiş"
    case settings  = "Ayarlar"

    var systemImage: String {
        switch self {
        case .dashboard: return "house.fill"
        case .log:       return "pencil.circle.fill"
        case .history:   return "scroll.fill"
        case .settings:  return "gearshape.fill"
        }
    }
}

struct AuraTabBar: View {
    @Binding var selected: AuraTab
    @Namespace private var tabNamespace

    var body: some View {
        HStack(spacing: 0) {
            ForEach(AuraTab.allCases, id: \.self) { tab in
                tabItem(tab)
            }
        }
        .padding(.horizontal, Theme.Spacing.md)
        .padding(.vertical, Theme.Spacing.sm)
        .background(.ultraThinMaterial)
        .background(Theme.Colors.canvas.opacity(0.8))
        .overlay(alignment: .top) {
            Rectangle()
                .fill(Theme.Colors.borderSubtle)
                .frame(height: 1)
        }
    }

    private func tabItem(_ tab: AuraTab) -> some View {
        let isSelected = selected == tab
        return Button {
            withAnimation(Theme.Motion.spring) { selected = tab }
        } label: {
            VStack(spacing: 4) {
                ZStack {
                    if isSelected {
                        Capsule()
                            .fill(Theme.Colors.brandPrimary.opacity(0.18))
                            .matchedGeometryEffect(id: "tab-pill", in: tabNamespace)
                            .frame(width: 52, height: 28)
                    }
                    Image(systemName: tab.systemImage)
                        .font(.system(size: 16, weight: isSelected ? .semibold : .regular))
                        .foregroundColor(isSelected ? Theme.Colors.brandPrimary : Theme.Colors.textMuted)
                        .frame(width: 52, height: 28)
                }

                Text(tab.rawValue)
                    .font(Theme.Typography.eyebrow)
                    .tracking(0.5)
                    .foregroundColor(isSelected ? Theme.Colors.brandPrimary : Theme.Colors.textMuted)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(.plain)
    }
}
