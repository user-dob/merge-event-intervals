import moment from  'moment';

export class MergeEventIntervals {

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

	mergeTwoEvents(a, b) {
		if (a.start.isAfter(b.start)) {
			[a, b] = [b, a];
		}

		// -----
		//        -----
		if (a.end.isBefore(b.start)) {
			return [a, b];
		}

		// -------
		//      -------
		if (a.end.isSameOrAfter(b.start) && a.end.isBefore(b.end)) {
			if (a.zIndex === b.zIndex) {
				return [
					{start: a.start, end: b.end, zIndex: a.zIndex}
				]
			}

			// -------
			//        -------
			if (a.end.isSame(b.start)) {
				return [a, b];
			}

			// -------
			// ----------
			if (a.start.isSame(b.start)) {
				return [
					{start: a.start, end: a.end, zIndex: a.zIndex > b.zIndex ? a.zIndex : b.zIndex},
					{start: a.end, end: b.end, zIndex: b.zIndex}
				]
			}

			// -------
			//      -------
			if (a.zIndex > b.zIndex) {
				return [
					a,
					{start: a.end, end: b.end, zIndex: b.zIndex}
				]
			}

			return [
				{start: a.start, end: b.start, zIndex: a.zIndex},
				b
			]
		}

		// ----------
		//   -----
		if (a.end.isSameOrAfter(b.end)) {
			if (a.zIndex >= b.zIndex) {
				return [a];
			}

			// -----
			// -----
			if (a.start.isSame(b.start) && a.end.isSame(b.end)) {
				return [b];
			}

			// ----------
			// -----
			if (a.start.isSame(b.start)) {
				return [
					{start: a.start, end: b.end, zIndex: b.zIndex},
					{start: b.end, end: a.end, zIndex: a.zIndex}
				]
			}

			// ----------
			//      -----
			if (a.end.isSame(b.end)) {
				return [
					{start: a.start, end: b.start, zIndex: a.zIndex},
					{start: b.start, end: b.end, zIndex: b.zIndex}
				]
			}

			// ----------
			//    -----
			return [
				{start: a.start, end: b.start, zIndex: a.zIndex},
				{start: b.start, end: b.end, zIndex: b.zIndex},
				{start: b.end, end: a.end, zIndex: a.zIndex}
			]
		}

		return [];
	}

	merge(items) {
		if (items.length === 0) {
			return [];
		}

		const events = [];
		items = this.sort(items);

		events.push(items.shift());

		while (items.length) {
			const item = items.shift();
			const intersectionEventIndex = events.findIndex(event => this.isIntersection(event, item));
			if (intersectionEventIndex !== -1) {
				const intersectionEvent = events[intersectionEventIndex];
				const mergeEvents = this.mergeTwoEvents(intersectionEvent, item);

				events[intersectionEventIndex] = mergeEvents.shift();

				if (mergeEvents.length) {
					items = this.sort([...mergeEvents, ...items]);
				}
			} else {
				events.push(item);
			}
		}

		return events;
	}

	// merge() {
	// 	const events = [];
	//
	// 	const mapByZIndex = this._items.reduce((item, map) => {
	// 		map[item.zIndex] = map[item.zIndex] || [];
	// 		map[item.zIndex].push(item);
	// 		return map;
	// 	}, {});
	//
	// 	for(let items of mapByZIndex) {
	// 		items = this.union(items);
	// 	}
	//
	// 	const eventsByZIndex = Object.keys(mapByZIndex).sort().map(zIndex => mapByZIndex[zIndex]);
	//
	// 	events.push(eventsByZIndex[0]);
	//
	// 	eventsByZIndex.slice(1).forEach(items => {
	// 		items.forEach(event => {
	// 			const intersectionEvents = events.filter(item => this.isIntersection(event, item));
	// 			const mergeEvents = intersectionEvents.reduce()
	//
	//
	//
	// 		})
	// 	})
	//
	//
	//
	//
	//
	//
	// 	return []
	// }

}































