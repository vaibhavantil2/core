/* eslint-disable @typescript-eslint/no-explicit-any */

export type WorkspacesFactoryFunction = (glue: any, config?: any) => Promise<void>;
declare const WorkspacesFactory: WorkspacesFactoryFunction;
export default WorkspacesFactory;

/**
 * @docmenuorder 1
 * @docName Workspaces
 * @intro
 * The Workspaces API offers advanced window management functionalities. Using Workspaces, users are able to arrange multiple applications 
 * within the same visual window (called *Frame*). This arrangement can be performed programmatically or by dragging and dropping applications within the Frame. 
 * Users can also save Workspace Layouts and restore them within the same Frame or even in different Frames.
 *
 * The Glue42 Workspaces enable the users to compose a custom arrangement of applications by treating each application 
 * as an individual building block that can be added, removed, moved or resized within a Workspace. 
 * The Frame can hold multiple Workspaces (as tabs) and can also be maximized, minimized or resized.
 * 
 * The Workspaces API is accessible through the `glue.workspaces` object.
 */
export namespace Glue42Workspaces {

    /** An object describing a workspace layout. */
    export interface WorkspaceLayout {
        /** An unique string name and identifier of the layout */
        name: string;

        /** The type of the workspace element. */
        type: "Workspace";

        /** The components of the workspace layout. This collection can contain only one element and it must be a workspace component. */
        components: Array<WorkspaceComponent>;

        /** An object containing various layout metadata. */
        metadata?: any;
    }

    /** An object describing a workspace definition in a workspace layout. */
    export interface WorkspaceComponent {
        /** The type of the workspace element. */
        type: "Workspace";

        state: {
            /** An array of all the workspace's children. */
            children: Array<RowLayoutItem | ColumnLayoutItem | GroupLayoutItem | WindowLayoutItem>;

            /** An object containing various element settings. */
            config: any;

            /** An object containing the context of the workspace layout */
            context: any;
        };
    }

    /** An object describing a row definition in a workspace layout. */
    export interface RowLayoutItem {
        /** The type of the workspace element. */
        type: "row";

        /** An array of all the row's children. */
        children: Array<RowLayoutItem | ColumnLayoutItem | GroupLayoutItem | WindowLayoutItem>;

        /** An object containing various element settings. */
        config: any;
    }

    /** An object describing a column definition in a workspace layout. */
    export interface ColumnLayoutItem {
        /** The type of the workspace element. */
        type: "column";

        /** An array of all the column's children. */
        children: Array<RowLayoutItem | ColumnLayoutItem | GroupLayoutItem | WindowLayoutItem>;

        /** An object containing various element settings. */
        config: any;
    }

    /** An object describing a group definition in a workspace layout. */
    export interface GroupLayoutItem {
        /** The type of the workspace element. */
        type: "group";

        /** An array of all the group's children which can only of type window. */
        children: WindowLayoutItem[];

        /** An object containing various element settings. */
        config: any;
    }

    /** An object describing a window definition in a workspace layout. */
    export interface WindowLayoutItem {
        /** The type of the workspace element. */
        type: "window";
        /** A configuration object for the window layout */
        config: {
            /** The name of the application as defined in Glue Desktop */
            appName: string;
            /** The url of the window, in case it is not a defined as an application. */
            url?: string;
            /** The title of the window */
            title?: string;
        };
    }

    /** A function which when called unsubscribes the user from further notifications. */
    export type Unsubscribe = () => void;

    /** An object containing all the possible settings when restoring a workspace from a layout. */
    export interface RestoreWorkspaceConfig {
        /** An object which will be set as the window context of all windows inside this workspace. */
        context?: object;

        /** The title of the new workspace. */
        title?: string;

        /** A string id of an existing frame. If provided, this workspace will be opened in that specific frame */
        frameId?: string;

        /** A setting used to declare that the workspace must be in a new frame and also provide options for that new frame */
        newFrame?: NewFrameConfig | boolean;

        loadingStrategy?: LoadingStrategy;

        /** Used for replacing the specified workspace instead of creating a new one */
        reuseWorkspaceId?: string;

        /** Opens the workspace without a workspace tab element */
        noTabHeader?: boolean;
    }

    /** An object containing the bounds of a frame */
    export interface FrameBounds {
        top?: number;
        left?: number;
        width?: number;
        height?: number;
    }

    /** An object describing the possible settings when defining a new frame. */
    export interface NewFrameConfig {
        /** An object describing the possible settings when defining a new frame. */
        bounds?: FrameBounds;
    }

    /** An object defining the resize parameters of a frame. */
    export interface ResizeConfig {
        /** The targeted width value */
        width?: number;

        /** The targeted height value */
        height?: number;

        /** Toggles whether or not the provided width and height values should be treated as absolute or relative to the current values. */
        relative?: boolean;
    }

    /** An object defining the position parameters of a frame. */
    export interface MoveConfig {
        /** The targeted top value */
        top?: number;

        /** The targeted left value */
        left?: number;

        /** Toggles whether or not the provided top and left values should be treated as absolute or relative to the current values. */
        relative?: boolean;
    }

    /** An object containing settings applied when creating a new workspace. */
    export interface WorkspaceCreateConfig {
        /** A boolean which defines whether or not the workspace should also be saved as a layout when created. */
        saveLayout?: boolean;
    }

    /**
    * The loading strategy used to open new workspaces. 
    * "direct" will cause all windows to start loading at the same time as soon as the workspace loads
    * "delayed" will cause all visible/active/selected windows to start loading at the same time as soon as the workspace loads. The rest will be loaded gradually at a specific interval.
    * "lazy" will cause all visible/active/selected windows to start loading at the same time as soon as the workspace loads. The rest will start loading when the user selects them and not before that.
   /** The loading strategy used to open new workspaces. "direct" will cause all windows to start loading at the same time, "delayed" */
    export type LoadingStrategy = "direct" | "delayed" | "lazy";

    /** An object which represent a workspace element. This is an element can be a box or a workspace window. */
    export type WorkspaceElement = WorkspaceBox | WorkspaceWindow;

    /** An object which represent a workspace box. This is an element which contains other elements, called children. */
    export type WorkspaceBox = Row | Column | Group;

    /** The possible window states for a workspaces frame. */
    export type FrameState = "maximized" | "minimized" | "normal";

    /** An object describing the options of the builder. */
    export interface BuilderConfig {
        /** A string defining the type of the builder. */
        type: "workspace" | "row" | "column" | "group";

        /** An object describing various options when creating a builder. */
        definition?: WorkspaceDefinition | BoxDefinition;
    }

    /** Workspace-specific options. */
    export interface WorkspaceConfig {
        /** A title of the workspace. */
        title?: string;

        /** Position of the workspace in relation to it's siblings in the frame. */
        position?: number;

        /** States whether or not the workspace should have focus when opened. */
        isFocused?: boolean;

