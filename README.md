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

*Note: If GitHub Actions ever supports this feature natively for pull requests,
then we do not need this action.*

#### Ways to customize

The behavior described above is the default, but it could be customized
using these options (also see examples below):

* `SKIP_DIRECTIVES` (comma-separated strings) to define your own
  directives to skip a job or workflow. This will overwrite the
  default directives.
* `NO_FAIL` (boolean, set this to `true`) to prevent this action from failing.
  Instead, it would set an output value for `run_next` to `true` or `false`
  to be used by downstream jobs.

#### Examples

Here are some simple examples to use this action in your workflows.

This fails `check_skip_ci`, thus preventing `tests` from running.
It is the simplest way to use this action:

```
name: CI

on:
  push:
  pull_request:

jobs:
  # This action should be a job before you run your tests.
  check_skip_ci:
    name: Skip CI
    runs-on: ubuntu-latest
    steps:
    - name: Fail means CI is skipped on purpose
      uses: OpenAstronomy/action-skip-ci@main
      with:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  # This is placeholder for your real tests.
  tests:
    name: Run tests
    needs: check_skip_ci
    ...
```

This makes `check_skip_ci` sets an output instead of failing.
It is more elegant (no red "x" in your check status) but
requires knowledge on how to pass output to downstream jobs.
This example also illustrates how to set custom directives,
though they are not required if you are happy with the
default directives:

```
name: CI

on:
  push:
  pull_request:

jobs:
  # This action should be a job before you run your tests.
  check_skip_ci:
    name: Skip CI
    runs-on: ubuntu-latest
    outputs:
      run_next: ${{ steps.skip_ci_step.outputs.run_next }}
    steps:
    - name: Set output to skip CI
      uses: OpenAstronomy/action-skip-ci@main
      id: skip_ci_step
      with:
        NO_FAIL: true
        SKIP_DIRECTIVES: '[skip other],[other skip]'
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  # This is placeholder for your real tests.
  tests:
    name: Run tests
    needs: check_skip_ci
    if: needs.check_skip_ci.outputs.run_next == 'true'
    ...
```

#### Why does this action not cancel workflow instead of failing?

This is because cancelling the workflow does not work when the command
is issued from a pull request opened from a fork due to lack of
write access from the fork's GitHub token. The cancellation does not
fail but nothing gets cancelled anyway.

#### For developers

To install/update dependencies::

    npm install

To build::

    npm run build

To run it locally (might require tinkering with `src/main.ts` to mock
the GitHub events)::

    node dist/index.js
