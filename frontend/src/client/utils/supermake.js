import {element} from "turbodombuilder";

export default function supermake(thing, parent) {
    let current = element({...thing, parent: parent});

    for(let key in thing) {
        if(thing[key].tag) current[key] = supermake(thing[key], current);
    }

    return current;
}
