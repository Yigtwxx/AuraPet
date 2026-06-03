import SwiftUI

struct SectionHeader: View {
    var eyebrow: String?
    let title: String
    var subtitle: String?
    var trailing: AnyView?

    init(
        eyebrow: String? = nil,
        title: String,
        subtitle: String? = nil,
        @ViewBuilder trailing: () -> some View = { EmptyView() }
    ) {
        self.eyebrow = eyebrow
        self.title = title
        self.subtitle = subtitle
        let tv = trailing()
        self.trailing = type(of: tv) == EmptyView.self ? nil : AnyView(tv)
    }

    var body: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                if let eyebrow {
                    Text(eyebrow.uppercased())
                        .font(Theme.Typography.eyebrow)
                        .foregroundColor(Theme.Colors.textMuted)
                        .tracking(1.5)
                }
                Text(title)
                    .font(Theme.Typography.h2)
                    .foregroundColor(Theme.Colors.textPrimary)
                if let subtitle {
                    Text(subtitle)
                        .font(Theme.Typography.body)
                        .foregroundColor(Theme.Colors.textMuted)
                }
            }
            Spacer()
            if let trailing { trailing }
        }
    }
}
