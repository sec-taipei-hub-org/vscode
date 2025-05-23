# How to Document Code in VS Code

This guide explains how to add documentation to the VS Code codebase. It complements the [Documentation Style Guide](/docs/DOCUMENTATION_STYLE_GUIDE.md), focusing on practical steps and workflows.

## Getting Started

Before adding documentation, familiarize yourself with existing code and its documentation style. The VS Code codebase primarily uses JSDoc-style comments for TypeScript and JavaScript code.

## Understanding What Needs Documentation

1. **Public APIs**: Any function, class, or interface that is exported and might be used by other components.

2. **Complex Logic**: Code containing non-obvious logic or algorithms.

3. **Interface Definitions**: Interfaces that define structures or contracts between components.

4. **Configuration Options**: Constants or enumerations that define settings or options.

## Documentation Workflow

### 1. Identify Undocumented Code

Use the provided script to identify undocumented code:

```bash
node scripts/find-undocumented-code.js [directory]
```

This script will scan the specified directory (or `src` by default) for code elements that lack proper documentation.

### 2. Add Documentation

Add JSDoc-style comments to the identified code elements. Follow these guidelines:

- Start with a brief description of what the code element does
- Add more detailed explanation if necessary
- Document parameters, return values, and exceptions where applicable
- Include examples for complex APIs

### 3. Validate Documentation

After adding documentation, check that it follows the style guide and provides all necessary information. Ask yourself:

- Does the documentation explain what the code does and why?
- Are all parameters, return values, and exceptions documented?
- Would a newcomer understand how to use this code from the documentation?

## Examples

### Documenting a Function

```typescript
/**
 * Creates a range of text in the editor from line and column information.
 * 
 * @param startLineNumber The 1-based line number where the range starts
 * @param startColumn The 1-based column number where the range starts
 * @param endLineNumber The 1-based line number where the range ends
 * @param endColumn The 1-based column number where the range ends
 * @returns A new Range object representing the specified text range
 * @throws If the range is invalid (e.g., negative line numbers)
 */
export function createRange(
  startLineNumber: number, 
  startColumn: number, 
  endLineNumber: number, 
  endColumn: number
): Range {
  if (startLineNumber < 1 || startColumn < 1 || endLineNumber < 1 || endColumn < 1) {
    throw new Error('Range is invalid');
  }
  return new Range(startLineNumber, startColumn, endLineNumber, endColumn);
}
```

### Documenting a Class

```typescript
/**
 * Represents a position in the editor.
 * 
 * Positions are line/column pairs, with line numbers starting from 1
 * and column numbers starting from 1. This is different from some
 * editor representations that use 0-based positions.
 */
export class Position {
  /**
   * Creates a new Position.
   * 
   * @param lineNumber The 1-based line number
   * @param column The 1-based column number
   */
  constructor(
    public readonly lineNumber: number,
    public readonly column: number
  ) {}
  
  /**
   * Checks if this position is before another position.
   * 
   * @param other The position to compare with
   * @returns True if this position is before the other position
   */
  isBefore(other: Position): boolean {
    if (this.lineNumber < other.lineNumber) {
      return true;
    }
    if (this.lineNumber === other.lineNumber) {
      return this.column < other.column;
    }
    return false;
  }
}
```

### Documenting an Interface

```typescript
/**
 * Represents a text editing service that can modify document content.
 * 
 * This interface provides methods to apply edits to a document while
 * managing the undo history and notifying listeners of changes.
 */
export interface ITextEditingService {
  /**
   * Applies a series of edits to the document.
   * 
   * @param source The source initiating the edit (e.g., "user" or "format")
   * @param edits An array of edits to apply
   * @param options Additional options for the editing operation
   * @returns A promise that resolves when all edits are applied
   */
  applyEdits(source: string, edits: TextEdit[], options?: IEditOptions): Promise<void>;
  
  /**
   * Checks if the service can perform edits on the document.
   * 
   * @returns True if the document is editable
   */
  canEditDocument(): boolean;
}
```

## Best Practices

1. **Document as You Code**: Add documentation while writing new code rather than after the fact.

2. **Update Documentation When Code Changes**: When modifying code, ensure the documentation stays consistent.

3. **Focus on Intent**: Explain why the code exists and what problem it solves, not just what it does.

4. **Avoid Duplication**: Don't repeat what's obvious from the code itself.

5. **Consider the Reader**: Write documentation assuming the reader is a developer new to the codebase.

## Tools

- **find-undocumented-code.js**: Identifies code that needs documentation
- **VS Code IntelliSense**: Provides JSDoc templates (type `/**` above a function)
- **ESLint**: Can be configured to enforce documentation standards

## Documentation Review

When reviewing code changes, check that:

1. New code is properly documented
2. Documentation is updated when code changes
3. Documentation follows the style guide
4. Documentation is clear and accurate

By following these guidelines and workflows, we can maintain high-quality documentation throughout the VS Code codebase.