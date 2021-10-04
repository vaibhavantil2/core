import GoldenLayout from "@glue42/golden-layout";
import componentStateMonitor from "../componentStateMonitor";
import createRegistry, { UnsubscribeFunction } from "callback-registry";
import { idAsString } from "../utils";

class ElementsObserver {
    private _registry = createRegistry();

    private readonly closeButtonClass = "lm_close";
    private readonly maximizeButtonClass = "lm_maximise";
    private readonly minimizeButtonClass = "lm_minimise";
    private readonly addWorkspaceButtonClass = "lm_add_button";

    private readonly ejectButtonClass = "lm_popout";
    private readonly addWindowButtonClass = "lm_add_button";

    public initStackObservation(stack: GoldenLayout.Stack): void {
        this.createStackObserver(stack);
    }

    public initFrameStackObservation(stack: GoldenLayout.Stack): void {
        this.createFrameStackObserver(stack);
    }

    public observeStackEjectButton(stack: GoldenLayout.Stack, callback: (ejectButton: HTMLButtonElement) => void): UnsubscribeFunction {
        return this.observeButton(stack, callback, this.ejectButtonKeyName(stack.config.id), this.ejectButtonClass);
    }

    public observeStackMaximizeButton(stack: GoldenLayout.Stack, callback: (maximizeButton: HTMLButtonElement) => void): UnsubscribeFunction {
        return this.observeButton(stack, callback, this.maximizeButtonKeyName(stack.config.id), this.maximizeButtonClass);
    }

    public observeStackAddWindowButton(stack: GoldenLayout.Stack, callback: (addWindowButton: HTMLButtonElement) => void): UnsubscribeFunction {
        return this.observeButton(stack, callback, this.addWindowButtonKeyName(stack.config.id), this.addWindowButtonClass);
    }

    public observeStackFrameCloseButton(stack: GoldenLayout.Stack, callback: (closeButton: HTMLButtonElement) => void): UnsubscribeFunction {
        return this.observeButton(stack, callback, this.closeButtonKeyName(stack.config.id), this.closeButtonClass);
    }

    public observeStackFrameMaximizeButton(stack: GoldenLayout.Stack, callback: (maximizeButton: HTMLButtonElement) => void): UnsubscribeFunction {
        return this.observeButton(stack, callback, this.maximizeButtonKeyName(stack.config.id), this.maximizeButtonClass);
    }

    public observeStackFrameMinimizeButton(stack: GoldenLayout.Stack, callback: (minimizeButton: HTMLButtonElement) => void): UnsubscribeFunction {
        return this.observeButton(stack, callback, this.minimizeButtonKeyName(stack.config.id), this.minimizeButtonClass);
    }

    public observeStackFrameAddWorkspaceButton(stack: GoldenLayout.Stack, callback: (addWorkspaceButton: HTMLButtonElement) => void): UnsubscribeFunction {
        return this.observeButton(stack, callback, this.addWorkspaceButtonKeyName(stack.config.id), this.addWorkspaceButtonClass);
    }

    public getStackMaximizeButton(stack: GoldenLayout.Stack): HTMLElement | undefined {
        const headerElement = stack?.header?.element[0];

        return headerElement ? this.getElementByClass(stack.header.element[0], this.maximizeButtonClass) : undefined;
    }

    private observeButton(stack: GoldenLayout.Stack, callback: (btn: HTMLButtonElement) => void, keyName: string, btnClass: string): UnsubscribeFunction {
        const unsub = this._registry.add(keyName, callback);

        stack.on("beforeItemDestroyed", () => {
            unsub();
        });

        const headerElement = stack.header?.element;
        if (headerElement && headerElement[0]) {
            const btn = this.getElementByClass(headerElement[0], btnClass);

            if (btn) {
                this._registry.execute(keyName, btn);
            }
        }

        return unsub;
    }

    private getElementByClass(root: HTMLElement, className: string): HTMLElement {
        const elements = root.getElementsByClassName(className);

        if (elements.length > 1) {
            throw new Error(`Multiple elements with class ${className} in element with id ${root.id} and class ${root.className} are not supported`);
        }

        return elements[0] as HTMLElement;
    }

