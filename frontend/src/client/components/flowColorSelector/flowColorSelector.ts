import { define, Point, TurboPopup } from "turbodombuilder";
import "./flowColorSelector.css";
import { FlowColorSelectorModel } from "./flowColorSelector.model";
import { FlowColorSelectorView } from "./flowColorSelector.view";
import { ConnectionTool } from "../../tools/connection/connection";
import { VcComponent } from "../component/component";
import { FlowColorSelectorProperties } from "./flowColorSelector.types";

/**
 * @description Component for selecting colors for connection flows
 */
@define("vc-flow-color-selector")
export class FlowColorSelector extends VcComponent<FlowColorSelectorView, any, FlowColorSelectorModel> {
    public constructor(properties: FlowColorSelectorProperties) {
            super(properties);
            this.mvc.generate({
                viewConstructor: FlowColorSelectorView,
                modelConstructor: FlowColorSelectorModel,
                data: null, 
                initialize: false
            });
    
            this.connectionTool = properties.connectionTool;
            
            if (properties.initialColor) {
                this.model.selectedColor = properties.initialColor;
                this.view.updateSelected();
            }
            
            this.mvc.initialize();
            // Hide by default - will show when needed
            this.hide();
    }
    
    private connectionTool: ConnectionTool;
    private onColorSelected: (color: string) => void;
    

    
    public get element(): any {
        return this.view.element;
    }
    
    public get selectedColor(): string {
        return this.model.selectedColor;
    }
    
    public showView(position: Point) {
        this.view.setPosition(position.x, position.y);
        this.element.style.display = "flex";
    }
    
    public hide() {
        this.element.style.display = "none";
    }
    
    public setOnColorSelected(callback: (color: string) => void) {
        this.onColorSelected = callback;
    }
    
    public selectColor(color: string) {
        if (this.onColorSelected) {
            this.onColorSelected(color);
        }
        this.hide();
    }
}
