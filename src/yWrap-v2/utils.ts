interface Object {
    truncateEnd(maxLength: number): string;
    truncateStart(maxLength: number): string;
}

Object.defineProperties(Object.prototype, {
    truncateEnd: {
        value: function (length: number) {
            if (this.toString().length > length) return this.toString().length > length
                ? (this.toString().substring(0, length).trimEnd() + "…")
                : this.toString();
        }
    },
    truncateStart: {
        value: function (length: number) {
            const reverse = (str: string) => str.split("").toReversed().join("");

            return this.toString().length > length
                ? ("…" + reverse(reverse(this.toString()).substring(0, length)).trimStart())
                : this.toString();
        }
    }
});