import { expect } from "chai";
import { createGlue, doneAllGlues } from "../initializer";
import { Glue42Core } from "../../glue";
import { generate } from "shortid";
import { PromiseWrapper } from "../../src/utils/pw";
// tslint:disable:no-unused-expression

describe("contexts.drop", () => {

    let glue!: Glue42Core.GlueCore;
    let glue2!: Glue42Core.GlueCore;

    beforeEach(async () => {
        glue = await createGlue();
        glue2 = await createGlue();
    });

    afterEach(async () => {
        await doneAllGlues();
    });

    it("updated a context and then drop it", async () => {
        const name = generate();
        await glue.contexts.set(name, { a: 1, b: { bb: 2 } });
        await glue.contexts.destroy(name);
        const result = new PromiseWrapper();

        setTimeout(() => {
            if (glue.contexts.all().find((c) => c === name)) {
                return Promise.reject("context should not be there");
            }
            if (glue2.contexts.all().find((c) => c === name)) {
                return Promise.reject("context should not be there");
            }
            result.resolve();
        }, 100);
        return result.promise;
    });

    it("updated a context and then drop it from the other side", async () => {
        const name = generate();
        await glue.contexts.set(name, { a: 1, b: { bb: 2 } });
        glue2.contexts.subscribe(name, () => {
            glue2.contexts.destroy(name);
        });

        const result = new PromiseWrapper();
        setTimeout(() => {
            if (glue.contexts.all().find((c) => c === "a")) {
                return Promise.reject("context should not be there");
            }
            if (glue2.contexts.all().find((c) => c === "a")) {
                return Promise.reject("context should not be there");
            }
            result.resolve();
        }, 100);
        return result;
    });

    it.skip("subscribe -> update -> destroy -> update, subscription should work", async () => {
        // this needs to be fixed
        const result = new PromiseWrapper();
        const name = generate();

        await glue.contexts.subscribe(name, (ctx) => {
            if (ctx.a === 2) {
                result.resolve();
            }
        });

        await glue2.contexts.update(name, { a: 1 });
        await glue2.contexts.destroy(name);
        glue2.contexts.update(name, { a: 2 });

        return result.promise;
    });
});
