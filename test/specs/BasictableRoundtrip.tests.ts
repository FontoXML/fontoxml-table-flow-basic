import type Blueprint from 'fontoxml-blueprints/src/Blueprint';
import type { FontoElementNode, JsonMl } from 'fontoxml-dom-utils/src/types';
import xq from 'fontoxml-selectors/src/xq';
import { isTableGridModel } from 'fontoxml-table-flow/src/indexedTableGridModels';
import type TableGridModel from 'fontoxml-table-flow/src/TableGridModel/TableGridModel';
import type { TableElementsSharedOptions } from 'fontoxml-table-flow/src/types';
import BasicTableDefinition from 'fontoxml-table-flow-basic/src/table-definition/BasicTableDefinition';
import type { TableElementsBasicOptions } from 'fontoxml-table-flow-basic/src/types';
import { assertDocumentAsJsonMl } from 'fontoxml-unit-test-utils/src/unitTestAssertionHelpers';
import UnitTestEnvironment from 'fontoxml-unit-test-utils/src/UnitTestEnvironment';
import {
	findFirstNodeInDocument,
	runWithBlueprint,
} from 'fontoxml-unit-test-utils/src/unitTestSetupHelpers';

const optionsWithoutHeaderCell = {
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

describe('Basic tables: XML to XML roundtrip', () => {
	let environment: UnitTestEnvironment;
	beforeEach(() => {
		environment = new UnitTestEnvironment();
	});
	afterEach(() => {
		environment.destroy();
	});

	function runTest(
		jsonIn: JsonMl,
		jsonOut: JsonMl,
		mutateGridModel: (
			gridModel: TableGridModel,
			blueprint: Blueprint
		) => void = () => {
			// Do nothing
		},
		options: TableElementsBasicOptions & TableElementsSharedOptions
	): void {
		const documentId = environment.createDocumentFromJsonMl(jsonIn);
		const tableDefinition = new BasicTableDefinition(options);
		const tableNode = findFirstNodeInDocument(
			documentId,
			xq`//basictable`
		) as FontoElementNode;
		runWithBlueprint((blueprint, _, format) => {
			const gridModel = tableDefinition.buildTableGridModel(
				tableNode,
				blueprint
			);
			if (!isTableGridModel(gridModel)) {
				throw gridModel.error;
			}

			mutateGridModel(gridModel, blueprint);

			const success = tableDefinition.applyToDom(
				gridModel,
				tableNode,
				blueprint,
				format
			);
			chai.assert.isTrue(success);
		});

		assertDocumentAsJsonMl(documentId, jsonOut);
	}

	describe('Without changes', () => {
		it('can handle a 1x1 table, changing nothing', () => {
			const jsonIn: JsonMl = ['basictable', ['row', ['cell']]];

			const jsonOut: JsonMl = ['basictable', ['row', ['cell']]];

			runTest(jsonIn, jsonOut, undefined, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table, changing nothing', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const jsonOut: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, undefined, optionsWithoutHeaderCell);
		});
	});

	describe('Header rows', () => {
		it('can handle a 4x4 table, increasing the header row count by 1', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.increaseHeaderRowCount(1);

			const jsonOut: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 1 header row, increasing the header row count by 1', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.increaseHeaderRowCount(1);

			const jsonOut: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 2 header rows, decreasing the header row count by 1', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.decreaseHeaderRowCount();

			const jsonOut: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 1 header row, decreasing the header row count by 1', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.decreaseHeaderRowCount();

			const jsonOut: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});
	});

	describe('Header rows with header cells', () => {
		it('can handle a 4x4 table, increasing the header row count by 1', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.increaseHeaderRowCount(1);

			const jsonOut: JsonMl = [
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
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithHeaderCell);
		});

		it('can handle a 4x4 table with 1 header row, increasing the header row count by 1', () => {
			const jsonIn: JsonMl = [
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
			];

			const mutateGridModel = (gridModel) =>
				gridModel.increaseHeaderRowCount(1);

			const jsonOut: JsonMl = [
				'basictable',
				[
					'headerRow',
					['headerCell'],
					['headerCell'],
					['headerCell'],
					['headerCell'],
				],
				[
					'headerRow',
					['headerCell'],
					['headerCell'],
					['headerCell'],
					['headerCell'],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithHeaderCell);
		});

		it('can handle a 4x4 table with 2 header rows, decreasing the header row count by 1', () => {
			const jsonIn: JsonMl = [
				'basictable',
				[
					'headerRow',
					['headerCell'],
					['headerCell'],
					['headerCell'],
					['headerCell'],
				],
				[
					'headerRow',
					['headerCell'],
					['headerCell'],
					['headerCell'],
					['headerCell'],
				],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.decreaseHeaderRowCount();

			const jsonOut: JsonMl = [
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
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithHeaderCell);
		});

		it('can handle a 4x4 table with 1 header row, decreasing the header row count by 1', () => {
			const jsonIn: JsonMl = [
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
			];

			const mutateGridModel = (gridModel) =>
				gridModel.decreaseHeaderRowCount();

			const jsonOut: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithHeaderCell);
		});
	});

	describe('Insert row', () => {
		it('can handle a 4x4 table, inserting a row before index 0', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertRow(0, false);

			const jsonOut: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table, inserting a row before index 2', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertRow(2, false);

			const jsonOut: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table, inserting a row after index 3', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.insertRow(3, true);

			const jsonOut: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 1 header row, inserting a row before index 0', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertRow(0, false);

			const jsonOut: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 2 header rows, inserting a row after index 1', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertRow(1, false);

			const jsonOut: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});
	});

	describe('Delete row', () => {
		it('can handle a 4x4 table, deleting a row at index 0', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteRow(0);

			const jsonOut: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table, deleting a row at index 2', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteRow(2);

			const jsonOut: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table, deleting a row at index 3', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteRow(3);

			const jsonOut: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 1 header row, deleting a row at index 0', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteRow(0);

			const jsonOut: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 2 header rows, deleting a row at index 0', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteRow(0);

			const jsonOut: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 2 header rows, deleting a row at index 1', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteRow(1);

			const jsonOut: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});
	});

	describe('Insert row', () => {
		it('can handle a 4x4 table, adding 1 column before index 0', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertColumn(0, false);

			const jsonOut: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table, adding 1 column before index 2', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertColumn(2, false);

			const jsonOut: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table, adding 1 column after index 3', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertColumn(3, true);

			const jsonOut: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 1 header row, adding 1 column before index 0', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertColumn(0, false);

			const jsonOut: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 1 header row, adding 1 column before index 2', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertColumn(2, false);

			const jsonOut: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 1 header row, adding 1 column after index 3', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) =>
				gridModel.insertColumn(3, true);

			const jsonOut: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});
	});

	describe('Delete row', () => {
		it('can handle a 4x4 table, deleting 1 column before index 0', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteColumn(0);

			const jsonOut: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table, deleting 1 column before index 2', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteColumn(2);

			const jsonOut: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table, deleting 1 column after index 3', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteColumn(3);

			const jsonOut: JsonMl = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 1 header row, deleting 1 column before index 0', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteColumn(0);

			const jsonOut: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 1 header row, deleting 1 column before index 2', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteColumn(2);

			const jsonOut: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 1 header row, deleting 1 column after index 3', () => {
			const jsonIn: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
			];

			const mutateGridModel = (gridModel) => gridModel.deleteColumn(3);

			const jsonOut: JsonMl = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
			];

			runTest(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});
	});
});
