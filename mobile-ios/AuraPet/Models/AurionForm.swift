import Foundation

enum AurionForm: Int, CaseIterable {
    case spark   = 1
    case drift   = 2
    case glimmer = 3
    case aether  = 4
    case nova    = 5

    init(level: Int) {
        switch level {
        case ...1:  self = .spark
        case 2:     self = .drift
        case 3:     self = .glimmer
        case 4:     self = .aether
        default:    self = .nova
        }
    }

    var displayName: String {
        switch self {
        case .spark:   return "Kıvılcım"
        case .drift:   return "Süzgün"
        case .glimmer: return "Parıltı"
        case .aether:  return "Esir"
        case .nova:    return "Nova"
        }
    }

    var englishName: String {
        switch self {
        case .spark:   return "Spark"
        case .drift:   return "Drift"
        case .glimmer: return "Glimmer"
        case .aether:  return "Aether"
        case .nova:    return "Nova"
        }
    }
}
