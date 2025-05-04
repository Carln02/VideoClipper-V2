import * as Y from 'yjs'

import * as crypto from "./crypto";
import { join_room as ds_join_project } from "./datastore";
import WebsocketProvider from "./websocket_manager"



let index_doc = new Y.Doc();
let index_public = index_doc.getMap('PUBLIC_INDEX');
let index_provider = new WebsocketProvider('PUBLIC_INDEX', index_doc);

let full_id;
let group_doc;

let group_rooms;
let group_videos;
let group_metadata;

let group_provider;



export async function init() {
    if(!localStorage.getItem("logged_groups")) localStorage.setItem("logged_groups", JSON.stringify({}));
}

export async function wait_public_index() {
    if(!index_public.has("PUBLIC_INDEX")) await new Promise((success, error) => {
        window.setTimeout(() => success(false), 10000);
        index_public.observe(() => { if(index_public.size > 0) { success(true) }});
    });
}

export function list_public_rooms() {
    return index_public;
}



function check_init_group() {
    if(!group_metadata.get("next_room_id")) group_metadata.set("next_room_id", 1);
    if(!group_metadata.get("next_video_id")) group_metadata.set("next_video_id", 1);
}

export function get_group_rooms() {
    return group_rooms;
}

export function get_group_videos() {
    return group_videos;
}

export function get_group_metadata() {
    return group_metadata;
}



export async function get_room_id(name, minicode) {
    return await crypto.hash(`${name}#${minicode}`);
}

export async function make_room(name, visible, password = null) {

    //  Initialize group information

    let minicode = await generate_minicode(name);
    let group_id = await get_room_id(name, minicode);
    let group_id_pub = await crypto.hash(group_id);
    let group_entry = index_doc.getMap(group_id);

    //  Add to public index if visible

    if(visible) index_public.set(group_id_pub, { name: name });

    //  Generate secret tokens

    let pwd_token = crypto.get_random_id();
    let pwd_data = await room_setup_pwd(pwd_token, password);

    let poa_token = crypto.get_random_id();
    let poa_data = await room_setup_token(poa_token, minicode);

    let secret_token = crypto.get_random_id();
    let secret_data = await room_setup_token(secret_token, `${poa_token}#${pwd_token}`);

    //  Create private index

    group_entry.set("pointer", { unique_id: group_id, pwd: pwd_data, poa: poa_data, secret: secret_data });

    //  Create and initialize room

    full_id = `GROUP:${group_id}@${secret_token}`;

    connect_room(full_id);

    let new_data = {
        name: name,
        minicode: minicode,
        pwd: { token: pwd_token },
        poa: { token: poa_token }
    }

    group_metadata.set("name", name);
    group_metadata.set("minicode", minicode);

    check_init_group()

    set_lginfo(group_id, new_data);

    return minicode;
}

