import SwiftUI

struct LogEntryView: View {
    let userId: String
    @State private var entryText = ""
    @State private var isLoading = false
    @State private var resultPet: Pet?
    @State private var resultSentimentLabel: String?
    @State private var errorMessage: String?
    @AppStorage("aurapet_log_draft") private var savedDraft = ""

    private let maxChars = 500
    private var charCount: Int { entryText.count }
    private var isOverLimit: Bool { charCount > maxChars }
    private var remaining: Int { maxChars - charCount }

    private static let suggestions: [(icon: String, text: String)] = [
        ("sun.max", "Bugün enerjik ve umutluyum — harika şeyler yaşadım."),
        ("cloud", "Bugün biraz yorgun ve gergin hissediyorum."),
        ("wind", "Sakin ve dengeli bir gün geçirdim."),
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Spacing.xl) {
                // Header
                VStack(alignment: .leading, spacing: 4) {
                    Text("GÜNLÜK · AI ANALİZİ")
                        .font(Theme.Typography.eyebrow)
                        .tracking(1.5)
                        .foregroundColor(Theme.Colors.textMuted)
                    Text("Bugün nasılsın?")
                        .font(Theme.Typography.h1)
                        .foregroundColor(Theme.Colors.textPrimary)
                        .accessibilityAddTraits(.isHeader)
                    Text("Birkaç cümle yaz — Aurion duygunu analiz edip buna göre evrim geçirecek.")
                        .font(Theme.Typography.body)
                        .foregroundColor(Theme.Colors.textMuted)
                        .padding(.top, 2)
                }

                // Input card
                AuraCard(variant: .glass) {
                    VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                        // Card header pill
                        HStack {
                            Label("Yeni Günlük Kaydı", systemImage: "wand.and.stars")
                                .font(Theme.Typography.eyebrow)
                                .foregroundColor(Theme.Colors.textMuted)
                                .labelStyle(.titleAndIcon)
                            Spacer()
                            Text("TR · BERT")
                                .font(Theme.Typography.eyebrow)
                                .tracking(1)
                                .foregroundColor(Theme.Colors.brandPrimary)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 3)
                                .background(Theme.Colors.brandSoft)
                                .clipShape(Capsule())
                        }

                        Divider()
                            .overlay(Theme.Colors.borderSubtle)

                        // TextEditor
                        ZStack(alignment: .topLeading) {
                            if entryText.isEmpty {
                                Text("Bugün neler yaşadın? Nasıl hissediyorsun?\n\nTürkçe yaz — AI modeli duygunu analiz edecek.")
                                    .font(Theme.Typography.body)
                                    .foregroundColor(Theme.Colors.textSubtle)
                                    .padding(.top, 8)
                                    .padding(.leading, 4)
                                    .allowsHitTesting(false)
                            }
                            TextEditor(text: $entryText)
                                .frame(minHeight: 160)
                                .foregroundColor(isOverLimit ? Theme.Colors.danger : Theme.Colors.textPrimary)
                                .font(Theme.Typography.body)
                                .scrollContentBackground(.hidden)
                                .background(Color.clear)
                                .accessibilityLabel("Günlük metni")
                                .accessibilityHint("Türkçe duygularını yaz, Aurion'un seni analiz etsin")
                        }
                        .onChange(of: entryText) { _, val in savedDraft = val }

                        // Footer: char counter + submit
                        HStack(alignment: .center) {
                            // Circular char counter
                            ZStack {
                                Circle()
                                    .stroke(Theme.Colors.borderSubtle, lineWidth: 2.5)
                                Circle()
                                    .trim(from: 0, to: min(CGFloat(charCount) / CGFloat(maxChars), 1))
                                    .stroke(
                                        isOverLimit ? Theme.Colors.danger :
                                        remaining < 60 ? Theme.Colors.warning : Theme.Colors.brandPrimary,
                                        style: StrokeStyle(lineWidth: 2.5, lineCap: .round)
                                    )
                                    .rotationEffect(.degrees(-90))
                                    .animation(Theme.Motion.fast, value: charCount)
                                Text(isOverLimit ? "-\(-remaining)" : "\(remaining)")
                                    .font(.system(size: 8, weight: .semibold))
                                    .foregroundColor(isOverLimit ? Theme.Colors.danger : Theme.Colors.textSubtle)
                                    .monospacedDigit()
                            }
                            .frame(width: 32, height: 32)
                            .accessibilityLabel("\(remaining) karakter kaldı")

                            Spacer()

                            Button(isLoading ? "Analiz ediliyor…" : "Gönder") { submit() }
                                .auraButton(variant: .primary, size: .md, isLoading: isLoading, fullWidth: false)
                                .disabled(entryText.trimmingCharacters(in: .whitespaces).isEmpty || isOverLimit)
                        }
                    }
                }

                // Error
                if let err = errorMessage {
                    ErrorBanner(message: err) { errorMessage = nil }
                }

                // Suggestion chips
                VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                    Text("ÖNERI")
                        .font(Theme.Typography.eyebrow)
                        .tracking(1.5)
                        .foregroundColor(Theme.Colors.textSubtle)

                    ForEach(Self.suggestions, id: \.icon) { s in
                        Button {
                            entryText = s.text
                            Theme.Haptics.selection()
                        } label: {
                            HStack(alignment: .top, spacing: Theme.Spacing.sm) {
                                Image(systemName: s.icon)
                                    .font(.system(size: 14))
                                    .foregroundColor(Theme.Colors.textSubtle)
                                    .frame(width: 18)
                                Text(s.text)
                                    .font(Theme.Typography.body)
                                    .foregroundColor(Theme.Colors.textMuted)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .multilineTextAlignment(.leading)
                            }
                            .padding(Theme.Spacing.md)
                            .background(
                                RoundedRectangle(cornerRadius: Theme.Radius.md)
                                    .fill(Theme.Colors.glass)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: Theme.Radius.md)
                                            .stroke(Theme.Colors.borderSubtle, lineWidth: 1)
                                    )
                            )
                        }
                        .accessibilityLabel("Öneri: \(s.text)")
                    }
                }

                // Result card
                if let pet = resultPet {
                    resultCard(pet, sentimentLabel: resultSentimentLabel)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                }

                Spacer().frame(height: Theme.Spacing.xl)
            }
            .padding(Theme.Spacing.xl)
        }
        .scrollDismissesKeyboard(.interactively)
        .navigationBarHidden(true)
        .animation(Theme.Motion.spring, value: resultPet?.id)
        .animation(Theme.Motion.spring, value: errorMessage)
        .onAppear {
            if entryText.isEmpty && !savedDraft.isEmpty {
                entryText = savedDraft
            }
        }
    }

    private func resultCard(_ pet: Pet, sentimentLabel: String?) -> some View {
        AuraCard(variant: .glass, moodColor: pet.currentMood.color) {
            VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                HStack(spacing: 4) {
                    Image(systemName: "sparkles")
                        .font(.system(size: 11))
                    Text("PETİNE GÜNCELLEME")
                        .font(Theme.Typography.eyebrow)
                        .tracking(1)
                    Spacer()
                    if let label = sentimentLabel {
                        Text(label)
                            .font(Theme.Typography.eyebrow)
                            .tracking(1)
                            .foregroundColor(
                                label == "POSITIVE" ? .green :
                                label == "NEGATIVE" ? Theme.Colors.danger :
                                Theme.Colors.textMuted
                            )
                            .padding(.horizontal, 8)
                            .padding(.vertical, 3)
                            .background(
                                (label == "POSITIVE" ? Color.green :
                                 label == "NEGATIVE" ? Theme.Colors.danger :
                                 Theme.Colors.textMuted).opacity(0.12)
                            )
                            .clipShape(Capsule())
                    }
                }
                .foregroundColor(Theme.Colors.textMuted)

                HStack(spacing: Theme.Spacing.lg) {
                    // Aurion with Lottie halo
                    ZStack {
                        LottieView(name: pet.currentMood.lottieName)
                            .frame(width: 90, height: 90)
                            .clipShape(Circle())
                            .opacity(0.6)
                        AurionView(pet: pet, size: 68)
                            .frame(width: 68, height: 68)
                    }
                    .accessibilityLabel("\(pet.name), \(pet.currentMood.label)")

                    VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                        Text(pet.name)
                            .font(Theme.Typography.h3)
                            .foregroundColor(Theme.Colors.textPrimary)
                        MoodChip(mood: pet.currentMood)
                            .accessibilityLabel("Ruh hali: \(pet.currentMood.label)")
                        HStack(spacing: 4) {
                            Text("Seviye")
                                .font(Theme.Typography.caption)
                                .foregroundColor(Theme.Colors.textMuted)
                            AnimatedCounter(value: pet.level, font: Theme.Typography.h4, color: pet.currentMood.color)
                        }
                        .accessibilityLabel("Seviye \(pet.level)")
                        XpBar(pet: pet)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }

                Text("+XP kazanıldı — Aurion evrimleşti")
                    .font(Theme.Typography.caption)
                    .foregroundColor(Theme.Colors.textSubtle)
                    .frame(maxWidth: .infinity, alignment: .center)
            }
        }
        .levelUpHaptic(trigger: pet.level)
    }

    private func submit() {
        let text = entryText.trimmingCharacters(in: .whitespaces)
        guard !text.isEmpty, !isOverLimit else { return }
        isLoading = true
        errorMessage = nil
        entryText = ""
        savedDraft = ""

        Task {
            do {
                let resp = try await AuraPetAPI.shared.addLogEntry(userId: userId, entryText: text)
                await MainActor.run {
                    withAnimation(Theme.Motion.spring) {
                        resultPet = resp.pet.toPet(userId: userId)
                        resultSentimentLabel = resp.sentimentLabel
                    }
                    isLoading = false
                }
            } catch {
                Theme.Haptics.error()
                await MainActor.run {
                    errorMessage = error.localizedDescription
                    isLoading = false
                    entryText = text
                    savedDraft = text
                }
            }
        }
    }
}
