# D4Guide - Diablo 4 Blood Wave Necromancer Build Guide

[![Tests](https://github.com/Scarmonit/D4Guide/actions/workflows/test.yml/badge.svg)](https://github.com/Scarmonit/D4Guide/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/Scarmonit/D4Guide/branch/main/graph/badge.svg)](https://codecov.io/gh/Scarmonit/D4Guide)

A comprehensive build guide for the Blood Wave Necromancer in Diablo 4, featuring interactive tools for damage calculation, skill planning, and gear comparison.

## Features

- **Damage Calculator** - Calculate and optimize your Blood Wave damage output
- **Skill Manager** - Plan and track skill point allocation
- **Gear Comparison** - Compare gear pieces and find optimal stats
- **Theme Support** - Light/dark mode with customizable fonts
- **Responsive Design** - Works on desktop and mobile devices

## Development

### Prerequisites

- Node.js 22+
- npm

### Installation

```bash
npm install --legacy-peer-deps
```

### Scripts

```bash
# Development server with live reload
npm run dev

# Build for production
npm run build

# Run all tests
npm run test:all

# Unit tests
npm run test:unit
npm run test:unit:watch
npm run test:unit:coverage

# E2E tests
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:debug
```

## Testing

- **Unit Tests**: Vitest with jsdom environment (104 tests)
- **E2E Tests**: Playwright with Chromium (14 tests)
- **Coverage**: V8 coverage provider

## License

MIT