        /** Provides the opportunity to open a workspace with no tab header */
        noTabHeader?: boolean;

        /** Used for replacing the specified workspace instead of creating a new one */
        reuseWorkspaceId?: string;

        /** Controls when the windows inside this workspace should load when the workspace is created or restored */
        loadStrategy?: LoadingStrategy;

        /** Controls the users ability to drop outside windows in the workspace */
        allowDrop?: boolean;

        /** Controls the users ability to drop windows in the left-most zone of the workspace */
        allowDropLeft?: boolean;

        /** Controls the users ability to drop windows in the top-most zone of the workspace */
        allowDropTop?: boolean;

        /** Controls the users ability to drop windows in the right-most zone of the workspace */
        allowDropRight?: boolean;

        /** Controls the users ability to drop windows in the bottom-most zone of the workspace */
        allowDropBottom?: boolean;

        /** Controls the users ability to extract windows from the workspace */
        allowExtract?: boolean;

        /** Controls the visibility of the save workspace button located in the workspace tab */
        showSaveButton?: boolean;

        /** Controls the visibility of the close button located in the workspaces tab */
        showCloseButton?: boolean;

        /** Prevents the splitters for being draggable, so the windows cannot be resized */
        allowSplitters?: boolean;

        /** Controls the visibility of all close button located in the windows' tab elements */
        showWindowCloseButtons?: boolean;

        /** Controls the visibility of all eject buttons located in the groups' headers */
        showEjectButtons?: boolean;

        /** Controls the visibility of all the add window buttons (the ones with the plus icon) located in the group headers */
        showAddWindowButtons?: boolean;
    }

    /** A config object which provides fine grain control when locking a workspace */
    export interface WorkspaceLockConfig {
        /** Prevents the splitters for being draggable, so the windows cannot be resized */
        allowSplitters?: boolean;

        /** (Enterprise only) Controls the ability of the users to drop outside windows in the workspace */
        allowDrop?: boolean;

        /** Controls the users ability to drop windows in left-most zone of the workspace */
        allowDropLeft?: boolean;

        /** Controls the users ability to drop windows in top-most zone of the workspace */
        allowDropTop?: boolean;

        /** Controls the users ability to drop windows in right-most zone of the workspace */
        allowDropRight?: boolean;

        /** Controls the users ability to drop windows in bottom-most zone of the workspace */
        allowDropBottom?: boolean;

        /** Controls the ability of the users to extract (or rearrange) windows inside the workspace */
        allowExtract?: boolean;

        /** Controls the visibility of the close button located in the workspaces tab */
        showCloseButton?: boolean;

        /** Controls the visibility of the save workspace button located in the workspace tab */
        showSaveButton?: boolean;

        /** Controls the visibility of all the add window buttons (the ones with the plus icon) located in the group headers */
        showAddWindowButtons?: boolean;

        /** Controls the visibility of all eject buttons located in the groups' headers */
        showEjectButtons?: boolean;

        /** Controls the visibility of all close button located in the windows' tab elements */
        showWindowCloseButtons?: boolean;
    }

    /** A config object which provides fine grain control when locking a window */
    export interface WorkspaceWindowLockConfig {
        /**  Blocks the users ability to extract the specified window */
        allowExtract?: boolean;

        /** Controls the visibility of the close button which is located in the window's tab */
        showCloseButton?: boolean;
    }

    /** A config object which provides fine grain control when locking a group */
    export interface GroupLockConfig {
        /**  Blocks the users ability to extract windows from the group */
        allowExtract?: boolean;

        /** (Enterprise only) Controls the ability of the users to drop outside windows in the group */
        allowDrop?: boolean;

        /** Controls the users ability to drop windows in left zone of the group */
        allowDropLeft?: boolean;

        /** Controls the users ability to drop windows in right zone of the group */
        allowDropRight?: boolean;

        /** Controls the users ability to drop windows in top zone of the group */
        allowDropTop?: boolean;

        /** Controls the users ability to drop windows in bottom zone of the group */
        allowDropBottom?: boolean;

        /** Controls the users ability to drop windows in header zone of the group */
        allowDropHeader?: boolean;

        /** Controls the visibility of the maximize/restore button located in the group header */
        showMaximizeButton?: boolean;

        /** Controls the visibility of the eject button located in the group header */
        showEjectButton?: boolean;

        /** Controls the visibility of the add window buttons (the ones with the plus icon) located in the group header */
        showAddWindowButton?: boolean;
    }

    /** A config object which provides fine grain control when locking a row */
    export interface RowLockConfig {
        /** (Enterprise only) Controls the ability of the users to drop outside windows in the row */
        allowDrop?: boolean;

        /** Prevents the splitters for being draggable, so the windows cannot be resized within the row */
        allowSplitters?: boolean;
    }

    /** A config object which provides fine grain control when locking a column */
    export interface ColumnLockConfig {
        /** (Enterprise only) Controls the ability of the users to drop outside windows in the column */
        allowDrop?: boolean;

        /** Prevents the splitters for being draggable, so the windows cannot be resized within the row */
        allowSplitters?: boolean;
    }

    /** A config object which defines various workspace window-specific settings */
    export interface WorkspaceWindowDefinitionConfig {
        /** Specifies the minimum width in pixels for the workspace window */
        minWidth?: number;

        /** Specifies the maximum width in pixels for the workspace window */
        maxWidth?: number;

        /** Specifies the minimum height in pixels for the workspace window */
        minHeight?: number;

        /** Specifies the maximum height in pixels for the workspace window */
        maxHeight?: number;

        /**  Blocks the users ability to extract the specified window */
        allowExtract?: boolean;

        /** Controls the visibility of the close button which is located in the window's tab */
        showCloseButton?: boolean;
    }

    /** A config object which defines various group-specific settings */
    export interface GroupDefinitionConfig {
        /** Specifies the minimum width in pixels for the group */
        minWidth?: number;

        /** Specifies the maximum width in pixels for the group */
        maxWidth?: number;

        /** Specifies the minimum height in pixels for the group */
        minHeight?: number;

        /** Specifies the maximum height in pixels for the group */
        maxHeight?: number;

        /**  Blocks the users ability to extract windows from the group */
        allowExtract?: boolean;

        /** Controls the visibility of the maximize/restore button located in the group header */
        showMaximizeButton?: boolean;

        /** Controls the visibility of the eject button located in the group header */
        showEjectButton?: boolean;

        /** (Enterprise only) Controls the ability of the users to drop outside windows in the group */
        allowDrop?: boolean;

        /** Controls the users ability to drop windows in left zone of the group */
        allowDropLeft?: boolean;

        /** Controls the users ability to drop windows in right zone of the group */
        allowDropRight?: boolean;

        /** Controls the users ability to drop windows in top zone of the group */
        allowDropTop?: boolean;

        /** Controls the users ability to drop windows in bottom zone of the group */
        allowDropBottom?: boolean;

