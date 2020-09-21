import { expect } from "chai";
import { createGlue, doneAllGlues } from "../initializer";
import { Glue42Core } from "../../glue";
import { generate } from "shortid";
import { PromiseWrapper } from "../../src/utils/pw";

describe("contexts.setPath", () => {

    let glue!: Glue42Core.GlueCore;
    let glue2!: Glue42Core.GlueCore;

    beforeEach(async () => {
        glue = await createGlue();
        glue2 = await createGlue();
    });

    afterEach(async () => {
        await doneAllGlues();
    });

    interface Test {
        initial: any;
        set?: Glue42Core.Contexts.PathValue[];
        setPath?: string;
        setValue?: any;
        expected: any;
    }

    const verify = async (t: Test) => {
        const pw = new PromiseWrapper();
        const ctxName = generate();
        await glue.contexts.set(ctxName, t.initial);
        let updates = 0;
        glue2.contexts.subscribe(ctxName, (obj) => {
            updates++;
            if (updates === 1) {
                if (t.setPath || t.setValue) {
                    glue.contexts.setPath(ctxName, t.setPath!, t.setValue);
                } else if (t.set) {
                    glue.contexts.setPaths(ctxName, t.set);
                }
                return;
            }
            try {
                expect(obj).to.deep.equal(t.expected);
            } catch (e) {
                pw.reject(e);
            }
            pw.resolve();
        });
        return pw.promise;
    };

    it("add new simple property to inner object", async () => {
        return verify({
            initial: { person: { name: "john", address: { street: "11" } } },
            setPath: "person.address.number",
            setValue: 21,
            expected: { person: { name: "john", address: { street: "11", number: 21 } } }
        });
    });

    it("add object property to inner object", async () => {
        return verify({
            initial: { person: { name: "john", address: { street: "11" } } },
            setPath: "person.address.lines",
            setValue: [{ a: 1 }, { b: 2 }],
            expected: { person: { name: "john", address: { street: "11", lines: [{ a: 1 }, { b: 2 }] } } }
        });
    });

    it("delete property from inner object", async () => {
        return verify({
            initial: { person: { name: "john", address: { street: "11" } } },
            setPath: "person.address",
            setValue: null,
            expected: { person: { name: "john" } }
        });
    });

    it("set without path replaces the whole context", async () => {
        return verify({
            initial: { person: { name: "john", address: { street: "11" } } },
            setPath: "",
            setValue: { a: 1 },
            expected: { a: 1 }
        });
    });

    it("set multiple paths (using setPaths) that add, update, remove props", async () => {
        return verify({
            initial: { person: { name: "john", address: { street: "11" } }, removeMe: 11 },
            set: [
                { path: "removeMe", value: null },
                { path: "person.name", value: "steve" },
                { path: "person.address.street", value: null },
                { path: "person.address.number", value: 10 },
                { path: "person.lastName", value: "stevenson" },
            ],
            expected: { person: { name: "steve", lastName: "stevenson", address: { number: 10 } } },
        });
    });

    it("setting un-existing paths is ok", async () => {
        return verify({
            initial: {},
            set: [
                { path: "person.address.number", value: 10 },
            ],
            expected: { person: { address: { number: 10 } } },
        });
    });

    it("switching type of data", async () => {
        return verify({
            initial: {
                person: 1, address: { street: "pob" }, city: { name: "Sofia" }
            },
            set: [
                { path: "person.name", value: "steve" },
                { path: "address.street", value: { name: "pob" } },
                { path: "city", value: "Sofia" },
            ],
            expected: {
                person: { name: "steve" }, address: { street: { name: "pob" } }, city: "Sofia"
            },
        });
    });

    it("setting and removing invalid paths", async () => {
        return verify({
            initial: { person: 1 },
            set: [
                { path: "removeMe", value: null },
                { path: "person.name", value: "steve" },
                { path: "person2.address.street", value: null },
                { path: "person2.address.number", value: 10 },
                { path: "person2.lastName", value: "stevenson" },
            ],
            expected: { person: { name: "steve" }, person2: { lastName: "stevenson", address: { number: 10 } } },
        });
    });
});
