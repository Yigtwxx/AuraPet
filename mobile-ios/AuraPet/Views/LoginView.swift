import SwiftUI

private enum LoginMode: String, CaseIterable {
    case signUp = "Kayıt Ol"
    case signIn = "Giriş Yap"
}

/// Form kuralları — web (login/page.tsx) ile birebir aynı; test edilebilir olsun
/// diye view'dan ayrı tutulur.
enum LoginValidation {
    static func usernameError(_ username: String) -> String? {
        guard !username.isEmpty else { return nil }
        return username.count < 2 ? "En az 2 karakter olmalı" : nil
    }

    static func emailError(_ email: String) -> String? {
        guard !email.isEmpty else { return nil }
        let valid = email.contains("@") && email.contains(".")
        return valid ? nil : "Geçerli bir e-posta girin"
    }

    /// Gönderimi engelleyen ilk neden; yoksa nil. Girişte yalnızca kullanıcı
    /// adı gerekir; e-posta yalnızca kayıtta zorunlu.
    static func firstBlocker(isSignUp: Bool, username: String, email: String) -> String? {
        if username.isEmpty { return "Kullanıcı adı gerekli" }
        if let err = usernameError(username) { return err }
        if isSignUp {
            if email.isEmpty { return "E-posta gerekli" }
            if let err = emailError(email) { return err }
        }
        return nil
    }
}

struct LoginView: View {
    @Binding var isLoggedIn: Bool
    @State private var mode: LoginMode = .signUp
    @State private var username = ""
    @State private var email = ""
    @State private var password = ""
    @State private var showPassword = false
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var appeared = false

    // Field-level validation
    private var usernameError: String? { LoginValidation.usernameError(username) }
    private var emailError: String? { LoginValidation.emailError(email) }
    /// Gönderimi engelleyen ilk neden; buton ölü görünmek yerine bunu söyler.
    private var validationMessage: String? {
        LoginValidation.firstBlocker(isSignUp: mode == .signUp, username: username, email: email)
    }

    var body: some View {
        ZStack {
            AuroraBackground(mood: .neutral)
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: Theme.Spacing.xl) {
                    Spacer().frame(height: Theme.Spacing.xl)

                    // Brand header
                    brandHeader

                    // Mode picker — opacity'ye bağlanmaz: SwiftUI'da opacity 0 olan
                    // görünüm dokunma da almaz; giriş animasyonu aksarsa kontrol
                    // hem görünmez hem basılamaz kalıyordu.
                    Picker("Mod", selection: $mode) {
                        ForEach(LoginMode.allCases, id: \.self) { Text($0.rawValue).tag($0) }
                    }
                    .pickerStyle(.segmented)
                    .animation(Theme.Motion.fast, value: mode)
                    .accessibilityLabel("Giriş modu seçimi")

                    // Form card
                    AuraCard(variant: .glass) {
                        VStack(spacing: Theme.Spacing.lg) {
                            Text(mode == .signUp ? "Yeni hesap oluştur" : "Hesabına giriş yap")
                                .font(Theme.Typography.h4)
                                .foregroundColor(Theme.Colors.textPrimary)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .animation(Theme.Motion.fast, value: mode)

                            FloatingLabelField(
                                label: "Kullanıcı adı",
                                text: $username,
                                errorText: usernameError,
                                helperText: mode == .signUp ? "3–20 karakter" : nil
                            )
                            .accessibilityLabel("Kullanıcı adı")

                            if mode == .signUp {
                                FloatingLabelField(
                                    label: "E-posta",
                                    text: $email,
                                    keyboardType: .emailAddress,
                                    errorText: emailError
                                )
                                .accessibilityLabel("E-posta adresi")
                                .transition(.opacity.combined(with: .move(edge: .top)))
                            }

                            // Password field with show/hide
                            ZStack(alignment: .trailing) {
                                FloatingLabelField(
                                    label: "Şifre",
                                    text: $password,
                                    isSecure: !showPassword,
                                    helperText: mode == .signUp ? "En az 8 karakter" : nil
                                )
                                .accessibilityLabel("Şifre")

                                Button {
                                    showPassword.toggle()
                                    Theme.Haptics.selection()
                                } label: {
                                    Image(systemName: showPassword ? "eye.slash" : "eye")
                                        .font(.system(size: 15))
                                        .foregroundColor(Theme.Colors.textMuted)
                                }
                                .padding(.trailing, Theme.Spacing.lg)
                                .padding(.top, 16)
                                .accessibilityLabel(showPassword ? "Şifreyi gizle" : "Şifreyi göster")
                            }

                            if let err = errorMessage {
                                ErrorBanner(message: err)
                                    .transition(.opacity.combined(with: .move(edge: .top)))
                            }

                            Button(mode == .signUp ? "Hesap Oluştur" : "Giriş Yap") {
                                submit()
                            }
                            .auraButton(variant: .primary, size: .lg, isLoading: isLoading)
                            .disabled(isLoading)
                        }
                    }
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 20)
                    .animation(Theme.Motion.spring, value: mode)

                    // Legal footer
                    Text("Devam ederek Kullanım Koşulları ve Gizlilik Politikası'nı kabul etmiş olursunuz.")
                        .font(Theme.Typography.caption)
                        .foregroundColor(Theme.Colors.textSubtle)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, Theme.Spacing.lg)
                        .opacity(appeared ? 0.7 : 0)

                    Spacer().frame(height: Theme.Spacing.xl)
                }
                .padding(.horizontal, Theme.Spacing.xl)
            }
            .scrollDismissesKeyboard(.interactively)
        }
        .navigationBarHidden(true)
        .animation(Theme.Motion.spring, value: errorMessage)
        .onAppear {
            withAnimation(Theme.Motion.spring.delay(0.12)) { appeared = true }
        }
    }

    private var brandHeader: some View {
        HStack(spacing: Theme.Spacing.md) {
            ZStack {
                RoundedRectangle(cornerRadius: Theme.Radius.md)
                    .fill(Theme.Colors.brandPrimary)
                    .frame(width: 44, height: 44)
                AurionSparkShape(color: .white)
                    .frame(width: 28, height: 28)
                    .accessibilityHidden(true)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text("AuraPet")
                    .font(Theme.Typography.h3)
                    .foregroundColor(Theme.Colors.textPrimary)
                    .accessibilityAddTraits(.isHeader)
                Text("Duygularınla evrilen dijital evcil hayvan")
                    .font(Theme.Typography.caption)
                    .foregroundColor(Theme.Colors.textMuted)
            }
            Spacer()
        }
        .opacity(appeared ? 1 : 0)
        .offset(y: appeared ? 0 : -10)
    }

    private func submit() {
        guard !isLoading else { return }
        // Buton her zaman basılabilir; geçersiz formda nedenini söyle (web ile aynı).
        if let reason = validationMessage {
            Theme.Haptics.error()
            errorMessage = reason
            return
        }
        isLoading = true
        errorMessage = nil

        Task {
            do {
                let user: UserResponse
                if mode == .signUp {
                    user = try await AuraPetAPI.shared.createUser(username: username, email: email)
                } else {
                    // Var olan hesaba giriş: web'le aynı user id → senkron.
                    user = try await AuraPetAPI.shared.login(username: username)
                }
                Session.shared.userId = user.id
                Theme.Haptics.success()
                await MainActor.run { isLoggedIn = true }
            } catch {
                Theme.Haptics.error()
                await MainActor.run {
                    errorMessage = error.localizedDescription
                    isLoading = false
                }
            }
        }
    }
}
