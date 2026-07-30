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

## PR review & merge

Every PR passes through three layers before it can merge. `develop` and `master` are protected: direct pushes are blocked, one approving review is required (pushing new commits dismisses earlier approvals), the `test` and `CodeRabbit` checks must pass, and only the Maintainers team can merge.

1. **CodeRabbit** reviews automatically when the PR is opened. Resolve every thread it raises — unresolved threads (even outdated ones) block the next step. If it reports "Review rate limited" (quota exhausted), trigger it later by commenting `@coderabbitai full review` on the PR.

2. **Run `/pr-review-merge <PR number>`** from Claude Code inside this repo. This is the second, judgment-based review plus triage: it checks the gates (CodeRabbit reviewed, threads resolved, CI green, real PR description, no credential-shaped files, lockfile changes explained), reviews the diff, and routes the PR with a label and a team review request:

   - `ready-for-maintainer-review` — nothing sensitive touched; any maintainer can approve and merge.
   - `needs-senior-review` — the diff touches sensitive paths (the API contract (`ajax.ts`, `remoteRoutes`, `types.ts`), auth/session code, login flows, capability-gated routing, deploy workflows); the Senior Engineering team must review first.

   The full gate and sensitive-path list lives in [`.claude/skills/pr-review-merge/SKILL.md`](./.claude/skills/pr-review-merge/SKILL.md). The skill never approves or merges anything.

3. **A maintainer approves and merges** in the GitHub UI (squash merge). The approval can come from anyone with write access — but not the PR author.

To run the skill you need Claude Code started inside the repo (pull first — the skill ships in `.claude/skills/`), an authenticated `gh` CLI (`gh auth login`), and write access for the labelling step. If you work from a fork, run `gh repo set-default kanzucodefoundation/project-zoe-client` once so `gh` resolves PRs against the upstream repo.

Releases (`develop` → `master`) follow the same process — the skill scans the full cumulative diff and routes it like any other PR. Merging to `master` deploys the production client. If a hotfix ever lands on `master` directly, back-merge it into `develop` immediately, using a merge commit (not squash).

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
