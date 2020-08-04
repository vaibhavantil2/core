import { expect } from "chai";
import { createGlue, doneAllGlues } from "../initializer";
import { Glue42Core } from "../../glue";
import { dataStore } from "../data";
import { Update, testCases, verify } from "./cases";
import { generate } from "shortid";
// tslint:disable:no-unused-expression

describe.only("contexts.setPath", () => {

    let glue!: Glue42Core.GlueCore;
    let glue2!: Glue42Core.GlueCore;

    beforeEach(async () => {
        glue = await createGlue();
        glue2 = await createGlue();
    });

    afterEach(async () => {
        await doneAllGlues();
    });

    it.only("check if set works correctly", (done) => {
        const ctxName = generate();
        glue2.contexts.subscribe(ctxName, (obj) => {
            // tslint:disable-next-line:no-console
            console.log(obj);
            if (obj?.person?.address?.number === 21) {
                done();
            }
        });
        glue.contexts.update(ctxName, { person: { name: "john" } }).then(() => {
            // TODO - remove setTimeout, possible GW issue
            setTimeout(() => {
                glue.contexts.setPath(ctxName, "person.address.number", 21);
            }, 100);
        });
    });
});