        /** Controls the users ability to drop windows in header zone of the group */
        allowDropHeader?: boolean;

        /** Controls the visibility of the add window buttons (the ones with the plus icon) located in the group header */
        showAddWindowButton?: boolean;
    }

    /** A config object which defines various row-specific settings */
    export interface RowDefinitionConfig {
        /** Specifies the minimum height in pixels for the row */
        minHeight?: number;

        /** Specifies the maximum height in pixels for the row */
        maxHeight?: number;

        /** (Enterprise only) Controls the ability of the users to drop outside windows in the row */
        allowDrop?: boolean;

        /** Prevents the splitters for being draggable, so the windows cannot be resized within the row */
        allowSplitters?: boolean;

        /** Specifies if a row should be pinned. A pinned row will always maintain it's height, unless the user manually changes it by dragging the splitter */
        isPinned?: boolean;
    }

    /** A config object which defines various column-specific settings */
    export interface ColumnDefinitionConfig {
        /** Specifies the minimum width in pixels for the column */
        minWidth?: number;

        /** Specifies the maximum width in pixels for the column */
        maxWidth?: number;

        /** (Enterprise only) Controls the ability of the users to drop outside windows in the column */
        allowDrop?: boolean;

        /** Prevents the splitters for being draggable, so the windows cannot be resized within the column */
        allowSplitters?: boolean;

        /** Specifies if a column should be pinned. A pinned column will always maintain it's width, unless the user manually changes it by dragging the splitter */
        isPinned?: boolean;
    }

    /** An object describing the possible options when defining a new workspace */
    export interface WorkspaceDefinition {
        /** An array of all the workspace's children which will also be opened. */
        children?: Array<WorkspaceWindowDefinition | BoxDefinition>;

        /** An object which will be set as the window context of all windows inside this workspace. */
        context?: any;

        /** Workspace-specific options. */
        config?: WorkspaceConfig;

        /** Options regarding the frame where this workspace will be opened in. */
        frame?: {
            /** A string id of an existing frame. If provided, this workspace will be opened in that specific frame */
            reuseFrameId?: string;

            /** A setting used to declare that the workspace must be in a new frame and also provide options for that new frame */
            newFrame?: NewFrameConfig | boolean;
        };
    }

    /** An object describing the possible options when opening a box inside a workspace. */
    export interface BoxDefinition {
        /** The type of the workspace element. */
        type?: "column" | "row" | "group";

        /** An array of all the box's children which will also be opened. */
        children?: Array<WorkspaceWindowDefinition | BoxDefinition>;

        /** An optional config object which defines various box-specific settings */
        config?: GroupDefinitionConfig | RowDefinitionConfig | ColumnDefinitionConfig;
    }

    /** An object describing the possible options when opening a window inside a workspace. */
    export interface WorkspaceWindowDefinition {
        /** The type of the workspace element. */
        type?: "window";

        /** The name of the application as defined, which will be opened. */
        appName?: string;

        /** The window id of an existing standalone window, which will be dragged into the workspace. */
        windowId?: string;

        /** An object which will be passed to the newly created window. This object is then accessible via the Windows API */
        context?: any;

        /** A config object which defines various workspace window-specific settings */
        config?: WorkspaceWindowDefinitionConfig;
    }

    /** A config object which shows the possible frame size constraints, which are calculated using all internal elements' constraints */
    export interface FrameConstraints {
        /** Shows the minimum width of the frame */
        minWidth: number;

        /** Shows the maximum width of the frame */
        maxWidth: number;

        /** Shows the minimum height of the frame */
        minHeight: number;

        /** Shows the maximum height of the frame */
        maxHeight: number;
    }

    /** A config object which defines how a workspace element should be resized */
    export interface ElementResizeConfig {
        /** Defines the desired new width of the element */
        width?: number;

        /** Defines the desired new height of the element */
        height?: number;
    }

    /** An object describing a workspace layout without the underlying structure */
    export interface WorkspaceLayoutSummary {
        /** An unique string name and identifier of the layout */
        name: string;
    }

    /** An object describing the basic details of a frame */
    export interface FrameSummary {
        /** An unique string identifier of the frame */
        id: string;
    }

    /** An object describing a frame */
    export interface Frame extends FrameSummary {
        /**
         * Retrieves the current bounds of the frame.
         */
        getBounds(): Promise<FrameBounds>;

        /**
         * Changes the size of this frame.
         * @param config An object defining the resize parameters.
         */
        resize(config: ResizeConfig): Promise<void>;

        /**
         * Changes the position of this frame.
         * @param config An object defining the position parameters.
         */
        move(config: MoveConfig): Promise<void>;

        /**
         * Focuses this frame.
         */
        focus(): Promise<void>;

        /**
         * Returns the current state of the frame.
         * Not available in Glue42 Core
         */
        state(): Promise<FrameState>;

        /**
         * Minimizes this frame.
         * Not available in Glue42 Core
         */
        minimize(): Promise<void>;

        /**
         * Minimizes this frame.
         * Not available in Glue42 Core
         */
        minimize(): Promise<void>;

        /**
         * Maximizes this frame.
         * Not available in Glue42 Core
         */
        maximize(): Promise<void>;

        /**
         * Restores this frame.
         * Not available in Glue42 Core
         */
        restore(): Promise<void>;

        /**
         * Closes this frame.
         */
        close(): Promise<void>;

        /**
         * Returns an object detailing the current state of this frame.
         */
        snapshot(): Promise<FrameSnapshot>;

        /**
         * Returns a collection of all workspaces present in this frame.
         */
        workspaces(): Promise<Workspace[]>;

        /**
        * Returns the current size constraints this frame. The constraints are calculated using all of the individual constraints of the elements within the workspaces in the frame.
        */
        getConstraints(): Promise<FrameConstraints>;

        /**
         * Opens a new workspace in this frame by restoring a previously saved workspace layout.
         * @param name The name of a saved workspace layout, which will be restored.
         * @param options An optional object containing various workspace restore options.
         */
        restoreWorkspace(name: string, options?: RestoreWorkspaceConfig): Promise<Workspace>;

        /**
         * Opens a new workspace in this frame based on the provided definition.
         * @param definition An object describing the shape and options of the workspace.
         * @param saveConfig An object used to set various create options.
         */
        createWorkspace(definition: WorkspaceDefinition, config?: WorkspaceCreateConfig): Promise<Workspace>;

        /**
         * Notifies when this frame is closed.
         * @param callback Callback function to handle the event.
         */
        onClosed(callback: (closed: { frameId: string }) => void): Promise<Unsubscribe>;

        /**
         * Notifies when this frame is maximized.
         * This event is not supported in Glue42 Core.
         * @param callback Callback function to handle the event.
         */
        onMaximized(callback: () => void): Promise<Unsubscribe>;

