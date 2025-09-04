const fs = require('fs');

// Read the Arabic translation file
const content = fs.readFileSync('src/lib/translations/ar.ts', 'utf8');

// Split into lines
let lines = content.split('\n');

// Track seen top-level keys
const seenKeys = new Set();
const filteredLines = [];
let currentKey = null;
let skipUntilBrace = false;
let braceDepth = 0;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is a top-level key definition (starts with '  ' and ends with ': {')
    const topLevelKeyMatch = line.match(/^  ([a-zA-Z_][a-zA-Z0-9_]*): \{$/);
    
    if (topLevelKeyMatch) {
        const key = topLevelKeyMatch[1];
        
        if (seenKeys.has(key)) {
            console.log(`Found duplicate key: ${key} at line ${i + 1}`);
            skipUntilBrace = true;
            braceDepth = 0;
            continue;
        } else {
            seenKeys.add(key);
            currentKey = key;
            skipUntilBrace = false;
        }
    }
    
    if (skipUntilBrace) {
        // Count braces to know when the duplicate section ends
        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;
        braceDepth += openBraces - closeBraces;
        
        // If we've closed all braces for this duplicate section, stop skipping
        if (braceDepth <= 0) {
            skipUntilBrace = false;
        }
        continue;
    }
    
    filteredLines.push(line);
}

// Write the filtered content back
const filteredContent = filteredLines.join('\n');
fs.writeFileSync('src/lib/translations/ar.ts', filteredContent);

console.log('Duplicate keys removed successfully!');



