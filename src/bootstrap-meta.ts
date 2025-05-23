/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { createRequire } from 'node:module';
import type { IProductConfiguration } from './vs/base/common/product.js';

/**
 * Creates a require function that works with ES modules.
 * This allows importing CommonJS modules from an ES module context.
 */
const require = createRequire(import.meta.url);

/**
 * Loads the product configuration.
 * 
 * This object contains build-time configuration settings for VS Code.
 * During the build process, 'BUILD_INSERT_PRODUCT_CONFIGURATION' is replaced
 * with the actual product configuration.
 */
let productObj: Partial<IProductConfiguration> & { BUILD_INSERT_PRODUCT_CONFIGURATION?: string } = { BUILD_INSERT_PRODUCT_CONFIGURATION: 'BUILD_INSERT_PRODUCT_CONFIGURATION' }; // DO NOT MODIFY, PATCHED DURING BUILD
if (productObj['BUILD_INSERT_PRODUCT_CONFIGURATION']) {
	productObj = require('../product.json'); // Running out of sources
}

/**
 * Loads the package configuration.
 * 
 * During the build process, 'BUILD_INSERT_PACKAGE_CONFIGURATION' is replaced
 * with the actual package configuration.
 */
let pkgObj = { BUILD_INSERT_PACKAGE_CONFIGURATION: 'BUILD_INSERT_PACKAGE_CONFIGURATION' }; // DO NOT MODIFY, PATCHED DURING BUILD
if (pkgObj['BUILD_INSERT_PACKAGE_CONFIGURATION']) {
	pkgObj = require('../package.json'); // Running out of sources
}

/**
 * Exports the product configuration object.
 * Contains VS Code product-specific settings.
 */
export const product = productObj;

/**
 * Exports the package configuration object.
 * Contains VS Code package metadata.
 */
export const pkg = pkgObj;