        /**
         * Notifies when this frame is closed.
         * This event is not supported in Glue42 Core.
         * @param callback Callback function to handle the event.
         */
        onMinimized(callback: () => void): Promise<Unsubscribe>;

        /**
         * Notifies when this frame is closed.
         * This event is not supported in Glue42 Core.
         * @param callback Callback function to handle the event.
         */
        onNormal(callback: () => void): Promise<Unsubscribe>;

        /**
         * Notifies when a new workspace was opened in this frame and returns an unsubscribe function.
         * @param callback Callback function to handle the event. Receives the added workspace as a parameter.
         */
        onWorkspaceOpened(callback: (workspace: Workspace) => void): Promise<Unsubscribe>;

        /**
         * Notifies when a workspace is selected in this frame and returns an unsubscribe function.
         * @param callback Callback function to handle the event. Receives the selected workspace as a parameter.
         */
        onWorkspaceSelected(callback: (workspace: Workspace) => void): Promise<Unsubscribe>;

        /**
         * Notifies when a workspace present in this frame was closed and returns an unsubscribe function.
         * @param callback Callback function to handle the event. Receives an object with the closed workspace id and frame id as a parameter.
         */
        onWorkspaceClosed(callback: (closed: { frameId: string; workspaceId: string }) => void): Promise<Unsubscribe>;

        /**
         * Notifies when a new window was added to a workspace part of this frame and returns an unsubscribe function.
         * An added window means that the window has a place in the workspace (it is a valid workspace element), but does not guarantee that the contents of the window are loaded.
         * @param callback Callback function to handle the event. Receives the added window as a parameter.
         */
        onWindowAdded(callback: (window: WorkspaceWindow) => void): Promise<Unsubscribe>;

        /**
         * Notifies when a window was removed from a workspace part of this frame and returns an unsubscribe function.
         * @param callback Callback function to handle the event. Receives an object containing the ids of the removed window, and the respective workspace and frame as a parameter.
         */
        onWindowRemoved(callback: (removed: { windowId?: string; workspaceId: string; frameId: string }) => void): Promise<Unsubscribe>;

        /**
         * Notifies when a window's content was loaded in a workspace part of this frame and returns an unsubscribe function.
         * A loaded window is a window, which was added to a workspace, it's contents were loaded and is present in the windows collection.
         * @param callback Callback function to handle the event. Receives the loaded window as a parameter.
         */
        onWindowLoaded(callback: (window: WorkspaceWindow) => void): Promise<Unsubscribe>;
    }

    /** An object describing the basic details of a workspace */
    export interface WorkspaceSummary {
        /** An unique string identifier of the workspace */
        id: string;

        /** The string id of the frame containing this workspace */
        frameId: string;

        /** The position of this workspace regarding it's siblings */
        positionIndex: number;

        /** The title of the workspace */
        title: string;

        /** The name of the originating layout of the current workspace if any */
        layoutName: string | undefined;

        /** Indicates if the workspace is hibernated */
        isHibernated?: boolean;

        /** Indicates if the workspace is selected in its frame. Can be undefined if using with an older version of GlueDesktop or GlueCore */
        isSelected?: boolean;

        /** Indicates if dragging of splitters is allowed in the workspace */
        allowSplitters?: boolean;

        /** Indicates if dropping outsize windows to the workspace is allowed */
        allowDrop?: boolean;

        /** Indicates if dropping windows in the left-most zone of the workspace is allowed */
        allowDropLeft?: boolean;

        /** Indicates if dropping windows in the top-most zone of the workspace is allowed */
        allowDropTop?: boolean;

        /** Indicates if dropping windows in the right-most zone of the workspace is allowed */
        allowDropRight?: boolean;

        /** Indicates if dropping windows in the bottom-most zone of the workspace is allowed */
        allowDropBottom?: boolean;

        /** Indicates if extracting windows from the workspace is allowed */
        allowExtract?: boolean;

        /** Indicates if the close button for this workspace is visible to the user */
        showCloseButton?: boolean;

        /** Indicates if the save button for this workspace is visible to the user */
        showSaveButton?: boolean;

        /** Returns the minimum width of the workspace, calculated by the constraints of all elements inside it */
        minWidth?: number;

        /** Returns the minimum height of the workspace, calculated by the constraints of all elements inside it */
        minHeight?: number;

        /** Returns the maximum width of the workspace, calculated by the constraints of all elements inside it */
        maxWidth?: number;

        /** Returns the maximum height of the workspace, calculated by the constraints of all elements inside it */
        maxHeight?: number;

        /** Returns the current width of the workspace */
        width?: number;

        /** Returns the current height of the workspace */
        height?: number;

        /** Indicates if the close buttons of the windows within this workspace are visible to the user */
        showWindowCloseButtons?: boolean;

        /** Indicates if the eject buttons of the windows within this workspace are visible to the user */
        showEjectButtons?: boolean;

        /** Indicates if the window add buttons within this workspace are visible to the user */
        showAddWindowButtons?: boolean;
    }

    /** An object describing a workspace */
    export interface Workspace extends WorkspaceSummary {

        /** A collection containing the immediate children of this workspace */
        children: WorkspaceElement[];

        /** An object representing the frame containing this workspace */
        frame: Frame;

        /**
         * Gives focus to this workspace.
         */
        focus(): Promise<void>;

        /**
         * Closes this workspace and all of it's children.
         */
        close(): Promise<void>;

        /**
         * Returns a snapshot object describing the full current state of this workspace.
         */
        snapshot(): Promise<WorkspaceSnapshot>;

        /**
         * Sets a new title for this workspace.
         * @param title The new title value.
         */
        setTitle(title: string): Promise<void>;

        /**
         * Gets the context for this workspace.
         */
        getContext(): Promise<any>;

        /**
         * Sets the context for this workspace. This operation will completely overwrite the existing context.
         * @param data The new context value.
         */
        setContext(data: any): Promise<void>;

        /**
         * Updated the context for this workspace. This operation will merge the existing context with the provided value.
         * @param data The context value to update.
         */
        updateContext(data: any): Promise<void>;

        /**
         * Notifies when the context for this workspace was updated.
         * @param callback Callback function to handle the event.
         */
        onContextUpdated(callback: (data: any) => void): Promise<Unsubscribe>;

        /**
         * Updates this workspace reference to reflect the current state of the workspace. 
         */
        refreshReference(): Promise<void>;

        /**
         * Saves the current workspace structure as a layout. In Glue42 Core this will throw an error if the name matches the name of a read-only layout.
         * @param name A string representing the name (also ID) of the new workspace layout.
         */
        saveLayout(name: string, config?: { saveContext?: boolean }): Promise<void>;

        /**
         * Returns the first box in this workspace, which satisfies the provided predicate.
         * @param predicate A filtering function (predicate) called for each box present in this workspace.
         */
        getBox(predicate: (box: WorkspaceBox) => boolean): WorkspaceBox;

