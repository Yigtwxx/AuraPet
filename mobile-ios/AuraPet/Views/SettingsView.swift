import SwiftUI

struct SettingsView: View {
    @Binding var isLoggedIn: Bool
    @AppStorage("aurapet_theme") private var colorSchemePreference = "system"
    @AppStorage("aurapet_display_name") private var displayName = ""
    @AppStorage("aurapet_notifications_enabled") private var notificationsEnabled = true
    @AppStorage(AuraGraphQL.serverURLKey) private var serverURL = ""
    @State private var showDeleteAlert = false
    @State private var showProfile = false
    @State private var showNotifications = false
    @State private var showServer = false
    @State private var activeDoc: LegalDoc?
    @Environment(\.colorScheme) private var systemColorScheme

    private var appVersion: String {
        let v = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
        let b = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
        return "\(v) (\(b))"
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Spacing.xl) {
                // Header
                VStack(alignment: .leading, spacing: 4) {
                    Text("AYARLAR")
                        .font(Theme.Typography.eyebrow)
                        .tracking(1.5)
                        .foregroundColor(Theme.Colors.textMuted)
                    Text("Tercihler")
                        .font(Theme.Typography.h1)
                        .foregroundColor(Theme.Colors.textPrimary)
                        .accessibilityAddTraits(.isHeader)
                }

                // App identity card
                AuraCard(variant: .glass) {
                    HStack(spacing: Theme.Spacing.lg) {
                        ZStack {
                            RoundedRectangle(cornerRadius: Theme.Radius.md)
                                .fill(LinearGradient(
                                    colors: [Theme.Colors.brandPrimary, Theme.Colors.brandSecondary],
                                    startPoint: .topLeading, endPoint: .bottomTrailing
                                ))
                                .frame(width: 56, height: 56)
                                .shadow(color: Theme.Colors.brandPrimary.opacity(0.4), radius: 10)
                            AurionSparkShape(color: .white)
                                .frame(width: 34, height: 34)
                                .accessibilityHidden(true)
                        }

                        VStack(alignment: .leading, spacing: 4) {
                            Text("AuraPet")
                                .font(Theme.Typography.h3)
                                .foregroundColor(Theme.Colors.textPrimary)
                            Text("Sürüm \(appVersion)")
                                .font(Theme.Typography.caption)
                                .foregroundColor(Theme.Colors.textMuted)
                        }
                        Spacer()
                    }
                }
                .accessibilityElement(children: .combine)
                .accessibilityLabel("AuraPet, sürüm \(appVersion)")

                // Appearance
                settingSection("GÖRÜNÜM") {
                    AuraCard(variant: .standard) {
                        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                            Label("Tema", systemImage: "circle.lefthalf.filled")
                                .font(Theme.Typography.label)
                                .foregroundColor(Theme.Colors.textPrimary)

                            Picker("Tema", selection: $colorSchemePreference) {
                                Label("Sistem", systemImage: "iphone").tag("system")
                                Label("Açık", systemImage: "sun.max").tag("light")
                                Label("Koyu", systemImage: "moon").tag("dark")
                            }
                            .pickerStyle(.segmented)
                            .accessibilityLabel("Tema tercihi")
                        }
                    }
                }

                // Account
                settingSection("HESAP") {
                    AuraCard(variant: .standard) {
                        VStack(spacing: 0) {
                            settingRow(icon: "person.circle", label: "Profil Düzenle", tint: Theme.Colors.brandPrimary) {
                                showProfile = true
                            }
                            Divider().padding(.leading, 46).overlay(Theme.Colors.borderSubtle)
                            settingRow(icon: "bell", label: "Bildirimler", tint: Theme.Colors.info) {
                                showNotifications = true
                            }
                        }
                    }
                }

                // Connection (web ↔ mobil senkron için sunucu adresi)
                settingSection("BAĞLANTI") {
                    AuraCard(variant: .standard) {
                        settingRow(icon: "network", label: "Sunucu Adresi", tint: Theme.Colors.info) {
                            showServer = true
                        }
                    }
                }

