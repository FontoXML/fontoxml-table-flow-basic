import type { DefaultTextContainerConfiguration } from 'fontoxml-base-flow/src/types';
import type { XPathTest, XQExpression } from 'fontoxml-selectors/src/types';

/**
 * @remarks
 * The options accepted by {@link configureAsBasicTableElements}. Please see
 * {@link TableElementsSharedOptions} for more information on the other
 * options accepted by this function.
 *
 * @fontosdk importable
 */
export type TableElementsBasicOptions = {
	/**
	 * @remarks
	 * Configuration for the table element.
	 *
	 * @fontosdk
	 */
	table: {
		/**
		 * @remarks
		 * The name of the table element.
		 *
		 * @fontosdk
		 */
		localName: string;
		/**
		 * @remarks
		 * The namespace URI of the table element.
		 *
		 * @fontosdk
		 */
		namespaceURI?: string | null;
		/**
		 * @remarks
		 * Additional override for which basic table elements
		 * should be regarded. as tables. This can be used to
		 * configure conreffed tables as not being tables.
		 *
		 * @fontosdk
		 */
		tableFilterSelector?: XPathTest | XQExpression;
	};
	/**
	 * @remarks
	 * Configuration for the header row element.
	 *
	 * @fontosdk
	 */
	headerRow?: {
		/**
		 * @remarks
		 * The name of the header row element.
		 *
		 * @fontosdk
		 */
		localName?: string;
		/**
		 * @remarks
		 * The namespace URI of the header row element.
		 *
		 * @fontosdk
		 */
		namespaceURI?: string | null;
	};
	/**
	 * @remarks
	 *  Configuration for the whole row.
	 *
	 * @fontosdk
	 */
	row: {
		/**
		 * @remarks
		 * The name of the row element.
		 *
		 * @fontosdk
		 */
		localName: string;
		/**
		 * @remarks
		 * The namespace URI of the row element.
		 *
		 * @fontosdk
		 */
		namespaceURI?: string | null;
	};
	/**
	 * @remarks
	 * Configuration for the header cell element. This
	 * option is optional. If it is not set, the cell
	 * option will be used for headerCell.
	 *
	 * @fontosdk
	 */
	headerCell?: {
		/**
		 * @remarks
		 * The name of the header cell element.
		 *
		 * @fontosdk
		 */
		localName?: string;
		/**
		 * @remarks
		 * The namespace URI of the header cell.
		 *
		 * @fontosdk
		 */
		namespaceURI?: string | null;
		/**
		 * @remarks
		 *The default text container for the header cell
		 *                                                  element.
		 *
		 * @fontosdk
		 */
		defaultTextContainer?:
			| DefaultTextContainerConfiguration
			| string
			| null
			| undefined;
	};
	/**
	 * @remarks
	 * Configuration for the cell element.
	 *
	 * @fontosdk
	 */
	cell: {
		/**
		 * @remarks
		 * The name of the cell element.
		 *
		 * @fontosdk
		 */
		localName: string;
		/**
		 * @remarks
		 * The namespace URI of the cell element.
		 *
		 * @fontosdk
		 */
		namespaceURI?: string | null;
		/**
		 * @remarks
		 * The default text container for the cell element.
		 *
		 * @fontosdk
		 */
		defaultTextContainer?:
			| DefaultTextContainerConfiguration
			| string
			| null
			| undefined;
	};
};
