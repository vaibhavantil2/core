describe("what if? ", () => {

    let inst;
    let method;

    before(() => coreReady);

    afterEach(async () => {
        if (inst) {
            await inst.stop()
            inst = null;
        }

        if (method) {
            await glue.interop.unregister(method);
        }
    });

    it("can I fly", async () => {
        expect(glue.appManager).to.not.be.an('undefined');
    });

    it('asd0', () => {
        expect(gtf).to.not.be.an('undefined');
        expect(gtf.waitFor).to.not.be.an('undefined');
        expect(gtf.getWindowName).to.not.be.an('undefined');
        expect(gtf.getGlueConfigJson).to.not.be.an('undefined');
        expect(gtf.getChannelNames).to.not.be.an('undefined');
        expect(gtf.createApp).to.not.be.an('undefined');
    });

    it('asd', async () => {
        console.log(glue.windows.list().length);
        const app = await gtf.createApp();
        console.log(glue.windows.list().length);
        await app.stop();
        console.log(glue.windows.list().length);
    });

    it('asd2', async () => {
        const app = await gtf.createApp();
        await app.setContext("testMe", { test: 42 });

        const all = glue.contexts.all();
        console.log(all);
        await app.stop();
    });
});
