import TableDefinition from 'fontoxml-table-flow/src/TableDefinition.js';
import createCreateCellNodeStrategy from 'fontoxml-table-flow/src/createCreateCellNodeStrategy.js';
import createCreateRowStrategy from 'fontoxml-table-flow/src/createCreateRowStrategy.js';
import normalizeCellNodeStrategies from 'fontoxml-table-flow/src/normalizeCellNodeStrategies.js';
import normalizeRowNodeStrategies from 'fontoxml-table-flow/src/normalizeRowNodeStrategies.js';

const DEFAULT_OPTIONS = {
	table: {
		localName: '',
		namespaceURI: null,
		tableFilterSelector: ''
	},
	headerRow: {
		localName: '',
		namespaceURI: null
	},
	row: {
		localName: '',
		namespaceURI: null
	},
	headerCell: {
		localName: '',
		namespaceURI: null
	},
	cell: {
		localName: '',
		namespaceURI: null
	},

	showInsertionWidget: false,
	showHighlightingWidget: false,
	rowBefore: false,
	columnBefore: false,
	useDefaultContextMenu: true,
	isCollapsibleQuery: 'false()',
	isInitiallyCollapsedQuery: 'true()',

	// Widget menu operations
	columnWidgetMenuOperations: [{ contents: [{ name: 'column-delete-at-index' }] }],
	rowWidgetMenuOperations: [{ contents: [{ name: 'contextual-row-delete' }] }]
};

const configurableElementOptions = ['table', 'headerRow', 'row', 'headerCell', 'cell'];
const optionalOptions = [
	'headerRow',
	'headerCell',
	'showHighlightingWidget',
	'showInsertionWidget',
	'rowBefore',
	'columnBefore',
	'useDefaultContextMenu',
	'columnWidgetMenuOperations',
	'rowWidgetMenuOperations',
	'isCollapsibleQuery',
	'isInitiallyCollapsedQuery'
];

function applyDefaults(options, defaultOptions) {
	// Each element configuration option must have a localName and there is no default value for it.
	// Each element configuration option can have a namespaceURI but the default value is empty string
	// The default tableFilterSelector is empty string

	const newOptions = {};
	for (const defaultOptionKey of Object.keys(defaultOptions)) {
		const defaultOption = defaultOptions[defaultOptionKey];
		if (!(defaultOptionKey in options)) {
			if (optionalOptions.some(optionalOption => optionalOption === defaultOptionKey)) {
				continue;
			}
			throw new Error(
				'All table parts (table, headerRow, row, cell) must be configured in the options for a basic table. Please refer to the documentation for configureAsBasicTableElements for details.'
			);
		}

		const option = options[defaultOptionKey];

		if (configurableElementOptions.some(elementOption => elementOption === defaultOptionKey)) {
			const newElementOption = (newOptions[defaultOptionKey] = {});

			if (!option.localName || typeof option.localName !== 'string') {
				throw new Error('Each element configuration option must have a localName.');
			}

			newElementOption['localName'] = option['localName'];
			newElementOption['namespaceURI'] = option.namespaceURI
				? option.namespaceURI
				: defaultOption.namespaceURI;

			if (defaultOptionKey === 'table') {
				newElementOption['tableFilterSelector'] = option.tableFilterSelector
					? option.tableFilterSelector
					: defaultOption.tableFilterSelector;
			}
		} else {
			newOptions[defaultOptionKey] = option || defaultOption;
		}
	}

	return newOptions;
}

function getTableDefinitionProperties(options) {
	options = applyDefaults(options, DEFAULT_OPTIONS);

	const selectorParts = {
		table: `Q{${options.table.namespaceURI || ''}}${options.table.localName +
			(options.table.tableFilterSelector
				? '[' + options.table.tableFilterSelector + ']'
				: '')}`,
		row: `Q{${options.row.namespaceURI || ''}}${options.row.localName}`,
		cell: `Q{${options.cell.namespaceURI || ''}}${options.cell.localName}`
	};

	// Alias for selector parts
	let headerRow = null;
	const row = selectorParts.row;
	let headerCell = null;
	const cell = selectorParts.cell;

	if (options.headerRow) {
		const headerRowSelector = `Q{${options.headerRow.namespaceURI || ''}}${
			options.headerRow.localName
		}`;
		selectorParts.headerRow =
			headerRowSelector !== selectorParts.row ? headerRowSelector : null;
		headerRow = selectorParts.headerRow;
	}

	if (options.headerCell) {
		const headerCellSelector = `Q{${options.headerCell.namespaceURI || ''}}${
			options.headerCell.localName
		}`;
		selectorParts.headerCell =
			headerCellSelector !== selectorParts.cell ? headerCellSelector : null;
		headerCell = selectorParts.headerCell;
	}

	// Properties object
	const properties = {
		selectorParts: selectorParts,

		// Finds
		findBodyRowNodesXPathQuery: `child::${row}`,
		findCellNodesXPathQuery: `child::${cell}`,

		// Data
		getNumberOfColumnsXPathQuery: `./*[self::${row}${
			headerRow ? ' or self::' + headerRow : ''
		}][1]/*[self::${cell}${headerCell ? ' or self::' + headerCell : ''}] => count()`,

		// Creates
		createCellNodeStrategy: createCreateCellNodeStrategy(
			options.cell.namespaceURI,
			options.cell.localName
		),
		createRowStrategy: createCreateRowStrategy(options.row.namespaceURI, options.row.localName),

		// Widget menu operations
		columnWidgetMenuOperations: options.columnWidgetMenuOperations,
		rowWidgetMenuOperations: options.rowWidgetMenuOperations
	};

	if (headerRow || headerCell) {
		properties.findHeaderRowNodesXPathQuery = headerRow
			? `child::${headerRow}`
			: `child::${row}[child::${headerCell}]`;

		properties.findBodyRowNodesXPathQuery = headerRow
			? `child::${row}`
			: `child::${row}[child::${cell}]`;

		properties.normalizeRowNodeStrategies = headerRow && [
			normalizeRowNodeStrategies.createConvertNormalRowNodeStrategy(
				options.headerRow.namespaceURI,
				options.headerRow.localName
			),
			normalizeRowNodeStrategies.createConvertFormerHeaderRowNodeStrategy(
				options.row.namespaceURI,
				options.row.localName
			)
		];
	}

	if (headerCell) {
		properties.findCellNodesXPathQuery = `child::*[self::${cell} or self::${headerCell}]`;
		properties.normalizeCellNodeStrategies = [
			normalizeCellNodeStrategies.createConvertHeaderCellNodeStrategy(
				options.headerCell.namespaceURI,
				options.headerCell.localName
			),
			normalizeCellNodeStrategies.createConvertFormerHeaderCellNodeStrategy(
				options.cell.namespaceURI,
				options.cell.localName
			)
		];
	}

	return properties;
}

/**
 * Configures the table definition for basic tables.
 *
 * @param {BasicTableOptions} options
 */
export default class BasicTableDefinition extends TableDefinition {
	constructor(options) {
		super(getTableDefinitionProperties(options));
	}
}
