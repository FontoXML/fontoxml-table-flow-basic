import type {
	AllowExpansionInContentView,
	Widget,
	WidgetSubAreaByName,
} from 'fontoxml-families/src/types';
import type { SxModule } from 'fontoxml-modular-schema-experience/src/sxManager';
import type { XPathQuery, XPathTest } from 'fontoxml-selectors/src/types';
import configureAsTableElements from 'fontoxml-table-flow/src/configureAsTableElements';

import BasicTableDefinition from './table-definition/BasicTableDefinition';

/**
 * Configure the given set of elements as a basic table. More configuration options for
 * the `configureAsBasicTableElements` function will be added at a later point in time.
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
 * Basic tables do not use elements to define columns, that is why the columnBefore widgets are
 * linked to the cell elements in the first row. Check {@link fonto-documentation/docs/editor/fontoxml-editor-documentation/quickstarts/configure-tables.xml#id-d8cde415-f9e0-ba0c-14a5-cdb5f92d647d our guide}
 * for more information on table widgets.
 *
 * Example usage for the table widgets:
 *
 *```
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
 *     columnWidgetMenuOperations: [{ contents: [{ name: 'column-delete-at-index' }] }],
 *     rowWidgetMenuOperations: [{ contents: [{ name: 'contextual-row-delete' }] }]
 * });
 *```
 *
 * The cell element menu button widgets are added based on the existence of contextual operations on
 * cell level. Make sure that only cell-specific operations are added to the cell widget, so that
 * users are only given options relevant to them.
 * Example on how you can add this element menu on the widget:
 *
 * ```
 *	configureProperties(sxModule, 'self::cell', {
 *		contextualOperations: [
 *			{ name: 'contextual-set-total-cell', hideIn: ['context-menu'] }
 *		]
 *	});
 * ```
 *
 * Basic tables can also be configured to be collapsible. Refer to {@link fonto-documentation/docs/editor/fontoxml-editor-documentation/quickstarts/configure-tables.xml#id-6c3f43af-b40c-4fa3-ab47-f0fd2d4ab85c our guide} to learn more.
 *
 * @fontosdk
 * @category  add-on/fontoxml-table-flow-basic
 *
 * @param  {SxModule}                           sxModule
 * @param  {Object}                             options
 * @param  {number}                             [options.priority]                              Selector priority for all elements configured by this function.
 * @param  {AllowExpansionInContentView}        [options.allowExpansionInContentView]           Defines the availability of expansion of a table.
 * @param  {Object}                             options.table                                   Configuration for the table element.
 * @param  {string}                             options.table.localName                         The name of the table element.
 * @param  {string}                             [options.table.namespaceURI=null]               The namespace URI of the table element.
 * @param  {XPathTest}                          [options.table.tableFilterSelector]             Additional override for which basic table elements should be regarded.
 *                                                                                              as tables. This can be used to configure conreffed tables as not being tables.
 * @param  {Object}                             [options.headerRow]                             Configuration for the header row element.
 * @param  {string}                             [options.headerRow.localName]                   The name of the header row element.
 * @param  {string}                             [options.headerRow.namespaceURI=null]           The namespace URI of the header row element.
 * @param  {Object}                             options.row                                     Configuration for the whole row.
 * @param  {string}                             options.row.localName                           The name of the row element.
 * @param  {string}                             [options.row.namespaceURI=null]                 The namespace URI of the row element.
 * @param  {Object}                             [options.headerCell]                            Configuration for the header cell element. This option is optional.
 *                                                                                              If it is not set, the cell option will be used for headerCell.
 * @param  {string}                             [options.headerCell.localName]                  The name of the header cell element.
 * @param  {string}                             [options.headerCell.namespaceURI=null]          The namespace URI of the header cell.
 * @param  {string}                             [options.headerCell.defaultTextContainer=null]  The default text container for the header cell element.
 * @param  {Object}                             options.cell                                    Configuration for the cell element.
 * @param  {string}                             options.cell.localName                          The name of the cell element.
 * @param  {string}                             [options.cell.namespaceURI=null]                The namespace URI of the cell element.
 * @param  {string}                             [options.cell.defaultTextContainer=null]        The default text container for the cell element.
 * @param  {boolean}                            [options.showInsertionWidget=false]             To add insertion buttons which insert a column or a row to
 *                                                                                              a specific place, default false.
 * @param  {boolean}                            [options.showHighlightingWidget=false]          To add highlighting bars which highlight columns and rows, and
 *                                                                                              provide operations popover, default false.
 * @param  {WidgetSubAreaByName|Widget[]|null}  [options.rowBefore]                             Used to add a single icon widget before each row using
 *                                                                                              {@link createIconWidget}. Row widgets are linked to the row elements
 *                                                                                              of the table. Any widget can be added but only icon widget is supported.
 * @param  {WidgetSubAreaByName|Widget[]|null}  [options.columnBefore]                          Used to add one or multiple widgets before each column. The context
 *                                                                                              node of each column widget is the cell element in the first row.
 *                                                                                              {@link fonto-documentation/docs/editor/api/index.xml#id-9d2b1ad5-bbc1-6c44-d491-16dc213c53f2 All widgets}
 *                                                                                              are supported.
 * @param  {Object[]|null}                      [options.columnWidgetMenuOperations]            To configure table widget menu for columns. It accepts an array of
 *                                                                                              {@link ContextualOperation}s, but only supports "name" and "contents"
 *                                                                                              properties. It is allowed to have only one layer of menu.
 * @param  {Object[]|null}                      [options.rowWidgetMenuOperations]               To configure table widget menu for rows. It accepts an array of
 *                                                                                              {@link ContextualOperation}s, but only supports "name" and "contents" properties.
 *                                                                                              It is allowed to have only one layer of menu.
 * @param  {boolean}                            [options.useDefaultContextMenu=true]            Whether or not to use a preconfigured context menu for elements within the table.
 * @param  {XPathQuery}                         [options.isCollapsibleQuery=false()]            The {@link XPathQuery} to determine whether or not a table has the ability
 *                                                                                              to be collapsible. Optional, defaults to 'false()'. $rowCount and $columnCount
 *                                                                                              helper variables can optionally be used in this XPath expression which evaluate
 *                                                                                              to the total rows and total columns in a table.
 * @param  {XPathQuery}                         [options.isInitiallyCollapsedQuery=true()]      The {@link XPathQuery} to determine whether or not a table should initially
 *                                                                                              start off as collapsed. Tables must first have the ability to be collapsible
 *                                                                                              with isCollapsibleQuery. Optional, defaults to 'true()'. $rowCount and $columnCount
 *                                                                                              helper variables can optionally be used in this XPath expression which evaluate
 *                                                                                              to the total rows and total columns in a table.
 */
