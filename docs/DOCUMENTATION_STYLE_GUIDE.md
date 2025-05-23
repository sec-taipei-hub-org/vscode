# VS Code Documentation Style Guide

This guide outlines the standards for documenting code in the VS Code repository. Following these guidelines ensures consistency and helps maintain high-quality documentation throughout the codebase.

## General Principles

- Write clear, concise documentation that explains the purpose and behavior of the code
- Use complete sentences with proper punctuation
- Keep documentation up-to-date when code changes
- Avoid redundant information that's obvious from the code itself
- Focus on *why* over *what* when appropriate

## JSDoc Format

Use JSDoc-style comments for documenting TypeScript and JavaScript code. 

### Classes

```typescript
/**
 * A brief description of the class.
 * 
 * A more detailed description if needed, explaining the purpose and usage.
 * Include any important considerations or constraints.
 */
export class MyClass {
    // Properties and methods
}
```

### Interfaces

```typescript
/**
 * A brief description of the interface.
 *
 * Add more details about the purpose of the interface and when to use it.
 */
interface IMyInterface {
    // Properties and methods
}
```

### Functions/Methods

```typescript
/**
 * A brief description of what the function/method does.
 *
 * @param paramName Description of the parameter
 * @param paramName2 Description of the second parameter
 * @returns Description of the return value
 * @throws Conditions under which the function might throw an exception
 */
function myFunction(paramName: Type, paramName2: Type2): ReturnType {
    // Implementation
}
```

### Properties

```typescript
/**
 * Description of the property
 */
public myProperty: string;
```

### Constants

```typescript
/**
 * Description of what the constant represents and how it's used
 */
const MY_CONSTANT = 'value';
```

### Enums

```typescript
/**
 * Description of the enum and its purpose
 */
enum MyEnum {
    /**
     * Description of this enum value
     */
    FirstValue = 1,

    /**
     * Description of this enum value
     */
    SecondValue = 2
}
```

## Inline Comments

Use inline comments to clarify complex logic or explain non-obvious behavior:

```typescript
// This complex algorithm works by...
const result = complexOperation();

// Workaround for a browser-specific issue
if (isBrowser) {
    // ...
}
```

## Examples

Including examples can be extremely helpful:

```typescript
/**
 * Formats a date string according to the given format.
 *
 * @param date The date to format
 * @param format The format string to use
 * @returns The formatted date string
 *
 * @example
 * // Returns "2023-01-15"
 * formatDate(new Date(2023, 0, 15), "yyyy-MM-dd");
 */
function formatDate(date: Date, format: string): string {
    // Implementation
}
```

## Documentation Maintenance

- Keep documentation up to date with code changes
- Delete documentation for removed code
- Update documentation when functionality changes
- Review documentation during code reviews

## Common Pitfalls to Avoid

1. **Stating the obvious**: Avoid comments that simply restate what the code clearly shows
2. **Outdated documentation**: Documentation that doesn't match the current implementation is worse than no documentation
3. **Incomplete documentation**: Missing parameters or return value descriptions
4. **Being too verbose**: Unnecessarily lengthy documentation can make it harder to find important information

## Special Documentation Types

### Public APIs

Public APIs should have comprehensive documentation, including:

- Detailed description of functionality
- All parameters and return values
- Examples of usage
- Exceptions that might be thrown
- Version information (since which version the API exists, if deprecated, etc.)

### Complex Algorithms

For complex algorithms, include:

- High-level explanation of the algorithm
- References to papers or external resources if applicable
- Time and space complexity information
- Constraints and limitations

By following these guidelines, we can maintain high-quality, consistent documentation throughout the VS Code codebase.