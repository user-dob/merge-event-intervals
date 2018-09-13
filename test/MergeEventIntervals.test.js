import { expect } from 'chai';
import moment from  'moment';
import { MergeEventIntervals } from '../src';

const i = (() => {
	const now = moment();
	const map = new Map()
	const n = m => {
		if (!map.has(m)) {
			map.set(m, now.clone().add(m, 'm'));
		}
		return map.get(m);
	};

	return (start, end, zIndex = 0) => ({start: n(start), end: n(end), zIndex});
})();

describe('MergeEventIntervals', () => {

	it('MergeEventIntervals sort', () => {
		const events = new MergeEventIntervals();
		let items, sortItems;

		items = [i(0, 10), i(20, 30)]
		sortItems = events.sort(items);

		expect(sortItems[0]).to.eql(items[0]);
		expect(sortItems[1]).to.eql(items[1]);

		items = [i(20, 30), i(0, 10)]
		sortItems = events.sort(items);

		expect(sortItems[0]).to.eql(items[1]);
		expect(sortItems[1]).to.eql(items[0]);
	})

	it('MergeEventIntervals isIntersection', () => {
		const events = new MergeEventIntervals();
		let isIntersection;

		isIntersection = events.isIntersection(i(0, 1), i(2, 3));
		expect(isIntersection).to.be.false;

		isIntersection = events.isIntersection(i(20, 30), i(0, 10));
		expect(isIntersection).to.be.false;

		isIntersection = events.isIntersection(i(0, 10), i(5, 15));
		expect(isIntersection).to.be.true;

		isIntersection = events.isIntersection(i(0, 10), i(10, 15));
		expect(isIntersection).to.be.true;

		isIntersection = events.isIntersection(i(0, 10), i(2, 5));
		expect(isIntersection).to.be.true;
	})

	it('MergeEventIntervals union', () => {
		const events = new MergeEventIntervals();
		let items, unionItems;

		items = [i(0, 10)];
		unionItems = [i(0, 10)];
		expect(events.union(items)).to.eql(unionItems);

		items = [i(0, 10), i(5, 10)];
		unionItems = [i(0, 10)];
		expect(events.union(items)).to.eql(unionItems);

		items = [i(0, 10), i(5, 20)];
		unionItems = [i(0, 20)];
		expect(events.union(items)).to.eql(unionItems);

		items = [i(0, 10), i(20, 40)];
		unionItems = [i(0, 10), i(20, 40)];
		expect(events.union(items)).to.eql(unionItems);

		items = [i(0, 10), i(10, 20)];
		unionItems = [i(0, 20)];
		expect(events.union(items)).to.eql(unionItems);
	})

	it('MergeEventIntervals merge', () => {
		const events = new MergeEventIntervals();
		expect(events.merge()).to.eql([]);
	})


})