                // Support
                settingSection("DESTEK") {
                    AuraCard(variant: .standard) {
                        VStack(spacing: 0) {
                            settingRow(icon: "doc.text", label: "Kullanım Koşulları", tint: Theme.Colors.textMuted) {
                                activeDoc = .terms
                            }
                            Divider().padding(.leading, 46).overlay(Theme.Colors.borderSubtle)
                            settingRow(icon: "lock.shield", label: "Gizlilik Politikası", tint: Theme.Colors.textMuted) {
                                activeDoc = .privacy
                            }
                        }
                    }
                }

                // Danger zone
                settingSection("TEHLİKELİ BÖLGE") {
                    VStack(spacing: Theme.Spacing.sm) {
                        Button("Çıkış Yap") { logout() }
                            .auraButton(variant: .danger, size: .md)

                        Button("Hesabı Sil") { showDeleteAlert = true }
                            .auraButton(variant: .ghost, size: .sm)
                            .foregroundColor(Theme.Colors.danger)
                    }
                }
            }
            .padding(Theme.Spacing.xl)
        }
        .navigationBarHidden(true)
        .alert("Hesabı Sil", isPresented: $showDeleteAlert) {
            Button("Sil", role: .destructive) { deleteAccount() }
            Button("İptal", role: .cancel) {}
        } message: {
            Text("Bu işlem geri alınamaz. Tüm Aurion'ların ve günlük kayıtların kalıcı olarak silinecek.")
        }
        .sheet(isPresented: $showProfile) {
            ProfileEditSheet(displayName: $displayName)
        }
        .sheet(isPresented: $showNotifications) {
            NotificationsSheet(enabled: $notificationsEnabled)
        }
        .sheet(isPresented: $showServer) {
            ServerURLSheet(serverURL: $serverURL)
        }
        .sheet(item: $activeDoc) { doc in
            LegalDocSheet(doc: doc)
        }
        .auraToast()
    }

    private func deleteAccount() {
        Session.shared.clear()
        clearUserScopedPreferences()
        Theme.Haptics.success()
        isLoggedIn = false
    }

    /// Çıkış/silme sırasında kullanıcıya özel cihaz tercihlerini temizler ki
    /// aynı telefonda farklı bir hesaba geçildiğinde veri sızıntısı olmasın.
    /// Sunucu adresi ve tema gibi cihaz ayarları korunur.
    private func clearUserScopedPreferences() {
        displayName = ""
        UserDefaults.standard.removeObject(forKey: "aurapet_log_draft")
    }

    private func settingSection<Content: View>(_ title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
            Text(title)
                .font(Theme.Typography.eyebrow)
                .tracking(1.5)
                .foregroundColor(Theme.Colors.textMuted)
            content()
        }
    }

    private func settingRow(icon: String, label: String, tint: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: Theme.Spacing.md) {
                ZStack {
                    RoundedRectangle(cornerRadius: 7)
                        .fill(tint.opacity(0.14))
                        .frame(width: 32, height: 32)
                    Image(systemName: icon)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(tint)
                }
                .accessibilityHidden(true)

                Text(label)
                    .font(Theme.Typography.label)
                    .foregroundColor(Theme.Colors.textPrimary)
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(Theme.Colors.textSubtle)
                    .accessibilityHidden(true)
            }
            .padding(.vertical, Theme.Spacing.sm)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(label)
    }

    private func logout() {
        Session.shared.clear()
        clearUserScopedPreferences()
        Theme.Haptics.medium()
        isLoggedIn = false
    }
}

// MARK: - Settings sub-views

private enum LegalDoc: String, Identifiable {
    case terms, privacy
    var id: String { rawValue }

    var title: String {
        switch self {
        case .terms:   return "Kullanım Koşulları"
        case .privacy: return "Gizlilik Politikası"
        }
    }

