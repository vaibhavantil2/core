// Last review version:  4.3.1
describe('unregister()', function () {

    before(() => coreReady);

    before(() => {
        window.name = gtf.agm.getMethodName();
        window.methodDefinition = {
            name,
        };
        window.callbackNeverCalled = () => {
        };
    })

    const registerMethod = async (name) => {
        await glue.agm.register(name, callbackNeverCalled);
        // const waitPromise = gtf.agm.waitForMethod(glue, name, glue.agm.instance);
        // await waitPromise;
    };

    beforeEach(() => {
        name = gtf.agm.getMethodName();
        methodDefinition = { name };
        // why?
        methodDefinition = { name };

        glueApplicationOne = undefined;
    });

    afterEach(() => {
        gtf.clearWindowActiveHooks();
        if (glueApplicationOne) {
            return glueApplicationOne.stop();
        }
    });

    it('Should remove method when called with "name" as (string)', async () => {
        await registerMethod(name);
        await glue.agm.unregister(name);
        expect(glue.agm.methods({ name }).length).to.equal(0);
    });

    it('Should remove method when called with methodDefinition object with "name" (methodDefinition) ', async () => {
        await registerMethod(methodDefinition);
        await glue.agm.unregister(methodDefinition);
        expect(glue.agm.methods({ name }).length).to.equal(0);
    });

    it('Should remove method when called with methodDefinition object with all properties (methodDefinition)', async () => {
        const fullMethodDefinition = Object.assign({}, methodDefinition, {
            accepts: 'int a',
            returns: 'int b',
            description: 'awesome test',
            objectTypes: ['DontFail!'],
            version: 42,
            displayName: 'Awesome Method',
        });

        await registerMethod(fullMethodDefinition);
        await glue.agm.unregister(fullMethodDefinition);
        expect(glue.agm.methods({ name }).length).to.equal(0);
    });

    it('Should remove method when called with name but registered with full methodDefinition (string)', async () => {
        const fullMethodDefinition = Object.assign({}, methodDefinition, {
            accepts: 'int a',
            returns: 'int b',
            description: 'awesome test',
            objectTypes: ['DontFail!'],
            version: 42,
            displayName: 'Awesome Method',
        });

        await registerMethod(fullMethodDefinition);
        await glue.agm.unregister(name);
        expect(glue.agm.methods({ name }).length).to.equal(0);
    });

    it('Should remove method when called with a full methodDefinition but registered only with name (methodDefinition)', async () => {
        const fullMethodDefinition = Object.assign({}, methodDefinition, {
            accepts: 'int a',
            returns: 'int b',
            description: 'awesome test',
            objectTypes: ['DontFail!'],
            version: 42,
            displayName: 'Awesome Method',
        });

        await registerMethod(name);
        await glue.agm.unregister(fullMethodDefinition);
        expect(glue.agm.methods({ name }).length).to.equal(0);
    });

    it('Should resolve when called with a simple name predicate (predicate)', async () => {
        await registerMethod(name);
        await glue.agm.unregister((md) => md.name === name);
    });

    [{
        prop: 'accepts',
        value: 'int smth'
    }, {
        prop: 'objectTypes',
        value: ['AType']
    }].forEach(({ prop, value }) => {
        it('Should resolve when called with any kind of method definition property predicate (predicate) ... ' + prop, async () => {
            const methodDef = { name, [prop]: value };
            await registerMethod(methodDef);
            await glue.agm.unregister((md) => md[prop] === value);
        });
    });

    it('Should remove BOTH methods that match the condition (predicate)', async () => {
        const desc = 'unregMePlease';

        await Promise.all([
            registerMethod({
                name: gtf.agm.getMethodName(),
                description: desc
            }),
            registerMethod({
                name: gtf.agm.getMethodName(),
                description: desc
            })
        ]);


        await glue.agm.unregister((md) => md.description === desc)
            .then(() => {
                const methods = glue.agm.methods({ description: desc });
                expect(methods).to.be.an('array');
                expect(methods.length).to.eql(0);
            });
    });

    it('Should reject when there are no methods that match the definition (string).', (done) => {
        glue.agm.unregister('non-existing-method')
            .then(() => done('Should not have resolved'))
            .catch(() => done());
    });

    it('Should reject when there are no methods that match the definition (methodDefinition).', (done) => {
        glue.agm.unregister({ name: 'non-existing-method' })
            .then(() => done('Should not have resolved'))
            .catch(() => done());
    });

    // Race case (GW) Change length
    Array.from({ length: 1 }).forEach(() => {
        it('Should resolve when the method is really removed from glue.agm.methods', async () => {
            const waitPromise = gtf.agm.waitForMethod(glue, name, glue.agm.instance);

            registerMethod(name);

            await waitPromise;
            await glue.agm.unregister(name);

            const methods = glue.agm.methods({ name });
            expect(methods).to.be.an('array');
            expect(methods.length).to.eql(0);
        });
    });

    it('Should reject when somebody tries to unregister a method that hasn\'t been registered by them. (methodDefinition)', (done) => {
        gtf.createApp()
            .then(glueApp => {
                window.glueApplicationOne = glueApp;
                return glueApplicationOne.agm.register(methodDefinition, callbackNeverCalled);
            })
            .then(() => {
                glue.agm.unregister(name)
                    .catch(() => done());
            })
            .catch(done);
    });

    it('Should reject when trying to unregister a method from different server (predicate)', (done) => {
        gtf.createApp()
            .then(glueApp => {
                window.glueApplicationOne = glueApp;
                return glueApplicationOne.agm.register(methodDefinition, callbackNeverCalled);
            })
            .then(() => {
                glue.agm.unregister((md) => md.name === name)
                    .catch(() => done());
            })
            .catch(done);
    });

    it('Should reject when trying to unregister a stream. (stream.name)', (done) => {
        glue.agm.createStream(methodDefinition)
            .then(stream => {
                glue.agm.unregister(stream.name)
                    .catch(() => done());
            })
            .catch(done);
    });

    it('Should reject when trying to unregister a stream. (predicate)', (done) => {
        glue.agm.createStream(methodDefinition)
            .then(stream => {
                glue.agm.unregister((md) => md.name === stream.name)
                    .catch(() => done());
            })
            .catch(done);
    });

    it('Should reject when the definition is undefined (string).', (done) => {
        glue.agm.unregister(undefined).catch(() => done());
    });

    it('Should reject when the definition object is empty (methodDefinition).', (done) => {
        glue.agm.unregister({}).catch(() => done());
    });

    it('Should reject when predicate doesnt match any method name(predicate)', (done) => {
        registerMethod(name).then(() => {
            glue.agm.unregister((md) => md.name === 'none <> existing')
                .catch(() => done());
        }).catch(done);
    });

    it('Should reject when predicate is called with non-existing methodDefinition prop', (done) => {
        registerMethod(name).then(() => {
            glue.agm.unregister((md) => md['wrongProp'] === name)
                .catch(() => done());
        }).catch(done);
    });

    it('Should be able to register a method synchronously on the next line after unregistering it', async () => {
        // JPM
        await glue.agm.register(name, callbackNeverCalled);
        glue.agm.unregister(name);
        await glue.agm.register(name, callbackNeverCalled);
    });
});
