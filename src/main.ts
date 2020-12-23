import * as core from "@actions/core";
import * as github from "@actions/github";

async function run() {
    try {
        const accepted_flags:Array<string> = [
            '[skip ci]', '[ci skip]',
            '[skip action]', '[action skip]',
            '[skip actions]', '[actions skip]'];

        const pr = github.context.payload.pull_request;
        if (!pr) {
            core.info("This action only runs for pull request, exiting with no-op");
            return;
        }

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
            core.setFailed(`"${commit.data.message}" contains directive to skip CI, failing this check`);

            /* Instead of failing, can also try to cancel but the token needs write access,
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
            core.info(`No directive to skip CI found in "${commit.data.message}", moving on...`);
        }
    } catch(err) {
        core.setFailed(`Action failed with error ${err}`);
    }
}

run();
