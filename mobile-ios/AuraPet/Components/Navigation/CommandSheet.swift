import SwiftUI

// MARK: - Command item model

struct CommandItem: Identifiable {
    let id = UUID()
    let icon: String
    let title: String
    let subtitle: String?
    let action: () -> Void

    init(icon: String, title: String, subtitle: String? = nil, action: @escaping () -> Void) {
        self.icon = icon
        self.title = title
        self.subtitle = subtitle
        self.action = action
    }
}

// MARK: - CommandSheet

struct CommandSheet: View {
    @Binding var isPresented: Bool
    let sections: [(title: String, items: [CommandItem])]

    @State private var query = ""
    @FocusState private var searchFocused: Bool

    private var filtered: [(title: String, items: [CommandItem])] {
        guard !query.isEmpty else { return sections }
        return sections.compactMap { section in
            let hits = section.items.filter {
                $0.title.localizedCaseInsensitiveContains(query) ||
                ($0.subtitle?.localizedCaseInsensitiveContains(query) ?? false)
            }
            return hits.isEmpty ? nil : (title: section.title, items: hits)
        }
    }

    var body: some View {
        NavigationStack {
            List {
                ForEach(filtered, id: \.title) { section in
                    Section(section.title) {
                        ForEach(section.items) { item in
                            Button {
                                isPresented = false
                                item.action()
                            } label: {
                                commandRow(item)
                            }
                            .listRowBackground(Color.clear)
                        }
                    }
                }

                if filtered.isEmpty {
                    ContentUnavailableView.search(text: query)
                        .listRowBackground(Color.clear)
                }
            }
            .listStyle(.insetGrouped)
            .scrollContentBackground(.hidden)
            .background(Theme.Colors.canvas.ignoresSafeArea())
            .navigationTitle("Komutlar")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Kapat") { isPresented = false }
                        .tint(Theme.Colors.brandPrimary)
                }
            }
            .searchable(text: $query, placement: .navigationBarDrawer(displayMode: .always), prompt: "Ara…")
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
        .presentationCornerRadius(24)
        .presentationBackground(Theme.Colors.canvas)
    }

    private func commandRow(_ item: CommandItem) -> some View {
        HStack(spacing: 14) {
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(Theme.Colors.brandSoft)
                    .frame(width: 34, height: 34)
                Image(systemName: item.icon)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(Theme.Colors.brandPrimary)
            }
            .accessibilityHidden(true)

            VStack(alignment: .leading, spacing: 2) {
                Text(item.title)
                    .font(Theme.Typography.label)
                    .foregroundColor(Theme.Colors.textPrimary)
                if let sub = item.subtitle {
                    Text(sub)
                        .font(Theme.Typography.caption)
                        .foregroundColor(Theme.Colors.textMuted)
                }
            }
            Spacer()
            Image(systemName: "chevron.right")
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(Theme.Colors.textSubtle)
                .accessibilityHidden(true)
        }
        .padding(.vertical, 4)
        .accessibilityLabel(item.title)
    }
}
