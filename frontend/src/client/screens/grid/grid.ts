/* eslint-disable @typescript-eslint/no-unused-vars */
import {VcComponent} from "../../components/component/component";
import {Project} from "../../directors/project/project";
import {ClickMode, Coordinate, css, define, div, Point, ToolManager} from "turbodombuilder";
import { NavigationManager } from "../../managers/navigationManager/navigationManager";
import { Toolbar } from "../../components/toolbar/toolbar";
import { NavigatableElement } from "../../managers/navigationManager/navigationManager.types";
import {ProjectScreens, Substrate, ToolType} from "../../directors/project/project.types";
import {ShootTool} from "../../tools/shoot/shoot";
import {NavigatorTool} from "../../tools/navigator/navigator";
import {SelectionTool} from "../../tools/selection/selection";
import {FlowEntry} from "../../components/flowEntry/flowEntry";
import {Flow} from "../../components/flow/flow";
import ELK from "elkjs/lib/elk.bundled.js";
import {Card} from "../../components/card/card";
import * as d3 from "d3";
import {line} from "d3";

type canvasGridPoints = {
    canvasPoint: Point;
    gridPoint: Point;
};

type overlap = {
    card1: Card;
    card2: Card;
    overlapRect: DOMRect;
    overlapArea: number;
    greaterY : Card;
    greaterX : Card;
}

@define("vc-grid")
export class Grid extends VcComponent<any, any, any, Project> implements Substrate {
    //Grid parent --> contains the main components that are translated/scaled
    public readonly content: HTMLDivElement;

    public readonly navigationManager: NavigationManager;
    public readonly curveConnections = false;

    public gridElementWidth : number = 300;
    public gridElementHeight : number = 300;
    public verticalPadding : number = 2;
    public horizontalPadding : number = 2;


    //Main toolbar
    private readonly toolbar: Toolbar;

    public constructor(document: Project) {
        super({director: document});

        this.content = div({parent: this, id: "grid-content"});

        //Init navigation manager
        this.navigationManager = new NavigationManager(this);

        //Init toolbar
        this.toolbar = new Toolbar({
            parent: this,
            classes: "bottom-toolbar",
            director: this.director,
            tools: [
                // {name: ToolType.selection, key: "Shift"},
                new SelectionTool({name: ToolType.selection, toolManager: this.toolManager, director: this.director, key: "Shift"}),
                new NavigatorTool({name: ToolType.navigator, toolManager: this.toolManager, director: this.director}),
                ToolType.createCard,
                ToolType.createText,
                ToolType.delete,
                new ShootTool({name: ToolType.shoot, toolManager: this.toolManager, director: this.director}),
            ]
        });

        this.initTools();
    }

    public get toolManager(): ToolManager<ToolType> {
        return this.director.toolManager as ToolManager<ToolType>;
    }

    private initTools() {
        //Create all tools
        // this.toolManager.addTool(new ConnectionTool(this.director));

        //Init default tools at hand
        this.toolManager.setTool(this.toolManager.getToolByKey("Shift"), ClickMode.left);
        this.toolManager.setTool(this.toolManager.getToolByKey("Control"), ClickMode.middle, {select: false, activate: false});
    }

    public remove(): this {
        super.remove();
        return this;
    }

    public get scale() {
        if (this.director.currentType !== ProjectScreens.grid) return 1;
        return this.navigationManager.scale;
    }

    // TODO handle multiple roots
    public initGrid(flow? : Flow){
        console.log("init grid");
        this.disperseCards(10000)
    }

    public drawAllConnections(){
        // const svg = d3.create('svg')
        // svg.attr("width", 5000).attr("height", 5000);
        // this.content.addChild(svg.node());
        this.director.flows.forEach(flow => {
            flow.getAllEntries().forEach(entry => {
                // svg.node().addChild(this.drawEntry(entry));
                // entry.redraw(this.drawEntry(entry));
                this.constrainFlowEntryPoints(entry, entry.points);
            })
            flow.redraw();
        })
    }

