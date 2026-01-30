# Channel Assignment - Decisions

## Architectural Choices
<!-- Append findings here -->

- Kept optimization intentionally greedy (no brute force / Hungarian) to avoid complexity while still improving “repeat channel” likelihood.
- Fallback behavior is deterministic and stable: preserve original pilotIds order when no channel preference exists for a slot.