    var text: String {
        switch self {
        case .terms:
            return """
            AuraPet'i kullanarak aşağıdaki koşulları kabul edersin.

            1. Hizmet. AuraPet, günlük notlarındaki duygu durumunu analiz ederek dijital Aurion'unun ruh halini, rengini ve formunu güncelleyen eğitsel bir uygulamadır.

            2. İçerik. Yazdığın notların sorumluluğu sana aittir. Notların yalnızca duygu skorunu hesaplamak için işlenir.

            3. Tıbbi uyarı. AuraPet bir sağlık veya terapi ürünü değildir; profesyonel destek yerine geçmez.

            4. Değişiklikler. Bu koşullar zaman zaman güncellenebilir. Güncel sürüm her zaman uygulama içinde yer alır.

            Sorularını dilediğin an bize iletebilirsin.
            """
        case .privacy:
            return """
            Gizliliğine önem veriyoruz.

            1. Topladığımız veriler. Kullanıcı adın, e-postan ve yazdığın günlük notların. Notlar yalnızca duygu skorunu üretmek için işlenir.

            2. Nerede saklanır. Hesap verilerin uygulamanın bağlı olduğu sunucuda tutulur. Tema, profil ve bildirim tercihlerin yalnızca bu cihazda saklanır.

            3. Paylaşım. Verilerin üçüncü taraflarla pazarlama amacıyla paylaşılmaz.

            4. Kontrol. Hesabını dilediğin an Ayarlar > Hesabı Sil ile kaldırabilirsin.

            Bu bir eğitsel projedir; üretim kullanımından önce gizlilik uygulamaları gözden geçirilmelidir.
            """
        }
    }
}

private struct ProfileEditSheet: View {
    @Binding var displayName: String
    @Environment(\.dismiss) private var dismiss
    @State private var draft = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: Theme.Spacing.xl) {
                    ZStack {
                        Circle()
                            .fill(Theme.Colors.brandPrimary.opacity(0.12))
                            .frame(width: 92, height: 92)
                        Text(initials)
                            .font(Theme.Typography.h1)
                            .foregroundColor(Theme.Colors.brandPrimary)
                    }
                    .padding(.top, Theme.Spacing.lg)
                    .accessibilityHidden(true)

                    FloatingLabelField(
                        label: "Görünen ad",
                        text: $draft,
                        helperText: "Uygulamada seni nasıl çağıralım?"
                    )

                    Button("Kaydet") {
                        displayName = draft.trimmingCharacters(in: .whitespaces)
                        Theme.Haptics.success()
                        ToastManager.shared.show("Profil güncellendi", type: .success)
                        dismiss()
                    }
                    .auraButton(variant: .primary, size: .lg)
                    .disabled(draft.trimmingCharacters(in: .whitespaces).isEmpty)

                    Spacer(minLength: 0)
                }
                .padding(Theme.Spacing.xl)
            }
            .scrollDismissesKeyboard(.interactively)
            .navigationTitle("Profil Düzenle")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("İptal") { dismiss() }.tint(Theme.Colors.brandPrimary)
                }
            }
            .background(Theme.Colors.canvas.ignoresSafeArea())
            .onAppear { draft = displayName }
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
        .presentationCornerRadius(24)
    }

    private var initials: String {
        let trimmed = draft.trimmingCharacters(in: .whitespaces)
        return trimmed.isEmpty ? "🙂" : String(trimmed.prefix(1)).uppercased()
    }
}

private struct NotificationsSheet: View {
    @Binding var enabled: Bool
    @AppStorage("aurapet_reminder_hour") private var reminderHour = 20
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                    AuraCard(variant: .standard) {
                        Toggle(isOn: $enabled) {
                            VStack(alignment: .leading, spacing: 3) {
                                Text("Günlük hatırlatma")
                                    .font(Theme.Typography.label)
                                    .foregroundColor(Theme.Colors.textPrimary)
                                Text("Her gün nasıl hissettiğini yazman için nazik bir dürtü.")
                                    .font(Theme.Typography.caption)
                                    .foregroundColor(Theme.Colors.textMuted)
                            }
                        }
                        .tint(Theme.Colors.brandPrimary)
                    }

