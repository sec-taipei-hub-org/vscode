/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { localize, localize2 } from '../../../../nls.js';
import { ICommandAction } from '../../../../platform/action/common/action.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { MenuId, MenuRegistry } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry, ICommandMetadata } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IssueReporterData, IWorkbenchIssueService } from './issue.js';

/**
 * Command ID for the action to open the issue reporter from the command palette.
 */
const OpenIssueReporterActionId = 'workbench.action.openIssueReporter';

/**
 * Command ID for the API endpoint to open the issue reporter.
 */
const OpenIssueReporterApiId = 'vscode.openIssueReporter';

/**
 * Command metadata for the issue reporter commands.
 * Defines the description and parameters for both commands.
 */
const OpenIssueReporterCommandMetadata: ICommandMetadata = {
	description: 'Open the issue reporter and optionally prefill part of the form.',
	args: [
		{
			name: 'options',
			description: 'Data to use to prefill the issue reporter with.',
			isOptional: true,
			schema: {
				oneOf: [
					{
						type: 'string',
						description: 'The extension id to preselect.'
					},
					{
						type: 'object',
						properties: {
							extensionId: {
								type: 'string'
							},
							issueTitle: {
								type: 'string'
							},
							issueBody: {
								type: 'string'
							}
						}

					}
				]
			}
		},
	]
};

/**
 * Interface defining the structure of arguments that can be passed 
 * when opening the issue reporter.
 */
interface OpenIssueReporterArgs {
	/**
	 * The ID of the extension to report an issue for.
	 * When provided, the issue reporter will be pre-filled with this extension.
	 */
	readonly extensionId?: string;

	/**
	 * The title for the new issue.
	 */
	readonly issueTitle?: string;

	/**
	 * The body text for the new issue.
	 */
	readonly issueBody?: string;

	/**
	 * Additional extension data to include in the issue report.
	 */
	readonly extensionData?: string;
}

/**
 * Workbench contribution that registers commands for opening the issue reporter.
 * 
 * This class handles:
 * - Checking if feedback is enabled via telemetry settings
 * - Registering commands to open the issue reporter through command palette and UI
 * - Adding menu items for the issue reporter in appropriate locations
 */
export class BaseIssueContribution extends Disposable implements IWorkbenchContribution {
	/**
	 * Creates a new instance of the BaseIssueContribution.
	 *
	 * @param productService Service providing product-specific configuration
	 * @param configurationService Service providing access to user and workspace settings
	 */
	constructor(
		@IProductService productService: IProductService,
		@IConfigurationService configurationService: IConfigurationService,
	) {
		super();

		if (!configurationService.getValue<boolean>('telemetry.feedback.enabled')) {
			this._register(CommandsRegistry.registerCommand({
				id: 'workbench.action.openIssueReporter',
				handler: function (accessor) {
					const data = accessor.get(INotificationService);
					data.info('Feedback is disabled.');

				},
			}));
			return;
		}

		if (!productService.reportIssueUrl) {
			return;
		}

		this._register(CommandsRegistry.registerCommand({
			id: OpenIssueReporterActionId,
			handler: function (accessor, args?: string | [string] | OpenIssueReporterArgs) {
				const data: Partial<IssueReporterData> =
					typeof args === 'string'
						? { extensionId: args }
						: Array.isArray(args)
							? { extensionId: args[0] }
							: args ?? {};

				return accessor.get(IWorkbenchIssueService).openReporter(data);
			},
			metadata: OpenIssueReporterCommandMetadata
		}));

		this._register(CommandsRegistry.registerCommand({
			id: OpenIssueReporterApiId,
			handler: function (accessor, args?: string | [string] | OpenIssueReporterArgs) {
				const data: Partial<IssueReporterData> =
					typeof args === 'string'
						? { extensionId: args }
						: Array.isArray(args)
							? { extensionId: args[0] }
							: args ?? {};

				return accessor.get(IWorkbenchIssueService).openReporter(data);
			},
			metadata: OpenIssueReporterCommandMetadata
		}));

		const reportIssue: ICommandAction = {
			id: OpenIssueReporterActionId,
			title: localize2({ key: 'reportIssueInEnglish', comment: ['Translate this to "Report Issue in English" in all languages please!'] }, "Report Issue..."),
			category: Categories.Help
		};

		this._register(MenuRegistry.appendMenuItem(MenuId.CommandPalette, { command: reportIssue }));

		this._register(MenuRegistry.appendMenuItem(MenuId.MenubarHelpMenu, {
			group: '3_feedback',
			command: {
				id: OpenIssueReporterActionId,
				title: localize({ key: 'miReportIssue', comment: ['&& denotes a mnemonic', 'Translate this to "Report Issue in English" in all languages please!'] }, "Report &&Issue")
			},
			order: 3
		}));
	}
}
