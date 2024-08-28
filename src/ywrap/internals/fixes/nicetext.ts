interface Object {
	limit(max_length: number): string;
	limit_start(max_length: number): string;
}

Object.defineProperties(Object.prototype, {
	limit: {
		value: function(length) {
			if(this.toString().length > length)
				return this.toString().substring(0, length).trimEnd() + "…";
			else
				return this.toString();
		}
	},
	limit_start: {
		value: function(length) {
			let reverse = s => s.split("").toReversed().join("");

			if(this.toString().length > length)
				return "…" + reverse(reverse(this.toString()).substring(0, length)).trimStart();
			else
				return this.toString();
		}
	}
});
