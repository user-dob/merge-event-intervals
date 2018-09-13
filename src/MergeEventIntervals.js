import moment from  'moment';

export class MergeEventIntervals {
	constructor(items = []) {
		this._items = items;
	}

	add(item) {
		this._items.push(item);
	}

	sort(items) {
		return items.slice(0).sort((left, right) => left.start.diff(right.start));
	}

	isIntersection(a, b) {
		if (a.start.isSameOrBefore(b.start)) {
			return a.end.isSameOrAfter(b.start);
		}
		return b.end.isSameOrAfter(a.start);
	}

	union(items) {
		const stack = [];
		items = this.sort(items);

		stack.push(items[0]);

		items.slice(1).forEach(item => {
			const top = stack[stack.length - 1];

			if (top.end.isBefore(item.start)) {
				stack.push(item);
			} else if(top.end.isBefore(item.end)) {
				top.end = item.end;	
			}
		});

		return stack;
	}

	merge() {
		const groupByZindex = this._items.reduce((item, group) => {
			group[item.zIndex] = group[item.zIndex] || [];
			group[item.zIndex].push(item);
			return group;
		}, {})

		return []
	}

} 