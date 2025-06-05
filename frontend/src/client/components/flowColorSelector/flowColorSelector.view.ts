import { div, TurboView } from "turbodombuilder";
import { FlowColorSelector } from "./flowColorSelector";
import { FlowColorSelectorModel } from "./flowColorSelector.model";

export class FlowColorSelectorView extends TurboView<FlowColorSelector, FlowColorSelectorModel> {
    // public component: FlowColorSelector;
    private colorElements: HTMLElement[] = [];
    // public element: HTMLElement;
    
    protected setupUIElements() {
        super.setupUIElements();
        
        this.colorElements = this.model.colors.map(color => 
            div({
                classes: "flow-color",
                style: `background-color: ${color}`
            })
        );
    }
    
    protected setupUILayout() {
        super.setupUILayout();
        this.colorElements.forEach(el => this.element.appendChild(el));
        this.updateSelected();
    }
    
    protected setupUIListeners() {
        super.setupUIListeners();
        
        this.colorElements.forEach((colorElement, index) => {
            colorElement.addEventListener("click", () => {
                this.model.selectedColor = this.model.colors[index];
                this.updateSelected();
                this.element.selectColor(this.model.selectedColor);
            });
        });
    }
    
    protected setupChangedCallbacks() {
        super.setupChangedCallbacks();
        
        this.emitter.add("selectedColor", () => this.updateSelected());
    }
    
    public updateSelected() {
        const selectedIndex = this.model.colors.indexOf(this.model.selectedColor);
        this.colorElements.forEach((element, index) => {
            element.classList.toggle("selected", index === selectedIndex);
        });
    }
    
    public setPosition(x: number, y: number) {
        this.element.style.left = x + "px";
        this.element.style.top = y + "px";
    }
}
