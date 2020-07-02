import TableDefinition from 'fontoxml-table-flow/src/TableDefinition.js';
import createCreateCellNodeStrategy from 'fontoxml-table-flow/src/createCreateCellNodeStrategy.js';
import createCreateRowStrategy from 'fontoxml-table-flow/src/createCreateRowStrategy.js';
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
	cell: {
		localName: '',
		namespaceURI: null
	}
};

function applyDefaults(options, defaultOptions) {
	// Each option must have a localName and there is no default value for it.
	// Each option can have a namespaceURI but the default value is empty string
	// The default tableFilterSelector is empty string

	const newOptions = {};
	for (const defaultOptionKey of Object.keys(defaultOptions)) {
		const defaultOption = defaultOptions[defaultOptionKey];
		if (!(defaultOptionKey in options)) {
			throw new Error(
				'All table parts (table, headerRow, row, cell) must be configured in the options for a basic table. Please refer to the documentation for configureAsBasicTableElements for details.'
			);
		}

		const newOption = (newOptions[defaultOptionKey] = {});
		const option = options[defaultOptionKey];

		if (!option.localName || typeof option.localName !== 'string') {
			throw new Error('Each option must have a localName.');
		}

		newOption['localName'] = option['localName'];
		newOption['namespaceURI'] = option.namespaceURI
			? option.namespaceURI
			: defaultOption.namespaceURI;

		if (defaultOptionKey === 'table') {
			newOption['tableFilterSelector'] = option.tableFilterSelector
				? option.tableFilterSelector
				: defaultOption.tableFilterSelector;
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
		headerRow: `Q{${options.headerRow.namespaceURI || ''}}${options.headerRow.localName}`,
		row: `Q{${options.row.namespaceURI || ''}}${options.row.localName}`,
		cell: `Q{${options.cell.namespaceURI || ''}}${options.cell.localName}`
	};

	// Alias for selector parts
	const headerRow = selectorParts.headerRow;
	const row = selectorParts.row;
	const cell = selectorParts.cell;

	// Properties object
	const properties = {
		selectorParts: selectorParts,

		// Finds
		findHeaderRowNodesXPathQuery: './' + headerRow,
		findBodyRowNodesXPathQuery: './' + row,
		findCellNodesXPathQuery: './' + cell,

		// Data
		getNumberOfColumnsXPathQuery:
			'./*[self::' + row + ' or self::' + headerRow + '][1]/' + cell + ' => count()',

		// Normalizations
		normalizeRowNodeStrategies: [
			normalizeRowNodeStrategies.createConvertNormalRowNodeStrategy(
				options.headerRow.namespaceURI,
				options.headerRow.localName
			),
			normalizeRowNodeStrategies.createConvertFormerHeaderRowNodeStrategy(
				options.row.namespaceURI,
				options.row.localName
			)
		],

		// Creates
		createCellNodeStrategy: createCreateCellNodeStrategy(
			options.cell.namespaceURI,
			options.cell.localName
		),
		createRowStrategy: createCreateRowStrategy(options.row.namespaceURI, options.row.localName)
	};

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
