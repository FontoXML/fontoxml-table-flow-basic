import Blueprint from 'fontoxml-blueprints/src/Blueprint.js';
import CoreDocument from 'fontoxml-core/src/Document.js';
import jsonMLMapper from 'fontoxml-dom-utils/src/jsonMLMapper.js';
import * as slimdom from 'slimdom';

import BasicTableDefinition from 'fontoxml-table-flow-basic/src/table-definition/BasicTableDefinition.js';

const options = {
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

describe('Basic tables: XML to grid model', () => {
	let documentNode;
	let coreDocument;
	let blueprint;
	let basicTableDefinition;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		coreDocument = new CoreDocument(documentNode);

		blueprint = new Blueprint(coreDocument.dom);
		basicTableDefinition = new BasicTableDefinition(options);
	});

	describe('Basics', () => {
		it('can deserialize a 1x1 table', () => {
			coreDocument.dom.mutate(() =>
				jsonMLMapper.parse(['basictable', ['row', ['cell']]], documentNode)
			);

			const tableElement = documentNode.firstChild;
			const gridModel = basicTableDefinition.buildTableGridModel(tableElement, blueprint);
			chai.assert.isOk(gridModel);

			chai.assert.equal(gridModel.getHeight(), 1);
			chai.assert.equal(gridModel.getWidth(), 1);
			chai.assert.equal(gridModel.headerRowCount, 0);
		});

		it('can deserialize a 4x4 table', () => {
			coreDocument.dom.mutate(() =>
				jsonMLMapper.parse(
					[
						'basictable',
						['row', ['cell'], ['cell'], ['cell'], ['cell']],
						['row', ['cell'], ['cell'], ['cell'], ['cell']],
						['row', ['cell'], ['cell'], ['cell'], ['cell']],
						['row', ['cell'], ['cell'], ['cell'], ['cell']]
					],
					documentNode
				)
			);

			const tableElement = documentNode.firstChild;
			const gridModel = basicTableDefinition.buildTableGridModel(tableElement, blueprint);
			chai.assert.isOk(gridModel);

			chai.assert.equal(gridModel.getHeight(), 4);
			chai.assert.equal(gridModel.getWidth(), 4);
			chai.assert.equal(gridModel.headerRowCount, 0);
		});

		it('can deserialize a 4x4 table containing processing instructions and comments', () => {
			coreDocument.dom.mutate(() =>
				jsonMLMapper.parse(
					[
						'basictable',
						['row', ['cell'], ['cell'], ['cell'], ['cell']],
						[
							'row',
							['?someProcessingInstruction', 'someContent'],
							['cell'],
							['cell'],
							['cell'],
							['cell']
						],
						['row', ['cell'], ['cell'], ['!', 'some comment'], ['cell'], ['cell']],
						['row', ['cell'], ['cell'], ['cell'], ['cell']]
					],
					documentNode
				)
			);

			const tableElement = documentNode.firstChild;
			const gridModel = basicTableDefinition.buildTableGridModel(tableElement, blueprint);
			chai.assert.isOk(gridModel);

			chai.assert.equal(gridModel.getHeight(), 4);
			chai.assert.equal(gridModel.getWidth(), 4);
			chai.assert.equal(gridModel.headerRowCount, 0);
		});
	});

	describe('Headers', () => {
		it('can deserialize a 4x4 table with 1 header row', () => {
			coreDocument.dom.mutate(() =>
				jsonMLMapper.parse(
					[
						'basictable',
						['head', ['cell'], ['cell'], ['cell'], ['cell']],
						['row', ['cell'], ['cell'], ['cell'], ['cell']],
						['row', ['cell'], ['cell'], ['cell'], ['cell']],
						['row', ['cell'], ['cell'], ['cell'], ['cell']]
					],
					documentNode
				)
			);

			const tableElement = documentNode.firstChild;
			const gridModel = basicTableDefinition.buildTableGridModel(tableElement, blueprint);
			chai.assert.isOk(gridModel);

			chai.assert.equal(gridModel.getHeight(), 4);
			chai.assert.equal(gridModel.getWidth(), 4);
			chai.assert.equal(gridModel.headerRowCount, 1);
		});

		it('can deserialize a 4x4 table with 2 header rows', () => {
			coreDocument.dom.mutate(() =>
				jsonMLMapper.parse(
					[
						'basictable',
						['head', ['cell'], ['cell'], ['cell'], ['cell']],
						['head', ['cell'], ['cell'], ['cell'], ['cell']],
						['row', ['cell'], ['cell'], ['cell'], ['cell']],
						['row', ['cell'], ['cell'], ['cell'], ['cell']]
					],
					documentNode
				)
			);

			const tableElement = documentNode.firstChild;
			const gridModel = basicTableDefinition.buildTableGridModel(tableElement, blueprint);
			chai.assert.isOk(gridModel);

			chai.assert.equal(gridModel.getHeight(), 4);
			chai.assert.equal(gridModel.getWidth(), 4);
			chai.assert.equal(gridModel.headerRowCount, 2);
		});
	});

	describe('Header rows and header cells', () => {
		beforeEach(() => {
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

			documentNode = new slimdom.Document();
			coreDocument = new CoreDocument(documentNode);

			blueprint = new Blueprint(coreDocument.dom);
			basicTableDefinition = new BasicTableDefinition(optionsWithHeaderCell);
		});

		it('can deserialize a 4x4 table with 1 header row', () => {
			coreDocument.dom.mutate(() =>
				jsonMLMapper.parse(
					[
						'basictable',
						[
							'headerRow',
							['headerCell'],
							['headerCell'],
							['headerCell'],
							['headerCell']
						],
						['row', ['cell'], ['cell'], ['cell'], ['cell']],
						['row', ['cell'], ['cell'], ['cell'], ['cell']],
						['row', ['cell'], ['cell'], ['cell'], ['cell']]
					],
					documentNode
				)
			);

			const tableElement = documentNode.firstChild;
			const gridModel = basicTableDefinition.buildTableGridModel(tableElement, blueprint);
			chai.assert.isOk(gridModel);

			chai.assert.equal(gridModel.getHeight(), 4);
			chai.assert.equal(gridModel.getWidth(), 4);
			chai.assert.equal(gridModel.headerRowCount, 1);
		});

		it('can deserialize a 4x4 table with 2 header rows', () => {
			coreDocument.dom.mutate(() =>
				jsonMLMapper.parse(
					[
						'basictable',
						[
							'headerRow',
							['headerCell'],
							['headerCell'],
							['headerCell'],
							['headerCell']
						],
						[
							'headerRow',
							['headerCell'],
							['headerCell'],
							['headerCell'],
							['headerCell']
						],
						['row', ['cell'], ['cell'], ['cell'], ['cell']],
						['row', ['cell'], ['cell'], ['cell'], ['cell']]
					],
					documentNode
				)
			);

			const tableElement = documentNode.firstChild;
			const gridModel = basicTableDefinition.buildTableGridModel(tableElement, blueprint);
			chai.assert.isOk(gridModel);

			chai.assert.equal(gridModel.getHeight(), 4);
			chai.assert.equal(gridModel.getWidth(), 4);
			chai.assert.equal(gridModel.headerRowCount, 2);
		});
	});
});
