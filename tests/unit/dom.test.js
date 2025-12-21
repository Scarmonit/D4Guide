/**
 * Unit tests for DOM utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createElement, $, $$, on } from '../../src/js/utils/dom.js';

// Helper to create test DOM structure safely
function setupTestDOM() {
  document.body.textContent = '';

  const container = document.createElement('div');
  container.id = 'container';

  const span1 = document.createElement('span');
  span1.className = 'item';
  span1.textContent = 'First';

  const span2 = document.createElement('span');
  span2.className = 'item';
  span2.textContent = 'Second';

  const paragraph = document.createElement('p');
  paragraph.id = 'paragraph';
  paragraph.textContent = 'Text';

  container.appendChild(span1);
  container.appendChild(span2);
  container.appendChild(paragraph);
  document.body.appendChild(container);
}

function setupListDOM() {
  document.body.textContent = '';

  const ul = document.createElement('ul');
  ul.id = 'list';

  ['One', 'Two', 'Three'].forEach(text => {
    const li = document.createElement('li');
    li.className = 'list-item';
    li.textContent = text;
    ul.appendChild(li);
  });

  document.body.appendChild(ul);
}

function setupButtonsDOM() {
  document.body.textContent = '';

  [1, 2, 3].forEach(num => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = `Button ${num}`;
    document.body.appendChild(btn);
  });
}

describe('DOM Utilities', () => {
  beforeEach(() => {
    document.body.textContent = '';
  });

  describe('createElement()', () => {
    it('should create element with specified tag', () => {
      const element = createElement('div');
      expect(element.tagName).toBe('DIV');
    });

    it('should create element with className attribute', () => {
      const element = createElement('span', { className: 'my-class' });
      expect(element.className).toBe('my-class');
    });

    it('should create element with multiple classes', () => {
      const element = createElement('p', { className: 'class1 class2 class3' });
      expect(element.classList.contains('class1')).toBe(true);
      expect(element.classList.contains('class2')).toBe(true);
      expect(element.classList.contains('class3')).toBe(true);
    });

    it('should create element with id attribute', () => {
      const element = createElement('div', { id: 'my-id' });
      expect(element.id).toBe('my-id');
    });

    it('should create element with data attributes', () => {
      const element = createElement('button', {
        'data-action': 'submit',
        'data-value': '42'
      });
      expect(element.getAttribute('data-action')).toBe('submit');
      expect(element.getAttribute('data-value')).toBe('42');
    });

    it('should create element with aria attributes', () => {
      const element = createElement('button', {
        'aria-label': 'Close button',
        'aria-hidden': 'false'
      });
      expect(element.getAttribute('aria-label')).toBe('Close button');
      expect(element.getAttribute('aria-hidden')).toBe('false');
    });

    it('should create element with no attributes', () => {
      const element = createElement('article');
      expect(element.attributes.length).toBe(0);
    });

    it('should create different element types', () => {
      const elements = ['div', 'span', 'button', 'input', 'ul', 'li', 'h1'];
      elements.forEach(tag => {
        const el = createElement(tag);
        expect(el.tagName).toBe(tag.toUpperCase());
      });
    });
  });

  describe('$()', () => {
    beforeEach(() => {
      setupTestDOM();
    });

    it('should select element by id', () => {
      const element = $('#container');
      expect(element).not.toBe(null);
      expect(element.id).toBe('container');
    });

    it('should select element by class (first match)', () => {
      const element = $('.item');
      expect(element).not.toBe(null);
      expect(element.textContent).toBe('First');
    });

    it('should select element by tag name', () => {
      const element = $('p');
      expect(element).not.toBe(null);
      expect(element.id).toBe('paragraph');
    });

    it('should return null for non-existent selector', () => {
      const element = $('#nonexistent');
      expect(element).toBe(null);
    });

    it('should select within custom context', () => {
      const container = document.getElementById('container');
      const element = $('span', container);
      expect(element).not.toBe(null);
      expect(element.className).toBe('item');
    });

    it('should select using complex selectors', () => {
      const element = $('#container .item');
      expect(element).not.toBe(null);
      expect(element.textContent).toBe('First');
    });
  });

  describe('$$()', () => {
    beforeEach(() => {
      setupListDOM();
    });

    it('should select all matching elements', () => {
      const elements = $$('.list-item');
      expect(elements.length).toBe(3);
    });

    it('should return NodeList', () => {
      const elements = $$('.list-item');
      expect(elements).toBeInstanceOf(NodeList);
    });

    it('should return empty NodeList for non-existent selector', () => {
      const elements = $$('.nonexistent');
      expect(elements.length).toBe(0);
    });

    it('should select within custom context', () => {
      const list = document.getElementById('list');
      const elements = $$('li', list);
      expect(elements.length).toBe(3);
    });

    it('should iterate over all elements', () => {
      const elements = $$('.list-item');
      const texts = [];
      elements.forEach(el => texts.push(el.textContent));
      expect(texts).toEqual(['One', 'Two', 'Three']);
    });
  });

  describe('on()', () => {
    beforeEach(() => {
      setupButtonsDOM();
    });

    it('should attach click handler to all matching elements', () => {
      const handler = vi.fn();
      on('.btn', 'click', handler);

      const buttons = document.querySelectorAll('.btn');
      buttons[0].click();
      buttons[1].click();
      buttons[2].click();

      expect(handler).toHaveBeenCalledTimes(3);
    });

    it('should pass event object to handler', () => {
      const handler = vi.fn();
      on('.btn', 'click', handler);

      const button = document.querySelector('.btn');
      button.click();

      expect(handler).toHaveBeenCalledWith(expect.any(MouseEvent));
    });

    it('should attach different event types', () => {
      const mouseoverHandler = vi.fn();
      on('.btn', 'mouseover', mouseoverHandler);

      const button = document.querySelector('.btn');
      const event = new MouseEvent('mouseover', { bubbles: true });
      button.dispatchEvent(event);

      expect(mouseoverHandler).toHaveBeenCalled();
    });

    it('should not throw if no elements match', () => {
      expect(() => {
        on('.nonexistent', 'click', vi.fn());
      }).not.toThrow();
    });
  });
});
