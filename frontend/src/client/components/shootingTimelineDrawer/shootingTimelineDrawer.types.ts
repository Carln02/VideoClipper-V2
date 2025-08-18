import {YMap} from "yjs/dist/src/types/YMap";
import {ShootingTimelineDrawerView} from "./shootingTimelineDrawer.view";
import {ShootingTimelineDrawerModel} from "./shootingTimelineDrawer.model";
import {TurboDrawerProperties} from "turbodombuilder";


export type ShootingTimelineDrawerProperties = TurboDrawerProperties<ShootingTimelineDrawerView,
    ShootingTimelineDrawerModel> & {
    
}