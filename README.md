---
category: add-on/fontoxml-table-flow-basic
---

# Basic table support

This add-on adds support for basic tables to a Fonto editor.

This add-on exposes one function called {@link configureAsBasicTableElements}. This function
configures all basic table elements. Nevertheless all basic table elements can be
configured either separately or by default automatically.

The `configureAsBasicTableElements` function should be used in a configureSxModule file, like this:

```
configureAsBasicTableElements(sxModule, {
	// Priority of the selectors used to select the table elements (optional)
	priority: 2,

	table: {
		// The name of the containing element
		localName: 'table',

		// The uri for the table element (optional)
		namespaceURI: 'http://some-uri.com/table',

		 // Optional
		tableFilterSelector: 'not(@conref)'
	},

	// Having headerRow option is optional
	headerRow: {
		// The name of the header row element
		localName: 'header',

		// The uri for the header row element (optional)
		namespaceURI: 'http://some-uri.com/header'
	},

	row: {
		// The name of the row element
		localName: 'tr',

		// The uri for the row element (optional)
		namespaceURI: 'http://some-uri.com/tr'
	},

	// Having headerCell option is optional
	headerCell: {
		// The name of the header cell element. If you have headerCell option, localName is required.
		localName: 'th',

		// The uri for the header cell element (optional)
		namespaceURI: 'http://some-uri.com/th',

		// The default text container used for header cell elements (optional)
		defaultTextContainer: 'p'
	},

	cell: {
		// The name of the cell element
		localName: 'td',

		// The uri for the cell element (optional)
		namespaceURI: 'http://some-uri.com/td'

		// The default text container used for cell elements (optional)
		defaultTextContainer: 'p'
	},

	// This widget is before each row. Any widget can be used, but only the {@link iconWidget} is supported here. Optional, defaults to an empty array.
	rowBefore: [
		createIconWidget('dot-circle-o', {
			clickOperation: 'do-nothing'
		})
	],

	// This widgets are before columns. Column widgets are linked to the cell elements in the first row. All widgets are supported. Optional, defaults to an empty array.
	columnBefore: [
		createIconWidget('clock-o', {
			clickOperation: 'lcTime-value-edit',
			tooltipContent: 'Click here to edit the duration'
		})
	],

	// This will show buttons that insert a new column or row. Optional, defaults to false.
	showInsertionWidget: true,

	// This will show areas that can be hovered over to highlight a column or row and that can be clicked to show a operations popover. Optional, defaults to false.
	showHighlightingWidget: true,

	// This XPath expression determines whether or not a table has the ability to be collapsed. Optional, defaults to 'false()'.
	// $rowCount and $columnCount helper variables can also optionally be used in the XPath expression to make it easier to configure
	// when the table should collapse i.e. '$rowCount > 5' which will allow tables with rows more than 5 to be able to be collapsed/uncollapsed
	isCollapsibleQuery: 'false()'

	// This XPath expression determines whether a table that has the ability to be collapsed should start off as collapsed on initial load. Optional, defaults to 'true()'.
	// $rowCount and $columnCount helper variables can also optionally be used in the XPath expression to make it easier to configure
	// when the table should start off as collapsed i.e. '$rowCount > 10' means that tables that have more than 10 rows will initially start off as collapsed
	// Note: This query is only evaluated on tables which have the ability to be collapsed using isCollapsibleQuery
	isInitiallyCollapsedQuery: 'true()'

    // In basic table, there are some operations in the column/row widget menus as default. But they can be overridden.
 	columnWidgetMenuOperations: [{ contents: [{ name: 'column-delete-at-index' }] }],
 	rowWidgetMenuOperations: [{ contents: [{ name: 'contextual-row-delete' }] }]
});
```

To configure the markup labels and contextual operations, use the {@link configureProperties} function.

The cell element menu button widgets are added based on the existence of contextual operations on cell level. Make sure that only cell-specific operations are added to the cell widget, so that users are only given options relevant to them.
Example on how you can add this element menu on the widget:

```
configureProperties(sxModule, 'self::cell', {
	contextualOperations: [
		{ name: 'contextual-set-total-cell', hideIn: ['context-menu'] }
	]
});
```

# Contributing

This package can serve as a base for custom versions of basic tables. It can be forked by checking
it out directly in the `packages` folder of an editor. When making a fork, consider keeping it
up-to-date with new Fonto Editor versions when they release. Please refer to [our documentation on
open-source add-ons](https://documentation.fontoxml.com/latest/add-ons-03165378ea7b#id-2cd061ac-8db3-1afa-57db-c07876d3bd11)
for possible approaches to maintaining and integrating (forks of) this add-on.

The code in this package is complex and is continously optimized for performance. We would like to
maintain any changes and extensions that you make to this package. We highly appreciate pull
requests for bug fixes, changes, or extensions to this package, as long as they are stable enough
and in line with the types of tables supported by this add-on.
