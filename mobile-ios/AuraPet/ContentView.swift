import SwiftUI

struct ContentView: View {
    @State private var isLoggedIn: Bool = Session.shared.userId != nil

    var body: some View {
        NavigationStack {
            if isLoggedIn, let uid = Session.shared.userId {
                MainTabView(userId: uid, isLoggedIn: $isLoggedIn)
            } else {
                SplashView(isLoggedIn: $isLoggedIn)
            }
        }
        .preferredColorScheme(.dark)
    }
}

// ── MainTabView with custom AuraTabBar ───────────────────────────────────────
struct MainTabView: View {
    let userId: String
    @Binding var isLoggedIn: Bool
    @State private var selectedTab: AuraTab = .dashboard

    var body: some View {
        ZStack(alignment: .bottom) {
            // Aurora background driven by active tab
            AuroraBackground(mood: tabMood)
                .ignoresSafeArea()

            // Tab content
            Group {
                switch selectedTab {
                case .dashboard: DashboardView(userId: userId)
                case .log:       LogEntryView(userId: userId)
                case .history:   HistoryView(userId: userId)
                case .settings:  SettingsView(isLoggedIn: $isLoggedIn)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .padding(.bottom, 72) // space for tab bar

            // Custom tab bar
            VStack(spacing: 0) {
                Spacer()
                AuraTabBar(selected: $selectedTab)
            }
            .ignoresSafeArea(edges: .bottom)
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
