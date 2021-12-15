describe("first ", function() {

    before(async () => await coreReady);

    it("case", () => {
        expect(1).to.eql(1);
    });

    it("gtf", () => {
        expect(gtf.puppet).to.not.be.undefined;
    });

    it("try it", (done) => {
        gtf.puppet.tryServer();

        setTimeout(() => done(), 3000);
    })
});
