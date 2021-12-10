import type {
	AllowExpansionInContentView,
	DefaultTextContainer,
	Widget,
	WidgetSubAreaByName,
} from 'fontoxml-families/src/types';
import type { SxModule } from 'fontoxml-modular-schema-experience/src/sxManager';
import type { ContextualOperation } from 'fontoxml-operations/src/types';
import type { XPathQuery, XPathTest } from 'fontoxml-selectors/src/types';
import configureAsTableElements from 'fontoxml-table-flow/src/configureAsTableElements';
import logDeprecationWarning from 'fontoxml-utils/src/logDeprecationWarning';

import BasicTableDefinition from './table-definition/BasicTableDefinition';

/**
 * @remarks
 * Configure the given set of elements as a basic table. More configuration options
 * for the `configureAsBasicTableElements` function will be added at a later point
 * in time.
 *
 * For example:
 *
 * ```
 * configureAsBasicTableElements(sxModule, {
 *     priority: 5, // Optional
 *     table: {
 *         localName: 'table',
 *         namespaceURI: 'http://some-uri.com/table',
 *         tableFilterSelector: 'not(@conref)' // Optional
 *     },
 *     // optional
 *     headerRow: {
 *         localName: 'header',
 *         namespaceURI: 'http://some-uri.com/header'
 *     },
 *     row: {
 *         localName: 'tr',
 *         namespaceURI: 'http://some-uri.com/tr'
 *     },
 *     // optional
 *     headerCell: {
 *         localName: 'th',
 *         namespaceURI: 'http://some-uri.com/th',
 *         defaultTextContainer: 'p'
 *     },
 *     cell: {
 *         localName: 'td',
 *         namespaceURI: 'http://some-uri.com/td'
 *         defaultTextContainer: 'p' // Optional
 *     }
 * });
 *
 * configureProperties(sxModule, 'self::table', {
 *     contextualOperations: [
 *         { name: 'table-contextual-delete' }
 *     ],
 *     markupLabel: 'table',
 *     tabNavigationItemSelectorOrNodeSpec: 'self::cell'
 * });
 * ```
 *
 * Basic tables do not use elements to define columns, that is why the columnBefore
 * widgets are linked to the cell elements in the first row. Check {@link
 * fonto-documentation/docs/configure/elements/configure-tables.xml#id-d8cde415-f9e0-ba0c-14a5-cdb5f92d647d
 * | our guide} for more information on table widgets.
 *
 * Example usage for the table widgets:
 *
 * ```
 * configureAsBasicTableElements(sxModule, {
 *     table: {
 *         localName: 'table',
 *         namespaceURI: 'http://some-uri.com/table',
 *     },
 *     headerRow: {
 *         localName: 'header',
 *         namespaceURI: 'http://some-uri.com/header'
 *     },
 *     row: {
 *         localName: 'tr',
 *         namespaceURI: 'http://some-uri.com/tr'
 *     },
 *     cell: {
 *         localName: 'td',
 *         namespaceURI: 'http://some-uri.com/td'
 *     },
 *     rowBefore: [
 *         createIconWidget('dot-circle-o', {
 *             clickOperation: 'do-nothing'
 *         })
 *     ],
 *     columnBefore: [
 *         createIconWidget('clock-o', {
 *             clickOperation: 'lcTime-value-edit',
 *             tooltipContent: 'Click here to edit the duration'
 *         })
 *     ],
 *     showInsertionWidget: true,
 *     showHighlightingWidget: true,
 *     columnsWidgetMenuOperations: [{ contents: [{ name: 'columns-delete' }] }],
 *     rowsWidgetMenuOperations: [{ contents: [{ name: 'rows-delete' }] }]
 * });
 * ```
 *
 * The cell element menu button widgets are added based on the existence of
 * contextual operations on cell level. Make sure that only cell-specific
 * operations are added to the cell widget, so that users are only given options
 * relevant to them. Example on how you can add this element menu on the widget:
 *
 * ```
 * configureProperties(sxModule, 'self::cell', {
 * 	contextualOperations: [
 * 		{ name: 'contextual-set-total-cell', hideIn: ['context-menu'] }
 * 	]
 * });
 * ```
 *
 * Basic tables can also be configured to be collapsible. Refer to {@link
 * fonto-documentation/docs/configure/elements/configure-tables.xml#id-6c3f43af-b40c-4fa3-ab47-f0fd2d4ab85c
 * | our guide} to learn more.
 *
 * @fontosdk importable
 *
 * @param sxModule                                -
 * @param options                                 -
 * @param options.priority                        - Selector priority for all elements configured by
 *                                                  this function.
 * @param options.allowExpansionInContentView     - Defines the availability of expansion of a table.
 * @param options.table                           - Configuration for the table element.
 * @param options.table.localName                 - The name of the table element.
 * @param options.table.namespaceURI              - The namespace URI of the table element.
 * @param options.table.tableFilterSelector       - Additional override for which basic table elements
 *                                                  should be regarded. as tables. This can be used to
 *                                                  configure conreffed tables as not being tables.
 * @param options.headerRow                       - Configuration for the header row element.
 * @param options.headerRow.localName             - The name of the header row element.
 * @param options.headerRow.namespaceURI          - The namespace URI of the header row element.
 * @param options.row                             - Configuration for the whole row.
 * @param options.row.localName                   - The name of the row element.
 * @param options.row.namespaceURI                - The namespace URI of the row element.
 * @param options.headerCell                      - Configuration for the header cell element. This
 *                                                  option is optional. If it is not set, the cell
 *                                                  option will be used for headerCell.
 * @param options.headerCell.localName            - The name of the header cell element.
 * @param options.headerCell.namespaceURI         - The namespace URI of the header cell.
 * @param options.headerCell.defaultTextContainer - The default text container for the header cell
 *                                                  element.
 * @param options.cell                            - Configuration for the cell element.
 * @param options.cell.localName                  - The name of the cell element.
 * @param options.cell.namespaceURI               - The namespace URI of the cell element.
 * @param options.cell.defaultTextContainer       - The default text container for the cell element.
 * @param options.showInsertionWidget             - To add insertion buttons which insert a column or a
 *                                                  row to a specific place, default false.
 * @param options.showHighlightingWidget          - This is deprecated. Instead use
 *                                                  showSelectionWidget.
 * @param options.showSelectionWidget             - To add selection bars which select columns and
 *                                                  rows, and provide operations popover, default
 *                                                  false.
 * @param options.rowBefore                       - Used to add a single icon widget before each row
 *                                                  using {@link createIconWidget}. Row widgets are
 *                                                  linked to the row elements of the table. Any widget
 *                                                  can be added but only icon widget is supported.
 * @param options.columnBefore                    - Used to add one or multiple widgets before each
 *                                                  column. The context node of each column widget is
 *                                                  the cell element in the first row. {@link
 *                                                  fonto-documentation/docs/generated-content/editor-api/index.xml#id-cd5577eb-9790-92d6-e3ac-8d1554fe6b12
 *                                                  | All widgets} are supported.
 * @param options.columnWidgetMenuOperations      - This is deprecated. Use columnsWidgetMenuOperations
 *                                                  instead.
 * @param options.columnsWidgetMenuOperations     - To configure table widget menu for columns. It accepts
 *                                                  an array of {@link ContextualOperation}s, but only
 *                                                  supports "name" and "contents" properties. It is
 *                                                  allowed to have only one layer of menu.
 * @param options.rowWidgetMenuOperations         - This is deprecated. Use rowsWidgetMenuOperations
 *                                                  instead.
 * @param options.rowsWidgetMenuOperations        - To configure table widget menu for rows. It accepts
 *                                                  an array of {@link ContextualOperation}s, but only
 *                                                  supports "name" and "contents" properties. It is
 *                                                  allowed to have only one layer of menu.
 * @param options.useDefaultContextMenu           - Whether or not to use a preconfigured context menu
 *                                                  for elements within the table.
 * @param options.isCollapsibleQuery              - The {@link XPathQuery} to determine whether or not
 *                                                  a table has the ability to be collapsible.
 *                                                  Optional, defaults to 'false()'. $rowCount and
 *                                                  $columnCount helper variables can optionally be
 *                                                  used in this XPath expression which evaluate to the
 *                                                  total rows and total columns in a table.
 * @param options.isInitiallyCollapsedQuery       - The {@link XPathQuery} to determine whether or not
 *                                                  a table should initially start off as collapsed.
 *                                                  Tables must first have the ability to be
 *                                                  collapsible with isCollapsibleQuery. Optional,
 *                                                  defaults to 'true()'. $rowCount and $columnCount
 *                                                  helper variables can optionally be used in this
 *                                                  XPath expression which evaluate to the total rows
 *                                                  and total columns in a table.
 */
