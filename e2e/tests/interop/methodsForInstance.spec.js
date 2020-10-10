describe('methodsForInstance()', function () {

    before(() => coreReady);

    before(() => gtf.createApp()
        .then((glueApplication) => {
            window.name1 = gtf.agm.getMethodName();
            window.name2 = gtf.agm.getMethodName();
            window.name3 = gtf.agm.getMethodName();
            window.name4 = gtf.agm.getMethodName();
            window.name5 = gtf.agm.getMethodName();
            window.callbackNeverCalled = () => {
            };

            const accepts1 = 'String test1';
            const description1 = 'Description1';
            const displayName1 = 'DisplayName1';
            const objectTypes1 = ['objectTypes1'];
            const returns1 = 'String test1';
            const methodDefinition1 = {
                name: name1,
                accepts: accepts1,
                description: description1,
                displayName: displayName1,
                objectTypes: objectTypes1,
                returns: returns1,
            };

            const accepts2 = 'String test2';
            const description2 = 'Description2';
            const displayName2 = 'DisplayName2';
            const objectTypes2 = ['objectTypes2'];
            const returns2 = 'String test2';
            const methodDefinition2 = {
                name: name2,
                accepts: accepts2,
                description: description2,
                displayName: displayName2,
                objectTypes: objectTypes2,
                returns: returns2,
            };

            const accepts3 = 'String test3';
            const description3 = 'Description3';
            const displayName3 = 'DisplayName3';
            const objectTypes3 = ['objectTypes3'];
            const returns3 = 'String test3';
            const methodDefinition3 = {
                name: name3,
                accepts: accepts3,
                description: description3,
                displayName: displayName3,
                objectTypes: objectTypes3,
                returns: returns3,
            };

            const accepts4 = 'String test4';
            const description4 = 'Description4';
            const displayName4 = 'DisplayName4';
            const objectTypes4 = ['objectTypes4'];
            const returns4 = 'String test4';
            const methodDefinition4 = {
                name: name4,
                accepts: accepts4,
                description: description4,
                displayName: displayName4,
                objectTypes: objectTypes4,
                returns: returns4,
            };

            const accepts5 = 'String test5';
            const description5 = 'Description5';
            const displayName5 = 'DisplayName5';
            const objectTypes5 = ['objectTypes5'];
            const returns5 = 'String test5';
            const methodDefinition5 = {
                name: name5,
                accepts: accepts5,
                description: description5,
                displayName: displayName5,
                objectTypes: objectTypes5,
                returns: returns5,
            };

            window.glueApplicationOne = glueApplication;
            const promise1 = glueApplicationOne.agm.register(methodDefinition1, callbackNeverCalled);
            const promise2 = glueApplicationOne.agm.register(methodDefinition2, callbackNeverCalled);
            const promise3 = glueApplicationOne.agm.register(methodDefinition3, callbackNeverCalled);
            const promise4 = glueApplicationOne.agm.register(methodDefinition4, callbackNeverCalled);
            const promise5 = glueApplicationOne.agm.register(methodDefinition5, callbackNeverCalled);

            return Promise.all([promise1, promise2, promise3, promise4, promise5]);
        }));

    after(() => {
        return glueApplicationOne.stop();
    });

    it('Should return all methods registered by the provided server instance.', (done) => {
        const methods = glue.agm.methodsForInstance(glueApplicationOne.myInstance.agm).filter((m) => [name1, name2, name3, name4, name5].includes(m.name));

        expect(methods.length).to.eql(5);
        done();
    });

    it('Should return an empty array when called with a non-existing server instance.', (done) => {
        expect(glue.agm.methodsForInstance({
            application: 'not-existing-application',
            environment: 'TRAINING',
            machine: 'DESKTOP-Q2H9A9K',
            user: 'ggeorgiev',
        })).to.eql([]);
        done();
    });

    it('Should throw an error when called with undefined. | Ticket: https://jira.tick42.com/browse/GLUE_D-1884', (done) => {
        try {
            glue.agm.methodsForInstance(undefined);
        } catch (err) {
            done();
        }
    });
});