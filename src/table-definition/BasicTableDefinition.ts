import xq from 'fontoxml-selectors/src/xq';
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
import type { TablePartSelectors } from 'fontoxml-table-flow/src/types';
import type { BasicTableOptions } from 'fontoxml-typescript-migration-debt/src/types';

const DEFAULT_OPTIONS = {
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
	// This is deprecated.
	showHighlightingWidget: undefined,
	showSelectionWidget: false,
	rowBefore: false,
	columnBefore: false,
	useDefaultContextMenu: true,
	isCollapsibleQuery: 'false()',
	isInitiallyCollapsedQuery: 'true()',

	// Deprecated
	columnWidgetMenuOperations: undefined,
	rowWidgetMenuOperations: undefined,
	// Widget menu operations
	columnsWidgetMenuOperations: [{ contents: [{ name: 'columns-delete' }] }],
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
	// This is deprecated.
	'showHighlightingWidget',
	'showSelectionWidget',
	'showInsertionWidget',
	'rowBefore',
	'columnBefore',
	'useDefaultContextMenu',
	// This is deprecated.
	'columnWidgetMenuOperations',
	'columnsWidgetMenuOperations',
	// This is deprecated.
	'rowWidgetMenuOperations',
	'rowsWidgetMenuOperations',
	'isCollapsibleQuery',
	'isInitiallyCollapsedQuery',
];

function applyDefaults(
	options: $TSFixMeAny,
	defaultOptions: $TSFixMeAny
): $TSFixMeAny {
	// Each element configuration option must have a localName and there is no default value for it.
	// Each element configuration option can have a namespaceURI but the default value is empty string
	// The default tableFilterSelector is empty string

	const newOptions = {};
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
			const newElementOption = (newOptions[defaultOptionKey] = {});

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
				newElementOption.tableFilterSelector =
					option.tableFilterSelector
						? option.tableFilterSelector
						: defaultOption.tableFilterSelector;
			}
		} else {
			newOptions[defaultOptionKey] = option || defaultOption;
		}
	}

	return newOptions;
}

function getTableDefinitionProperties(options: $TSFixMeAny): $TSFixMeAny {
	options = applyDefaults(options, DEFAULT_OPTIONS);

	const tablePartSelectors: TablePartSelectors = {
		table: xq`${xq(
			`self::Q{${options.table.namespaceURI || ''}}${
				options.table.localName
			}`
		)}
			[${
				options.table.tableFilterSelector
					? options.table.tableFilterSelector
					: xq`true()`
			}]`,
		row: xq(
			`self::Q{${options.row.namespaceURI || ''}}${options.row.localName}`
		),
		cell: xq(
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
		tablePartSelectors.headerRow = xq(
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
		tablePartSelectors.headerCell = xq(
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
		// This is deprecated. Remove in 7.20
		columnWidgetMenuOperations: options.columnWidgetMenuOperations,
		columnsWidgetMenuOperations: options.columnsWidgetMenuOperations,
		// This is deprecated. Remove in 7.20
		rowWidgetMenuOperations: options.rowWidgetMenuOperations,
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
	public constructor(options: BasicTableOptions) {
		super(getTableDefinitionProperties(options));
	}
}
