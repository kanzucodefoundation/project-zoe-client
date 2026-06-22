# Contributing to Project Zoe Client

Thank you for your interest in contributing! Please read this guide before opening a pull request.

## Before you start

- Get the project running locally by following the [README](./README.md).
- Check the [open issues](https://github.com/kanzucodefoundation/project-zoe-client/issues) to see if someone is already working on what you have in mind.
- For significant changes, open an issue first to discuss the approach before writing code.

## Workflow

```
feature branch → develop (staging) → master (production)
```

1. **Branch from `develop`** — never from `master`:

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes.** Keep commits small and focused.

3. **Test your changes locally** before opening a PR. Check that the feature works as expected and that you haven't broken existing screens.

4. **Open a PR against `develop`** and fill in every section of the PR template — especially _how to test_ and screenshots where relevant. Incomplete PRs will be sent back.

5. Your PR will be reviewed. Address any feedback, then it will be merged into `develop` and deployed automatically to staging.

6. Once the change is verified on staging, it is promoted to `master` via a separate PR, which triggers the production deploy.

## Branch naming

```
{type}/{short-summary}
```

| Type | When to use |
|------|-------------|
| `feat` | New feature or screen |
| `fix` | Bug fix |
| `chore` | Maintenance, dependencies, config |
| `docs` | Documentation only |
| `refactor` | Code restructure without behaviour change |

**Examples:** `feat/contact-detail-page`, `fix/dark-mode-table-header`, `chore/update-mui`

## Code style

ESLint is configured with the flat config (`eslint.config.js`). Run `npm run lint` before pushing.

Use conventional commit messages:

```
feat: add contact detail page
fix: correct table header colour in dark mode
chore: upgrade MUI to v7
```

## Project structure

```
src/
  components/    # Shared layout and UI components
  data/          # Redux store and core slice
  modules/       # Feature modules (one folder per domain)
  theme-wh/      # MUI theme customisations
  utils/         # Shared utilities and API client
```

New features belong in `src/modules/` under their own domain folder. Shared components used across more than one module go in `src/components/`.