                    if enabled {
                        AuraCard(variant: .standard) {
                            Stepper(value: $reminderHour, in: 6...23) {
                                HStack(spacing: Theme.Spacing.sm) {
                                    Image(systemName: "clock")
                                        .foregroundColor(Theme.Colors.info)
                                        .accessibilityHidden(true)
                                    Text("Hatırlatma saati")
                                        .font(Theme.Typography.label)
                                        .foregroundColor(Theme.Colors.textPrimary)
                                    Spacer()
                                    Text(String(format: "%02d:00", reminderHour))
                                        .font(Theme.Typography.label.monospacedDigit())
                                        .foregroundColor(Theme.Colors.brandPrimary)
                                }
                            }
                        }
                        .transition(.opacity.combined(with: .move(edge: .top)))
                    }

                    Text("Tercihlerin bu cihazda saklanır.")
                        .font(Theme.Typography.caption)
                        .foregroundColor(Theme.Colors.textSubtle)
                }
                .padding(Theme.Spacing.xl)
                .animation(Theme.Motion.spring, value: enabled)
            }
            .navigationTitle("Bildirimler")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Bitti") { dismiss() }.tint(Theme.Colors.brandPrimary)
                }
            }
            .background(Theme.Colors.canvas.ignoresSafeArea())
        }
        .presentationDetents([.medium])
        .presentationDragIndicator(.visible)
        .presentationCornerRadius(24)
    }
}

private struct ServerURLSheet: View {
    @Binding var serverURL: String
    @Environment(\.dismiss) private var dismiss
    @State private var draft = ""

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.Spacing.lg) {
                    AuraCard(variant: .glass) {
                        VStack(alignment: .leading, spacing: Theme.Spacing.md) {
                            Text("Web ve mobilin aynı hesabı paylaşması için telefonun, bilgisayardaki sunucuya bağlanması gerekir.")
                                .font(Theme.Typography.body)
                                .foregroundColor(Theme.Colors.textMuted)

                            FloatingLabelField(
                                label: "Sunucu adresi",
                                text: $draft,
                                keyboardType: .URL,
                                helperText: "Simülatörde boş bırak (localhost). Gerçek cihazda Mac'in adresi — ör. http://192.168.1.42:8000/graphql"
                            )
                            .accessibilityLabel("Sunucu adresi")
                        }
                    }

                    Button("Kaydet") {
                        serverURL = draft.trimmingCharacters(in: .whitespaces)
                        Theme.Haptics.success()
                        ToastManager.shared.show("Sunucu adresi güncellendi", type: .success)
                        dismiss()
                    }
                    .auraButton(variant: .primary, size: .lg)

                    Button("Varsayılana dön (localhost)") {
                        draft = ""
                        serverURL = ""
                        Theme.Haptics.selection()
                        ToastManager.shared.show("Varsayılan sunucuya dönüldü", type: .info)
                        dismiss()
                    }
                    .auraButton(variant: .ghost, size: .sm)

                    Spacer(minLength: 0)
                }
                .padding(Theme.Spacing.xl)
            }
            .scrollDismissesKeyboard(.interactively)
            .navigationTitle("Sunucu Adresi")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("İptal") { dismiss() }.tint(Theme.Colors.brandPrimary)
                }
            }
            .background(Theme.Colors.canvas.ignoresSafeArea())
            .onAppear { draft = serverURL }
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
        .presentationCornerRadius(24)
    }
}

private struct LegalDocSheet: View {
    let doc: LegalDoc
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                Text(doc.text)
                    .font(Theme.Typography.body)
                    .foregroundColor(Theme.Colors.textMuted)
                    .lineSpacing(5)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(Theme.Spacing.xl)
            }
            .navigationTitle(doc.title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Kapat") { dismiss() }.tint(Theme.Colors.brandPrimary)
                }
            }
            .background(Theme.Colors.canvas.ignoresSafeArea())
        }
        .presentationDragIndicator(.visible)
        .presentationCornerRadius(24)
    }
}
