import Blueprint from 'fontoxml-blueprints/src/Blueprint.js';
import CoreDocument from 'fontoxml-core/src/Document.js';
import jsonMLMapper from 'fontoxml-dom-utils/src/jsonMLMapper.js';
import indicesManager from 'fontoxml-indices/src/indicesManager.js';
import * as slimdom from 'slimdom';

import BasicTableDefinition from 'fontoxml-table-flow-basic/src/table-definition/BasicTableDefinition.js';

const stubFormat = {
	synthesizer: {
		completeStructure: () => true
	},
	metadata: {
		get: (_option, _node) => false
	},
	validator: {
		canContain: () => true,
		validateDown: () => []
	}
};

const optionsWithoutHeaderCell = {
	table: {
		localName: 'basictable',
		namespaceURI: null,
		tableFilterSelector: ''
	},
	headerRow: {
		localName: 'head',
		namespaceURI: null
	},
	row: {
		localName: 'row',
		namespaceURI: null
	},
	cell: {
		localName: 'cell',
		namespaceURI: null
	}
};

const optionsWithHeaderCell = {
	table: {
		localName: 'basictable',
		namespaceURI: null,
		tableFilterSelector: ''
	},
	headerRow: {
		localName: 'headerRow',
		namespaceURI: null
	},
	row: {
		localName: 'row',
		namespaceURI: null
	},
	headerCell: {
		localName: 'headerCell',
		namespaceURI: null
	},
	cell: {
		localName: 'cell',
		namespaceURI: null
	}
};

