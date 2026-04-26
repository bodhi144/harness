# Harness Project

## Workflow
- 새 작업 시작: `harness-start` skill 사용
- 작업 완료/프로모션: `harness-finish` skill 사용

## Architecture Layers
Import direction is ONE WAY — top to bottom only:
```
pages/ → components/ → lib/ → utils/
```
- `utils/` = pure functions, no framework imports
- `lib/` = domain logic, no React imports
- `components/` = UI primitives and composites
- `pages/` = route-level views, composes components

## Commit Convention
```
git commit -m "<type>(<scope>): <description>"
```
Types: `feat`, `fix`, `test`, `refactor`, `chore`, `docs`
