import { Map, Array, AbstractType } from 'yjs'

declare module 'yjs' {
	interface Map<MapType> {
		get_forced(key: string): any;
		has_forced(key: string): boolean;
		entries_forced(): any[];
	}

	interface Array<T> {
		get_forced(key: string): any;
		array_forced(): any[];
	}

	interface AbstractType<EventType> {
		parent_forced(): AbstractType<any> | null;
		_prelimParent: AbstractType<any> | null;
	}
}

Object.defineProperties(Map.prototype, {
	get_forced: {
		value: function(key) {
			if(this.doc == null)	return this._prelimContent.get(key);
			else					return this.get(key);
		}
	},
	has_forced: {
		value: function(key) {
			if(this.doc == null)	return this._prelimContent.has(key);
			else					return this.has(key);
		}
	},
	entries_forced: {
		value: function() {
			if(this.doc == null)	return this._prelimContent;
			else					return this.entries();
		}
	}
});

Object.defineProperties(Array.prototype, {
	get_forced: {
		value: function(index) {
			if(this.doc == null)	return this._prelimContent[index];
			else					return this.get(index);
		}
	},
	array_forced: {
		value: function() {
			if(this.doc == null)	return this._prelimContent;
			else					return this.toArray();
		}
	}
});

Object.defineProperties(AbstractType.prototype, {
	parent_forced: {
		value: function() {
			if(this.doc == null)	return this._prelimParent;
			else					return this.parent;
		}
	}
});


