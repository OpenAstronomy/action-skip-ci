# GitHub Action to skip CI in PR

Check if the latest commit message in the pull request contains of of
these directives (case-insensitive):

* `[skip ci]`
* `[ci skip]`
* `[skip action]`
* `[action skip]`
* `[skip actions]`
* `[actions skip]`

If it does, the workflow running this action will be cancelled, thus preventing
downstream jobs or steps from running. Otherwise, jobs will run as usual.
Non-pull request event will not be affected.

Here is a simple example to use this action in your workflow:

```
name: CI

on:
  push:
  pull_request_target:

jobs:
  # This action should be a step before you run your tests.
  check_skip_ci:
    name: Skip CI
    runs-on: ubuntu-latest
    steps:
    - name: Cancel workflow if CI is skipped
      uses: pllim/action-skip-ci@main
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  # This is placeholder for your real tests.
  tests:
    name: Run tests
    ...
```

*Note: If GitHub Actions ever supports this feature natively for pull requests, then we do not need this action.*
