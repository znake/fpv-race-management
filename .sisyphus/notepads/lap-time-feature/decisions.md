# Decisions - Lap Time Feature

## Architectural Choices

- PlacementEntryModal: discard pending digit buffer when the modal closes (cleanup effect clears timeout + refs, does not auto-finalize on close).
