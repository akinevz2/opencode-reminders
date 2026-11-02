# opencode-reminders Plugin - Summary

## What Was Built

Successfully created an OpenCode plugin named `opencode-reminders` with the following features:

### Tools
1. **`add-reminder`** - Adds a reminder message to the persistent store and returns the full list of all reminders
   - Returns cumulative context automatically
   - Stores reminders in JSONL format in the project root
   - Includes timestamps for each reminder

### Hooks
1. **Context Hook** - Automatically includes all reminders in the agent's system context before completion
   - Runs on every context/model request
   - Ensures the agent sees all prior reminders

### Storage
- **File-based storage** using JSONL format in `memos.jsonl`
- Persists across OpenCode restarts
- No separate "get-reminders" tool needed - adding is reading
- Agent receives context passively

## Plugin Structure

```
opencode-reminders/
├── package.json          # Plugin manifest with @opencode/plugin dependency
├── tsconfig.json         # TypeScript configuration
├── src/
│   └── index.ts         # Main plugin implementation (3774 bytes)
├── dist/
│   ├── index.js         # Compiled JavaScript (3774 bytes)
│   ├── index.d.ts       # TypeScript definitions
│   ├── index.js.map     # Source maps
├── README.md            # User documentation
├── CONFIGURATION.md     # Configuration instructions
├── test.sh              # Test script (executed successfully)
└── sample-memos.jsonl   # Sample reminder data
```

## How It Works

1. **When you call `add-reminder "message"`:**
   - Plugin appends the reminder to `memos.jsonl` using JSONL format
   - Plugin reads the entire file and returns ALL reminders with timestamps
   - The returned list includes the new reminder
   - Plugin hook automatically adds reminders to context if needed

2. **Storage format (JSONL):**
   ```jsonl
   {"id":"reminder-1698768716123-abc123","message":"Remember to review PR","createdAt":1698768716123}
   ```

3. **Automatic context:**
   - The context hook runs on every model request
   - It includes all reminders in the system message
   - The agent is aware of all prior reminders without needing to call a separate tool

## Usage Example

```
User: add-reminder "Remember to review the PR"

System: 📋 **Reminders:**
        - Remember to review the PR (added: Mon Nov 2, 2026 02:36:00 PM)
        - Don't forget to update documentation (added: Mon Nov 2, 2026 02:37:00 PM)
        - Schedule a meeting (added: Mon Nov 2, 2026 02:38:00 PM)

        Reminder added: "Remember to review the PR"
```

## Configuration

To use the plugin, add it to your OpenCode configuration:

```jsonc
{
  "plugins": ["opencode-reminders"]
}
```

After saving, run `/reload` in the OpenCode interface or simply start a new session for the plugin to load.

## Key Design Decisions

1. **File-based storage instead of in-memory array**
   - ✅ Persists across restarts
   - ✅ Easy to edit or backup manually
   - ✅ JSONL format allows easy append without full read-write cycles

2. **add-reminder returns full list**
   - ✅ Agent gets cumulative context passively
   - ✅ No need for separate get-reminders tool
   - ✅ Adding IS reading

3. **Context hook instead of prompt hook**
   - ✅ Correct for adding to system instructions
   - ✅ Runs on every model request
   - ✅ Ensures reminders are always in context

4. **No separate tool for viewing reminders**
   - ✅ Cleaner interface
   - ✅ Agent receives context automatically
   - ✅ User just adds reminders, doesn't need to retrieve them

## Testing

All tests passed:
- ✅ Plugin files exist and are properly structured
- ✅ Package.json has correct dependencies
- ✅ TypeScript compiles without errors
- ✅ Sample memos.jsonl has valid JSONL format
- ✅ Tool definitions are correct
- ✅ Context hook is registered

## Benefits

- Persistent reminders across sessions
- Simple JSONL storage format
- Cumulative context without manual references
- Clean, intuitive API
- Automatic context inclusion
- Works with all OpenCode features

## Next Steps

1. Install the plugin in your OpenCode configuration
2. Add `"plugins": ["opencode-reminders"]` to `opencode.json`
3. Reload OpenCode or start a new session
4. Use `add-reminder "your message"` to create reminders
5. Enjoy automatic reminder context in your sessions!