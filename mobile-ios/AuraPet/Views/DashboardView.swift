import SwiftUI

/// Pet adı kuralları — create ve rename'de ortak; test edilebilir olsun diye
/// view'dan ayrı (LoginValidation kalıbı). Backend de aynı sınırı uygular (1–20).
enum PetValidation {
    static let maxNameLength = 20

    /// Trim'lenmiş ada göre hata; geçerliyse nil. Boş veya 20 karakterden uzun reddedilir.
    /// Backend `.strip()` ile parite için newline dahil tüm boşlukları kırpar.
    static func nameError(_ name: String) -> String? {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmed.isEmpty { return "İsim boş olamaz" }
        if trimmed.count > maxNameLength { return "En fazla \(maxNameLength) karakter" }
        return nil
    }

    static func isValid(_ name: String) -> Bool { nameError(name) == nil }
}

struct DashboardView: View {
    let userId: String
    @State private var pets: [Pet] = []
    @State private var isLoading = true
    @State private var errorMessage: String?
    @State private var showAddSheet = false
    @State private var renameTarget: Pet?
    @State private var renameText = ""
    @State private var showRename = false
    @State private var deleteTarget: Pet?
    @State private var showDelete = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.Spacing.xl) {
                // Header
                HStack(alignment: .bottom) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("KOLEKSİYON")
                            .font(Theme.Typography.eyebrow)
                            .tracking(1.5)
                            .foregroundColor(Theme.Colors.textMuted)
                        Text("Aurion'ların")
                            .font(Theme.Typography.h1)
                            .foregroundColor(Theme.Colors.textPrimary)
                            .accessibilityAddTraits(.isHeader)
                    }
                    Spacer()
                    if !isLoading && !pets.isEmpty {
                        Button {
                            showAddSheet = true
                            Theme.Haptics.selection()
                        } label: {
                            Label("Yeni", systemImage: "plus")
                                .labelStyle(.iconOnly)
                        }
                        .auraButton(variant: .primary, size: .sm, fullWidth: false)
                        .accessibilityLabel("Yeni Aurion oluştur")
                    }
                }

                // Error
                if let err = errorMessage {
                    ErrorBanner(message: err) {
                        Task { await loadPets() }
                    }
                }

                // Loading skeletons
                if isLoading {
                    VStack(spacing: Theme.Spacing.md) {
                        ForEach(0..<3, id: \.self) { _ in PetCardSkeleton() }
                    }
                } else if pets.isEmpty {
                    // Empty state
                    EmptyState(
                        icon: "sparkles",
                        title: "İlk Aurion'unu yarat",
                        description: "Bir isim seç — Aurion seni tanıdıkça evrim geçirecek, ruh haline göre değişecek.",
                        action: { showAddSheet = true },
                        actionLabel: "Aurion Oluştur",
                        accentColor: Theme.Colors.brandPrimary
                    )
                    .auraCard(variant: .glass)
                } else {
                    // Pet list
                    VStack(spacing: Theme.Spacing.md) {
                        ForEach(pets) { pet in
                            PetCardView(pet: pet)
                                .contextMenu {
                                    Button {
                                        renameText = pet.name
                                        renameTarget = pet
                                        showRename = true
                                    } label: {
                                        Label("Yeniden Adlandır", systemImage: "pencil")
                                    }
                                    Button(role: .destructive) {
                                        deleteTarget = pet
                                        showDelete = true
                                    } label: {
                                        Label("Sil", systemImage: "trash")
                                    }
                                }
                        }
                    }
                }
            }
            .padding(Theme.Spacing.xl)
        }
        .navigationBarHidden(true)
        .refreshable { await loadPets() }
        .task { await loadPets() }
        .sheet(isPresented: $showAddSheet) {
            AddPetSheet(userId: userId, onAdded: { newPet in
                withAnimation(Theme.Motion.spring) { pets.append(newPet) }
            })
        }
        .auraToast()
        .alert("Yeniden Adlandır", isPresented: $showRename) {
            TextField("Aurion adı", text: $renameText)
            Button("Kaydet") { renamePet() }
            Button("İptal", role: .cancel) { renameTarget = nil }
        } message: {
            Text("Aurion'una yeni bir isim ver.")
        }
        .alert("Aurion'u Sil", isPresented: $showDelete, presenting: deleteTarget) { pet in
            Button("Sil", role: .destructive) { performDelete(pet) }
            Button("İptal", role: .cancel) { deleteTarget = nil }
        } message: { pet in
            Text("\(pet.name) kalıcı olarak silinecek. Bu işlem geri alınamaz.")
        }
    }

    private func loadPets() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            let responses = try await AuraPetAPI.shared.getUserPets(userId: userId)
            await MainActor.run { pets = responses.map { $0.toPet(userId: userId) } }
        } catch {
            await MainActor.run { errorMessage = error.localizedDescription }
        }
    }

    private func renamePet() {
        guard let pet = renameTarget else { return }
        let name = renameText.trimmingCharacters(in: .whitespacesAndNewlines)
        // Boş / 20+ karakter geçersiz; değişmediyse sessizce kapat (create ile aynı kural).
        if let err = PetValidation.nameError(renameText) {
            Theme.Haptics.error()
            ToastManager.shared.show(err, type: .error)
            renameTarget = nil
            return
        }
        guard name != pet.name else { renameTarget = nil; return }
        Task {
            do {
                let resp = try await AuraPetAPI.shared.updatePet(petId: pet.id, name: name)
                let updated = resp.toPet(userId: userId)
                Theme.Haptics.success()
                await MainActor.run {
                    if let idx = pets.firstIndex(where: { $0.id == pet.id }) { pets[idx] = updated }
                    ToastManager.shared.show("İsim güncellendi", type: .success)
                    renameTarget = nil
                }
            } catch {
                Theme.Haptics.error()
                await MainActor.run {
                    ToastManager.shared.show(error.localizedDescription, type: .error)
                    renameTarget = nil
                }
            }
        }
    }

    private func performDelete(_ pet: Pet) {
        Task {
            do {
                _ = try await AuraPetAPI.shared.deletePet(petId: pet.id)
                Theme.Haptics.success()
                await MainActor.run {
                    withAnimation(Theme.Motion.spring) { pets.removeAll { $0.id == pet.id } }
                    ToastManager.shared.show("Aurion serbest bırakıldı", type: .success)
                    deleteTarget = nil
                }
            } catch {
                Theme.Haptics.error()
                await MainActor.run {
                    ToastManager.shared.show(error.localizedDescription, type: .error)
                    deleteTarget = nil
                }
            }
        }
    }
}

