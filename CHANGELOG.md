# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.8] - 2025-05-30

### Changed
- Updated @ton-ai-core/blueprint dependency from ^0.30.16 to ^0.34.5
- Updated @ton/sandbox dependency from ^0.16.0 to ^0.31.0  
- Updated @ton/test-utils dependency from ^0.4.2 to ^0.6.0

### Improved
- Enhanced test template generation to automatically detect if scripts require arguments
- Added intelligent argument handling in generated test templates
- Improved script analysis to determine function signatures dynamically

## [0.1.7] - 2025-04-24

### Fixed
- Correct comment formatting in test template
- Remove placeholder argument from test template assertion

## [0.1.6] - 2025-04-24

### Fixed
- Correct comment formatting in test template

## [0.1.5] - 2025-04-24

- Placeholder for release process.

## [0.1.4] - 2025-04-24
### Changed
- Export SandboxNetworkProvider from package root for easier import.
- Renamed `SandboxSpecsPlugin` to `SandboxPlugin` for clarity.
### Fixed
- Code formatting issues identified by Prettier.
- Configure `tsconfig.json` paths for correct self-import resolution in tests.

## [0.1.3] - 2025-04-24
### Changed
- refactor: Export SandboxNetworkProvider from package root

## [0.1.2] - 2024-08-01 
### Added
- Initial version of blueprint-plugin-sandbox-specs.
- Command `blueprint generate-specs` to generate spec files from template.
