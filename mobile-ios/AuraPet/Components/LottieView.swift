import SwiftUI

// ---------------------------------------------------------------------------
// MARK: – LottieView
// ---------------------------------------------------------------------------
// Lottie SPM paketi eklendiğinde gerçek animasyonu, eklenmediğinde PlaceholderOrb
// gösterir. Herhangi bir kod değişikliği GEREKMEZ — derleyici otomatik geçiş yapar.
//
// Lottie SPM eklemek için:
//   Xcode > File > Add Package Dependencies
//   https://github.com/airbnb/lottie-ios  →  4.x veya üzeri
// ---------------------------------------------------------------------------

#if canImport(Lottie)
import Lottie

struct LottieView: View {
    let name: String
    var loopMode: Bool = true

    var body: some View {
        LottieAnimationViewWrapper(name: name, loopMode: loopMode ? .loop : .playOnce)
    }
}

private struct LottieAnimationViewWrapper: UIViewRepresentable {
    let name: String
    let loopMode: LottieLoopMode

    func makeUIView(context: Context) -> LottieAnimationView {
        let v = LottieAnimationView(name: name, bundle: .main)
        v.loopMode = loopMode
        v.contentMode = .scaleAspectFit
        v.play()
        return v
    }

    func updateUIView(_ uiView: LottieAnimationView, context: Context) {
        uiView.loopMode = loopMode
    }
}

#else

struct LottieView: View {
    let name: String
    var loopMode: Bool = true

    var body: some View {
        PlaceholderOrb(moodName: name)
    }
}

private struct PlaceholderOrb: View {
    let moodName: String

    private var mood: Mood { Mood.from(moodName.uppercased()) }

    var body: some View {
        Circle()
            .fill(mood.color)
            .overlay(
                Text(mood.label.components(separatedBy: " ").last ?? "")
                    .font(.system(size: 36))
            )
    }
}

#endif
