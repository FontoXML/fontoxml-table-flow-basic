import * as slimdom from 'slimdom';

import Blueprint from 'fontoxml-blueprints/src/Blueprint';
import CoreDocument from 'fontoxml-core/src/Document';
import jsonMLMapper from 'fontoxml-dom-utils/src/jsonMLMapper';
import indicesManager from 'fontoxml-indices/src/indicesManager';
import BasicTableDefinition from 'fontoxml-table-flow-basic/src/table-definition/BasicTableDefinition';

const stubFormat = {
	synthesizer: {
		completeStructure: () => true,
	},
	metadata: {
		get: (_option, _node) => false,
	},
	validator: {
		canContain: () => true,
	},
};

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
	let blueprint;
	let coreDocument;
	let createTable;
	let documentNode;
	let tableDefinition;
	let tableNode;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		coreDocument = new CoreDocument(documentNode, null);
		blueprint = new Blueprint(coreDocument.dom);

		tableNode = documentNode.createElement('basictable');

		tableDefinition = new BasicTableDefinition(options);
		createTable = tableDefinition.getTableGridModelBuilder();

		coreDocument.dom.mutate(() => {
			documentNode.appendChild(tableNode);
		});
	});

	describe('Basics', () => {
		it('can serialize a 1x1 table', () => {
			const tableGridModel = createTable(1, 1, false, documentNode);
			chai.assert.isTrue(
				tableDefinition.applyToDom(
					tableGridModel,
					documentNode.firstChild,
					blueprint,
					stubFormat
				)
			);

			blueprint.realize();
			// The changes will be set to merge with the base index, this needs to be commited.
			indicesManager.getIndexSet().commitMerge();

			chai.assert.deepEqual(
				jsonMLMapper.serialize(documentNode.firstChild),
				['basictable', ['row', ['cell']]]
			);
		});

		it('can serialize a 4x4 table', () => {
			const tableGridModel = createTable(4, 4, false, documentNode);
			chai.assert.isTrue(
				tableDefinition.applyToDom(
					tableGridModel,
					documentNode.firstChild,
					blueprint,
					stubFormat
				)
			);

			blueprint.realize();
			// The changes will be set to merge with the base index, this needs to be commited.
			indicesManager.getIndexSet().commitMerge();

			chai.assert.deepEqual(
				jsonMLMapper.serialize(documentNode.firstChild),
				[
					'basictable',
					['row', ['cell'], ['cell'], ['cell'], ['cell']],
					['row', ['cell'], ['cell'], ['cell'], ['cell']],
					['row', ['cell'], ['cell'], ['cell'], ['cell']],
					['row', ['cell'], ['cell'], ['cell'], ['cell']],
				]
			);
		});
	});

	describe('Headers', () => {
		it('can serialize a 4x4 table', () => {
			const tableGridModel = createTable(4, 4, true, documentNode);
			chai.assert.isTrue(
				tableDefinition.applyToDom(
					tableGridModel,
					documentNode.firstChild,
					blueprint,
					stubFormat
				)
			);

			blueprint.realize();
			// The changes will be set to merge with the base index, this needs to be commited.
			indicesManager.getIndexSet().commitMerge();

			chai.assert.deepEqual(
				jsonMLMapper.serialize(documentNode.firstChild),
				[
					'basictable',
					['head', ['cell'], ['cell'], ['cell'], ['cell']],
					['row', ['cell'], ['cell'], ['cell'], ['cell']],
					['row', ['cell'], ['cell'], ['cell'], ['cell']],
					['row', ['cell'], ['cell'], ['cell'], ['cell']],
				]
			);
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

		beforeEach(() => {
			documentNode = new slimdom.Document();
			coreDocument = new CoreDocument(documentNode, null);
			blueprint = new Blueprint(coreDocument.dom);

			tableNode = documentNode.createElement('basictable');

			tableDefinition = new BasicTableDefinition(optionsWithHeaderCell);
			createTable = tableDefinition.getTableGridModelBuilder();

			coreDocument.dom.mutate(() => {
				documentNode.appendChild(tableNode);
			});
		});

		it('can serialize a 4x4 table', () => {
			const tableGridModel = createTable(4, 4, true, documentNode);
			chai.assert.isTrue(
				tableDefinition.applyToDom(
					tableGridModel,
					documentNode.firstChild,
					blueprint,
					stubFormat
				)
			);

			blueprint.realize();
			// The changes will be set to merge with the base index, this needs to be commited.
			indicesManager.getIndexSet().commitMerge();

			chai.assert.deepEqual(
				jsonMLMapper.serialize(documentNode.firstChild),
				[
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
				]
			);
		});
	});
});
