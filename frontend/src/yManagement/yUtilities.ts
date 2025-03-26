import {YArray, YMap} from "./yManagement.types";
import {generate_unique_id} from "../client/sync/datastore";

export class YUtilities {
    public static createYMap<DataType = object>(data: DataType): YMap {
        const map = new YMap();
        for (const [key, value] of Object.entries(data)) map.set(key, value);
        return map;
    }

    public static createYArray<DataType = object>(data: DataType[]): YArray {
        const array = new YArray();
        array.push(data);
        return array;
    }

    /**
     * @function addInYMap
     * @static
     * @async
     * @description Adds the provided data in the provided parent in the Yjs document, with a unique ID as its field
     * name.
     * @param {object} data - The data to append to the Yjs document.
     * @param parentYMap
     * @param id
     * document.
     * @returns {Promise<string>} - The ID of the data in its parent.
     */
    public static async addInYMap(data: object, parentYMap: YMap, id?: string): Promise<string> {
        if (!id) id = await generate_unique_id(parentYMap) as string;
        parentYMap.set(id, data);
        return id;
    }

    /**
     * @function addInYArray
     * @static
     * @description Adds the provided data in the provided parent array in the Yjs document.
     * @param {object} data - The data to append to the Yjs document.
     * @param {YArray} parentYArray - The pointer to the parent array to which the data should be appended in
     * the Yjs document.
     * @param {number} [index] - The index position in the array where the data should be added. By default, the data
     * is pushed at the end of the array.
     * @returns {number} - The index of the data in its parent.
     */
    public static addInYArray(data: object, parentYArray: YArray, index?: number): number {
        if (index == undefined || index > parentYArray.length) {
            index = parentYArray.length;
            parentYArray.push([data]);
        } else {
            if (index < 0) index = 0;
            parentYArray.insert(index, [data]);
        }
        return index;
    }

    public static removeFromYArray(entry: unknown, parentYArray: YArray): boolean {
        for (const [index, child] of parentYArray.toArray()) {
            if (entry != child) continue;
            parentYArray.delete(index);
            return true;
        }
        return false;
    }
}