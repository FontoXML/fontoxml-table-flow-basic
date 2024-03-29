import xq, { ensureXQExpression } from 'fontoxml-selectors/src/xq';
import createCreateCellNodeStrategy from 'fontoxml-table-flow/src/createCreateCellNodeStrategy';
import createCreateRowStrategy from 'fontoxml-table-flow/src/createCreateRowStrategy';
import {
	createConvertFormerHeaderCellNodeStrategy,
	createConvertHeaderCellNodeStrategy,
} from 'fontoxml-table-flow/src/normalizeCellNodeStrategies';
import {
	createConvertFormerHeaderRowNodeStrategy,
	createConvertNormalRowNodeStrategy,
} from 'fontoxml-table-flow/src/normalizeRowNodeStrategies';
import TableDefinition from 'fontoxml-table-flow/src/TableDefinition';
import type {
	TableDefinitionProperties,
	TableElementsSharedOptions,
	TablePartSelectors,
} from 'fontoxml-table-flow/src/types';

import type { TableElementsBasicOptions } from '../types';

const DEFAULT_OPTIONS: TableElementsBasicOptions & TableElementsSharedOptions =
	{
		table: {
			localName: '',
			namespaceURI: null,
			tableFilterSelector: '',
		},
		headerRow: {
			localName: '',
			namespaceURI: null,
		},
		row: {
			localName: '',
			namespaceURI: null,
		},
		headerCell: {
			localName: '',
			namespaceURI: null,
		},
		cell: {
			localName: '',
			namespaceURI: null,
		},

		showInsertionWidget: false,
		showSelectionWidget: false,
		rowBefore: null,
		columnBefore: null,
		useDefaultContextMenu: true,
		isCollapsibleQuery: 'false()',
		isInitiallyCollapsedQuery: 'true()',

		// Widget menu operations
		columnsWidgetMenuOperations: [
			{ contents: [{ name: 'columns-delete' }] },
		],
		rowsWidgetMenuOperations: [{ contents: [{ name: 'rows-delete' }] }],
	};

const configurableElementOptions = [
	'table',
	'headerRow',
	'row',
	'headerCell',
	'cell',
];
const optionalOptions = [
	'headerRow',
	'headerCell',
	'showSelectionWidget',
	'showInsertionWidget',
	'rowBefore',
	'columnBefore',
	'useDefaultContextMenu',
	'columnsWidgetMenuOperations',
	'rowsWidgetMenuOperations',
	'isCollapsibleQuery',
	'isInitiallyCollapsedQuery',
];

function applyDefaults(
	options: TableElementsBasicOptions & TableElementsSharedOptions,
	defaultOptions: TableElementsBasicOptions & TableElementsSharedOptions
): TableElementsBasicOptions & TableElementsSharedOptions {
	// Each element configuration option must have a localName and there is no default value for it.
	// Each element configuration option can have a namespaceURI but the default value is empty string
	// The default tableFilterSelector is empty string

	const newOptions: TableElementsBasicOptions & TableElementsSharedOptions =
		{} as TableElementsBasicOptions & TableElementsSharedOptions;
	for (const defaultOptionKey of Object.keys(defaultOptions)) {
		const defaultOption = defaultOptions[defaultOptionKey];
		if (!(defaultOptionKey in options)) {
			if (
				optionalOptions.some(
					(optionalOption) => optionalOption === defaultOptionKey
				)
			) {
				continue;
			}
			throw new Error(
				'All table parts (table, headerRow, row, cell) must be configured in the options for a basic table. Please refer to the documentation for configureAsBasicTableElements for details.'
			);
		}

		const option = options[defaultOptionKey];

		if (
			configurableElementOptions.some(
				(elementOption) => elementOption === defaultOptionKey
			)
		) {
			const newElementOption: {
				localName?: string;
				namespaceURI?: string | null;
			} = (newOptions[defaultOptionKey] = {});

			if (!option.localName || typeof option.localName !== 'string') {
				throw new Error(
					'Each element configuration option must have a localName.'
				);
			}

			newElementOption.localName = option.localName;
			newElementOption.namespaceURI = option.namespaceURI
				? option.namespaceURI
				: defaultOption.namespaceURI;

			if (defaultOptionKey === 'table') {
				(
					newElementOption as TableElementsBasicOptions['table']
				).tableFilterSelector = option.tableFilterSelector
					? option.tableFilterSelector
					: defaultOption.tableFilterSelector;
			}
		} else {
			newOptions[defaultOptionKey] = option || defaultOption;
		}
	}

	return newOptions;
}

