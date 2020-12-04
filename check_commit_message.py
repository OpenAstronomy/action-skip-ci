import json
import os
import sys

from github import Github

event_name = os.environ['GITHUB_EVENT_NAME']

# If not PR, success with no-op.
if event_name not in ('pull_request_target', 'pull_request'):
    print(f'Skipping commit message check for skipping CI for {event_name}')
    sys.exit(0)

event_jsonfile = os.environ['GITHUB_EVENT_PATH']

with open(event_jsonfile, encoding='utf-8') as fin:
    event = json.load(fin)

base_repo = event['pull_request']['base']['repo']['full_name']
pr_num = event['number']
g = Github(os.environ.get('GITHUB_TOKEN'))
repo = g.get_repo(base_repo)
pr = repo.get_pull(pr_num)
commits = pr.get_commits().reversed

# Make it case-insensitive by converting to lowercase.
pr_msg = commits[0].commit.message.lower()
accepted_flags = ('[skip ci]', '[ci skip]',
                  '[skip action]', '[action skip]',
                  '[skip actions]', '[actions skip]')
want_to_skip = False
for flag in accepted_flags:
    if flag in pr_msg:
        want_to_skip = True
        break

if want_to_skip:
    print(f'"{flag}" found in "{pr_msg}", failing to stop downstream jobs')
    sys.exit(1)
else:
    print(f'No directive to skip CI found in "{pr_msg}"')
