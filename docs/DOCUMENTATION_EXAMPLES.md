# Documentation Examples

This document provides examples of properly documented code according to VS Code's documentation standards.

## Class Documentation

```typescript
/**
 * Represents a text document manager that handles opening, editing, and closing documents.
 * 
 * The DocumentManager is responsible for managing the lifecycle of text documents
 * within the editor. It provides methods for opening documents from various sources,
 * tracking document state changes, and handling document disposal.
 * 
 * @example
 * ```typescript
 * const manager = new DocumentManager(fileSystem, configuration);
 * const document = await manager.openDocument(uri);
 * const content = document.getText();
 * ```
 */
export class DocumentManager {
    /**
     * The collection of currently open documents, indexed by URI string.
     */
    private _documents: Map<string, TextDocument> = new Map();
    
    /**
     * Event that fires when a document is opened.
     */
    private readonly _onDidOpenDocument = new Emitter<TextDocument>();
    
    /**
     * Event that fires when a document is closed.
     */
    private readonly _onDidCloseDocument = new Emitter<TextDocument>();
    
    /**
     * Creates a new instance of the DocumentManager.
     * 
     * @param fileSystem The file system service used to read and write documents
     * @param configuration The configuration service for document settings
     */
    constructor(
        private readonly fileSystem: IFileSystemService,
        private readonly configuration: IConfigurationService
    ) {}
    
    /**
     * Opens a document from the given URI.
     * If the document is already open, returns the existing instance.
     * 
     * @param uri The URI of the document to open
     * @param options Options for opening the document
     * @returns A promise that resolves to the opened document
     * @throws {FileNotFoundError} If the file doesn't exist and options.create is false
     */
    async openDocument(uri: URI, options?: OpenDocumentOptions): Promise<TextDocument> {
        const uriString = uri.toString();
        
        // Check if the document is already open
        const existing = this._documents.get(uriString);
        if (existing) {
            return existing;
        }
        
        // Create a new document
        const content = await this.fileSystem.readFile(uri);
        const document = new TextDocument(uri, content, options?.languageId);
        
        // Store and track the document
        this._documents.set(uriString, document);
        this._onDidOpenDocument.fire(document);
        
        return document;
    }
    
    /**
     * Closes a document, optionally saving its content.
     * 
     * @param document The document to close
     * @param save Whether to save the document before closing
     * @returns A promise that resolves when the document is closed
     */
    async closeDocument(document: TextDocument, save: boolean = false): Promise<void> {
        const uri = document.uri;
        const uriString = uri.toString();
        
        if (save && document.isDirty) {
            await this.fileSystem.writeFile(uri, document.getText());
        }
        
        this._documents.delete(uriString);
        this._onDidCloseDocument.fire(document);
        document.dispose();
    }
    
    /**
     * Gets all currently open documents.
     * 
     * @returns An array of all open documents
     */
    getAllDocuments(): TextDocument[] {
        return Array.from(this._documents.values());
    }
}
```

## Interface Documentation

```typescript
/**
 * Represents a service that provides workspace folder information and operations.
 * 
 * This service allows access to workspace folders, their contents, and provides
 * operations to manipulate the workspace structure.
 */
export interface IWorkspaceService {
    /**
     * Event that fires when workspace folders change.
     */
    readonly onDidChangeWorkspaceFolders: Event<IWorkspaceFoldersChangeEvent>;
    
    /**
     * Gets all workspace folders.
     * 
     * @returns An array of workspace folders, or empty array if no folders are open
     */
    getWorkspaceFolders(): IWorkspaceFolder[];
    
    /**
     * Gets the workspace folder that contains the given URI.
     * 
     * @param uri The URI to find a workspace folder for
     * @returns The workspace folder that contains the URI, or undefined if none
     */
    getWorkspaceFolder(uri: URI): IWorkspaceFolder | undefined;
    
    /**
     * Updates the workspace folders by adding and/or removing folders.
     * 
     * @param foldersToAdd Array of folders to add
     * @param foldersToRemove Array of folders to remove
     * @returns True if the operation was successful, false otherwise
     */
    updateWorkspaceFolders(
        foldersToAdd: { uri: URI; name?: string }[],
        foldersToRemove: URI[]
    ): Promise<boolean>;
}
```

## Function Documentation

```typescript
/**
 * Formats a file path according to platform conventions.
 * 
 * This function normalizes file paths for the current platform:
 * - On Windows: Uses backslashes and ensures volume letter is capitalized
 * - On macOS/Linux: Uses forward slashes
 * 
 * @param path The file path to format
 * @param options Additional formatting options
 * @returns The formatted path string
 * 
 * @example
 * ```typescript
 * // On Windows: "C:\\Users\\Example\\File.txt"
 * // On macOS: "/Users/example/File.txt"
 * const formattedPath = formatPath("c:/users/example/file.txt");
 * ```
 */
export function formatPath(path: string, options?: PathFormatOptions): string {
    if (!path) {
        return '';
    }
    
    const isWindows = process.platform === 'win32';
    let result = path;
    
    // Normalize separators
    if (isWindows) {
        // Replace forward slashes with backslashes for Windows
        result = result.replace(/\//g, '\\');
        
        // Capitalize drive letter if present
        if (/^[a-z]:/.test(result)) {
            result = result[0].toUpperCase() + result.substring(1);
        }
    } else {
        // Replace backslashes with forward slashes for Unix-like systems
        result = result.replace(/\\/g, '/');
    }
    
    // Apply additional formatting based on options
    if (options?.trimTrailingSeparator) {
        const sep = isWindows ? '\\' : '/';
        if (result.endsWith(sep)) {
            result = result.slice(0, -1);
        }
    }
    
    return result;
}
```

## Constant and Enum Documentation

```typescript
/**
 * The standard timeout duration (in milliseconds) for operations like connecting to a server.
 * This value is based on typical network latency and server response times.
 */
export const STANDARD_TIMEOUT_MS = 30000;

/**
 * Maximum file size (in bytes) for text files that can be opened in the editor.
 * Files larger than this will trigger a warning and might experience performance issues.
 */
export const MAX_SAFE_TEXT_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

/**
 * Represents the state of an asynchronous operation.
 */
export enum AsyncOperationState {
    /**
     * The operation has not started yet.
     */
    NotStarted = 0,
    
    /**
     * The operation is currently in progress.
     */
    InProgress = 1,
    
    /**
     * The operation completed successfully.
     */
    Completed = 2,
    
    /**
     * The operation failed with an error.
     */
    Failed = 3,
    
    /**
     * The operation was cancelled before completion.
     */
    Cancelled = 4
}
```

These examples demonstrate the comprehensive documentation style that should be applied throughout the VS Code codebase. All public APIs, complex functions, classes, interfaces, and other significant code elements should be documented according to these patterns.