function getTableDefinitionProperties(
	options: TableElementsBasicOptions & TableElementsSharedOptions
): TableDefinitionProperties {
	options = applyDefaults(options, DEFAULT_OPTIONS);

	const tablePartSelectors: TablePartSelectors = {
		table: xq`${ensureXQExpression(
			`self::Q{${options.table.namespaceURI || ''}}${
				options.table.localName
			}`
		)}
			[${
				options.table.tableFilterSelector
					? ensureXQExpression(options.table.tableFilterSelector)
					: xq`true()`
			}]`,
		row: ensureXQExpression(
			`self::Q{${options.row.namespaceURI || ''}}${options.row.localName}`
		),
		cell: ensureXQExpression(
			`self::Q{${options.cell.namespaceURI || ''}}${
				options.cell.localName
			}`
		),
	};

	if (
		options.headerRow &&
		(options.headerRow.namespaceURI !== options.row.namespaceURI ||
			options.headerRow.localName !== options.row.localName)
	) {
		tablePartSelectors.headerRow = ensureXQExpression(
			`self::Q{${options.headerRow.namespaceURI || ''}}${
				options.headerRow.localName
			}`
		);
	}

	if (
		options.headerCell &&
		(options.headerCell.namespaceURI !== options.cell.namespaceURI ||
			options.headerCell.localName !== options.cell.localName)
	) {
		tablePartSelectors.headerCell = ensureXQExpression(
			`self::Q{${options.headerCell.namespaceURI || ''}}${
				options.headerCell.localName
			}`
		);
	}

	// Alias for selector parts
	const headerRow = tablePartSelectors.headerRow;
	const row = tablePartSelectors.row;
	const headerCell = tablePartSelectors.headerCell;
	const cell = tablePartSelectors.cell;

	// Properties object
	return {
		tablePartSelectors,

		// Finds
		findHeaderRowNodesXPathQuery: headerRow
			? xq`child::*[${headerRow}]`
			: headerCell
			? xq`child::*[${row}[child::*[${headerCell}]]`
			: undefined,

		findBodyRowNodesXPathQuery: headerCell
			? xq`child::*[${row}[child::*[${cell}]]]`
			: xq`child::*[${row}]`,

		findCellNodesXPathQuery: headerCell
			? xq`child::*[${cell} or ${headerCell}]`
			: xq`child::*[${cell}]`,

		// Normalizations
		normalizeCellNodeStrategies: headerCell
			? [
					createConvertHeaderCellNodeStrategy(
						options.headerCell.namespaceURI,
						options.headerCell.localName
					),
					createConvertFormerHeaderCellNodeStrategy(
						options.cell.namespaceURI,
						options.cell.localName
					),
			  ]
			: undefined,

		normalizeRowNodeStrategies: headerRow
			? [
					createConvertNormalRowNodeStrategy(
						options.headerRow.namespaceURI,
						options.headerRow.localName
					),
					createConvertFormerHeaderRowNodeStrategy(
						options.row.namespaceURI,
						options.row.localName
					),
			  ]
			: undefined,

		// Data
		getNumberOfColumnsXPathQuery: xq`child::*[${row} or ${
			headerRow || xq`false()`
		}][1]/child::*[${cell} or ${headerCell || xq`false()`}] => count()`,

		// Creates
		createCellNodeStrategy: createCreateCellNodeStrategy(
			options.cell.namespaceURI,
			options.cell.localName
		),
		createRowStrategy: createCreateRowStrategy(
			options.row.namespaceURI,
			options.row.localName
		),

		// Widget menu operations
		columnsWidgetMenuOperations: options.columnsWidgetMenuOperations,
		rowsWidgetMenuOperations: options.rowsWidgetMenuOperations,
	};
}

/**
 * @remarks
 * Configures the table definition for basic tables.
 */
export default class BasicTableDefinition extends TableDefinition {
	/**
	 * @param options -
	 */
	public constructor(options: TableElementsBasicOptions) {
		super(getTableDefinitionProperties(options));
	}
}
