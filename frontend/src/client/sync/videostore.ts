import * as logman from "./logman";
import { addVideo, updateVideo, deleteVideo, getVideo } from './videoDB';

export async function add_video(uri, metadata) {
    // const id = logman.get_group_metadata().get("next_video_id");

    // store metadata separately if needed or pass it all to addVideo
    return await addVideo(uri, metadata);  // returns an auto-increment ID or you can pass the id manually

    // logman.get_group_metadata().set("next_video_id", id + 1);
    // return id;
}

export async function update_video(id, uri, metadata) {
    await updateVideo(id, uri, metadata);
}

export async function delete_video(id) {
    await deleteVideo(id);
}

export async function get_video(id) {
    const stored = await getVideo(id);
    if (!stored) return null;
    return {
        uri: stored.uri,
        metadata: stored.metadata
    };
}



