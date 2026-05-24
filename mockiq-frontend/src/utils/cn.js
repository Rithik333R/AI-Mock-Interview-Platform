/**
 * cn — className utility.
 *
 * Merges multiple class name values into a single string,
 * filtering out falsy values (undefined, null, false, '').
 *
 * Usage:
 *   cn('base-class', isActive && 'active', hasError ? 'error' : 'normal')
 *   cn('card', className)
 *
 * This is a lightweight alternative to clsx/classnames.
 * No external dependency needed for this use case.
 */
export function cn(...classes) {
  return classes
    .flat()
    .filter(Boolean)
    .join(' ')
    .trim()
}