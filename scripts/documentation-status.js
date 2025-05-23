#!/usr/bin/env node
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * This script analyzes the codebase and provides a summary of documentation coverage.
 * It's useful for tracking progress in the documentation effort.
 * 
 * Usage: node documentation-status.js [directory]
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

// Define patterns to recognize documented elements
const PATTERNS = {
    // Documented elements have JSDoc comments /** ... */
    documented: {
        class: /\/\*\*[\s\S]*?\*\/\s*(export\s+)?(abstract\s+)?(class)\s+([A-Za-z0-9_]+)/g,
        interface: /\/\*\*[\s\S]*?\*\/\s*(export\s+)?(interface)\s+([A-Za-z0-9_]+)/g,
        function: /\/\*\*[\s\S]*?\*\/\s*(export\s+)?(function)\s+([A-Za-z0-9_]+)/g,
        method: /\/\*\*[\s\S]*?\*\/\s*(private|public|protected|static)?\s*([A-Za-z0-9_]+)\s*\([^)]*\)/g,
        property: /\/\*\*[\s\S]*?\*\/\s*(private|public|protected|static)?\s*([A-Za-z0-9_]+)\s*:/g,
        constant: /\/\*\*[\s\S]*?\*\/\s*(export\s+)?(const|let|var)\s+([A-Za-z0-9_]+)/g,
        enum: /\/\*\*[\s\S]*?\*\/\s*(export\s+)?(enum)\s+([A-Za-z0-9_]+)/g
    },
    
    // All elements (documented or not)
    all: {
        class: /(export\s+)?(abstract\s+)?(class)\s+([A-Za-z0-9_]+)/g,
        interface: /(export\s+)?(interface)\s+([A-Za-z0-9_]+)/g,
        function: /(export\s+)?(function)\s+([A-Za-z0-9_]+)/g,
        method: /(private|public|protected|static)?\s*([A-Za-z0-9_]+)\s*\([^)]*\)\s*(\{|:|=>)/g,
        property: /(private|public|protected|static)?\s*([A-Za-z0-9_]+)\s*:/g,
        constant: /(export\s+)?(const|let|var)\s+([A-Za-z0-9_]+)/g,
        enum: /(export\s+)?(enum)\s+([A-Za-z0-9_]+)/g
    }
};

// Counters
const stats = {
    files: {
        total: 0,
        withDocs: 0
    },
    elements: {
        total: {
            class: 0,
            interface: 0,
            function: 0,
            method: 0,
            property: 0,
            constant: 0,
            enum: 0
        },
        documented: {
            class: 0,
            interface: 0,
            function: 0,
            method: 0,
            property: 0,
            constant: 0,
            enum: 0
        }
    }
};

// Files to analyze
const sourceDirectory = process.argv[2] || path.join(process.cwd(), 'src');

/**
 * Counts documented and total elements in a file
 * 
 * @param {string} filePath Path to the file to analyze
 */
function analyzeFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        stats.files.total++;
        
        let hasDocumentation = false;
        
        for (const type in PATTERNS.all) {
            // Reset each regex before using
            PATTERNS.all[type].lastIndex = 0;
            PATTERNS.documented[type].lastIndex = 0;
            
            // Count all elements of this type
            const allMatches = content.match(PATTERNS.all[type]) || [];
            stats.elements.total[type] += allMatches.length;
            
            // Count documented elements of this type
            const documentedMatches = content.match(PATTERNS.documented[type]) || [];
            stats.elements.documented[type] += documentedMatches.length;
            
            if (documentedMatches.length > 0) {
                hasDocumentation = true;
            }
        }
        
        if (hasDocumentation) {
            stats.files.withDocs++;
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
 * Print the documentation status report
 */
function printResults() {
    console.log('\nDocumentation Status Report');
    console.log('==========================\n');
    
    // File statistics
    console.log(`Files with documentation: ${stats.files.withDocs} / ${stats.files.total} (${((stats.files.withDocs / stats.files.total) * 100).toFixed(2)}%)`);
    
    // Element statistics
    console.log('\nElement Documentation:');
    
    for (const type in stats.elements.total) {
        const total = stats.elements.total[type];
        const documented = stats.elements.documented[type];
        const percentage = total > 0 ? ((documented / total) * 100).toFixed(2) : '0.00';
        
        console.log(`  ${type.padEnd(10)}: ${documented} / ${total} (${percentage}%)`);
    }
    
    // Overall statistics
    const totalElements = Object.values(stats.elements.total).reduce((a, b) => a + b, 0);
    const totalDocumented = Object.values(stats.elements.documented).reduce((a, b) => a + b, 0);
    const overallPercentage = totalElements > 0 ? ((totalDocumented / totalElements) * 100).toFixed(2) : '0.00';
    
    console.log('\nOverall Documentation Coverage:');
    console.log(`  ${totalDocumented} / ${totalElements} elements documented (${overallPercentage}%)`);
    
    console.log('\nRecommendations:');
    if (overallPercentage < 50) {
        console.log('  - Focus on documenting key classes and interfaces');
        console.log('  - Prioritize exported functions and public APIs');
    } else if (overallPercentage < 80) {
        console.log('  - Continue documenting remaining public APIs');
        console.log('  - Add documentation to complex methods and utility functions');
    } else {
        console.log('  - Maintain documentation as code changes');
        console.log('  - Review existing documentation for accuracy and clarity');
    }
}

// Execute the script
console.log(`Analyzing documentation in: ${sourceDirectory}`);
scanDirectory(sourceDirectory);
printResults();