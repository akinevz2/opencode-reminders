# How to Configure opencode-reminders

## Method 1: Global Configuration

Add the plugin to your global OpenCode configuration:

```jsonc
# ~/.config/opencode/opencode.jsonc

{
  "plugins": ["opencode-reminders"]
}
```

## Method 2: Project Configuration

Add the plugin to your project's OpenCode configuration:

```jsonc
# ./opencode.jsonc (in your project directory)

{
  "plugins": ["opencode-reminders"]
}
```

## Method 3: Local Plugin Directory

If you've installed the plugin in a local directory:

```jsonc
{
  "plugins": ["./.opencode/plugins/opencode-reminders"]
}
```

## How to Load

After adding the plugin to `opencode.json`, the plugin will automatically load when you start OpenCode. You don't need to restart OpenCode explicitly—the configuration is watched and reloaded automatically.

## Troubleshooting

If the plugin doesn't load:

1. Check that you've correctly installed the plugin in the plugins directory
2. Verify the package.json exists and has the correct exports
3. Run `/reload` in the OpenCode interface to force a configuration reload
4. Check the logs for any error messages:

```bash
tail -f ~/.local/share/opencode/log/opencode.log | grep reminders
```

## Plugin Structure

```
opencode-reminders/
├── package.json      # Plugin manifest and dependencies
├── tsconfig.json     # TypeScript configuration
├── src/
│   └── index.ts      # Main plugin implementation
├── dist/             # Compiled JavaScript (generated)
├── README.md         # User documentation
└── CONFIGURATION.md  # Configuration instructions
```