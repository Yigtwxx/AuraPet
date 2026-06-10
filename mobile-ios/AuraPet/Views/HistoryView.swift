import SwiftUI
import Charts

private enum TimeRange: String, CaseIterable {
    case week = "Hafta"
    case month = "Ay"
    case all = "Tümü"
}

struct HistoryView: View {
    let userId: String
    @State private var logs: [LogEntry] = []
    @State private var isLoading = true
    @State private var errorMessage: String?
    @State private var timeRange: TimeRange = .all
    @State private var expandedLogId: String?

    private static let isoFormatter: ISO8601DateFormatter = {
        let f = ISO8601DateFormatter()
        f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return f
    }()

    private func date(from log: LogEntry) -> Date {
        Self.isoFormatter.date(from: log.createdAt) ?? .distantPast
    }

    private var filteredLogs: [LogEntry] {
        let calendar = Calendar.current
        let now = Date()
        switch timeRange {
        case .week:
            let cutoff = calendar.date(byAdding: .day, value: -7, to: now)!
            return logs.filter { date(from: $0) >= cutoff }
        case .month:
            let cutoff = calendar.date(byAdding: .month, value: -1, to: now)!
            return logs.filter { date(from: $0) >= cutoff }
        case .all:
            return logs
        }
    }

    private var avgScore: Double {
        guard !filteredLogs.isEmpty else { return 0 }
        return filteredLogs.reduce(0) { $0 + $1.sentimentScore } / Double(filteredLogs.count)
    }

