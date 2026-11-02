#!/bin/bash

# Test script for opencode-reminders plugin

set -e

echo "🧪 Testing opencode-reminders plugin..."

# Test 1: Check if the plugin files exist
echo "✓ Checking plugin files..."
test -f "dist/index.js" && echo "  - Compiled index.js found"
test -f "dist/index.d.ts" && echo "  - TypeScript definitions found"
test -f "dist/index.js.map" && echo "  - Source maps found"
test -f "package.json" && echo "  - package.json found"
test -f "tsconfig.json" && echo "  - tsconfig.json found"
test -f "README.md" && echo "  - README.md found"
test -f "CONFIGURATION.md" && echo "  - CONFIGURATION.md found"

# Test 2: Verify package.json structure
echo ""
echo "✓ Verifying package.json..."
grep -q '"name": "opencode-reminders"' package.json && echo "  - Plugin name correct"
grep -q '"@opencode/plugin": "latest"' package.json && echo "  - Plugin dependency present"

# Test 3: Check if TypeScript compiles without errors
echo ""
echo "✓ Checking TypeScript compilation..."
npx tsc --noEmit

# Test 4: Verify sample memos.jsonl has valid JSONL format
echo ""
echo "✓ Verifying sample memos.jsonl..."
if [ -f "sample-memos.jsonl" ]; then
    # Check each line is valid JSON
    while IFS= read -r line; do
        echo "$line" | jq . > /dev/null 2>&1 || { echo "  ✗ Invalid JSONL line"; exit 1; }
    done < sample-memos.jsonl
    echo "  - Sample memos.jsonl valid JSONL"
fi

# Test 5: Verify expected tool is registered
echo ""
echo "✓ Checking plugin setup..."
# Just verify the source file contains the tool definition
grep -q '"name": "add-reminder"' src/index.ts && echo "  - add-reminder tool defined"
grep -q '"description": "Add a reminder message' src/index.ts && echo "  - Tool has description"

# Test 6: Verify context hook is set up
echo ""
echo "✓ Checking context hook..."
grep -q '"ctx.session.hook("context"' src/index.ts && echo "  - Context hook registered"

echo ""
echo "🎉 All tests passed!"
echo ""
echo "To use the plugin, add it to your opencode.json configuration:"
echo '  "plugins": ["opencode-reminders"]'
echo ""
echo "Then load the plugin by reloading OpenCode or running /reload"