        /**
         * Returns all boxes in this workspace, which satisfy the provided predicate. If no predicate was provided, will return all boxes.
         * @param predicate A filtering function (predicate) called for each box present in this workspace.
         */
        getAllBoxes(predicate?: (box: WorkspaceBox) => boolean): WorkspaceBox[];

        /**
         * Returns the first row in this workspace, which satisfies the provided predicate.
         * @param predicate A filtering function (predicate) called for each row present in this workspace.
         */
        getRow(predicate: (row: Row) => boolean): Row;

        /**
         * Returns all rows in this workspace, which satisfy the provided predicate. If no predicate was provided, will return all rows.
         * @param predicate A filtering function (predicate) called for each row present in this workspace.
         */
        getAllRows(predicate?: (row: Row) => boolean): Row[];

        /**
         * Returns the first column in this workspace, which satisfies the provided predicate.
         * @param predicate A filtering function (predicate) called for each column present in this workspace.
         */
        getColumn(predicate: (column: Column) => boolean): Column;

        /**
         * Returns all columns in this workspace, which satisfy the provided predicate. If no predicate was provided, will return all column.
         * @param predicate A filtering function (predicate) called for each column present in this workspace.
         */
        getAllColumns(predicate?: (columns: Column) => boolean): Column[];

        /**
         * Returns the first group in this workspace, which satisfies the provided predicate.
         * @param predicate A filtering function (predicate) called for each group present in this workspace.
         */
        getGroup(predicate: (group: Group) => boolean): Group;

        /**
         * Returns all groups in this workspace, which satisfy the provided predicate. If no predicate was provided, will return all groups.
         * @param predicate A filtering function (predicate) called for each group present in this workspace.
         */
        getAllGroups(predicate?: (group: Group) => boolean): Group[];

        /**
         * Returns the first window in this workspace, which satisfies the provided predicate.
         * @param predicate A filtering function (predicate) called for each window present in this workspace.
         */
        getWindow(predicate: (window: WorkspaceWindow) => boolean): WorkspaceWindow;

        /**
         * Returns all windows in this workspace, which satisfy the provided predicate. If no predicate was provided, will return all windows.
         * @param predicate A filtering function (predicate) called for each window present in this workspace.
         */
        getAllWindows(predicate?: (window: WorkspaceWindow) => boolean): WorkspaceWindow[];

        /**
         * Adds a new row to this workspace.
         * @param definition An object describing the available row settings.
         */
        addRow(definition?: BoxDefinition): Promise<Row>;

        /**
         * Adds a new column to this workspace.
         * @param definition An object describing the available column settings.
         */
        addColumn(definition?: BoxDefinition): Promise<Column>;

        /**
         * Adds a new group to this workspace.
         * @param definition An object describing the available group settings.
         */
        addGroup(definition?: BoxDefinition): Promise<Group>;

        /**
         * Adds a new window to this workspace.
         * @param definition An object describing the available window settings.
         */
        addWindow(definition: WorkspaceWindowDefinition): Promise<WorkspaceWindow>;

        /**
         * Removes the first element of this workspace which satisfies the predicate.
         * @param predicate A filtering function (predicate) called for each element in this workspace.
         */
        remove(predicate: (child: WorkspaceElement) => boolean): Promise<void>;

        /**
         * Removes the first immediate child of this workspaces which satisfies the predicate.
         * @param predicate A filtering function (predicate) called for immediate child of this workspace.
         */
        removeChild(predicate: (child: WorkspaceElement) => boolean): Promise<void>;

        /**
         * Transforms this workspace into a workspace with one immediate child of type row and all existing elements are inserted as a child to that row.
         */
        bundleToRow(): Promise<void>;

        /**
         * Transforms this workspace into a workspace with one immediate child of type column and all existing elements are inserted as a child to that row.
         */
        bundleToColumn(): Promise<void>;

        /**
         * Puts the workspace in a hibernated state. All the windows are closed, but the workspace structure remains.
         */
        hibernate(): Promise<void>;

        /**
         * Resumes a hibernated workspace. All the windows prior to the hibernation are reloaded.
         */
        resume(): Promise<void>;

        /**
         * Locks the workspace using a provided config object, which restricts various modification functionalities of the workspace
         * @param config This can be either an object or a function. When the object is provided, it overrides all other lock properties. When a function is provided, it will be called with the current lock settings and it should return a lock config, which will override the current settings. The function is recommended in all cases where overriding of the settings is not desired.
         */
        lock(config?: WorkspaceLockConfig | ((config: WorkspaceLockConfig) => WorkspaceLockConfig)): Promise<void>;

        /**
         * Notifies when this workspace is closed.
         * @param callback Callback function to handle the event.
         */
        onClosed(callback: () => void): Promise<Unsubscribe>;

        /**
         * Notifies when a new window was added to this workspace and returns an unsubscribe function.
         * An added window means that the window has a place in the workspace (it is a valid workspace element), but does not guarantee that the contents of the window are loaded.
         * @param callback Callback function to handle the event. Receives the added window as a parameter.
         */
        onWindowAdded(callback: (window: WorkspaceWindow) => void): Promise<Unsubscribe>;

        /**
         * Notifies when a window was removed from this workspace and returns an unsubscribe function.
         * Not supported in Glue42 Core
         * @param callback Callback function to handle the event. Receives an object containing the ids of the removed window, and the respective workspace and frame as a parameter.
         */
        onWindowRemoved(callback: (removed: { windowId?: string; workspaceId: string; frameId: string }) => void): Promise<Unsubscribe>;

        /**
         * Notifies when a window's content was loaded in this workspace and returns an unsubscribe function.
         * A loaded window is a window, which was added to a workspace, it's contents were loaded and is present in the windows collection.
         * @param callback Callback function to handle the event. Receives the loaded window as a parameter.
         */
        onWindowLoaded(callback: (window: WorkspaceWindow) => void): Promise<Unsubscribe>;
    }

    /** An object containing the summary of a workspace box */
    export interface BoxSummary {

        /** An unique string identifier of this box */
        id: string;

        /** The unique string identifier of the frame containing this box */
        frameId: string;

        /** The unique string identifier of the workspace containing this box */
        workspaceId: string;

        /** An number representing the positing of this box relative to it's siblings */
        positionIndex: number;

        /** Indicates if dropping windows inside this box is allowed */
        allowDrop?: boolean;

        /** Returns the minimum width of the box, calculated by the size constraints of the elements inside it */
        minWidth?: number;

        /** Returns the minimum height of the box, calculated by the size constraints of the elements inside it */
        minHeight?: number;

        /** Returns the maximum width of the box, calculated by the size constraints of the elements inside it */
        maxWidth?: number;

        /** Returns the maximum height of the box, calculated by the size constraints of the elements inside it */
        maxHeight?: number;

        /** Returns the current width of the box, can be undefined if the API is used with old versions of Enterprise or Core */
        width?: number;

