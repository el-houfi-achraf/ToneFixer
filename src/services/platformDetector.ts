import type {
  Platform,
  MessageType,
  RelationshipType,
  MessageContext,
} from "@/types";

export class PlatformDetector {
  // Stocker la plateforme détectée en cache pour éviter les détections répétées
  private static _cachedPlatform: Platform | null = null;
  private static _cachedHostname: string | null = null;
  private static _lastDetectionTime: number = 0;

  /**
   * Détecte la plateforme actuellement utilisée
   * Utilise un cache pour éviter les détections répétées sur le même hostname
   */ static detectPlatform(): Platform {
    const hostname = window.location.hostname;
    const href = window.location.href;
    const currentTime = Date.now();

    // Utiliser le cache pour éviter les appels répétés (cache valide pendant 60 secondes)
    if (
      this._cachedHostname === hostname &&
      this._cachedPlatform &&
      currentTime - this._lastDetectionTime < 60000
    ) {
      // Complètement silencieux - pas de log pour les hits de cache
      return this._cachedPlatform;
    }

    // Log limité - uniquement lors du changement de site ou expiration du cache
    const shouldLog =
      !this._cachedHostname ||
      this._cachedHostname !== hostname ||
      currentTime - this._lastDetectionTime >= 60000;
    if (shouldLog) {
      console.log("ToneFixer: Détection plateforme sur:", hostname);
    }

    // Pages locales de test
    if (
      href.includes("test-page.html") ||
      hostname === "" ||
      href.startsWith("file://")
    ) {
      console.log("ToneFixer: Page de test locale détectée");
      this._cachedHostname = hostname;
      this._cachedPlatform = "gmail"; // On simule Gmail pour les tests
      this._lastDetectionTime = currentTime;
      return this._cachedPlatform;
    }

    let platform: Platform = "other";

    // Détection plus précise des domaines avec vérification de sous-domaines
    if (this._matchDomain(hostname, ["mail.google.com"])) {
      platform = "gmail";
    } else if (this._matchDomain(hostname, ["slack.com", "app.slack.com"])) {
      platform = "slack";
    } else if (
      this._matchDomain(hostname, ["linkedin.com", "www.linkedin.com"])
    ) {
      platform = "linkedin";
    } else if (this._matchDomain(hostname, ["github.com", "www.github.com"])) {
      platform = "github";
    } else if (
      this._matchDomain(hostname, ["discord.com", "www.discord.com"])
    ) {
      platform = "discord";
    } else if (this._matchDomain(hostname, ["teams.microsoft.com"])) {
      platform = "teams";
    }
    // Pour les tests, on peut détecter d'autres sites communs
    else if (hostname.includes("google.com")) {
      platform = "gmail"; // Pour tester sur google.com
    } else if (hostname.includes("outlook")) {
      platform = "gmail"; // Pour tester sur outlook
    }

    // Mettre en cache la détection
    this._cachedHostname = hostname;
    this._cachedPlatform = platform;
    this._lastDetectionTime = currentTime;

    console.log(`ToneFixer: Plateforme détectée: ${platform} sur ${hostname}`);

    return platform;
  }

  /**
   * Helper pour vérifier si un hostname correspond à un des domaines dans la liste
   */
  private static _matchDomain(hostname: string, domains: string[]): boolean {
    return domains.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
    );
  }

  /**
   * Détecte le type de message en fonction de l'élément et de la plateforme
   * Méthode simplifiée pour compatibilité
   */
  static detectMessageType(
    element: HTMLElement,
    platform: Platform
  ): MessageType {
    return "email"; // Simplifié pour la compatibilité
  }
}
