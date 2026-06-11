import SwiftUI

private enum LoginMode: String, CaseIterable {
    case signUp = "Kayıt Ol"
    case signIn = "Giriş Yap"
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
    private var usernameError: String? {
        guard !username.isEmpty else { return nil }
        return username.count < 3 ? "En az 3 karakter olmalı" : nil
    }
    private var emailError: String? {
        guard !email.isEmpty else { return nil }
        let valid = email.contains("@") && email.contains(".")
        return valid ? nil : "Geçerli bir e-posta girin"
    }
    private var canSubmit: Bool {
        guard !isLoading, !username.isEmpty, usernameError == nil else { return false }
        // Girişte yalnızca kullanıcı adı gerekir; e-posta yalnızca kayıtta zorunlu.
        if mode == .signUp {
            return !email.isEmpty && emailError == nil
        }
        return true
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

                    // Mode picker
                    Picker("Mod", selection: $mode) {
                        ForEach(LoginMode.allCases, id: \.self) { Text($0.rawValue).tag($0) }
                    }
                    .pickerStyle(.segmented)
                    .opacity(appeared ? 1 : 0)
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
                            .disabled(!canSubmit)
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
                    .fill(
                        LinearGradient(
                            colors: [Theme.Colors.brandPrimary, Theme.Colors.brandSecondary],
                            startPoint: .topLeading, endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 44, height: 44)
                    .shadow(color: Theme.Colors.brandPrimary.opacity(0.45), radius: 8)
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
        guard canSubmit else { return }
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
