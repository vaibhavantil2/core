import { BaseBuilder } from "./baseBuilder";
import { ChildBuilder } from "../types/builders";
import { Glue42Workspaces } from "../../workspaces";

interface PrivateData {
    definition: Glue42Workspaces.BoxDefinition;
    base: BaseBuilder;
    children: ChildBuilder[];
}

const privateData = new WeakMap<ParentBuilder, PrivateData>();

export class ParentBuilder implements ParentBuilder {

    constructor(
        definition: Glue42Workspaces.BoxDefinition,
        base: BaseBuilder
    ) {
        const children = base.wrapChildren(definition.children);

        delete definition.children;

        privateData.set(this, { base, children, definition });
    }

    public get type(): "column" | "row" | "group" {
        return privateData.get(this).definition.type;
    }

    public addColumn(definition?: Glue42Workspaces.BoxDefinition): ParentBuilder {
        const base = privateData.get(this).base;

        return base.add("column", privateData.get(this).children, definition);
    }

    public addRow(definition?: Glue42Workspaces.BoxDefinition): ParentBuilder {
        const base = privateData.get(this).base;

        return base.add("row", privateData.get(this).children, definition);
    }

    public addGroup(definition?: Glue42Workspaces.BoxDefinition): ParentBuilder {
        const base = privateData.get(this).base;

        return base.add("group", privateData.get(this).children, definition);
    }

    public addWindow(definition: Glue42Workspaces.WorkspaceWindowDefinition): ParentBuilder {
        const base = privateData.get(this).base;

        base.addWindow(privateData.get(this).children, definition);

        return this;
    }

    public serialize(): Glue42Workspaces.BoxDefinition {
        const definition = privateData.get(this).definition;
        definition.children = privateData.get(this).base.serializeChildren(privateData.get(this).children);
        return definition;
    }

}