export async function join_room(group_id, minicode = null, password = null) {

    //  Check if room exists

    let group_entry = index_doc.getMap(group_id);

// ⏳ Wait for pointer to appear (max 10s)
    if (!group_entry.has("pointer")) {
        const success = await new Promise((resolve) => {
            const timeout = setTimeout(() => resolve(false), 10000);
            const observer = () => {
                if (group_entry.has("pointer")) {
                    clearTimeout(timeout);
                    group_entry.unobserve(observer);
                    resolve(true);
                }
            };
            group_entry.observe(observer);
        });

        if (!success) return {
            success: false,
            reason: "index_does_not_exist"
        };
    }


    let group_info = group_entry.get("pointer") as any;

    //  Follow path if room has moved

    while(group_info.moved) {
        group_id = group_info.new_id;
        group_entry = index_doc.getMap(group_id);
        group_info = group_entry.get("pointer");
    }

    //  Retrieve logged in group info

    let group_info_local = get_lginfo(group_info.unique_id);

    if(!minicode && !group_info_local) return {
        success: false,
        reason: "needs_minicode"
    }

    if(!password && !group_info_local && !group_info.pwd.skip) return {
        success: false,
        reason: "needs_password"
    }

    group_info_local = group_info_local ?? {};

    //  Retrieve secret tokens

    let pwd_token;
    let poa_token;
    let secret_token;

    try {
        pwd_token = await room_decode_pwd(group_info, group_info_local, password, "pwd");
        poa_token = await room_decode_token(group_info, group_info_local, minicode, "poa");
        secret_token = await room_decode_token(group_info, group_info_local, `${poa_token}#${pwd_token}`, "secret");
    } catch(e) {
        return {
            success: false,
            reason: `crypto_error_${e}`
        }
    }

    //  Connect

    full_id = `GROUP:${group_info.unique_id}@${secret_token}`;

    connect_room(full_id);

    let success = await new Promise((resolve) => {
        const timeout = setTimeout(() => {
            group_metadata.unobserve(observer);
            resolve(false);
        }, 10000);

        const observer = () => {
            if (group_metadata.has("minicode")) {
                clearTimeout(timeout);
                group_metadata.unobserve(observer);
                resolve(true);
            }
        };

        group_metadata.observe(observer);
    });


    if(!success) return {
        success: false,
        reason: "not_initialized"
    }

    check_init_group();

    //  Save info to local storage

    let new_data = {
        name: group_metadata.get("name"),
        minicode: group_metadata.get("minicode"),
        pwd: { token: pwd_token },
        poa: { token: poa_token }
    }

    set_lginfo(group_info.unique_id, new_data);

    return {
        success: true
    }
}

export async function quit_room() {
    group_provider.destroy();
    group_doc.destroy();

    group_rooms = null;
    group_videos = null;
    group_metadata = null;
    full_id = null;
}

export function connect_project(id) {
    ds_join_project(full_id, id);
}



async function connect_room(id) {
    full_id = id;
    group_doc = new Y.Doc();

    group_rooms = group_doc.getMap("rooms");
    group_videos = group_doc.getMap("videos");
    group_metadata = group_doc.getMap("metadata");

    group_provider = new WebsocketProvider(id, group_doc);
}

async function generate_minicode(name) {
    let next_minicode = () => Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    let max_tries = 100;

    while(true) {
        let minicode = next_minicode();
        let group_id = await get_room_id(name, minicode);
        let group_id_pub = await crypto.hash(group_id);

        if(!index_public.has(group_id_pub)) {
            let group_entry = index_doc.getMap(group_id);

            if(!group_entry.has("pointer")) return minicode;
        }

        if(max_tries-- == 0) throw "Unable to generate room code";
    }
}



function get_lginfo(unique_id) {
    return JSON.parse(localStorage.getItem("logged_groups"))[unique_id];
}

function set_lginfo(unique_id, data) {
    let group_info_local = JSON.parse(localStorage.getItem("logged_groups"));
    group_info_local[unique_id] = data;
    localStorage.setItem("logged_groups", JSON.stringify(group_info_local));
}



async function room_setup_pwd(token, password) {
    if(password == null)    return { skip: true, token: token };
    else                    return await room_setup_token(token, password);
}

async function room_setup_token(token, password) {
    let salt = crypto.get_random_id();
    let key = await crypto.create_key(password, salt);
    let cipher = await crypto.encrypt(token, key);

    return { cipher: cipher.cipher, iv: cipher.iv, salt: salt };
}



async function room_decode_pwd(info, info_local, password, type) {
    if(info[type].skip)     return info[type].token;
    else                    return await room_decode_token(info, info_local, password, type);
}

async function room_decode_token(info, info_local, password, type) {
    if(!password) return info_local[type]?.token;

    try {
        let key = await crypto.create_key(password, info[type].salt);
        return await crypto.decrypt(info[type].cipher, info[type].iv, key);
    } catch(e) {
        throw type;
    }
}


