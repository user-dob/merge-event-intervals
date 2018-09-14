import { expect } from 'chai';
import moment from  'moment';
import { MergeEventIntervals } from '../src';

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

describe('MergeEventIntervals', () => {

	it('sort', () => {
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
	
	it('isIntersection', () => {
		const events = new MergeEventIntervals();
		let isIntersection;
	
		isIntersection = events.isIntersection(i(0, 1), i(2, 3));
		expect(isIntersection).to.be.false;
	
		isIntersection = events.isIntersection(i(20, 30), i(0, 10));
		expect(isIntersection).to.be.false;
	
		isIntersection = events.isIntersection(i(0, 10), i(5, 15));
		expect(isIntersection).to.be.true;
	
		isIntersection = events.isIntersection(i(0, 10), i(10, 15));
		expect(isIntersection).to.be.false;
	
		isIntersection = events.isIntersection(i(0, 10), i(2, 5));
		expect(isIntersection).to.be.true;
	})
	
	it('union', () => {
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
	
	it('mergeTwoEvents', () => {
		const events = new MergeEventIntervals();
		const zIndex0 = 0;
		const zIndex1 = 1;
		let items, mergeItems;
	
		// -----
		//        -----
		items = [i(0, 10, zIndex0), i(20, 30, zIndex0)];
		mergeItems = [i(0, 10, zIndex0), i(20, 30, zIndex0)];
		expect(events.mergeTwoEvents(items[0], items[1])).to.eql(mergeItems, '[i(0, 10, zIndex0), i(20, 30, zIndex0)]');
	
		// -----
		//      -----
		items = [i(0, 10, zIndex0), i(10, 20, zIndex0)];
		mergeItems = [i(0, 20, zIndex0)];
		expect(events.mergeTwoEvents(items[0], items[1])).to.eql(mergeItems, '[i(0, 10, zIndex0), i(10, 20, zIndex0)]');
	
		items = [i(10, 20, zIndex0), i(0, 10, zIndex0)];
		mergeItems = [i(0, 20, zIndex0)];
		expect(events.mergeTwoEvents(items[0], items[1])).to.eql(mergeItems, '[i(10, 20, zIndex0), i(0, 10, zIndex0)]');
	
		items = [i(0, 10, zIndex0), i(10, 20, zIndex1)];
		mergeItems = [i(0, 10, zIndex0), i(10, 20, zIndex1)];
		expect(events.mergeTwoEvents(items[0], items[1])).to.eql(mergeItems, '[i(0, 10, zIndex0), i(10, 20, zIndex1)]');
	
		// -------
		// ----------
		items = [i(0, 10, zIndex0), i(0, 20, zIndex0)];
		mergeItems = [i(0, 20, zIndex0)];
		expect(events.mergeTwoEvents(items[0], items[1])).to.eql(mergeItems, '[i(0, 10, zIndex0), i(0, 20, zIndex0)]');
	
		items = [i(0, 10, zIndex1), i(0, 20, zIndex0)];
		mergeItems = [i(0, 10, zIndex1), i(10, 20, zIndex0)];
		expect(events.mergeTwoEvents(items[0], items[1])).to.eql(mergeItems, '[i(0, 10, zIndex1), i(0, 20, zIndex0)]');
		
		// -------
		//      -------
		items = [i(0, 20, zIndex0), i(10, 30, zIndex0)];
		mergeItems = [i(0, 30, zIndex0)];
		expect(events.mergeTwoEvents(items[0], items[1])).to.eql(mergeItems, '[i(0, 20, zIndex0), i(10, 30, zIndex0)]');
	
		items = [i(0, 20, zIndex1), i(10, 30, zIndex0)];
		mergeItems = [i(0, 20, zIndex1), i(20, 30, zIndex0)];
		expect(events.mergeTwoEvents(items[0], items[1])).to.eql(mergeItems, '[i(0, 20, zIndex1), i(10, 30, zIndex0)]');
	
		items = [i(0, 20, zIndex0), i(10, 30, zIndex1)];
		mergeItems = [i(0, 10, zIndex0), i(10, 30, zIndex1)];
		expect(events.mergeTwoEvents(items[0], items[1])).to.eql(mergeItems, '[i(0, 20, zIndex0), i(10, 30, zIndex1)]');
		
		// -------
		// -------
		items = [i(0, 10, zIndex0), i(0, 10, zIndex0)];
		mergeItems = [i(0, 10, zIndex0)];
		expect(events.mergeTwoEvents(items[0], items[1])).to.eql(mergeItems, '[i(0, 10, zIndex0), i(0, 10, zIndex0)]');
	
		items = [i(0, 10, zIndex1), i(0, 10, zIndex0)];
		mergeItems = [i(0, 10, zIndex1)];
		expect(events.mergeTwoEvents(items[0], items[1])).to.eql(mergeItems, '[i(0, 10, zIndex1), i(0, 10, zIndex0)]');
	
		// ----------
		// -----
		items = [i(0, 20, zIndex0), i(0, 10, zIndex0)];
		mergeItems = [i(0, 20, zIndex0)];
		expect(events.mergeTwoEvents(items[0], items[1])).to.eql(mergeItems, '[i(0, 20, zIndex0), i(0, 10, zIndex0)]');
	
		items = [i(0, 20, zIndex1), i(0, 10, zIndex0)];
		mergeItems = [i(0, 20, zIndex1)];
		expect(events.mergeTwoEvents(items[0], items[1])).to.eql(mergeItems, '[i(0, 20, zIndex1), i(0, 10, zIndex0)]');
	
		items = [i(0, 20, zIndex0), i(0, 10, zIndex1)];
		mergeItems = [i(0, 10, zIndex1), i(10, 20, zIndex0)];
		expect(events.mergeTwoEvents(items[0], items[1])).to.eql(mergeItems, '[i(0, 20, zIndex0), i(0, 10, zIndex1)]');
	
		// ----------
		//      -----
		items = [i(0, 20, zIndex0), i(10, 20, zIndex0)];
		mergeItems = [i(0, 20, zIndex0)];
		expect(events.mergeTwoEvents(items[0], items[1])).to.eql(mergeItems, '[i(0, 20, zIndex0), i(10, 20, zIndex0)]');
	
		items = [i(0, 20, zIndex1), i(10, 20, zIndex0)];
		mergeItems = [i(0, 20, zIndex1)];
		expect(events.mergeTwoEvents(items[0], items[1])).to.eql(mergeItems, '[i(0, 20, zIndex1), i(10, 20, zIndex0)]');
	
		items = [i(0, 20, zIndex0), i(10, 20, zIndex1)];
		mergeItems = [i(0, 10, zIndex0), i(10, 20, zIndex1)];
		expect(events.mergeTwoEvents(items[0], items[1])).to.eql(mergeItems, '[i(0, 20, zIndex0), i(10, 20, zIndex1)]');
	
		// ----------
		//    -----
		items = [i(0, 30, zIndex0), i(10, 20, zIndex0)];
		mergeItems = [i(0, 30, zIndex0)];
		expect(events.mergeTwoEvents(items[0], items[1])).to.eql(mergeItems, '[i(0, 30, zIndex0), i(10, 20, zIndex0)]');
	
		items = [i(0, 30, zIndex1), i(10, 20, zIndex0)];
		mergeItems = [i(0, 30, zIndex1)];
		expect(events.mergeTwoEvents(items[0], items[1])).to.eql(mergeItems, '[i(0, 30, zIndex1), i(10, 20, zIndex0)]');
	
		items = [i(0, 30, zIndex0), i(10, 20, zIndex1)];
		mergeItems = [i(0, 10, zIndex0), i(10, 20, zIndex1), i(20, 30, zIndex0)];
		expect(events.mergeTwoEvents(items[0], items[1])).to.eql(mergeItems, '[i(0, 30, zIndex0), i(10, 20, zIndex1)]');
	})

	it('merge', () => {
		const events = new MergeEventIntervals();
		const zIndex0 = 0;
		const zIndex1 = 1;
		const zIndex2 = 2;
		let items, mergeItems;

		items = [];
		mergeItems = [];
		expect(events.merge(items)).to.eql(mergeItems);
		
		items = [i(0, 10, zIndex0)];
		mergeItems = [i(0, 10, zIndex0)];
		expect(events.merge(items)).to.eql(mergeItems);
		
		items = [i(0, 10, zIndex0), i(20, 30, zIndex0)];
		mergeItems = [i(0, 10, zIndex0), i(20, 30, zIndex0)];
		expect(events.merge(items)).to.eql(mergeItems);
		
		items = [i(0, 10, zIndex0), i(20, 30, zIndex1)];
		mergeItems = [i(0, 10, zIndex0), i(20, 30, zIndex1)];
		expect(events.merge(items)).to.eql(mergeItems);
		
		items = [i(0, 30, zIndex0), i(10, 20, zIndex0)];
		mergeItems = [i(0, 30, zIndex0)];
		expect(events.merge(items)).to.eql(mergeItems);

		items = [i(0, 30, zIndex0), i(10, 20, zIndex1)];
		mergeItems = [i(0, 10, zIndex0), i(10, 20, zIndex1), i(20, 30, zIndex0)];
		expect(events.merge(items)).to.eql(mergeItems);

		items = [i(0, 30, zIndex0), i(10, 20, zIndex1)];
		mergeItems = [i(0, 10, zIndex0), i(10, 20, zIndex1), i(20, 30, zIndex0)];
		expect(events.merge(items)).to.eql(mergeItems);

		items = [i(0, 30, zIndex0), i(10, 20, zIndex1), i(10, 15, zIndex0)];
		mergeItems = [i(0, 10, zIndex0), i(10, 20, zIndex1), i(20, 30, zIndex0)];
		expect(events.merge(items)).to.eql(mergeItems);

		items = [i(0, 60, zIndex0), i(10, 20, zIndex1), i(30, 50, zIndex1), i(35, 45, zIndex2)];
		mergeItems = [i(0, 10, zIndex0), i(10, 20, zIndex1), i(20, 30, zIndex0), i(30, 35, zIndex1), i(35, 45, zIndex2), i(45, 50, zIndex1), i(50, 60, zIndex0)];
		expect(events.merge(items)).to.eql(mergeItems);
	})

})