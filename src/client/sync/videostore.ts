//@ts-nocheck
import * as logman from "./logman";
import {SyncedMedia} from "../app/views/camera/manager/captureManager/captureManager.types";


export function add_video(uri, metadata) {
    let id = logman.get_group_metadata().get("next_video_id");

    console.log(metadata);

    logman.get_group_videos().set(`${id}`, metadata);
    localStorage.setItem(`videotmp:${id}`, uri);

    logman.get_group_metadata().set("next_video_id", id + 1);
    return id;
}

export function update_video(id, uri, metadata) {
    logman.get_group_videos().set(`${id}`, metadata);
    localStorage.setItem(`videotmp:${id}`, uri);
}

export function delete_video(id) {
    logman.get_group_videos().delete(`${id}`);
    localStorage.removeItem(`videotmp:${id}`);
}

export function get_video(id): {uri: string, metadata: SyncedMedia} {
    return {
        uri: localStorage.getItem(`videotmp:${id}`),
        metadata: logman.get_group_videos().get(`${id}`)
    }
}