describe('Basic tables: XML to XML roundtrip', () => {
	let documentNode;
	let coreDocument;
	let blueprint;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		coreDocument = new CoreDocument(documentNode);

		blueprint = new Blueprint(coreDocument.dom);
	});

	function transformTable(jsonIn, jsonOut, mutateGridModel = () => {}, options) {
		coreDocument.dom.mutate(() => jsonMLMapper.parse(jsonIn, documentNode));

		const tableDefinition = new BasicTableDefinition(options);
		const tableNode = documentNode.firstChild;
		const gridModel = tableDefinition.buildTableGridModel(tableNode, blueprint);
		chai.assert.isOk(gridModel);

		mutateGridModel(gridModel);

		const success = tableDefinition.applyToDom(gridModel, tableNode, blueprint, stubFormat);
		chai.assert.isTrue(success);

		blueprint.realize();
		// The changes will be set to merge with the base index, this needs to be commited.
		indicesManager.getIndexSet().commitMerge();
		chai.assert.deepEqual(jsonMLMapper.serialize(documentNode.firstChild), jsonOut);
	}

	describe('Without changes', () => {
		it('can handle a 1x1 table, changing nothing', () => {
			const jsonIn = ['basictable', ['row', ['cell']]];

			const jsonOut = ['basictable', ['row', ['cell']]];

			transformTable(jsonIn, jsonOut, undefined, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table, changing nothing', () => {
			const jsonIn = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const jsonOut = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, undefined, optionsWithoutHeaderCell);
		});
	});

	describe('Header rows', () => {
		it('can handle a 4x4 table, increasing the header row count by 1', () => {
			const jsonIn = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.increaseHeaderRowCount(1);

			const jsonOut = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 1 header row, increasing the header row count by 1', () => {
			const jsonIn = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.increaseHeaderRowCount(1);

			const jsonOut = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 2 header rows, decreasing the header row count by 1', () => {
			const jsonIn = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.decreaseHeaderRowCount();

			const jsonOut = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 1 header row, decreasing the header row count by 1', () => {
			const jsonIn = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.decreaseHeaderRowCount();

			const jsonOut = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});
	});

	describe('Header rows with header cells', () => {
		it('can handle a 4x4 table, increasing the header row count by 1', () => {
			const jsonIn = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.increaseHeaderRowCount(1);

			const jsonOut = [
				'basictable',
				['headerRow', ['headerCell'], ['headerCell'], ['headerCell'], ['headerCell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithHeaderCell);
		});

		it('can handle a 4x4 table with 1 header row, increasing the header row count by 1', () => {
			const jsonIn = [
				'basictable',
				['headerRow', ['headerCell'], ['headerCell'], ['headerCell'], ['headerCell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.increaseHeaderRowCount(1);

			const jsonOut = [
				'basictable',
				['headerRow', ['headerCell'], ['headerCell'], ['headerCell'], ['headerCell']],
				['headerRow', ['headerCell'], ['headerCell'], ['headerCell'], ['headerCell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithHeaderCell);
		});

		it('can handle a 4x4 table with 2 header rows, decreasing the header row count by 1', () => {
			const jsonIn = [
				'basictable',
				['headerRow', ['headerCell'], ['headerCell'], ['headerCell'], ['headerCell']],
				['headerRow', ['headerCell'], ['headerCell'], ['headerCell'], ['headerCell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.decreaseHeaderRowCount();

			const jsonOut = [
				'basictable',
				['headerRow', ['headerCell'], ['headerCell'], ['headerCell'], ['headerCell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithHeaderCell);
		});

		it('can handle a 4x4 table with 1 header row, decreasing the header row count by 1', () => {
			const jsonIn = [
				'basictable',
				['headerRow', ['headerCell'], ['headerCell'], ['headerCell'], ['headerCell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.decreaseHeaderRowCount();

			const jsonOut = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithHeaderCell);
		});
	});

	describe('Insert row', () => {
		it('can handle a 4x4 table, inserting a row before index 0', () => {
			const jsonIn = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.insertRow(0, false);

			const jsonOut = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table, inserting a row before index 2', () => {
			const jsonIn = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.insertRow(2, false);

			const jsonOut = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table, inserting a row after index 3', () => {
			const jsonIn = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.insertRow(3, true);

			const jsonOut = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 1 header row, inserting a row before index 0', () => {
			const jsonIn = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.insertRow(0, false);

			const jsonOut = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 2 header rows, inserting a row after index 1', () => {
			const jsonIn = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.insertRow(1, false);

			const jsonOut = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});
	});

	describe('Delete row', () => {
		it('can handle a 4x4 table, deleting a row at index 0', () => {
			const jsonIn = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.deleteRow(0);

			const jsonOut = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table, deleting a row at index 2', () => {
			const jsonIn = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.deleteRow(2);

			const jsonOut = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table, deleting a row at index 3', () => {
			const jsonIn = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.deleteRow(3);

			const jsonOut = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 1 header row, deleting a row at index 0', () => {
			const jsonIn = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.deleteRow(0);

			const jsonOut = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 2 header rows, deleting a row at index 0', () => {
			const jsonIn = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.deleteRow(0);

			const jsonOut = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 2 header rows, deleting a row at index 1', () => {
			const jsonIn = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.deleteRow(1);

			const jsonOut = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});
	});

	describe('Insert row', () => {
		it('can handle a 4x4 table, adding 1 column before index 0', () => {
			const jsonIn = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.insertColumn(0, false);

			const jsonOut = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table, adding 1 column before index 2', () => {
			const jsonIn = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.insertColumn(2, false);

			const jsonOut = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table, adding 1 column after index 3', () => {
			const jsonIn = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.insertColumn(3, true);

			const jsonOut = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 1 header row, adding 1 column before index 0', () => {
			const jsonIn = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.insertColumn(0, false);

			const jsonOut = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 1 header row, adding 1 column before index 2', () => {
			const jsonIn = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.insertColumn(2, false);

			const jsonOut = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 1 header row, adding 1 column after index 3', () => {
			const jsonIn = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.insertColumn(3, true);

			const jsonOut = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});
	});

	describe('Delete row', () => {
		it('can handle a 4x4 table, deleting 1 column before index 0', () => {
			const jsonIn = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.deleteColumn(0);

			const jsonOut = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table, deleting 1 column before index 2', () => {
			const jsonIn = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.deleteColumn(2);

			const jsonOut = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table, deleting 1 column after index 3', () => {
			const jsonIn = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.deleteColumn(3);

			const jsonOut = [
				'basictable',
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 1 header row, deleting 1 column before index 0', () => {
			const jsonIn = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.deleteColumn(0);

			const jsonOut = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 1 header row, deleting 1 column before index 2', () => {
			const jsonIn = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.deleteColumn(2);

			const jsonOut = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});

		it('can handle a 4x4 table with 1 header row, deleting 1 column after index 3', () => {
			const jsonIn = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell'], ['cell']]
			];

			const mutateGridModel = gridModel => gridModel.deleteColumn(3);

			const jsonOut = [
				'basictable',
				['head', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']],
				['row', ['cell'], ['cell'], ['cell']]
			];

			transformTable(jsonIn, jsonOut, mutateGridModel, optionsWithoutHeaderCell);
		});
	});
});
