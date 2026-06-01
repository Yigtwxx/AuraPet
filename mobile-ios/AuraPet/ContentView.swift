import SwiftUI

struct ContentView: View {
    @State private var isLoggedIn: Bool = Session.shared.userId != nil
    @AppStorage("aurapet_theme") private var colorSchemePreference = "system"

    private var preferredColorScheme: ColorScheme? {
        switch colorSchemePreference {
        case "light": return .light
        case "dark":  return .dark
        default:      return nil
        }
    }

    var body: some View {
        NavigationStack {
            if isLoggedIn, let uid = Session.shared.userId {
                MainTabView(userId: uid, isLoggedIn: $isLoggedIn)
            } else {
                SplashView(isLoggedIn: $isLoggedIn)
            }
        }
        .preferredColorScheme(preferredColorScheme)
    }
}

// MARK: - MainTabView

struct MainTabView: View {
    let userId: String
    @Binding var isLoggedIn: Bool
    @State private var selectedTab: AuraTab = .dashboard

    var body: some View {
        ZStack(alignment: .bottom) {
            AuroraBackground(mood: tabMood)
                .ignoresSafeArea()

            Group {
                switch selectedTab {
                case .dashboard: DashboardView(userId: userId)
                case .log:       LogEntryView(userId: userId)
                case .history:   HistoryView(userId: userId)
                case .settings:  SettingsView(isLoggedIn: $isLoggedIn)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .safeAreaInset(edge: .bottom) {
                AuraTabBar(selected: $selectedTab)
            }
        }
    }

    private var tabMood: Mood {
        switch selectedTab {
        case .log:     return .happy
        case .history: return .sad
        default:       return .neutral
        }
    }
}
