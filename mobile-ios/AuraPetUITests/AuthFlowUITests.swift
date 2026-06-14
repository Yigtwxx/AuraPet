import XCTest

/// Auth navigasyon regresyon testi.
///
/// Bug (2026-06-13): kayıt/giriş başarılı olunca push'lu LoginView NavigationStack'te takılı
/// kalıyor, kullanıcı MainTabView'e geçemiyor ("giriş yap'a basamıyorum"). Düzeltme: ContentView'de
/// NavigationStack her dalın içine alındı + submit başarısında isLoading sıfırlandı.
///
/// Bu test gerçek backend gerektirir; ayakta değilse XCTSkip ile atlanır (CI-güvenli).
final class AuthFlowUITests: XCTestCase {

    override func setUpWithError() throws {
        continueAfterFailure = false
        try XCTSkipUnless(backendIsUp(), "Backend :8000 çalışmıyor — auth UI testi atlandı")
    }

    /// Kayıt sonrası kullanıcı LoginView'de TAKILMAMALI, doğrudan Dashboard'a (MainTabView) düşmeli.
    func testSignupLandsOnDashboard() throws {
        let app = XCUIApplication()
        app.launch()

        // Splash → Başla
        let start = app.buttons.matching(NSPredicate(format: "label CONTAINS[c] %@", "Başla")).firstMatch
        XCTAssertTrue(start.waitForExistence(timeout: 15), "Splash 'Başla' butonu görünmedi")
        start.tap()

        // Kayıt modu varsayılan. Benzersiz kimlik bilgileriyle formu doldur.
        let stamp = Int(Date().timeIntervalSince1970)
        let username = "uitest\(stamp)"

        typeInto(app, field: "Kullanıcı adı", text: username, secure: false)
        typeInto(app, field: "E-posta", text: "\(username)@test.com", secure: false)
        typeInto(app, field: "Şifre", text: "secret123", secure: true)

        // Klavyeyi kapat ki submit butonu erişilebilir olsun (her alanın kendi
        // toolbar "Tamam"ı var → firstMatch).
        let done = app.buttons["Tamam"].firstMatch
        if done.waitForExistence(timeout: 2) { done.tap() }

        app.buttons["Hesap Oluştur"].firstMatch.tap()

        // Submit sonrası ekranı 6sn bekleyip hiyerarşiyi bas (teşhis).
        sleep(6)
        print("DIAG_HIERARCHY_BEGIN")
        print(app.debugDescription)
        print("DIAG_HIERARCHY_END")

        // MainTabView göstergesi: Dashboard başlığı. Bug varsa LoginView'de kalınır → bulunmaz.
        let dashboard = app.staticTexts["Aurion'ların"]
        XCTAssertTrue(
            dashboard.waitForExistence(timeout: 20),
            "Kayıt sonrası Dashboard görünmedi — uygulama login ekranında takıldı (bug geri döndü)"
        )
    }

    // MARK: - Helpers

    private func typeInto(_ app: XCUIApplication, field: String, text: String, secure: Bool) {
        let element = secure ? app.secureTextFields[field] : app.textFields[field]
        XCTAssertTrue(element.waitForExistence(timeout: 8), "'\(field)' alanı bulunamadı")
        element.tap()
        element.typeText(text)
    }

    private func backendIsUp() -> Bool {
        guard let url = URL(string: "http://localhost:8000/api/health") else { return false }
        var ok = false
        let sem = DispatchSemaphore(value: 0)
        let task = URLSession.shared.dataTask(with: url) { data, _, _ in
            if let d = data, let s = String(data: d, encoding: .utf8), s.contains("\"status\":\"ok\"") {
                ok = true
            }
            sem.signal()
        }
        task.resume()
        _ = sem.wait(timeout: .now() + 4)
        return ok
    }
}
