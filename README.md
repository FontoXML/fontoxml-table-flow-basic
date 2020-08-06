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
		namespaceURI: 'http://some-uri.com/th'
	},

	cell: {
		// The name of the cell element
		localName: 'td',

		// The uri for the cell element (optional)
		namespaceURI: 'http://some-uri.com/td'

		// The default text container used for entry elements (optional)
		defaultTextContainer: 'p'
	},

	// Widget are before rows. Any widget can be used, but only the {@link iconWidget} is supported here. Optional, defaults to an empty array.
	rowBefore: [
		createIconWidget('dot-circle-o', {
			clickOperation: 'do-nothing'
		})
	],

	// Widget are before columns. Column widgets are linked to the cell elements in the first row. Any widget can be used, but only the {@link iconWidget} is supported here. Optional, defaults to an empty array.
	columnBefore: [
		createIconWidget('lcTime-value-edit', {
			clickOperation: 'do-nothing'
		})
	],

	// This will show buttons that insert a new column or row. Optional, defaults to false.
	showInsertionWidget: true,

	// This will show areas that can be hovered over to highlight a column or row and that can be clicked to show a operations popover. Optional, defaults to false.
	showHighlightingWidget: true
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