        /** Returns the current height of the box, can be undefined if the API is used with old versions of Enterprise or Core */
        height?: number;

        /** Returns whether or not the box is maximized */
        isMaximized?: boolean;
    }

    /** An object describing a workspace box */
    export interface Box extends BoxSummary {

        /** A collection containing the immediate children of this box */
        children: WorkspaceElement[];

        /** An object representing this box's parent */
        parent: Workspace | WorkspaceBox;

        /** An object representing the frame containing this box */
        frame: Frame;

        /** An object representing the workspace containing this box */
        workspace: Workspace;

        /**
         * Opens a new window inside this box and loads it's content.
         * @param definition An object describing the requested window.
         */
        addWindow(definition: WorkspaceWindowDefinition): Promise<WorkspaceWindow>;

        /**
         * Adds a new group box to this box.
         * @param definition An object describing the type of the requested builder, alongside other settings.
         */
        addGroup(definition?: BoxDefinition | BoxBuilder): Promise<Group>;

        /**
         * Adds a new column box to this box.
         * @param definition An object describing the type of the requested builder, alongside other settings.
         */
        addColumn(definition?: BoxDefinition | BoxBuilder): Promise<Column>;

        /**
         * Adds a new row box to this box.
         * @param definition An object describing the type of the requested builder, alongside other settings.
         */
        addRow(definition?: BoxDefinition | BoxBuilder): Promise<Row>;

        /**
         * Removes the first immediate child of this box which satisfies the predicate.
         * @param predicate A filtering function (predicate) called for immediate child of this box.
         */
        removeChild(predicate: (child: WorkspaceElement) => boolean): Promise<void>;

        /**
         * Maximizes this box relative to it's parent box.
         */
        maximize(): Promise<void>;

        /**
         * Restores this box, if previously maximized.
         */
        restore(): Promise<void>;

        /**
         * Closes this box all of it's children.
         */
        close(): Promise<void>;
    }

    /** An object describing a row type workspace box */
    export interface Row extends Box {
        type: "row";

        /** Indicates if dragging of splitters is allowed in the row */
        allowSplitters?: boolean;

        /** Indicates whether or not the row is pinned */
        isPinned?: boolean;

        /**
         * Locks the row using a provided config object, which restricts various modification functionalities of the row
         * @param config This can be either an object or a function. When the object is provided, it overrides all other lock properties. When a function is provided, it will be called with the current lock settings and it should return a lock config, which will override the current settings. The function is recommended in all cases where overriding of the settings is not desired.
         */
        lock(config?: RowLockConfig | ((config: RowLockConfig) => RowLockConfig)): Promise<void>;

        /**
         * Sets a new height for the row
         * @param height A required number which should be the new height of the row
         */
        setHeight(height: number): Promise<void>;
    }

    /** An object describing a column type workspace box */
    export interface Column extends Box {
        type: "column";

        /** Indicates if dragging of splitters is allowed in the column */
        allowSplitters?: boolean;

        /** Indicates whether or not the column is pinned */
        isPinned?: boolean;

        /**
         * Locks the column using a provided config object, which restricts various modification functionalities of the column
         * @param config This can be either an object or a function. When the object is provided, it overrides all other lock properties. When a function is provided, it will be called with the current lock settings and it should return a lock config, which will override the current settings. The function is recommended in all cases where overriding of the settings is not desired.
         */
        lock(config?: ColumnLockConfig | ((config: ColumnLockConfig) => ColumnLockConfig)): Promise<void>;

        /**
         * Sets a new width for the column
         * @param width A required number which should be the new width of the column
         */
        setWidth(width: number): Promise<void>;
    }

    /** An object describing a group type workspace box */
    export interface Group extends Box {
        type: "group";

        /** Controls the users ability to extract windows from the group */
        allowExtract?: boolean;

        /** Controls the users ability to drop windows in the left zone of the group */
        allowDropLeft?: boolean;

        /** Controls the users ability to drop windows in the right zone of the group */
        allowDropRight?: boolean;

        /** Controls the users ability to drop windows in the top zone of the group */
        allowDropTop?: boolean;

        /** Controls the users ability to drop windows in the bottom zone of the group */
        allowDropBottom?: boolean;

        /** Controls the users ability to drop windows in header zone of the group */
        allowDropHeader?: boolean;

        /** Controls the visibility of the maximize/restore button located in the group header */
        showMaximizeButton?: boolean;

        /** Controls the visibility of the eject button located in the group header */
        showEjectButton?: boolean;

        /** Controls the visibility of the add window buttons (the ones with the plus icon) located in the group header */
        showAddWindowButton?: boolean;

        /**
         * Locks the group using a provided config object, which restricts various modification functionalities of the group
         * @param config This can be either an object or a function. When the object is provided, it overrides all other lock properties. When a function is provided, it will be called with the current lock settings and it should return a lock config, which will override the current settings. The function is recommended in all cases where overriding of the settings is not desired.
         */
        lock(config?: GroupLockConfig | ((config: GroupLockConfig) => GroupLockConfig)): Promise<void>;

        /**
         * Sets a new size for the group
         * @param sizeConfig A config object which should be the new size of the group.
         */
        setSize(sizeConfig: ElementResizeConfig): Promise<void>;
    }

    /** An object describing the basic details of a workspace window */
    export interface WorkspaceWindowSummary {
        /** An unique string identifier of the window */
        id: string | undefined;

        /** An unique string identifier of the workspace element that hosts the window */
        elementId: string;

        /** The type of the workspace element */
        type: "window";

        /** The string id of the frame containing this window */
        frameId: string;

        /** The application name of the window if it was registered as an application */
        appName: string;

        /** The string id of the workspace containing this window */
        workspaceId: string;

        /** The position of this window regarding it's siblings */
        positionIndex: number;

        /** A flag showing whether or not the window is maximized within it's box */
        isMaximized: boolean;

        /** A flag showing whether or not the window's content is loaded */
        isLoaded: boolean;

        /** A flag showing whether or not the window has focus */
        focused: boolean;

        /** The title of the window */
        title: string;

        /** Show whether or not the user can extract the specified window */
        allowExtract?: boolean;

        /** Indicates whether the close button which is located in the window's tab is visible */
        showCloseButton?: boolean;

        /** Indicates the current width of the window */
        width?: number;

        /** Indicates the current height of the window */
        height?: number;

        /** Indicates the configured minimum width of the window */
        minWidth?: number;

        /** Indicates the configured height width of the window */
        minHeight?: number;

        /** Indicates the configured maximum width of the window */
        maxWidth?: number;

        /** Indicates the configured maximum height of the window */
        maxHeight?: number;
    }

    /** An object describing a window part of an existing workspace */
    export interface WorkspaceWindow extends WorkspaceWindowSummary {

        /** An object representing the workspace, which contains this window */
        workspace: Workspace;

        /** An object representing the frame, which contains this window */
        frame: Frame;