// MARK: - Add Pet Sheet

private struct AddPetSheet: View {
    let userId: String
    let onAdded: (Pet) -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var petName = ""
    @State private var isCreating = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: Theme.Spacing.xl) {
                    // Mascot preview
                    ZStack {
                        Circle()
                            .fill(Theme.Colors.brandPrimary.opacity(0.1))
                            .frame(width: 100, height: 100)
                        AurionSparkShape(color: Theme.Colors.brandPrimary)
                            .frame(width: 60, height: 60)
                            .accessibilityHidden(true)
                    }
                    .padding(.top, Theme.Spacing.lg)

                    Text("Yeni Aurion'una bir isim ver")
                        .font(Theme.Typography.h3)
                        .foregroundColor(Theme.Colors.textPrimary)
                        .multilineTextAlignment(.center)

                    Text("İsim seçimi kalıcıdır — Aurion bu isimle seninle büyüyecek.")
                        .font(Theme.Typography.body)
                        .foregroundColor(Theme.Colors.textMuted)
                        .multilineTextAlignment(.center)

                    FloatingLabelField(
                        label: "Aurion adı",
                        text: $petName,
                        errorText: petName.count > 20 ? "En fazla 20 karakter" : nil,
                        helperText: "örn. Lyra, Orion, Nyx",
                        submitLabel: .done
                    )

                    if let err = errorMessage {
                        ErrorBanner(message: err)
                    }

                    Button("Aurion Oluştur") { createPet() }
                        .auraButton(variant: .primary, size: .lg, isLoading: isCreating)
                        .disabled(!PetValidation.isValid(petName) || isCreating)
                }
                .padding(Theme.Spacing.xl)
            }
            .scrollDismissesKeyboard(.interactively)
            .navigationTitle("Yeni Aurion")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("İptal") { dismiss() }
                        .tint(Theme.Colors.brandPrimary)
                }
            }
            .background(Theme.Colors.canvas.ignoresSafeArea())
        }
        .presentationDetents([.medium, .large])
        .presentationDragIndicator(.visible)
        .presentationCornerRadius(24)
    }

    private func createPet() {
        guard PetValidation.isValid(petName) else { return }
        let name = petName.trimmingCharacters(in: .whitespacesAndNewlines)
        isCreating = true
        errorMessage = nil

        Task {
            do {
                let resp = try await AuraPetAPI.shared.createPet(userId: userId, name: name)
                let pet = resp.toPet(userId: userId)
                Theme.Haptics.success()
                await MainActor.run {
                    onAdded(pet)
                    dismiss()
                }
            } catch {
                Theme.Haptics.error()
                await MainActor.run {
                    errorMessage = error.localizedDescription
                    isCreating = false
                }
            }
        }
    }
}
