import { BaseBuilder } from "./baseBuilder";
import { ChildBuilder } from "../types/builders";
import { ParentBuilder } from "./parentBuilder";
import { workspaceBuilderCreateConfigDecoder, nonNegativeNumberDecoder } from "../shared/decoders";
import { Glue42Workspaces } from "../../workspaces";
import { WorkspacesController } from "../types/controller";

interface PrivateData {
    definition: Glue42Workspaces.WorkspaceDefinition;
    children: ChildBuilder[];
    base: BaseBuilder;
    controller: WorkspacesController;
}

const privateData = new WeakMap<WorkspaceBuilder, PrivateData>();

export class WorkspaceBuilder implements WorkspaceBuilder {

    constructor(
        definition: Glue42Workspaces.WorkspaceDefinition,
        base: BaseBuilder,
        controller: WorkspacesController
    ) {
        const children = base.wrapChildren(definition.children);

        delete definition.children;

        privateData.set(this, { base, children, definition, controller });
    }

    public addColumn(definition?: Glue42Workspaces.BoxDefinition): ParentBuilder {
        const children = privateData.get(this).children;

        const areAllColumns = children.every((child) => child instanceof ParentBuilder && child.type === "column");

        if (!areAllColumns) {
            throw new Error("Cannot add a column to this workspace, because there are already children of another type");
        }

        const base = privateData.get(this).base;

        return base.add("column", children, definition);
    }

    public addRow(definition?: Glue42Workspaces.BoxDefinition): ParentBuilder {
        const children = privateData.get(this).children;

        const areAllRows = children.every((child) => child instanceof ParentBuilder && child.type === "row");

        if (!areAllRows) {
            throw new Error("Cannot add a row to this workspace, because there are already children of another type");
        }

        const base = privateData.get(this).base;

        return base.add("row", children, definition);
    }

    public addGroup(definition?: Glue42Workspaces.BoxDefinition): ParentBuilder {
        const children = privateData.get(this).children;

        if (children.length !== 0) {
            throw new Error("Cannot add a group to this workspace, because there are already defined children.");
        }

        const base = privateData.get(this).base;

        return base.add("group", children, definition);
    }

    public addWindow(definition: Glue42Workspaces.WorkspaceWindowDefinition): WorkspaceBuilder {
        const children = privateData.get(this).children;

        if (children.length !== 0) {
            throw new Error("Cannot add a window to this workspace, because there are already defined children.");
        }

        const base = privateData.get(this).base;

        base.addWindow(children, definition);

        return this;
    }

    public getChildAt(index: number): ChildBuilder {
        nonNegativeNumberDecoder.runWithException(index);
        const data = privateData.get(this).children;

        return data[index];
    }

    public async create(config?: Glue42Workspaces.WorkspaceCreateConfig): Promise<Glue42Workspaces.Workspace> {
        const saveConfig = workspaceBuilderCreateConfigDecoder.runWithException(config);

        const definition = privateData.get(this).definition;
        definition.children = privateData.get(this).base.serializeChildren(privateData.get(this).children);

        const controller = privateData.get(this).controller;

        return controller.createWorkspace(definition, saveConfig);
    }
}