export default function configureAsBasicTableElements(
	sxModule: SxModule,
	options: {
		priority?: number;
		allowExpansionInContentView?: AllowExpansionInContentView;
		table: {
			localName: string;
			namespaceURI?: string | null;
			tableFilterSelector?: XPathTest;
		};
		headerRow?: {
			localName?: string;
			namespaceURI?: string | null;
		};
		row: {
			localName: string;
			namespaceURI?: string | null;
		};
		headerCell?: {
			localName?: string;
			namespaceURI?: string | null;
			defaultTextContainer?: DefaultTextContainer;
		};
		cell: {
			localName: string;
			namespaceURI?: string | null;
			defaultTextContainer?: DefaultTextContainer;
		};
		showInsertionWidget?: boolean;
		/**
		 * @deprecated Instead use showSelectionWidget.
		 */
		showHighlightingWidget?: boolean;
		showSelectionWidget?: boolean;
		rowBefore?: Widget[] | WidgetSubAreaByName | null;
		columnBefore?: Widget[] | WidgetSubAreaByName | null;
		/**
		 * @deprecated
		 * Instead use columnsWidgetMenuOperations.
		 */
		columnWidgetMenuOperations?: ContextualOperation[] | null;
		columnsWidgetMenuOperations?: ContextualOperation[] | null;
		/**
		 * @deprecated
		 * Instead use rowsWidgetMenuOperations.
		 */
		rowWidgetMenuOperations?: ContextualOperation[] | null;
		rowsWidgetMenuOperations?: ContextualOperation[] | null;
		useDefaultContextMenu?: boolean;
		isCollapsibleQuery?: XPathQuery;
		isInitiallyCollapsedQuery?: XPathQuery;
	}
): void {
	const tableDefinition = new BasicTableDefinition(options);

	configureAsTableElements(sxModule, options, tableDefinition);
}
