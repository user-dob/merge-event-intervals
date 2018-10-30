import {expect} from 'chai';
import moment from 'moment';
import {MergeEventIntervals} from '../src';

const i = (() => {
	const now = moment('2000-01-01');
	const map = new Map()
	const n = m => {
		if (!map.has(m)) {
			map.set(m, now.clone().add(m, 'm'));
		}
		return map.get(m);
	};

	return (start, end, zIndex = 0) => ({start: n(start), end: n(end), zIndex});
})();

const expectIntervals = (left, right, message) => {
	const leftValue = left.map(item => [item.start.minute(), item.end.minute(), item.zIndex]);
	const rightValue = right.map(item => [item.start.minute(), item.end.minute(), item.zIndex]);

	expect(leftValue).to.eql(rightValue, message || `[(${leftValue.join('),(')})] !== [(${rightValue.join('),(')})]`);
}

describe('MergeEventIntervals', () => {

	let mergeEventIntervals;

	beforeEach(() => {
		mergeEventIntervals = new MergeEventIntervals();
	})

	it('sort', () => {
		let items, expectItems;

		items = [i(0, 10), i(20, 30)];
		expectItems = [i(0, 10), i(20, 30)];
		expectIntervals(expectItems, mergeEventIntervals.sort(items));

		items = [i(20, 30), i(0, 10)];
		expectItems = [i(0, 10), i(20, 30)];
		expectIntervals(expectItems, mergeEventIntervals.sort(items));
	})

	it('isIntersection', () => {
		let isIntersection;

		isIntersection = mergeEventIntervals.isIntersection(i(0, 1), i(2, 3));
		expect(isIntersection).to.be.false;

		isIntersection = mergeEventIntervals.isIntersection(i(20, 30), i(0, 10));
		expect(isIntersection).to.be.false;

		isIntersection = mergeEventIntervals.isIntersection(i(0, 10), i(5, 15));
		expect(isIntersection).to.be.true;

		isIntersection = mergeEventIntervals.isIntersection(i(0, 10), i(10, 15));
		expect(isIntersection).to.be.false;

		isIntersection = mergeEventIntervals.isIntersection(i(0, 10), i(2, 5));
		expect(isIntersection).to.be.true;
	})

	it('unionWithBorders', () => {
		let items, expectItems;

		items = [i(0, 10)];
		expectItems = [i(0, 10)];
		expectIntervals(expectItems, mergeEventIntervals.unionWithBorders(items));

		items = [i(0, 10), i(5, 10)];
		expectItems = [i(0, 10)];
		expectIntervals(expectItems, mergeEventIntervals.unionWithBorders(items));

		items = [i(0, 10), i(5, 20)];
		expectItems = [i(0, 20)];
		expectIntervals(expectItems, mergeEventIntervals.unionWithBorders(items));

		items = [i(0, 10), i(20, 40)];
		expectItems = [i(0, 10), i(20, 40)];
		expectIntervals(expectItems, mergeEventIntervals.unionWithBorders(items));

		items = [i(0, 10), i(10, 20)];
		expectItems = [i(0, 10), i(10, 20)];
		expectIntervals(expectItems, mergeEventIntervals.unionWithBorders(items));
	})

	it('union', () => {
		let items, expectItems;

		items = [i(0, 10)];
		expectItems = [i(0, 10)];
		expectIntervals(expectItems, mergeEventIntervals.union(items));

		items = [i(0, 10), i(5, 10)];
		expectItems = [i(0, 10)];
		expectIntervals(expectItems, mergeEventIntervals.union(items));

		items = [i(0, 10), i(5, 20)];
		expectItems = [i(0, 20)];
		expectIntervals(expectItems, mergeEventIntervals.union(items));

		items = [i(0, 10), i(20, 40)];
		expectItems = [i(0, 10), i(20, 40)];
		expectIntervals(expectItems, mergeEventIntervals.union(items));

		items = [i(0, 10), i(10, 20)];
		expectItems = [i(0, 20)];
		expectIntervals(expectItems, mergeEventIntervals.union(items));
	})

	it('mergeTwoEvents', () => {
		const zIndex0 = 0;
		const zIndex1 = 1;
		let items, expectItems;

		// -----
		//        -----
		items = [i(0, 10, zIndex0), i(20, 30, zIndex0)];
		expectItems = [i(0, 10, zIndex0), i(20, 30, zIndex0)];
		expectIntervals(expectItems, mergeEventIntervals.mergeTwoEvents(...items));

		// -----
		//      -----
		items = [i(0, 10, zIndex0), i(10, 20, zIndex0)];
		expectItems = [i(0, 10, zIndex0), i(10, 20, zIndex0)];
		expectIntervals(expectItems, mergeEventIntervals.mergeTwoEvents(...items));

		items = [i(10, 20, zIndex0), i(0, 10, zIndex0)];
		expectItems = [i(0, 10, zIndex0), i(10, 20, zIndex0)];
		expectIntervals(expectItems, mergeEventIntervals.mergeTwoEvents(...items));

		items = [i(0, 10, zIndex0), i(10, 20, zIndex1)];
		expectItems = [i(0, 10, zIndex0), i(10, 20, zIndex1)];
		expectIntervals(expectItems, mergeEventIntervals.mergeTwoEvents(...items));

		// -------
		// ----------
		items = [i(0, 10, zIndex0), i(0, 20, zIndex0)];
		expectItems = [i(0, 20, zIndex0)];
		expectIntervals(expectItems, mergeEventIntervals.mergeTwoEvents(...items));

		items = [i(0, 10, zIndex1), i(0, 20, zIndex0)];
		expectItems = [i(0, 10, zIndex1), i(10, 20, zIndex0)];
		expectIntervals(expectItems, mergeEventIntervals.mergeTwoEvents(...items));

		// -------
		//      -------
		items = [i(0, 20, zIndex0), i(10, 30, zIndex0)];
		expectItems = [i(0, 30, zIndex0)];
		expectIntervals(expectItems, mergeEventIntervals.mergeTwoEvents(...items));

		items = [i(0, 20, zIndex1), i(10, 30, zIndex0)];
		expectItems = [i(0, 20, zIndex1), i(20, 30, zIndex0)];
		expectIntervals(expectItems, mergeEventIntervals.mergeTwoEvents(...items));

		items = [i(0, 20, zIndex0), i(10, 30, zIndex1)];
		expectItems = [i(0, 10, zIndex0), i(10, 30, zIndex1)];
		expectIntervals(expectItems, mergeEventIntervals.mergeTwoEvents(...items));

		// -------
		// -------
		items = [i(0, 10, zIndex0), i(0, 10, zIndex0)];
		expectItems = [i(0, 10, zIndex0)];
		expectIntervals(expectItems, mergeEventIntervals.mergeTwoEvents(...items));

		items = [i(0, 10, zIndex1), i(0, 10, zIndex0)];
		expectItems = [i(0, 10, zIndex1)];
		expectIntervals(expectItems, mergeEventIntervals.mergeTwoEvents(...items));

		// ----------
		// -----
		items = [i(0, 20, zIndex0), i(0, 10, zIndex0)];
		expectItems = [i(0, 20, zIndex0)];
		expectIntervals(expectItems, mergeEventIntervals.mergeTwoEvents(...items));

		items = [i(0, 20, zIndex1), i(0, 10, zIndex0)];
		expectItems = [i(0, 20, zIndex1)];
		expectIntervals(expectItems, mergeEventIntervals.mergeTwoEvents(...items));

		items = [i(0, 20, zIndex0), i(0, 10, zIndex1)];
		expectItems = [i(0, 10, zIndex1), i(10, 20, zIndex0)];
		expectIntervals(expectItems, mergeEventIntervals.mergeTwoEvents(...items));

		// ----------
		//      -----
		items = [i(0, 20, zIndex0), i(10, 20, zIndex0)];
		expectItems = [i(0, 20, zIndex0)];
		expectIntervals(expectItems, mergeEventIntervals.mergeTwoEvents(...items));

		items = [i(0, 20, zIndex1), i(10, 20, zIndex0)];
		expectItems = [i(0, 20, zIndex1)];
		expectIntervals(expectItems, mergeEventIntervals.mergeTwoEvents(...items));

		items = [i(0, 20, zIndex0), i(10, 20, zIndex1)];
		expectItems = [i(0, 10, zIndex0), i(10, 20, zIndex1)];
		expectIntervals(expectItems, mergeEventIntervals.mergeTwoEvents(...items));

		// ----------
		//    -----
		items = [i(0, 30, zIndex0), i(10, 20, zIndex0)];
		expectItems = [i(0, 30, zIndex0)];
		expectIntervals(expectItems, mergeEventIntervals.mergeTwoEvents(...items));

		items = [i(0, 30, zIndex1), i(10, 20, zIndex0)];
		expectItems = [i(0, 30, zIndex1)];
		expectIntervals(expectItems, mergeEventIntervals.mergeTwoEvents(...items));

		items = [i(0, 30, zIndex0), i(10, 20, zIndex1)];
		expectItems = [i(0, 10, zIndex0), i(10, 20, zIndex1), i(20, 30, zIndex0)];
		expectIntervals(expectItems, mergeEventIntervals.mergeTwoEvents(...items));
	})

	it('merge', () => {
		const events = new MergeEventIntervals();
		const zIndex0 = 0;
		const zIndex1 = 1;
		const zIndex2 = 2;
		let items, expectItems;

		items = [];
		expectItems = [];
		expectIntervals(expectItems, mergeEventIntervals.merge(items));

		items = [i(0, 10, zIndex0)];
		expectItems = [i(0, 10, zIndex0)];
		expectIntervals(expectItems, mergeEventIntervals.merge(items));

		items = [i(0, 10, zIndex0), i(20, 30, zIndex0)];
		expectItems = [i(0, 10, zIndex0), i(20, 30, zIndex0)];
		expectIntervals(expectItems, mergeEventIntervals.merge(items));

		items = [i(0, 10, zIndex0), i(20, 30, zIndex1)];
		expectItems = [i(0, 10, zIndex0), i(20, 30, zIndex1)];
		expectIntervals(expectItems, mergeEventIntervals.merge(items));

		items = [i(0, 30, zIndex0), i(10, 20, zIndex0)];
		expectItems = [i(0, 30, zIndex0)];
		expectIntervals(expectItems, mergeEventIntervals.merge(items));

		items = [i(0, 10, zIndex0), i(10, 20, zIndex0)];
		expectItems = [i(0, 10, zIndex0), i(10, 20, zIndex0)];
		expectIntervals(expectItems, mergeEventIntervals.merge(items));

		items = [i(0, 30, zIndex0), i(10, 20, zIndex1)];
		expectItems = [i(0, 10, zIndex0), i(10, 20, zIndex1), i(20, 30, zIndex0)];
		expectIntervals(expectItems, mergeEventIntervals.merge(items));

		items = [i(0, 30, zIndex0), i(10, 20, zIndex1)];
		expectItems = [i(0, 10, zIndex0), i(10, 20, zIndex1), i(20, 30, zIndex0)];
		expectIntervals(expectItems, mergeEventIntervals.merge(items));

		items = [i(0, 30, zIndex0), i(10, 20, zIndex1), i(10, 15, zIndex0)];
		expectItems = [i(0, 10, zIndex0), i(10, 20, zIndex1), i(20, 30, zIndex0)];
		expectIntervals(expectItems, mergeEventIntervals.merge(items));

		items = [i(0, 60, zIndex0), i(10, 40, zIndex1), i(30, 50, zIndex2)];
		expectItems = [i(0, 10, zIndex0), i(10, 30, zIndex1), i(30, 50, zIndex2), i(50, 60, zIndex0)];
		expectIntervals(expectItems, mergeEventIntervals.merge(items));

		items = [i(0, 60, zIndex0), i(10, 20, zIndex1), i(30, 50, zIndex1), i(35, 45, zIndex2)];
		expectItems = [i(0, 10, zIndex0), i(10, 20, zIndex1), i(20, 30, zIndex0), i(30, 35, zIndex1), i(35, 45, zIndex2), i(45, 50, zIndex1), i(50, 60, zIndex0)];
		expectIntervals(expectItems, mergeEventIntervals.merge(items));
	})
})