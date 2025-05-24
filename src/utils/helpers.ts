import type { ToneLevel, ToneIssueType } from "@/types";

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function sanitizeText(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function getToneColor(level: ToneLevel): string {
  switch (level) {
    case "excellent":
      return "text-green-600 bg-green-50 border-green-200";
    case "good":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "fair":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "poor":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "problematic":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
}

export function getIssueColor(
  type: ToneIssueType,
  severity: "low" | "medium" | "high"
): string {
  const baseColors = {
    aggressive: "red",
    "passive-aggressive": "orange",
    "overly-formal": "blue",
    "too-casual": "purple",
    unclear: "yellow",
    "potentially-offensive": "red",
    "micro-aggression": "red",
    "cultural-insensitive": "red",
    emotional: "pink",
    demanding: "orange",
    dismissive: "gray",
  };

  const color = baseColors[type] || "gray";

  switch (severity) {
    case "high":
      return `text-${color}-700 bg-${color}-100 border-${color}-300`;
    case "medium":
      return `text-${color}-600 bg-${color}-50 border-${color}-200`;
    case "low":
      return `text-${color}-500 bg-${color}-25 border-${color}-100`;
  }
}

export function formatProcessingTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function calculateConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return "text-green-600";
  if (confidence >= 0.6) return "text-yellow-600";
  return "text-red-600";
}

export function getPositionInViewport(element: HTMLElement): {
  x: number;
  y: number;
} {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top,
  };
}

export function isElementVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

export function smoothScrollToElement(element: HTMLElement): void {
  element.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "nearest",
  });
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback pour les environnements non-sécurisés
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    return new Promise((resolve, reject) => {
      if (document.execCommand("copy")) {
        resolve();
      } else {
        reject(new Error("Unable to copy to clipboard"));
      }
      document.body.removeChild(textArea);
    });
  }
}

export function highlightText(
  element: HTMLElement,
  start: number,
  end: number,
  className: string
): HTMLElement | null {
  try {
    const text = element.textContent || "";
    if (start < 0 || end > text.length || start >= end) {
      return null;
    }

    const range = document.createRange();
    const textNode = element.firstChild;

    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
      return null;
    }

    range.setStart(textNode, start);
    range.setEnd(textNode, end);

    const highlight = document.createElement("span");
    highlight.className = className;

    try {
      range.surroundContents(highlight);
      return highlight;
    } catch (error) {
      // Si surroundContents échoue, utiliser une approche alternative
      const contents = range.extractContents();
      highlight.appendChild(contents);
      range.insertNode(highlight);
      return highlight;
    }
  } catch (error) {
    console.warn("Failed to highlight text:", error);
    return null;
  }
}

export function removeHighlights(element: HTMLElement): void {
  const highlights = element.querySelectorAll(
    ".tonefixer-highlight, .tonefixer-issue"
  );
  highlights.forEach((highlight) => {
    const parent = highlight.parentNode;
    if (parent) {
      parent.replaceChild(
        document.createTextNode(highlight.textContent || ""),
        highlight
      );
      parent.normalize();
    }
  });
}

export function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

export function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

export function unescapeHtml(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || "";
}

export class EventEmitter {
  private events: { [key: string]: Function[] } = {};

  on(event: string, callback: Function): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: Function): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach((callback) => callback(...args));
  }

  once(event: string, callback: Function): void {
    const onceCallback = (...args: any[]) => {
      callback(...args);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }
}
