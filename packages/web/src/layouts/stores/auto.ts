import { Glue42Web } from "../../../web";

interface LocalStorageEntry {
    [name: string]: Glue42Web.Layouts.Layout;
}

export class AutoStorage {

    private static readonly KEY = "G0_layouts";

    public get(name: string, type: Glue42Web.Layouts.LayoutType): Glue42Web.Layouts.Layout | undefined {
        const obj = this.getObjectFromLocalStorage();
        const key = this.getKey(name, type);
        return obj[key];
    }

    public save(layout: Glue42Web.Layouts.Layout): Glue42Web.Layouts.Layout {
        const obj = this.getObjectFromLocalStorage();
        const key = this.getKey(layout.name, layout.type);
        obj[key] = layout;
        this.setObjectToLocalStorage(obj);
        return layout;
    }

    public remove(name: string, type: Glue42Web.Layouts.LayoutType): void {
        const obj = this.getObjectFromLocalStorage();
        const key = this.getKey(name, type);
        delete obj[key];
    }

    private getObjectFromLocalStorage(): LocalStorageEntry {
        const values = window.localStorage.getItem(AutoStorage.KEY);
        if (values) {
            return JSON.parse(values);
        }
        return {};
    }

    private setObjectToLocalStorage(obj: LocalStorageEntry): void {
        window.localStorage.setItem(AutoStorage.KEY, JSON.stringify(obj));
    }

    private getKey(name: string, type: string): string {
        return `${type}_${name}`;
    }
}