    private var positiveStreak: Int {
        var max = 0, cur = 0
        for l in filteredLogs {
            if l.sentimentScore > 0 { cur += 1; if cur > max { max = cur } }
            else { cur = 0 }
        }
        return max
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Spacing.xl) {
                // Header
                VStack(alignment: .leading, spacing: 4) {
                    Text("ANALİTİK")
                        .font(Theme.Typography.eyebrow)
                        .tracking(1.5)
                        .foregroundColor(Theme.Colors.textMuted)
                    Text("Geçmiş")
                        .font(Theme.Typography.h1)
                        .foregroundColor(Theme.Colors.textPrimary)
                        .accessibilityAddTraits(.isHeader)
                    Text("Önceki günlük notların ve duygu skorların.")
                        .font(Theme.Typography.body)
                        .foregroundColor(Theme.Colors.textMuted)
                        .padding(.top, 2)
                }

                // Error
                if let err = errorMessage {
                    ErrorBanner(message: err) { Task { await loadLogs() } }
                }

                if isLoading {
                    loadingState
                } else {
                    // Time range picker
                    Picker("Dönem", selection: $timeRange) {
                        ForEach(TimeRange.allCases, id: \.self) { Text($0.rawValue).tag($0) }
                    }
                    .pickerStyle(.segmented)
                    .animation(Theme.Motion.fast, value: timeRange)

                    // KPI row
                    if !filteredLogs.isEmpty {
                        kpiRow
                    }

                    // Chart
                    if filteredLogs.count >= 2 { chartSection }

                    // Log list
                    logListSection
                }
            }
            .padding(Theme.Spacing.xl)
        }
        .navigationBarHidden(true)
        .refreshable { await loadLogs() }
        .task { await loadLogs() }
        .animation(Theme.Motion.gentle, value: timeRange)
    }

    // MARK: - Loading

    private var loadingState: some View {
        VStack(spacing: Theme.Spacing.md) {
            HStack(spacing: Theme.Spacing.md) {
                ForEach(0..<3, id: \.self) { _ in
                    Skeleton(height: 72, radius: Theme.Radius.md)
                        .frame(maxWidth: .infinity)
                }
            }
            Skeleton(height: 160, radius: Theme.Radius.lg)
            ForEach(0..<4, id: \.self) { _ in HistoryItemSkeleton() }
        }
    }

    // MARK: - KPI

    private var kpiRow: some View {
        HStack(spacing: Theme.Spacing.md) {
            kpiCard(
                value: "\(filteredLogs.count)",
                label: "Kayıt",
                icon: "square.stack.3d.up",
                color: Theme.Colors.brandPrimary
            )
            kpiCard(
                value: (avgScore >= 0 ? "+" : "") + String(format: "%.2f", avgScore),
                label: "Ort. Skor",
                icon: "chart.line.uptrend.xyaxis",
                color: avgScore > 0.25 ? Theme.Colors.success
                     : avgScore < -0.25 ? Theme.Colors.danger
                     : Theme.Colors.textMuted
            )
            kpiCard(
                value: "\(positiveStreak)",
                label: "Seri",
                icon: "flame",
                color: positiveStreak >= 3 ? Theme.Colors.warning : Theme.Colors.textMuted
            )
        }
    }

    private func kpiCard(value: String, label: String, icon: String, color: Color) -> some View {
        AuraCard(variant: .compact) {
            VStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 16))
                    .foregroundColor(color)
                    .accessibilityHidden(true)
                Text(value)
                    .font(Theme.Typography.h2)
                    .foregroundColor(color)
                    .monospacedDigit()
                Text(label)
                    .font(Theme.Typography.caption)
                    .foregroundColor(Theme.Colors.textMuted)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, Theme.Spacing.sm)
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(label): \(value)")
    }

    // MARK: - Chart

    private var chartSection: some View {
        AuraCard(variant: .glass) {
            VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                Text("DUYGU TRENDİ")
                    .font(Theme.Typography.eyebrow)
                    .tracking(1.5)
                    .foregroundColor(Theme.Colors.textMuted)

                let chartLogs = Array(filteredLogs.reversed().prefix(30).enumerated())
                Chart {
                    ForEach(chartLogs, id: \.offset) { i, log in
                        AreaMark(x: .value("Kayıt", i), y: .value("Skor", log.sentimentScore))
                            .foregroundStyle(
                                LinearGradient(
                                    colors: [scoreColor(log.sentimentScore).opacity(0.2), .clear],
                                    startPoint: .top, endPoint: .bottom
                                )
                            )
                            .interpolationMethod(.catmullRom)
                        LineMark(x: .value("Kayıt", i), y: .value("Skor", log.sentimentScore))
                            .foregroundStyle(scoreColor(log.sentimentScore))
                            .lineStyle(StrokeStyle(lineWidth: 2))
                            .interpolationMethod(.catmullRom)
                        PointMark(x: .value("Kayıt", i), y: .value("Skor", log.sentimentScore))
                            .foregroundStyle(scoreColor(log.sentimentScore))
                            .symbolSize(30)
                    }
                }
                .chartYScale(domain: -1...1)
                .chartXAxis {
                    AxisMarks(values: .automatic(desiredCount: 5)) { _ in
                        AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5, dash: [4]))
                            .foregroundStyle(Theme.Colors.borderSubtle)
                        AxisValueLabel()
                            .foregroundStyle(Theme.Colors.textMuted)
                            .font(Theme.Typography.caption)
                    }
                }
                .chartYAxis {
                    AxisMarks(values: [-1, -0.5, 0, 0.5, 1]) { val in
                        AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5, dash: [4]))
                            .foregroundStyle(Theme.Colors.borderSubtle)
                        AxisValueLabel()
                            .foregroundStyle(Theme.Colors.textMuted)
                            .font(Theme.Typography.caption)
                    }
                }
                .frame(height: 160)
                .accessibilityLabel("Duygu trendi grafiği, son \(chartLogs.count) kayıt")
            }
        }
    }

    private func scoreColor(_ score: Double) -> Color {
        score > 0.1  ? Theme.Colors.success  :
        score < -0.1 ? Theme.Colors.danger    :
                       Theme.Colors.textMuted
    }

    // MARK: - Log list

    private var logListSection: some View {
        VStack(spacing: Theme.Spacing.sm) {
            if filteredLogs.isEmpty {
                EmptyState(
                    icon: "book.closed",
                    title: "Henüz kayıt yok",
                    description: "Seçilen dönemde günlük kaydı bulunamadı. Günlük ekleyerek başla.",
                    action: nil,
                    actionLabel: ""
                )
                .auraCard(variant: .glass)
            } else {
                ForEach(filteredLogs) { log in
                    logItem(log)
                }
            }
        }
    }

    private func logItem(_ log: LogEntry) -> some View {
        let isExpanded = expandedLogId == log.id
        return Button {
            withAnimation(Theme.Motion.gentle) {
                expandedLogId = isExpanded ? nil : log.id
            }
            Theme.Haptics.selection()
        } label: {
            AuraCard(variant: .compact) {
                VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                    HStack(alignment: .top) {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(log.formattedDate)
                                .font(Theme.Typography.caption)
                                .foregroundColor(Theme.Colors.textMuted)
                            Text(isExpanded ? log.entryText : String(log.entryText.prefix(120)) + (log.entryText.count > 120 ? "…" : ""))
                                .font(Theme.Typography.body)
                                .foregroundColor(Theme.Colors.textPrimary)
                                .multilineTextAlignment(.leading)
                                .lineLimit(isExpanded ? nil : 2)
                                .animation(Theme.Motion.gentle, value: isExpanded)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)

                        VStack(alignment: .trailing, spacing: 4) {
                            Text(log.scoreString)
                                .font(Theme.Typography.mono)
                                .fontWeight(.bold)
                                .foregroundColor(scoreColor(log.sentimentScore))
                                .monospacedDigit()
                            Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                                .font(.system(size: 10, weight: .semibold))
                                .foregroundColor(Theme.Colors.textSubtle)
                        }
                    }

                    // Color rail
                    Rectangle()
                        .fill(
                            LinearGradient(
                                colors: [scoreColor(log.sentimentScore), scoreColor(log.sentimentScore).opacity(0.2)],
                                startPoint: .leading, endPoint: .trailing
                            )
                        )
                        .frame(height: 2)
                        .clipShape(Capsule())
                }
            }
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Günlük kaydı: \(log.formattedDate), skor: \(log.scoreString)")
        .accessibilityHint(isExpanded ? "Daraltmak için dokun" : "Genişletmek için dokun")
    }

    // MARK: - Data

    private func loadLogs() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            let responses = try await AuraPetAPI.shared.getLogs(userId: userId)
            await MainActor.run { logs = responses.map { $0.toEntry(userId: userId) } }
        } catch {
            await MainActor.run { errorMessage = error.localizedDescription }
        }
    }
}
