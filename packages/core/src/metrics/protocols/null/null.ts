import { Protocol } from "../../types";
import { Glue42Core } from "../../../../glue";

export class NullProtocol implements Protocol {
    public init(repo: Glue42Core.Metrics.Repository): void {
        // do nothing
    }

    public createSystem(system: Glue42Core.Metrics.System): Promise<void> {
        return Promise.resolve();
    }

    public updateSystem(metric: Glue42Core.Metrics.System, state: Glue42Core.Metrics.State): Promise<void> {
        return Promise.resolve();
    }

    public createMetric(metric: Glue42Core.Metrics.Metric): Promise<void> {
        return Promise.resolve();
    }

    public updateMetric(metric: Glue42Core.Metrics.Metric): Promise<void> {
        return Promise.resolve();
    }
}
