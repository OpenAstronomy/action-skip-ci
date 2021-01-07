import * as core from "@actions/core";
import * as github from "@actions/github";

async function run() {
    try {
        const pr = github.context.payload.pull_request;
        if (!pr) {
            core.info("This action only runs for pull request, exiting with no-op");
            return;
        }

        /* Input always parsed as string, so need to convert to bool.
           See https://github.com/actions/toolkit/issues/361
        */
        const no_fail_input = core.getInput("NO_FAIL", { required: false });
        const no_fail = no_fail_input === "true";

        const accepted_flags_input = core.getInput("SKIP_DIRECTIVES", { required: false });
        const accepted_flags = accepted_flags_input.split(",");

        const gh_token = core.getInput("GITHUB_TOKEN", { required: true });
        const octokit = github.getOctokit(gh_token);

        const commit = await octokit.git.getCommit({
            owner: pr.head.repo.owner.login,
            repo: pr.head.repo.name,
            commit_sha: pr.head.sha});
        const msg = commit.data.message.toLowerCase();

        core.info("Looking for one of the following directives:");
        for (let i=0; i<accepted_flags.length; i++) {
            core.info(`    ${accepted_flags[i]}`);
        }

        if (accepted_flags.some(v => msg.includes(v))) {
            core.info(`"${commit.data.message}" contains directive to skip, so...`)
            if (no_fail) {
                core.info('setting run_next to false');
                core.setOutput('run_next', false);
            } else {
                core.setFailed('failing this check');
            }

            /* Instead of failing or setting output, can also try to cancel but
               the token needs write access,
               so we cannot implement this for OSS in reality. */
            /*
            const { GITHUB_RUN_ID } = process.env;
            const run_id = Number(GITHUB_RUN_ID);
            core.info(`"${commit.data.message}" contains directive to skip CI, cancelling GITHUB_RUN_ID=${run_id}`);
            const res = await octokit.actions.cancelWorkflowRun({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                run_id: run_id
            });
            */
        } else {
            core.info(`No directive to skip found in "${commit.data.message}", so...`);
            if (no_fail) {
                core.info('setting run_next to true');
                core.setOutput('run_next', true);
            } else {
                core.info(`moving on...`);
            }
        }
    } catch(err) {
        core.setFailed(`Action failed with error ${err}`);
    }
}

run();
