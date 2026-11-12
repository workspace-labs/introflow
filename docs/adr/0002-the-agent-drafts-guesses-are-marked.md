# 0002. The agent drafts every word; guesses are marked until confirmed

- Status: accepted
- Date: 2026-11-12
- Decided by: the owner ("what if the human can't give the right description? … the AI first reads the
  project")

## Context

The first plan had the owner answer two questions in his own words: why the project was built, and what
makes it different. He pointed out that many people cannot describe their own project well from nothing.

## Options weighed

1. **Ask the owner for those two answers.** Honest, but hard for exactly the people the skill is for.
2. **The agent writes everything silently.** Easy, but an introduction goes to clients and judges under the
   owner's name, and the agent cannot know why something was built.
3. **The agent drafts everything, and marks what it worked out itself.** The owner corrects instead of
   writing.

## Decision

Option 3. A line from the records is written `- Label: text`. A line the agent worked out is written
`? Label: text`: the page prints "To confirm" on it, and the reader refuses `status: approved` while any
remains. A fact the files do not hold and the agent cannot work out is left out and asked.

## Consequences

- A draft may be shown with guesses in it; an approved introduction never holds one.
- The quality of the draft depends on the project's own files. A thin project gets a shorter introduction
  and a plain statement of what was missing, not an invented one.
