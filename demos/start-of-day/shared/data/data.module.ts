import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DataService } from "./data.service";
import { GlueService } from "./glue.service";

@NgModule({
    imports: [CommonModule]
})
export class DataModule {
    static forRoot(): any {
        return {
            ngModule: DataModule,
            providers: [DataService, GlueService]
        };
    }
}