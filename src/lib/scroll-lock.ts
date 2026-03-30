/**
 * Centralized body scroll lock.
 *
 * Multiple overlays (mobile menu, cart sidebar, modals …) can request a lock
 * independently. The body scroll is only restored once ALL locks are released.
 *
 * Usage:
 *   lockScroll('cart')    – acquire lock
 *   unlockScroll('cart')  – release lock
 */

const activeLocks = new Set<string>()

export function lockScroll(key: string): void {
  activeLocks.add(key)
  document.body.style.overflow = 'hidden'
  // iOS Safari fix – prevent elastic scroll on the body
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
}

export function unlockScroll(key: string): void {
  activeLocks.delete(key)
  if (activeLocks.size === 0) {
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.width = ''
  }
}
