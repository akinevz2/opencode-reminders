# opencode-reminders

An OpenCode plugin for managing reminders across sessions using file-based storage.

## Features

- Add reminders that persist across OpenCode restarts
- File-specific reminders: tag reminders with affected files for context-aware reminders
- Reminders are stored as JSONL in the project root as `memos.jsonl`
- The `add-reminder` tool returns the full list of all reminders or filtered by files
- A hook automatically includes reminders in the agent's context before completing tasks
- No separate "get-reminders" tool needed—adding is reading

## Installation

Place this plugin in your OpenCode installation:

```bash
# Option 1: Local plugin
cp -r .opencode/plugins/opencode-reminders ~/.config/opencode/plugins/

# Option 2: Or link it
cd ~/.config/opencode/plugins
ln -s /path/to/opencode-reminders
```

Then add it to your `opencode.json`:

```jsonc
{
  "plugins": ["opencode-reminders"]
}
```

## Usage

### Add a reminder

Simply call `add-reminder` with your message:

```
add-reminder "Remember to review the PR"
add-reminder "Don't forget to update documentation"
```

### View all reminders

When you call `add-reminder`, you'll receive the full list of all reminders:

```
📋 **Reminders:**

- Remember to review the PR (added: Mon Nov 2, 2026 02:36:00 PM)
- Don't forget to update documentation (added: Mon Nov 2, 2026 02:37:00 PM)

Reminder added: "Remember to review the PR"
```

### File-specific reminders

Add reminders scoped to specific files for context-aware reminders:

```
# Add reminder for a specific file
add-reminder "Check for security vulnerabilities" --files "src/auth.ts"

# Add reminder for multiple files
add-reminder "Update dependencies" --files "package.json" "tsconfig.json"

# Add reminder without file scope (global reminder)
add-reminder "Code review needed for PR"
```

The `files` parameter accepts an array of file paths relative to the project root. When requesting reminders, the tool will return reminders that match any of the specified files.

**Storage format with file metadata:**

```jsonl
{"id":"reminder-1698768716123-abc","message":"Check for security","files":["src/auth.ts"],"createdAt":1698768716123}
{"id":"reminder-1698768770456-def","message":"Update dependencies","files":["package.json","tsconfig.json"],"createdAt":1698768770456}
```

### Automatic context

The plugin automatically includes all reminders in the agent's context before completing tasks, so you don't need to manually reference them each time.

## Storage Format

Reminders are stored in `memos.jsonl` in the following format:

```jsonl
{"id":"reminder-1698768716123-abc123","message":"Remember to review the PR","createdAt":1698768716123}
{"id":"reminder-1698768770456-def456","message":"Don't forget to update documentation","createdAt":1698768770456}
```

Each line is a complete JSON object representing a reminder.

## How It Works

1. **Plugin Setup**: Registers the `add-reminder` tool and sets up a context hook
2. **add-reminder Tool**:
   - Appends a new reminder to `memos.jsonl`
   - Reads the entire file and returns all reminders with timestamps
   - This makes adding also reading, giving the agent cumulative context
3. **Context Hook**: Automatically includes reminder messages in system instructions before model calls

## Benefits

- ✅ Persistent storage across restarts
- ✅ Simple file-based JSONL format (easy to edit or backup)
- ✅ Cumulative context without manual references
- ✅ No separate retrieval tool needed
- ✅ Works with any OpenCode session