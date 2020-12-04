# GitHub Action to skip CI in PR

Check if the latest commit message in the pull request contains of of
these directives (case-insensitive):

* `[skip ci]`
* `[ci skip]`
* `[skip action]`
* `[action skip]`
* `[skip actions]`
* `[actions skip]`

If it does, the job running this action will fail, thus preventing
downstream jobs from running. Otherwise, jobs will run as usual.
Non-pull request event will not be affected.

Here is a simple example to use this action in your workflow. All
the downstream jobs should depend on this action via ``needs``:

```
name: CI

on:
  push:
  pull_request_target:

jobs:
  check_skip_ci:
    name: Failure means CI is skipped on purpose
    runs-on: ubuntu-latest
    steps:
    - name: Check skip CI
      uses: pllim/action-skip-ci@main
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  # This is placeholder for your real tests.
  tests:
    name: My tests
    runs-on: ubuntu-latest
    needs: check_skip_ci
    steps: ...

```

*Note: If GitHub Actions ever supports this feature natively, then we do not need this action.*