export default function configureAsBasicTableElements(
	sxModule: SxModule,
	options: {
		priority?: number;
		allowExpansionInContentView?: AllowExpansionInContentView;
		table: {
			localName: string;
			namespaceURI?: string;
			tableFilterSelector?: XPathTest;
		};
		headerRow?: {
			localName?: string;
			namespaceURI?: string;
		};
		row: {
			localName: string;
			namespaceURI?: string;
		};
		headerCell?: {
			localName?: string;
			namespaceURI?: string;
			defaultTextContainer?: string;
		};
		cell: {
			localName: string;
			namespaceURI?: string;
			defaultTextContainer?: string;
		};
		showInsertionWidget?: boolean;
		showHighlightingWidget?: boolean;
		rowBefore?: Widget[] | WidgetSubAreaByName | null;
		columnBefore?: Widget[] | WidgetSubAreaByName | null;
		columnWidgetMenuOperations?: Object[] | null;
		rowWidgetMenuOperations?: Object[] | null;
		useDefaultContextMenu?: boolean;
		isCollapsibleQuery?: XPathQuery;
		isInitiallyCollapsedQuery?: XPathQuery;
	}
): void {
	options = options || {};
	const tableDefinition = new BasicTableDefinition(options);

	options.cell.defaultTextContainer =
		options.cell.defaultTextContainer || null;

	configureAsTableElements(sxModule, options, tableDefinition);
}
