import configureAsTableElements from 'fontoxml-table-flow/src/configureAsTableElements.js';
import BasicTableDefinition from './table-definition/BasicTableDefinition.js';

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
 * linked to the cell elements in the first row.
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
 * @fontosdk
 * @category  add-on/fontoxml-table-flow-basic
 *
 * @param  {SxModule}        sxModule
 * @param  {Object}          options
 * @param  {number}          [options.priority]                       Selector priority for all elements configured by this function
 * @param  {Object}          options.table                            Configuration for the table element
 * @param  {string}          options.table.localName                  The name of the table element
 * @param  {string}          [options.table.namespaceURI=null]        The namespace URI of the table element
 * @param  {XPathTest}       [options.table.tableFilterSelector]      Additional override for which basic table elements should be regarded as tables. This can be used to configure conreffed tables as not being tables.
 * @param  {Object}          [options.headerRow]                      Configuration for the header row element
 * @param  {string}          [options.headerRow.localName]            The name of the header row element
 * @param  {string}          [options.headerRow.namespaceURI=null]    The namespace URI of the header row element
 * @param  {Object}          options.row                              Configuration for the whole row
 * @param  {string}          options.row.localName                    The name of the row element
 * @param  {string}          [options.row.namespaceURI=null]          The namespace URI of the row element
 * @param  {Object}          [options.headerCell]                     Configuration for the header cell element. This option is optional. If it is not set, the cell option will be used for headerCell.
 * @param  {string}          [options.headerCell.localName]           The name of the header cell element
 * @param  {string}          [options.headerCell.namespaceURI=null]   The namespace URI of the header cell
 * @param  {string}          [options.headerCell.defaultTextContainer=null] The default text container for the header cell element
 * @param  {Object}          options.cell                             Configuration for the cell element
 * @param  {string}          options.cell.localName                   The name of the cell element
 * @param  {string}          [options.cell.namespaceURI=null]         The namespace URI of the cell element
 * @param  {string}          [options.cell.defaultTextContainer=null] The default text container for the cell element
 * @param  {boolean}         [options.showInsertionWidget=false]      To add insertion buttons which insert a column or a row to a specific place, default false.
 * @param  {boolean}         [options.showHighlightingWidget=false]   To add highlighting bars which highlight columns and rows, and provide operations popover, default false.
 * @param  {Widget[]}        [options.rowBefore]                      To add row icon widgets by using {@link createIconWidget}. Row widgets are linked to the row elements of the table. Any widget can be added but only icon widget is supported.
 * @param  {Widget[]|null}   [options.columnBefore]                   To add column icon widgets by using {@link createIconWidget}. Column widgets are linked to the cell elements in the first row. Any widget can be added but only icon widget is supported.
 * @param  {Object[]|null}   [options.columnWidgetMenuOperations]     To configure table widget menu for columns. It accepts an array of {@link ContextualOperation}s, but only supports "name" and "contents" properties. It is allowed to have only one layer of menu.
 * @param  {Object[]|null}   [options.rowWidgetMenuOperations]        To configure table widget menu for rows. It accepts an array of {@link ContextualOperation}s, but only supports "name" and "contents" properties. It is allowed to have only one layer of menu.
 * @param  {boolean}         [options.useDefaultContextMenu=true]     Whether or not to use a preconfigured context menu for elements within the table
 */
export default function configureAsBasicTableElements(sxModule, options) {
	options = options || {};
	const tableDefinition = new BasicTableDefinition(options);

	options.cell['defaultTextContainer'] = options.cell['defaultTextContainer'] || null;

	configureAsTableElements(sxModule, options, tableDefinition);
}