    private createFrameStackObserver(stack: GoldenLayout.Stack): MutationObserver {
        const headerElement: HTMLElement = stack.header.element[0];
        const mutationObserver = new MutationObserver(() => {
            const closeButton = this.getElementByClass(headerElement, this.closeButtonClass);
            const maximizeButton = this.getElementByClass(headerElement, this.maximizeButtonClass);
            const minimizeButton = this.getElementByClass(headerElement, this.minimizeButtonClass);
            const addButton = this.getElementByClass(headerElement, this.addWorkspaceButtonClass);
            const stackId = idAsString(stack.config.id);

            if (closeButton && componentStateMonitor.decoratedFactory.createSystemButtons) {
                this._registry.execute(this.closeButtonKeyName(stackId), closeButton);
            }

            if (maximizeButton && componentStateMonitor.decoratedFactory.createSystemButtons) {
                this._registry.execute(this.maximizeButtonKeyName(stackId), maximizeButton);
            }

            if (minimizeButton && componentStateMonitor.decoratedFactory.createSystemButtons) {
                this._registry.execute(this.minimizeButtonKeyName(stackId), minimizeButton);
            }

            if (addButton && componentStateMonitor.decoratedFactory.createAddWorkspace) {
                this._registry.execute(this.addWorkspaceButtonKeyName(stackId), addButton);
            }
        });

        const observerConfig = { attributes: false, childList: true, subtree: true };

        mutationObserver.observe(headerElement, observerConfig);

        return mutationObserver;
    }

    private createStackObserver(stack: GoldenLayout.Stack): MutationObserver {
        const headerElement: HTMLElement = stack.header.element[0];
        let hasEjectButton = false;
        let hasMaximizeButton = false;
        let hasAddWindowButton = false;

        const mutationObserver = new MutationObserver(() => {
            const ejectButton = this.getElementByClass(headerElement, this.ejectButtonClass);
            const maximizeButton = this.getElementByClass(headerElement, this.maximizeButtonClass);
            const addWindowButton = this.getElementByClass(headerElement, this.addWindowButtonClass);
            const stackId = idAsString(stack.config.id);

            if (ejectButton && componentStateMonitor.decoratedFactory.createGroupHeaderButtons && !hasEjectButton) {
                this._registry.execute(`${stackId}-eject`, ejectButton);
            }

            hasEjectButton = !!ejectButton;

            if (maximizeButton && componentStateMonitor.decoratedFactory.createGroupHeaderButtons && !hasMaximizeButton) {
                this._registry.execute(`${stackId}-maximize`, maximizeButton);
            }

            hasMaximizeButton = !!maximizeButton;

            if (addWindowButton && componentStateMonitor.decoratedFactory.createGroupHeaderButtons && !hasAddWindowButton) {
                this._registry.execute(`${stackId}-addWindow`, addWindowButton);
            }

            hasAddWindowButton = !!addWindowButton;
        });

        const observerConfig = { attributes: false, childList: true, subtree: true };

        mutationObserver.observe(headerElement, observerConfig);

        return mutationObserver;
    }

    private closeButtonKeyName(stackId: string | string[]): string {
        return `${idAsString(stackId)}-close`;
    }

    private maximizeButtonKeyName(stackId: string | string[]): string {
        return `${idAsString(stackId)}-maximize`;
    }

    private minimizeButtonKeyName(stackId: string | string[]): string {
        return `${idAsString(stackId)}-minimize`;
    }

    private addWorkspaceButtonKeyName(stackId: string | string[]): string {
        return `${idAsString(stackId)}-addWorkspace`;
    }

    private ejectButtonKeyName(stackId: string | string[]): string {
        return `${idAsString(stackId)}-eject`;
    }

    private addWindowButtonKeyName(stackId: string | string[]): string {
        return `${idAsString(stackId)}-addWindow`;
    }
}

export default new ElementsObserver();
