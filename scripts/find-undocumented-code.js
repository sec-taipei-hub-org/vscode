#!/usr/bin/env node
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * This script analyzes TypeScript/JavaScript files to identify code elements that lack proper documentation.
 * It looks for classes, interfaces, functions, and other elements that should have JSDoc comments.
 * 
 * Usage: node find-undocumented-code.js [directory]
 * 
 * If no directory is provided, it will scan the src directory.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const EXCLUDED_DIRS = [
    'node_modules',
    '.git',
    'out',
    'dist',
    'test'
];

// Define patterns to look for elements that should be documented
const PATTERNS = [
    {
        type: 'class',
        regex: /\bclass\s+([A-Za-z0-9_]+)/g,
        needsDocs: true
    },
    {
        type: 'interface',
        regex: /\binterface\s+([A-Za-z0-9_]+)/g,
        needsDocs: true
    },
    {
        type: 'function',
        regex: /\bfunction\s+([A-Za-z0-9_]+)/g,
        needsDocs: true
    },
    {
        type: 'exported function',
        regex: /\bexport\s+function\s+([A-Za-z0-9_]+)/g,
        needsDocs: true
    },
    {
        type: 'method',
        regex: /(?:public|private|protected|static)?\s*([A-Za-z0-9_]+)\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*{/g,
        needsDocs: false // Only flag public methods
    },
    {
        type: 'exported constant',
        regex: /\bexport\s+const\s+([A-Za-z0-9_]+)/g,
        needsDocs: true
    },
    {
        type: 'exported variable',
        regex: /\bexport\s+(?:let|var)\s+([A-Za-z0-9_]+)/g,
        needsDocs: true
    },
    {
        type: 'enum',
        regex: /\benum\s+([A-Za-z0-9_]+)/g,
        needsDocs: true
    }
];

// Files to analyze
const sourceDirectory = process.argv[2] || path.join(process.cwd(), 'src');

// Results storage
const undocumentedElements = [];

/**
 * Checks if the given line index has JSDoc comments above it
 * 
 * @param {string[]} lines The file content split into lines
 * @param {number} lineIndex The line index to check
 * @returns {boolean} True if JSDoc comments exist, false otherwise
 */
function hasJSDocAbove(lines, lineIndex) {
    let i = lineIndex - 1;
    
    // Skip empty lines and decorator lines
    while (i >= 0 && (lines[i].trim() === '' || lines[i].trim().startsWith('@'))) {
        i--;
    }
    
    // Check if there's a JSDoc comment
    if (i >= 0 && lines[i].trim().endsWith('*/')) {
        let j = i;
        while (j >= 0 && !lines[j].trim().startsWith('/**')) {
            j--;
        }
        return j >= 0;
    }
    
    return false;
}

/**
 * Analyze a file for undocumented code elements
 * 
 * @param {string} filePath Path to the file to analyze
 */
function analyzeFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        for (const pattern of PATTERNS) {
            const regex = new RegExp(pattern.regex);
            let match;
            
            // Use the file content to find line numbers
            let lineNumber = 0;
            for (const line of lines) {
                lineNumber++;
                
                // Reset the regex before using it
                regex.lastIndex = 0;
                
                // Find all matches in this line
                while ((match = regex.exec(line)) !== null) {
                    const elementName = match[1];
                    
                    // Skip certain patterns
                    if (elementName === 'constructor' || elementName === 'toString' || elementName.startsWith('_')) {
                        continue;
                    }
                    
                    // Check if it has JSDoc
                    if (pattern.needsDocs && !hasJSDocAbove(lines, lineNumber - 1)) {
                        undocumentedElements.push({
                            file: filePath.replace(process.cwd(), ''),
                            line: lineNumber,
                            type: pattern.type,
                            name: elementName
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error(`Error analyzing file ${filePath}: ${error.message}`);
    }
}

/**
 * Recursively scan a directory for TypeScript/JavaScript files
 * 
 * @param {string} directory Directory to scan
 */
function scanDirectory(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const entry of entries) {
        const entryPath = path.join(directory, entry.name);
        
        if (entry.isDirectory() && !EXCLUDED_DIRS.includes(entry.name)) {
            scanDirectory(entryPath);
        } else if ((entry.name.endsWith('.ts') || entry.name.endsWith('.js')) && 
                    !entry.name.endsWith('.d.ts') && 
                    !entry.name.endsWith('.test.ts') && 
                    !entry.name.endsWith('.spec.ts')) {
            analyzeFile(entryPath);
        }
    }
}

/**
 * Print results in a readable format
 */
function printResults() {
    console.log('\nUndocumented Code Elements:');
    console.log('=========================');
    
    const groupedByFile = {};
    
    for (const element of undocumentedElements) {
        if (!groupedByFile[element.file]) {
            groupedByFile[element.file] = [];
        }
        groupedByFile[element.file].push(element);
    }
    
    for (const file in groupedByFile) {
        console.log(`\nFile: ${file}`);
        console.log('-'.repeat(file.length + 6));
        
        const elements = groupedByFile[file];
        elements.sort((a, b) => a.line - b.line);
        
        for (const element of elements) {
            console.log(`Line ${element.line}: ${element.type} "${element.name}" lacks JSDoc documentation`);
        }
    }
    
    console.log('\nSummary:');
    console.log('========');
    console.log(`Total undocumented elements: ${undocumentedElements.length}`);
}

// Execute the script
console.log(`Scanning directory: ${sourceDirectory}`);
scanDirectory(sourceDirectory);
printResults();