/**
 * DOM utility functions
 */

/**
 * Create an element with attributes
 * @param {string} tag - HTML tag name
 * @param {Object} attrs - Attributes to set
 * @returns {HTMLElement}
 */
export function createElement(tag, attrs = {}) {
  const element = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key.startsWith('data-')) {
      element.setAttribute(key, value);
    } else {
      element.setAttribute(key, value);
    }
  });
  return element;
}

/**
 * Query selector shorthand
 * @param {string} selector
 * @param {Element} context
 * @returns {Element|null}
 */
export function $(selector, context = document) {
  return context.querySelector(selector);
}

/**
 * Query selector all shorthand
 * @param {string} selector
 * @param {Element} context
 * @returns {NodeList}
 */
export function $$(selector, context = document) {
  return context.querySelectorAll(selector);
}

/**
 * Add event listener to multiple elements
 * @param {string} selector
 * @param {string} event
 * @param {Function} handler
 */
export function on(selector, event, handler) {
  $$(selector).forEach(el => el.addEventListener(event, handler));
}
