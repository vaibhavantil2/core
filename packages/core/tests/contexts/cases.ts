import { generate } from "shortid";
import { Glue42Core } from "../../glue";
import { expect } from "chai";

export interface TestItem {
    title: string;
    test: Update[];
}

export interface Update {
    data: object;
    expected?: object;
}

export const testCases: TestItem[] = [
    {
        title: "adding simple props",
        test: [
            { data: { a: 1 } },
            { data: { b: 2 }, expected: { a: 1, b: 2 } },
            { data: { a: 3, b: 3 }, expected: { a: 3, b: 3 } }]
    },
    {
        title: "removing simple props",
        test: [
            { data: { a: 1, b: 1 } },
            { data: { b: null }, expected: { a: 1, } },
            { data: { a: null }, expected: {} }
        ]
    },
    {
        title: "replacing object",
        test: [
            { data: { a: { aa: 1 }, b: 1 } },
            { data: { a: { bb: 2 } }, expected: { a: { bb: 2 }, b: 1 } }
        ]
    },
    {
        title: "removing objects",
        test: [
            { data: { a: { aa: 1 }, b: 1 } },
            { data: { a: null }, expected: { b: 1 } }
        ]
    },
    {
        title: "null on inner level",
        test: [
            { data: { a: { aa: 1, bb: 2 } } },
            { data: { a: { aa: null, bb: 2 } }, expected: { a: { aa: null, bb: 2 } } }
        ]
    }

];

export function verify(updater: Glue42Core.GlueCore, subscriber: Glue42Core.GlueCore, data: Update[], done: (err?: any) => void, shouldSet?: boolean) {
    let index = -1;
    const ctxName = generate();
    const update = () => {
        index++;
        if (index >= data.length) {
            done();
            return;
        }
        const updateData = data[index].data;
        if (shouldSet) {
            updater.contexts.set(ctxName, updateData);
        } else {
            updater.contexts.update(ctxName, updateData);
        }
    };

    subscriber.contexts.subscribe(ctxName, ((d) => {
        try {
            const expectedData = data[index].expected || data[index].data;
            expect(d).to.deep.equal(expectedData);
        } catch (e) { done(e); }
        update();
    })).then(() => {
        // trigger initial update
        update();
    });
}
