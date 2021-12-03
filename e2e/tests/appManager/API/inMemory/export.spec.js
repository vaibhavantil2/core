describe('export() ', function () {

    this.timeout(60000);

    const extraDefOne = {
        name: "ExtraOne",
        type: "window",
        details: {
            url: "http://localhost:4242/dummyApp/index.html"
        },
        customProperties: {
            includeInWorkspaces: true
        }
    };

    before(async () => {
        await coreReady;

        definitionsOnStart = await glue.appManager.inMemory.export();
    });

    afterEach(() => glue.appManager.inMemory.import(definitionsOnStart, "replace"));

    const baseDefinition = {
        name: "SimpleOne",
        type: "window",
        title: "SimpleOne",
        details: {
            url: "http://localhost:4242/dummyApp/index.html"
        },
        customProperties: {
            includeInWorkspaces: true
        }
    };

    const getMassApps = (numberOfDefs, namePrefix) => {
        const originalName = baseDefinition.name;

        const apps = Array.from({ length: numberOfDefs }).map((el, idx) => {

            const name = namePrefix ? namePrefix + originalName + idx.toString() : originalName + idx.toString();

            return Object.assign({}, baseDefinition, { name });
        });

        return apps;
    };

    it("should return a promise", async () => {
        const appsExportPromise = glue.appManager.inMemory.export();

        expect(appsExportPromise.then).to.be.a("function");
        expect(appsExportPromise.catch).to.be.a("function");

        await appsExportPromise;
    });

    it("should resolve with a valid Glue definitions array", async () => {
        await glue.appManager.inMemory.import([extraDefOne], "merge");

        const apps = await glue.appManager.inMemory.export();

        expect(Array.isArray(apps)).to.be.true;
        apps.forEach((app) => {
            expect(app.name).to.be.a("string");
            expect(app.details).to.be.an("object");
        });
    });

    it("the exported definitions should be the same number as the ones returned from applications", async () => {
        await glue.appManager.inMemory.import([extraDefOne], "merge");

        const exported = await glue.appManager.inMemory.export();
        const returned = glue.appManager.applications();

        expect(exported.length).to.eql(returned.length);
    });

    it("the exported definitions have the same names as the ones returned from applications", async () => {
        await glue.appManager.inMemory.import([extraDefOne], "merge");

        const exported = await glue.appManager.inMemory.export();
        const returned = glue.appManager.applications();

        exported.forEach((exp) => {
            expect(returned.some((ret) => ret.name === exp.name));
        });
    });

    it('should wait a running bulk import and return correct collection of 9000 app definitions when triggered in parallel', async () => {
        const massDefs = getMassApps(9000);

        const [_, exported] = await Promise.all([
            glue.appManager.inMemory.import(massDefs, "replace"),
            glue.appManager.inMemory.export()
        ]);

        expect(exported.length).to.eql(9000);
    });
});

