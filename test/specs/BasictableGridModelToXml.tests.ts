import type {
	FontoDocumentNode,
	FontoElementNode,
	JsonMl,
} from 'fontoxml-dom-utils/src/types';
import xq from 'fontoxml-selectors/src/xq';
import type { TableElementsSharedOptions } from 'fontoxml-table-flow/src/types';
import BasicTableDefinition from 'fontoxml-table-flow-basic/src/table-definition/BasicTableDefinition';
import type { TableElementsBasicOptions } from 'fontoxml-table-flow-basic/src/types';
import { assertDocumentAsJsonMl } from 'fontoxml-unit-test-utils/src/unitTestAssertionHelpers';
import UnitTestEnvironment from 'fontoxml-unit-test-utils/src/UnitTestEnvironment';
import {
	findFirstNodeInDocument,
	runWithBlueprint,
} from 'fontoxml-unit-test-utils/src/unitTestSetupHelpers';

const options = {
	table: {
		localName: 'basictable',
		namespaceURI: null,
		tableFilterSelector: '',
	},
	headerRow: {
		localName: 'head',
		namespaceURI: null,
	},
	row: {
		localName: 'row',
		namespaceURI: null,
	},
	cell: {
		localName: 'cell',
		namespaceURI: null,
	},
};

describe('Basic tables: Grid model to XML', () => {
	let environment: UnitTestEnvironment;
	beforeEach(() => {
		environment = new UnitTestEnvironment();
	});
	afterEach(() => {
		environment.destroy();
	});

	function runTest(
		numberOfRows: number,
		numberOfColumns: number,
		hasHeader: boolean,
		options: TableElementsBasicOptions & TableElementsSharedOptions,
		expected: JsonMl
	): void {
		const documentId = environment.createDocumentFromJsonMl(['basictable']);
		const documentNode = findFirstNodeInDocument(
			documentId,
			xq`self::node()`
		) as FontoDocumentNode;
		const tableDefinition = new BasicTableDefinition(options);
		const tableNode = findFirstNodeInDocument(
			documentId,
			xq`/basictable`
		) as FontoElementNode;
		runWithBlueprint((blueprint, _, format) => {
			const tableGridModel = tableDefinition.getTableGridModelBuilder()(
				numberOfRows,
				numberOfColumns,
				hasHeader,
				documentNode
			);
			chai.assert.isTrue(
				tableDefinition.applyToDom(
					tableGridModel,
					tableNode,
					blueprint,
					format
				)
			);
		});
		assertDocumentAsJsonMl(documentId, expected);
	}

	describe('Basics', () => {
		it('can serialize a 1x1 table', () => {
			runTest(1, 1, false, options, ['basictable', ['row', ['cell']]]);
		});

		it('can serialize a 4x4 table', () => {
			runTest(4, 4, false, options, [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			]);
		});
	});

	describe('Headers', () => {
		it('can serialize a 4x4 table', () => {
			runTest(4, 4, true, options, [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			]);
		});
	});

	describe('Header rows and header cells', () => {
		const optionsWithHeaderCell = {
			table: {
				localName: 'basictable',
				namespaceURI: null,
				tableFilterSelector: '',
			},
			headerRow: {
				localName: 'headerRow',
				namespaceURI: null,
			},
			row: {
				localName: 'row',
				namespaceURI: null,
			},
			headerCell: {
				localName: 'headerCell',
				namespaceURI: null,
			},
			cell: {
				localName: 'cell',
				namespaceURI: null,
			},
		};

		it('can serialize a 4x4 table', () => {
			runTest(4, 4, true, optionsWithHeaderCell, [
				'basictable',
				[
					'headerRow',
					['headerCell'],
					['headerCell'],
					['headerCell'],
					['headerCell'],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			]);
		});
	});
});
