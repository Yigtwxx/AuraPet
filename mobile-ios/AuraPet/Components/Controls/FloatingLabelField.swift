import SwiftUI

struct FloatingLabelField: View {
    let label: String
    @Binding var text: String
    var keyboardType: UIKeyboardType = .default
    var isSecure: Bool = false
    var errorText: String? = nil
    var helperText: String? = nil
    var submitLabel: SubmitLabel = .done

    @FocusState private var focused: Bool
    private var isActive: Bool { focused || !text.isEmpty }
    private var hasError: Bool { errorText != nil }

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            inputField
            feedbackLabel
        }
        .animation(Theme.Motion.fast, value: errorText)
    }

    private var inputField: some View {
        ZStack(alignment: .leading) {
            background
            inputContent
            floatingLabel
        }
        .frame(height: 56)
        .contentShape(Rectangle())
        .onTapGesture { focused = true }
    }

    private var background: some View {
        RoundedRectangle(cornerRadius: Theme.Radius.sm)
            .fill(Theme.Colors.glass)
            .overlay(
                RoundedRectangle(cornerRadius: Theme.Radius.sm)
                    .stroke(borderColor, lineWidth: 1)
            )
            .shadow(color: shadowColor, radius: 8, x: 0, y: 0)
            .animation(Theme.Motion.fast, value: focused)
            .animation(Theme.Motion.fast, value: hasError)
    }

    private var inputContent: some View {
        Group {
            if isSecure {
                SecureField("", text: $text)
                    .submitLabel(submitLabel)
            } else {
                TextField("", text: $text)
                    .keyboardType(keyboardType)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .submitLabel(submitLabel)
            }
        }
        .focused($focused)
        .padding(.horizontal, Theme.Spacing.lg)
        .padding(.top, isActive ? 20 : 0)
        .padding(.bottom, isActive ? 4 : 0)
        .font(Theme.Typography.body)
        .foregroundColor(hasError ? Theme.Colors.danger : Theme.Colors.textPrimary)
        .toolbar {
            ToolbarItemGroup(placement: .keyboard) {
                Spacer()
                Button("Tamam") { focused = false }
                    .font(.system(.callout, design: .default, weight: .semibold))
                    .tint(Theme.Colors.brandPrimary)
            }
        }
    }

    private var floatingLabel: some View {
        Text(label)
            .font(isActive ? Theme.Typography.eyebrow : Theme.Typography.body)
            .foregroundColor(labelColor)
            .offset(x: Theme.Spacing.lg, y: isActive ? -14 : 0)
            .animation(Theme.Motion.gentle, value: isActive)
            .animation(Theme.Motion.fast, value: hasError)
            .animation(Theme.Motion.fast, value: focused)
            .allowsHitTesting(false)
    }

    @ViewBuilder
    private var feedbackLabel: some View {
        if let error = errorText {
            HStack(spacing: 4) {
                Image(systemName: "exclamationmark.circle.fill")
                    .font(.system(size: 11))
                Text(error)
                    .font(Theme.Typography.caption)
            }
            .foregroundColor(Theme.Colors.danger)
            .padding(.horizontal, 4)
            .transition(.opacity.combined(with: .move(edge: .top)))
        } else if let helper = helperText {
            Text(helper)
                .font(Theme.Typography.caption)
                .foregroundColor(Theme.Colors.textSubtle)
                .padding(.horizontal, 4)
                .transition(.opacity)
        }
    }

    private var borderColor: Color {
        if hasError { return Theme.Colors.danger }
        if focused  { return Theme.Colors.brandPrimary.opacity(0.7) }
        return Theme.Colors.borderStrong
    }

    private var shadowColor: Color {
        if hasError { return Theme.Colors.danger.opacity(0.12) }
        if focused  { return Theme.Colors.brandPrimary.opacity(0.15) }
        return .clear
    }

    private var labelColor: Color {
        if hasError { return Theme.Colors.danger.opacity(0.8) }
        if focused  { return Theme.Colors.brandPrimary.opacity(0.9) }
        return Theme.Colors.textMuted
    }
}