        /** An object representing the parent box, which contains this window */
        parent: Workspace | WorkspaceBox;

        /**
         * Forces a window, which was added to the workspace to load it's contents.
         */
        forceLoad(): Promise<void>;

        /**
         * Gives focus to the window.
         */
        focus(): Promise<void>;

        /**
         * Closes the workspace window.
         */
        close(): Promise<void>;

        /**
         * Sets a new title to the workspace window.
         * @param title The new title for the window.
         */
        setTitle(title: string): Promise<void>;

        /**
         * Maximizes the workspace window relative to it's parent box.
         */
        maximize(): Promise<void>;

        /**
         * Restores a previously maximized workspace window.
         */
        restore(): Promise<void>;

        /**
         * Removes a workspace window from the workspace and turns it into a standalone window.
         */
        eject(): Promise<any>;

        /**
         * Returns the underlying GDWindow (Enterprise) or WebWindow (Core) of the workspace window.
         */
        getGdWindow(): any;

        /**
         * Moves the workspace window to a new box. In Glue42 Core this box must be part of the same frame.
         * @param box An object describing the new box of the window.
         */
        moveTo(box: WorkspaceBox): Promise<void>;

        /**
         * Sets a new size for the window
         * @param sizeConfig A config object which should be the new size of the window.
         */
        setSize(sizeConfig: ElementResizeConfig): Promise<void>;

        /**
         * Locks the window using a provided config object, which restricts various modification functionalities of the window
         * @param config This can be either an object or a function. When the object is provided, it overrides all other lock properties. When a function is provided, it will be called with the current lock settings and it should return a lock config, which will override the current settings. The function is recommended in all cases where overriding of the settings is not desired.
         */
        lock(config?: Glue42Workspaces.WorkspaceWindowLockConfig | ((config: Glue42Workspaces.WorkspaceWindowLockConfig) => Glue42Workspaces.WorkspaceWindowLockConfig)): Promise<void>;

        /**
         * Notifies when this window was removed from the workspace.
         * @param callback Callback function to handle the event.
         */
        onRemoved(callback: () => void): Promise<Unsubscribe>;
    }

    /** An object describing a builder user to create workspaces */
    export interface WorkspaceBuilder {
        /**
         * Adds a new row to the calling workspace. Returns the new row.
         * @param config An object describing the type of the requested builder, alongside other settings.
         */
        addRow(definition?: BoxDefinition): BoxBuilder;

        /**
         * Adds a new column to the calling workspace. Returns the new column.
         * @param config An object describing the type of the requested builder, alongside other settings.
         */
        addColumn(definition?: BoxDefinition): BoxBuilder;

        /**
         * Adds a new group to the calling workspace. Returns the new group.
         * @param config An object describing the type of the requested builder, alongside other settings.
         */
        addGroup(definition?: BoxDefinition): BoxBuilder;

        /**
         * Adds a new window to the calling workspace. Returns the calling workspace.
         * @param config An object describing the requested window.
         */
        addWindow(definition: WorkspaceWindowDefinition): WorkspaceBuilder;

        /**
         * Creates a new workspace using the builder as a blueprint for structure and contents.
         * @param config An object containing workspace creating options.
         */
        create(config?: WorkspaceCreateConfig): Promise<Workspace>;
    }

    /** An object describing a builder used to create workspace boxes */
    export interface BoxBuilder {
        /**
         * Adds a new row to the calling box. Returns the new row.
         * @param config An object describing the type of the requested builder, alongside other settings.
         */
        addRow(definition?: BoxDefinition): BoxBuilder;

        /**
         * Adds a new column to the calling box. Returns the new column.
         * @param config An object describing the type of the requested builder, alongside other settings.
         */
        addColumn(definition?: BoxDefinition): BoxBuilder;

        /**
         * Adds a new group to the calling box. Returns the new group.
         * @param config An object describing the type of the requested builder, alongside other settings.
         */
        addGroup(definition?: BoxDefinition): BoxBuilder;

        /**
         * Adds a new window to the calling box. Returns the immediate parent box of the window.
         * @param config An object describing the requested window.
         */
        addWindow(definition: WorkspaceWindowDefinition): BoxBuilder;

        /**
         * Returns the JSON object which describes the full structure of the box.
         */
        serialize(): BoxDefinition;
    }

    /** A configuration object used to save a current workspace as a layout */
    export interface WorkspaceLayoutSaveConfig {
        /**
         * A string used as name (doubles as id) of the layout, which is later used when restoring it. 
         */
        name: string;

        /**
         * A string representing the id of the workspace whose structure should be saved into a layout.
         */
        workspaceId: string;

        /** Toggles whether or not the current workspace context should be saved in the layout */
        saveContext?: boolean;

        /** Object which will be saved as part of the layout */
        metadata?: object;
    }

    /** An object describing the complete state of a frame at the time when the object was created */
    export interface FrameSnapshot {
        /**
         * A string identifier unique to each frame
         */
        id: string;
    }

    /** An object describing the complete state of a workspace at the time when the object was created */
    export interface WorkspaceSnapshot {
        /**
         * A string identifier unique to each workspace
         */
        id: string;
    }

    /** An API enabling basic CRUD workspaces actions */
    export interface WorkspaceLayoutsAPI {
        /**
         * Returns a collection of summarized layouts data. This data contains all the standard data excluding the actual structure of the layout.
         * This is helpful in cases where a simple query of existing layouts is needed without the complexity of transmitting the full layouts structure.
         */
        getSummaries(): Promise<WorkspaceLayoutSummary[]>;

        /**
         * Deletes a previously saved layout. In Glue42 Core delete will fail with an error in trying to delete a read-only layout, this is a layout defined in the glue.layouts.json file.
         * @param name The name of the layout to delete.
         */
        delete(name: string): Promise<void>;

        /**
         * Returns all layouts which satisfy the predicate. This collection of all saved layouts includes the layouts structure. If no predicate is provided, it returns all saved layouts.
         * @param predicate A filtering function (predicate) called for each saved layout.
         */
        export(predicate?: (layout: WorkspaceLayout) => boolean): Promise<WorkspaceLayout[]>;

        /**
         * Saves the provided layouts into Glue42. In Glue42 Core this will fail with an error if a provided layout's name matches a read-only layout.
         * @param layouts A collection of layouts to add to Glue42.
         */
        import(layouts: WorkspaceLayout[], mode?: "replace" | "merge"): Promise<void>;

        /**
         * Saves an existing, open workspace as a layout.
         * @param config An object describing the name of the layout and the id of the workspace, whose structure will be saved.
         */
        save(config: WorkspaceLayoutSaveConfig): Promise<WorkspaceLayout>;

        /**
         * Notifies when a layouts has been saved. This event is fired when a new layout has been saved and an existing layout has been updated.
         * @param callback Callback function to handle the event. Receives the saved layout as a parameter.
         */
        onSaved(callback: (layout: WorkspaceLayout) => void): Promise<Unsubscribe>;

