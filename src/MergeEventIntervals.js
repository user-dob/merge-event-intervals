import moment from 'moment';

export class MergeEventIntervals {

	sort(items) {
		return items.slice(0).sort((left, right) => left.start.diff(right.start));
	}

	isIntersection(a, b) {
		if (a.start.isBefore(b.start)) {
			return a.end.isAfter(b.start);
		}
		return b.end.isAfter(a.start);
	}

	union(items) {
		const stack = [];
		items = this.sort(items).filter(item => !item.start.isSame(item.end));

		stack.push(items[0]);

		items.slice(1).forEach(item => {
			const top = stack[stack.length - 1];

			if (top.zIndex === item.zIndex) {
				if (top.end.isBefore(item.start)) {
					stack.push(item);
				} else if (top.end.isSameOrBefore(item.end)) {
					top.end = item.end;
				}
			} else {
				stack.push(item);
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
			return this.union([
				Object.assign({}, a, {end: b.start}),
				Object.assign({}, a.zIndex > b.zIndex ? a : b, {start: b.start, end: a.end}),
				Object.assign({}, b, {start: a.end})
			]);
		}

		// ----------
		//   -----
		if (a.end.isSameOrAfter(b.end)) {
			return this.union([
				Object.assign({}, a, {end: b.start}),
				Object.assign({}, a.zIndex > b.zIndex ? a : b, {start: b.start, end: b.end}),
				Object.assign({}, a, {start: b.end})
			]);
		}

		return [];
	}

	merge(items) {
		if (items.length === 0) {
			return [];
		}

		items = this.sort(items);

		const events = [];
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

		return this.union(events);
	}
}