    constrainFlowEntryPoints(entry: FlowEntry, points: Point[]):Point [] {
        return this.drawEntry(entry);
    }

    public drawEntry(entry : FlowEntry) : Point[]{
        const startCor = this.parseTransformValues(this.director.getNode(entry.startNodeId).style.transform);
        const startPos = new Point(startCor.x,startCor.y).add(new Point(200 / 2, 150 / 2));
        const endCor = this.parseTransformValues(this.director.getNode(entry.endNodeId).style.transform);
        const endPos = new Point(endCor.x, endCor.y).add(new Point(200 / 2, 150 / 2));
        console.log(startPos, endPos);

        const linePositions : [[number, number]] = [[startPos.x, startPos.y]];

        const direction = endPos.sub(startPos);
        const directionIdentity = new Point(direction.x > 0 ? 1 : -1, direction.y > 0 ? 1 : -1);

        const lineBendDistance = 160

        const x = endPos.x - directionIdentity.x * lineBendDistance;
        const y = startPos.y + directionIdentity.y * lineBendDistance;

        linePositions.push([startPos.x, y]);
        linePositions.push([x, y]);
        linePositions.push([x, endPos.y]);
        linePositions.push([endPos.x, endPos.y]);
        // return linePositions

        // console.log(this.director.getNode(entry.startNodeId), this.director.getNode(entry.endNodeId), linePositions);

        return linePositions.map(([x,y]) => new Point(x, y));
        // return linePositions;


        // // use d3 to draw the line from positions
        // const line = d3.line()
        //     .x(d => d[0])
        //     .y(d => d[1]);
        //
        // const pathData = line(linePositions.filter(p => !isNaN(p[0]) && !isNaN(p[1])));
        // //
        // const svg = d3.create('svg:path')
        //     .attr("class", "flow")
        //     .attr('d', pathData)
        //     .attr('stroke', entry.flow.color || '#000') // Use flow color or default to black
        //     .attr("opacity", 1)
        //     .attr('stroke-width', 2)
        //     .attr('fill', 'none');
        // return svg.node();
    }

    public getNearestGridSpace(card : Card) {
        const {x,y} = this.parseTransformValues(card.style.transform)
        const point = new Point(x, y);


        const topLeftPos = point.sub(point.mod(this.gridElementWidth, this.gridElementHeight));
        console.log(topLeftPos);
        const midPoint = topLeftPos.add(new Point(this.gridElementWidth / 2, this.gridElementHeight / 2));
        const directionIdentifier = midPoint.sub(point);

        const finalX  = directionIdentifier.x > 0 ? topLeftPos.x + this.gridElementWidth : topLeftPos.x;
        const finalY = directionIdentifier.y > 0 ? topLeftPos.y + this.gridElementHeight : topLeftPos.y;
        let gridPoint = new Point(finalX, finalY);
        gridPoint = topLeftPos;

        return {gridPoint, directionIdentifier };
    }

    public disperseCards( timesLeft? : number){
        if (timesLeft === undefined) timesLeft = 10;
        if(timesLeft === 0) return;
        const tolerance = Math.round((10000 - timesLeft)/500)
        const overlaps : overlap[] = this.getAllOverlaps(tolerance);
        console.log(tolerance, overlaps.length, timesLeft);

        if (overlaps.length === 0) {
            this.director.cards.forEach(card => {
                this.moveCard(card, this.getNearestGridSpace(card).gridPoint, false);
            });
            console.log("disperse cards done", this.getAllOverlaps(0));
            this.getAllOverlaps(0).forEach(overlap => {
                this.drawOverlapRect(overlap.overlapRect, 30000);
            })
            this.drawAllConnections();
            return;
        }

        let maxOverlap = overlaps[0];
        overlaps.forEach(overlap => {
            if (overlap.overlapArea > maxOverlap.overlapArea) maxOverlap = overlap;
        })

        //draw the rect of overlap
        this.drawOverlapRect(maxOverlap.overlapRect);

        if (maxOverlap.overlapRect.height > maxOverlap.overlapRect.width) {
            this.moveCard(maxOverlap.greaterX, new Point(maxOverlap.overlapRect.width,0), true);
        } else {
            this.moveCard(maxOverlap.greaterY, new Point(0, maxOverlap.overlapRect.height),true);
        }
        // this.disperseCards(timesLeft - 1);
        requestAnimationFrame(() => this.disperseCards(timesLeft - 1));
    }

