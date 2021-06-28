import readOnlyBlueprint from 'fontoxml-blueprints/src/readOnlyBlueprint';
import * as slimdom from 'slimdom';
import BasicTableDefinition from 'fontoxml-table-flow-basic/src/table-definition/BasicTableDefinition';

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

describe('BasicTableDefinition', () => {
	let documentNode;
	let tableNode;
	let rowNode;
	let cellNode;
	let basicTableDefinition;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		tableNode = documentNode.createElement('basictable');
		documentNode.appendChild(tableNode);
		rowNode = documentNode.createElement('row');
		tableNode.appendChild(rowNode);
		cellNode = documentNode.createElement('cell');
		rowNode.appendChild(cellNode);
		basicTableDefinition = new BasicTableDefinition(options);
	});

	describe('basicTableDefinition()', () => {
		it('can be initialized', () => {});
	});

	describe('isTable()', () => {
		it('can recognize a table element', () =>
			chai.assert.isTrue(
				basicTableDefinition.isTable(tableNode, readOnlyBlueprint)
			));
	});

	describe('isTableCell()', () => {
		it('can recoginize a cell element', () =>
			chai.assert.isTrue(
				basicTableDefinition.isTableCell(cellNode, readOnlyBlueprint)
			));
	});

	describe('isTablePart()', () => {
		it('can recognize a table part element', () =>
			chai.assert.isTrue(
				basicTableDefinition.isTablePart(rowNode, readOnlyBlueprint)
			));
	});
});