        /**
         * Notifies when a layouts has been removed.
         * @param callback Callback function to handle the event. Receives the removed layout as a parameter.
         */
        onRemoved(callback: (layout: WorkspaceLayout) => void): Promise<Unsubscribe>;
    }

    /**
     * @docmenuorder 1
     */
    export interface API {
        /**
         * Checks whether or not the calling window is currently present inside of a workspace
         */
        inWorkspace(): Promise<boolean>;

        /**
         * Gets either a workspace or a box builder depending on the provided type inside the config object.
         * This builder is used to dynamically construct a workspace runtime.
         * @param config An object describing the type of the requested builder, alongside other settings.
         */
        getBuilder(config: BuilderConfig): WorkspaceBuilder | BoxBuilder;

        /**
         * Returns the frame instance of the calling window. Throws an error if the calling window is not part of a workspace.
         */
        getMyFrame(): Promise<Frame>;

        /**
         * Returns the first frame instance which satisfies the provided predicate or undefined, if non do.
         * @param predicate A filtering function (predicate) called for each open frame.
         */
        getFrame(predicate: (frame: Frame) => boolean): Promise<Frame>;

        /**
         * Returns all frames which satisfy the provided predicate. If no predicate is provided, will return all frames.
         * @param predicate A filtering function (predicate) called for each open frame.
         */
        getAllFrames(predicate?: (frame: Frame) => boolean): Promise<Frame[]>;

        /**
         * Returns an collection of objects, where each object contains basic information about an open workspace.
         * This function was designed for easy and quick listing of existing workspaces without adding the complexity of transmitting the entire structure of each workspace.
         */
        getAllWorkspacesSummaries(): Promise<WorkspaceSummary[]>;

        /**
         * Returns the instance of the workspace where the calling window is located.
         * Throws an error if the calling window is not not part of any workspace.
         */
        getMyWorkspace(): Promise<Workspace>;

        /**
         * Returns the first workspace instance which satisfies the provided predicate or undefined, if non do.
         * @param predicate A filtering function (predicate) called for each open workspace.
         */
        getWorkspace(predicate: (workspace: Workspace) => boolean): Promise<Workspace>;

        /**
         * Returns an instance of the workspace with the passed id. The performance is better than getWorkspace when querying for a workspace by id.
         * @param workspaceId The id of the desired workspace 
         */
        getWorkspaceById(workspaceId: string): Promise<Workspace>;

        /**
         * Returns all workspaces which satisfy the provided predicate. If no predicate is provided, will return all workspaces.
         * @param predicate A filtering function (predicate) called for each open workspace.
         */
        getAllWorkspaces(predicate?: (workspace: Workspace) => boolean): Promise<Workspace[]>;

        /**
         * Returns the workspace window instance of the first window, which is part of a workspace and satisfies the provided predicate.
         * This function will search recursively in all open workspaces.
         * @param predicate A filtering function (predicate) called for each window in each open workspace.
         */
        getWindow(predicate: (workspaceWindow: WorkspaceWindow) => boolean): Promise<WorkspaceWindow>;

        /**
         * Returns the instance of the first box, which satisfies the provided predicate.
         * This function will search recursively in all open workspaces.
         * @param predicate A filtering function (predicate) called for each box in each open workspace.
         */
        getBox(predicate: (box: WorkspaceBox) => boolean): Promise<WorkspaceBox>;

        /**
         * Opens a new workspace by restoring a previously saved workspace layout.
         * @param name The name of a saved workspace layout, which will be restored.
         * @param options An optional object containing various workspace restore options.
         */
        restoreWorkspace(name: string, options?: RestoreWorkspaceConfig): Promise<Workspace>;

        /**
         * Opens a new workspace based on the provided definition.
         * @param definition An object describing the shape and options of the workspace.
         * @param saveConfig An object used to set various create options.
         */
        createWorkspace(definition: WorkspaceDefinition, saveConfig?: WorkspaceCreateConfig): Promise<Workspace>;

        /**
         * Wait for a frame with the specified id to be loaded. 
         * It's needed when using the workspaces-api from a custom workspaces frame and you have the frameId,
         * but the frame object is not populated in the API yet (e.g. the frame is in the pool)
         * @param id the id of the frame that should be waited
         */
        waitForFrame(id: string): Promise<Frame>;

        /**
         * An API which gives full read, write and delete access to the workspaces layouts.
         */
        layouts: WorkspaceLayoutsAPI;

        /**
         * Notifies when a new frame was opened and returns an unsubscribe function.
         * @param callback Callback function to handle the event. Receives the added frame as a parameter.
         */
        onFrameOpened(callback: (frame: Frame) => void): Promise<Unsubscribe>;

        /**
         * Notifies when a new frame was closed and returns an unsubscribe function.
         * @param callback Callback function to handle the event. Receives an object containing the id of the closed frame as a parameter.
         */
        onFrameClosed(callback: (closed: { frameId: string }) => void): Promise<Unsubscribe>;

        /**
         * Notifies when a new workspace was opened in any of the opened frames and returns an unsubscribe function.
         * @param callback Callback function to handle the event. Receives the added workspace as a parameter.
         */
        onWorkspaceOpened(callback: (workspace: Workspace) => void): Promise<Unsubscribe>;

        /**
         * Notifies when a workspace present in any of the opened frames was closed and returns an unsubscribe function.
         * @param callback Callback function to handle the event. Receives an object with the closed workspace id and frame id as a parameter.
         */
        onWorkspaceClosed(callback: (closed: { frameId: string; workspaceId: string }) => void): Promise<Unsubscribe>;

        /**
         * Notifies when a new window was added to any workspace in any frame and returns an unsubscribe function.
         * An added window means that the window has a place in a workspace (it is a valid workspace element), but does not guarantee that the contents of the window are loaded.
         * @param callback Callback function to handle the event. Receives the added window as a parameter.
         */
        onWindowAdded(callback: (workspaceWindow: WorkspaceWindow) => void): Promise<Unsubscribe>;

        /**
         * Notifies when a window's content was loaded in any workspace in any frame and returns an unsubscribe function.
         * A loaded window is a window, which was added to a workspace, it's contents were loaded and it is present in the windows collection.
         * @param callback Callback function to handle the event. Receives the loaded window as a parameter.
         */
        onWindowLoaded(callback: (workspaceWindow: WorkspaceWindow) => void): Promise<Unsubscribe>;

        /**
         * Notifies when a window was removed from any workspace and any frame and returns an unsubscribe function.
         * @param callback Callback function to handle the event. Receives an object containing the ids of the removed window, and the respective workspace and frame as a parameter.
         */
        onWindowRemoved(callback: (removed: { windowId?: string; workspaceId: string; frameId: string }) => void): Promise<Unsubscribe>;

    }
}
