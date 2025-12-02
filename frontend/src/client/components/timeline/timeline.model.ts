import {SyncedClip} from "../clip/clip.types";
import {TimelineIndexInfo} from "./timeline.types";
import {
    auto,
    DataBlockObserver, deepObserveAny,
    Direction,
    handler,
    signal,
    trim,
    TurboModel,
    TurboYBlock,
    YArray
} from "turbodombuilder";
import {TimelineTimeHandler} from "./timeline.timeHandler";
import {Card} from "../card/card";

export class TimelineModel extends TurboModel<SyncedClip & YArray, number, string, "array"> {
    public static dataBlockConstructor = TurboYBlock;

    public readonly pixelsPerSecondUnit: number = 20 as const;
    public readonly timeIncrementMs = 10 as const;

    public playTimer: NodeJS.Timeout | null = null;
    public nextTimer: NodeJS.Timeout | null = null;

    public indexInfo: TimelineIndexInfo;

    protected cardsBlock: TurboYBlock<YArray, number>;
    protected cardsObserver: DataBlockObserver<string, Card, number>;
    public onCardAdded: (cardId: string, index: number) => Card;

    @signal public totalDuration: number = 0;
    @signal public orientation: Direction = Direction.horizontal;

    @signal @auto({
        preprocessValue: function (value: number) {return trim(value, this.totalDuration)}
    }) public currentTime: number;

    @handler() public timeHandler: TimelineTimeHandler;

    public constructor(data?: YArray<SyncedClip>) {
        super(data, "array");

        this.cardsBlock = new TurboYBlock();
        this.cardsObserver = this.cardsBlock.generateObserver({
            onAdded: (cardId, index) => {
                const card = this.onCardAdded(cardId, index);
                if (!card) return undefined;
                this.setBlock(card.syncedClips, cardId, index);
                return card;
            },
            onUpdated: (_cardId, card: Card, index: number) => this.cardsObserver.setInstance(card, index),
            onDeleted: (_cardId, card: Card) => this.cardsObserver.removeInstance(card, false)
        });

        this.onSetBlock.add((blockKey) => {
            this.refreshTotalDuration();
            deepObserveAny(this.getBlockData(blockKey), () => this.refreshTotalDuration(), "startTime", "endTime");
        });
    }

    public get cardIds(): string[] {
        return this.cardsBlock?.toJSON() as string[];
    }

    public set cardIds(data: YArray<string>) {
        this.clear();
        this.cardsBlock.data = data;
    }

    public get cards(): Card[] {
        return this.cardsObserver.getAllInstances();
    }

    public set cards(data: Card[]) {
        this.clear();
        this.cardsBlock.data = data.map(card => card?.dataId) as any;
    }

    public getCardAt(index: number): Card {
        return this.cardsObserver.getInstance(index);
    }

    public getClipsAt(index: number): YArray<SyncedClip> {
        return this.getBlockData(index);
    }

    public get totalClipsCount(): number {
        return this.getAllBlocks().flatMap(block => block.data.toJSON())
            .reduce((acc) => acc + 1, 0);
    }

    public get timeIncrementS(): number {
        return this.timeIncrementMs / 1000;
    }

    private refreshTotalDuration() {
        this.totalDuration = this.getAllBlocks()
            .flatMap(block => block.data.toJSON())
            .map((entry: SyncedClip) => entry.endTime - entry.startTime)
            .reduce((acc, cur) => acc + cur, 0);
    }
}