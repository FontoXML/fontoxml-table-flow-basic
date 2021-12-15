import type { SxModule } from 'fontoxml-modular-schema-experience/src/sxManager';
import configureAsTableElements from 'fontoxml-table-flow/src/configureAsTableElements';
import type { TableElementsSharedOptions } from 'fontoxml-table-flow/src/types';

import BasicTableDefinition from './table-definition/BasicTableDefinition';
import type { TableElementsBasicOptions } from './types';

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
 */
export default function configureAsBasicTableElements(
	sxModule: SxModule,
	options: TableElementsBasicOptions & TableElementsSharedOptions
): void {
	const tableDefinition = new BasicTableDefinition(options);

	configureAsTableElements(sxModule, options, tableDefinition);
}
