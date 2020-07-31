describe("what if? ", () => {

    let inst;
    let method;

    before(() => {
        return Promise.all([glueReady, gtfReady]);
    });

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

    it("can I fly 2", async () => {
        const found = glue.appManager.application("supportApp");
        expect(found).to.not.be.an('undefined');
    });

    it("can I fly 3", async () => {
        const found = glue.appManager.application("supportApp");
        inst = await found.start();

        expect(inst).to.not.be.an('undefined');
    });

    it("can I fly 4", (done) => {
        const found = glue.appManager.application("supportApp");

        glue.interop
            .register("G42Core.Hello", () => {
                done();
            })
            .then(() => {
                return found.start();
            })
            .then((ins) => {
                inst = ins;
            })
            .catch(done);
    });
});