    public drawOverlapRect(overlapRect: DOMRect, delay : number = 1000): void {
        const debugRect = document.createElement('div');
        Object.assign(debugRect.style, {
            position: 'absolute',
            left: `${overlapRect.x}px`,
            top: `${overlapRect.y}px`,
            width: `${overlapRect.width}px`,
            height: `${overlapRect.height}px`,
            border: '2px solid red',
            backgroundColor: 'rgba(255, 0, 0, 0.2)',
            pointerEvents: 'none',
            zIndex: '9999'
        });
        // document.body.appendChild(debugRect);
        this.director.grid.content.addChild(debugRect);

        setTimeout(() => debugRect.remove(), delay);
    }

    public drawLinesFromPoints(){

    }
    public getAllOverlaps(tolerance : number = 0){
        const allCards = this.director.cards;
        const allOverlaps : overlap[] = [];
        const doneCards : Set<Card> = new Set();

        allCards.forEach(card1 => {
            const rect1 = this.getCardBoundingBox(card1);

            allCards.forEach(card2 => {
                if(card1 === card2) return;
                if(doneCards.has(card2)) return;
                const rect2 = this.getCardBoundingBox(card2);

                const overlapRect = this.getOverlap(rect1, rect2);
                if(overlapRect.width > tolerance && overlapRect.height > tolerance){
                    const overlapArea = overlapRect.width * overlapRect.height;
                    const greaterX = rect1.right > rect2.right ? card1 : card2;
                    const greaterY = rect1.bottom > rect2.bottom ? card1 : card2;
                    allOverlaps.push({card1, card2, overlapRect, overlapArea, greaterX, greaterY});
                }
            })
            doneCards.add(card1);
        });
        // console.log(allOverlaps);
        // console.log(allCards,doneCards)
        return allOverlaps;
    }

    public getOverlap(rect1 :DOMRect, rect2 :DOMRect){
        const overlapWidth = Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
        const overlapHeight = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top));
        const overlapX = Math.max(0, Math.min(rect1.right, rect2.right) - overlapWidth);
        const overlapY = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - overlapHeight);
        return new DOMRect(overlapX, overlapY, overlapWidth, overlapHeight);
    }

    public moveCard(card : Card, point : Point, displacement : boolean){
        const style = card.style.transform;
        const { x, y } = this.parseTransformValues(style);
        const pos = new Point(x, y);

        let value = point;


        if(displacement) value = point.add(pos);
        // console.log(pos,point,value,displacement,x,y, card.title);
        card.setStyle("transform", `translate3d(${value.x}px , ${value.y}px, 0)`);
    }

    public parseTransformValues(transformStyle: string): { x: number, y: number } {
        // Match numbers before 'px' and after 'px,'
        const regex = /[\d]*\.*[\d]+px/g;

        const match = transformStyle.match(regex);
        // console.log(match);

        const x = parseFloat(match[0]); // 0
        const y = parseFloat(match[1]); // 73.8961
        return { x, y };
    }

    public getCardBoundingBox(card : Card): DOMRect{
        const {x,y} = this.parseTransformValues(card.style.transform)
        const rect : DOMRect = new DOMRect(
            x + this.horizontalPadding/2,
            y - this.verticalPadding/2,
            this.gridElementWidth + this.horizontalPadding/2,
            this.gridElementHeight + this.verticalPadding/2);
        return rect;
    }
    /**
     * @description Translate and scale the canvas by the given values
     * @param translation
     * @param scale
     */
    public transform(translation: Point, scale: number) {
        this.content.setStyle("transform", css`translate3d(${translation.x}px, ${translation.y}px, 0) scale3d(${scale}, ${scale}, 1)`);
    }
}