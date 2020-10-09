import { expect } from "chai";
import { createGlue, doneAllGlues } from "../initializer";
import { Glue42Core } from "../../glue";
import { dataStore } from "../data";
import { Update, testCases, verify } from "./cases";
import { init } from "../core/base";
import { generate } from "shortid";
import { PromiseWrapper } from "../../src/utils/pw";
// tslint:disable:no-unused-expression

describe("contexts.core", () => {

    let glue!: Glue42Core.GlueCore;
    let glue2!: Glue42Core.GlueCore;

    beforeEach(async () => {
        glue = await createGlue();
        glue2 = await createGlue();
    });

    afterEach(async () => {
        await doneAllGlues();
    });

    it("check if set works correctly", (done) => {
        const data: Update[] = dataStore.map((i) => {
            return {
                data: i
            };
        });
        verify(glue, glue, data, done, true);
    });

    it("subscribe for non-existing and then set", async () => {
        const result = new PromiseWrapper();
        const ctxName = generate();
        glue.contexts.subscribe(ctxName, (ctx) => {
            if (ctx.a === 1) {
                result.resolve();
            }
        });
        glue.contexts.set(ctxName, { a: 1 });
        return result.promise;
    });

    it("subscribe for non-existing and then someone else set it", async () => {
        const result = new PromiseWrapper();
        const ctxName = generate();
        glue.contexts.subscribe(ctxName, (ctx) => {
            if (ctx.a === 1) {
                result.resolve();
            }
        });
        glue2.contexts.set(ctxName, { a: 1 });
        return result.promise;
    });

    it("should get copy objects of the contexts", async () => {
        const result = new PromiseWrapper();
        const ctxName = generate();
        await glue2.contexts.set(ctxName, { a: 1 });
        glue.contexts.subscribe(ctxName, (ctx) => {
            if (ctx.b === 1) {
                result.resolve();
            }
            ctx.b = 1;
            glue.contexts.update(ctxName, ctx);
        });
        return result.promise;
    });

    for (const testCase of testCases) {
        it("hear myself - " + testCase.title, (done) => {
            verify(glue, glue, testCase.test, done);
        });

        it("hear others - " + testCase.title, (done) => {
            verify(glue, glue2, testCase.test, done);
        });
    }
});
