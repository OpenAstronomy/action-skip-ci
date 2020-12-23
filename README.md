# GitHub Action to skip CI in PR

Check if the latest commit message in the pull request contains one of
these directives (case-insensitive):

* `[skip ci]`
* `[ci skip]`
* `[skip action]`
* `[action skip]`
* `[skip actions]`
* `[actions skip]`

If it does, the job running this action will fail, thus preventing
downstream jobs or steps from running. Otherwise, jobs will run as usual.

Non-pull request event will not be affected. This is because we want the CI
to run when a PR is merged even though its last commit has a directive to
skip CI for that PR.

Here is a simple example to use this action in your workflow:

```
name: CI

on:
  push:
  pull_request_target:

jobs:
  # This action should be a job before you run your tests.
  check_skip_ci:
    name: Skip CI
    runs-on: ubuntu-latest
    steps:
    - name: Fail means CI is skipped on purpose
      uses: pllim/action-skip-ci@main
      with:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  # This is placeholder for your real tests.
  tests:
    name: Run tests
    needs: check_skip_ci
    ...
```

*Note: If GitHub Actions ever supports this feature natively for pull requests, then we do not need this action.*

#### Why does this action not cancel workflow instead of failing?

This is because cancelling the workflow does work when the command
is issued from a pull request opened from a fork due to lack of
write access from the fork's token. The cancellation does not
fail but nothing gets cancelled anyway.
