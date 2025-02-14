# Development Guide

This guide explains how to develop and contribute to AIWrapper.

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/mitkury/aiwrapper.git
cd aiwrapper
```

2. Install dependencies:
```bash
npm install
```

## Project Structure

- `src/` - Source code
  - `lang/` - Language model implementations
  - `types/` - TypeScript type definitions
- `tests/` - Test files
  - `npm/` - NPM package tests
  - `deno/` - Deno module tests
  - `shared/` - Shared test utilities
- `docs/` - Documentation
- `dist/` - Built files (generated)

## Building

Build the project:
```bash
npm run build
```

This runs:
1. `prebuild` - Prepares files for building
2. `build` - Compiles TypeScript
3. `postbuild` - Post-build processing

## Testing

See [Testing Guide](testing.md) for detailed testing information.

## Development Workflow

1. Create a new branch for your feature/fix
2. Make your changes
3. Add/update tests
4. Build and test locally
5. Submit a pull request

## Code Style

- Use TypeScript for type safety
- Follow existing code formatting
- Add JSDoc comments for public APIs
- Keep code modular and maintainable

## Adding New Features

### Adding a New Provider

1. Create a new provider class in `src/lang/`
2. Implement the required interfaces
3. Add provider-specific tests
4. Update documentation

### Adding New Functionality

1. Design the API
2. Add TypeScript types
3. Implement the feature
4. Add tests
5. Update documentation

## Documentation

- Keep README.md focused on user-facing features
- Add detailed documentation in `/docs`
- Include code examples
- Document breaking changes 