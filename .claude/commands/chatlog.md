# /chatlog - Get Current Conversation Log Path

Locate and display the JSONL conversation log file for the current Claude Code session.

## Behavior

1. Determine the project-specific session storage directory by encoding the working directory path
2. Find the most recently modified `.jsonl` file in that directory (which is this active conversation)
3. Verify the session ID matches by reading the first line of the file
4. Output the full system path and session ID

## Steps

Run the following bash commands:

```bash
# The project session dir uses the working directory path with / replaced by -
# and leading - stripped. Claude Code stores this automatically.
PROJECT_DIR="$HOME/.claude/projects/-$(echo "$PWD" | sed 's|/|-|g' | sed 's/^-//')"

if [ ! -d "$PROJECT_DIR" ]; then
  echo "No session directory found at: $PROJECT_DIR"
  exit 1
fi

# Find the most recently modified .jsonl file (the active conversation)
LOGFILE=$(ls -t "$PROJECT_DIR"/*.jsonl 2>/dev/null | head -1)

if [ -z "$LOGFILE" ]; then
  echo "No conversation logs found in: $PROJECT_DIR"
  exit 1
fi

# Extract session ID from filename
SESSION_ID=$(basename "$LOGFILE" .jsonl)

echo "$LOGFILE"
```

## Output Format

Display the results clearly:

```
## Current Conversation Log

**Session ID:** <session-id>
**Log file:** <full-path-to-jsonl>

Copy this path to reference this conversation from another Claude Code session.
```

## Notes

- The log file is a JSONL (JSON Lines) format — each line is a JSON object representing a message or event
- This is a local file only; there is no web URL for conversation logs
- The session directory path is derived from the project working directory
