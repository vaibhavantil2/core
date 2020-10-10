describe('methodRemoved()', function () {

    before(() => coreReady);

    describe('AGM events about my actions: ', function () {
        let currentStream;

        before(() => window.methodDefinition = {
            name: gtf.agm.getMethodName()
        });

        const cleanUp = () => {
            return new Promise((resolve, reject) => {

                const method = glue.agm.methods().find(m => m.name === methodDefinition.name);

                if (method && !method.supportsStreaming) {

                    gtf.agm.clearMethod(methodDefinition.name, glue.agm.instance)
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            reject(err);
                        });

                } else if (method && method.supportsStreaming) {

                    gtf.agm.clearStream(currentStream, glue.agm.instance)
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            reject(err);
                        });

                } else {
                    resolve();
                }
            });
        };

        afterEach(() => {
            return cleanUp();
        });

        it('Should receive method removed event when I unregister a method', (done) => {
            const callDone = gtf.waitFor(2, done);

            methodDefinition.name = gtf.agm.getMethodName();

            let unSubscribe = glue.agm.serverMethodRemoved((data) => {
                const server = data.server || {};
                const method = data.method || {};

                if (method.name !== methodDefinition.name) {
                    return;
                }

                if (gtf.agm.isValidServer(server, glue.agm.instance)) {
                    if (unSubscribe) {
                        unSubscribe();
                    }
                    callDone();
                }
            });

            let unSub = glue.agm.methodRemoved((method) => {
                if (method.name === methodDefinition.name) {
                    if (unSub) {
                        unSub();
                    }
                    callDone();
                }
            });

            const un = glue.agm.methodAdded((method) => {
                if (method.name === methodDefinition.name) {
                    if (un) {
                        un();
                    }
                    const m = glue.agm.methods().find(x => x.name === methodDefinition.name);
                    glue.agm.unregister(m);

                }
            });

            glue.agm.register(methodDefinition.name, () => {

            });

        });
    
        it('Should receive method removed event when I unregister a stream', (done) => {
            const callDone = gtf.waitFor(2, done);

            methodDefinition.name = gtf.agm.getMethodName();

            let un = glue.agm.methodRemoved((method) => {
                if (method.name === methodDefinition.name) {
                    if (un) {
                        un();
                    }
                    callDone();
                }
            });

            let unSub = glue.agm.serverMethodRemoved((data) => {
                var server = data.server || {};
                var method = data.method || {};

                if (method.name !== methodDefinition.name) {
                    return;
                }

                if (gtf.agm.isValidServer(server, glue.agm.instance)) {
                    if (unSub) {
                        unSub();
                    }
                    gtf.agm.persistentMethodCheck(methodDefinition.name)
                        .then(() => {
                            callDone();
                        });
                }
            });

            glue.agm.createStream(methodDefinition)
                .then((server) => {
                    server.close();
                });

        });
    });

    describe('AGM events about other servers\' actions: ', function () {

        before(() => window.methodDefinition = {
            name: gtf.agm.getMethodName()
        });

        beforeEach(() => {
            return gtf.createApp()
                .then((glueApplication) => {
                    window.glueApplicationOne = glueApplication;
                });
        });

        afterEach(() => {
            return glueApplicationOne.stop();
        });

        it('Should receive methodRemoved and serverMethodRemoved events when a server un-registers an async method', (done) => {

            const callDone = gtf.waitFor(2, done);

            methodDefinition.name = gtf.agm.getMethodName();

            let un = glue.agm.serverMethodAdded((data) => {
                const server = data.server || {};
                const method = data.method || {};

                if (method.name !== methodDefinition.name) {
                    return;
                }

                if (gtf.agm.isValidServer(server, glueApplicationOne.myInstance.agm)) {
                    if (un) {
                        un();
                    }
                    glueApplicationOne.agm.unregister(methodDefinition);
                    return;
                }
            });

            let unSub = glue.agm.methodRemoved((method) => {
                if (method.name === methodDefinition.name) {
                    if (unSub) {
                        unSub();
                    }
                    callDone();
                }
            });

            let unSubscribe = glue.agm.serverMethodRemoved((removal) => {
                var server = removal.server || {};
                var method = removal.method || {};

                if (method.name !== methodDefinition.name) {
                    return;
                }

                if (gtf.agm.isValidServer(server, glueApplicationOne.myInstance.agm)) {
                    if (unSubscribe) {
                        unSubscribe();
                    }
                    callDone();
                    return;
                }
            });

            glueApplicationOne.agm.registerAsync(methodDefinition, (args, caller, success) => {
                success();
            });

        });
    
        // probably detected a real bug

        // it('Should receive methodRemoved and serverMethodRemoved events when a server un-registers a method', (done) => {

        //     const callDone = gtf.waitFor(2, done);

        //     methodDefinition.name = gtf.agm.getMethodName();

        //     let un = glue.agm.serverMethodAdded((data) => {
        //         const server = data.server || {};
        //         const method = data.method || {};

        //         if (method.name !== methodDefinition.name) {
        //             return;
        //         }

        //         if (gtf.agm.isValidServer(server, glueApplicationOne.myInstance.agm)) {
        //             if (un) {
        //                 un();
        //             }
        //             glueApplicationOne.agm.unregister(method);
        //             return;
        //         }
        //     });

        //     let unSub = glue.agm.methodRemoved((method) => {
        //         if (method.name === methodDefinition.name) {
        //             if (unSub) {
        //                 unSub();
        //             }
        //             callDone();
        //         }
        //     });

        //     let unSubscribe = glue.agm.serverMethodRemoved((removal) => {
        //         var server = removal.server || {};
        //         var method = removal.method || {};

        //         if (method.name !== methodDefinition.name) {
        //             return;
        //         }

        //         if (gtf.agm.isValidServer(server, glueApplicationOne.myInstance.agm)) {
        //             if (unSubscribe) {
        //                 unSubscribe();
        //             }
        //             callDone();
        //             return;
        //         }
        //     });

        //     glueApplicationOne.agm.register(methodDefinition, () => { });

        // });
    
        // probably detected a real bug

        // it('Should receive method removed event when a server un-registers a stream', (done) => {

        //     const callDone = gtf.waitFor(2, done);

        //     methodDefinition.name = gtf.agm.getMethodName();

        //     let un = glue.agm.methodRemoved((method) => {
        //         if (method.name === methodDefinition.name) {
        //             if (un) {
        //                 un();
        //             }
        //             callDone();
        //         }
        //     });

        //     let unSub = glue.agm.serverMethodRemoved((removal) => {
        //         var server = removal.server || {};
        //         var method = removal.method || {};

        //         if (method.name !== methodDefinition.name) {
        //             return;
        //         }

        //         if (gtf.agm.isValidServer(server, glueApplicationOne.myInstance.agm)) {
        //             if (unSub) {
        //                 unSub();
        //             }
        //             callDone();
        //             return;
        //         }
        //     });

        //     glueApplicationOne.agm.createStream(methodDefinition)
        //         .then((stream) => {
        //             stream.close();
        //         })
        //         .catch(done);
        // });
    });

    describe('Registering with full method options', () => {
        let stream;

        const expectedProperties = [
            'accepts',
            'description',
            'displayName',
            'getServers',
            'name',
            'objectTypes',
            'returns',
            'supportsStreaming',
        ];

        const fullMethodOptions = {
            name: '',
            objectTypes: ['otherApp'],
            description: 'same description',
            displayName: 'awesome display name',
            accepts: 'String name',
            returns: 'String name'
        };

        const checkMethodDefinition = (method, isStream) => {

            const shouldSupportStreaming = isStream ? isStream : false;

            for (let prop of expectedProperties) {

                if (method.hasOwnProperty(prop)) {
                    if (prop === 'supportsStreaming') {
                        expect(method[prop]).to.be.a('Boolean');
                        expect(method[prop]).to.eql(shouldSupportStreaming);
                        continue;
                    }
                    if (prop === 'getServers') {
                        expect(method[prop]).to.be.a('Function');
                        continue;
                    }

                    expect(method[prop]).to.eql(fullMethodOptions[prop]);
                    continue;
                }
                throw new Error(`${method.name} is missing property ${prop}`);
            }
        };

        beforeEach(() => {
            fullMethodOptions.name = gtf.agm.getMethodName();
        });

        afterEach(() => {
            const method = glue.agm.methods().find(x => x.name === fullMethodOptions.name);

            if (method && method.supportsStreaming) {
                return gtf.agm.clearStream(stream, glue.agm.instance);
            }

            if (method && !method.supportsStreaming) {
                return gtf.agm.clearMethod(method.name, glue.agm.instance);
            }

        });

        it('MethodRemoved should pass a valid methodDefinition object', (done) => {

            const un = glue.agm.methodAdded((method) => {
                if (method.name === fullMethodOptions.name) {
                    glue.agm.unregister(fullMethodOptions);
                }
            });

            const unTwo = glue.agm.methodRemoved((method) => {
                if (method.name === fullMethodOptions.name) {
                    try {
                        checkMethodDefinition(method);
                        done();
                        un();
                        unTwo();
                    } catch (error) {
                        done(error);
                    }
                }
            });

            glue.agm.register(fullMethodOptions, () => { });

        });
    
        it('MethodRemoved should pass a valid methodDefinition object | Ticket: https://jira.tick42.com/browse/GLUE_D-1609', (done) => {
            const un = glue.agm.methodAdded((method) => {
                if (method.name === fullMethodOptions.name) {

                    const m = glue.agm.methods().find(x => x.name === fullMethodOptions.name);
                    glue.agm.unregister(m);
                }
            });

            const unTwo = glue.agm.methodRemoved((method) => {
                if (method.name === fullMethodOptions.name) {
                    try {
                        checkMethodDefinition(method);
                        un();
                        unTwo();
                        done();
                    } catch (error) {
                        un();
                        unTwo();
                        done(error);
                    }
                }
            });

            glue.agm.registerAsync(fullMethodOptions, () => { });
        });
    
        it('MethodRemoved should pass a valid methodDefinition object', (done) => {
            const ready = gtf.waitFor(2, done);

            const unTwo = glue.agm.methodRemoved((method) => {
                if (method.name === fullMethodOptions.name) {
                    try {
                        checkMethodDefinition(method, true);
                        unTwo();
                        ready();
                    } catch (error) {
                        unTwo();
                        done(error);
                    }
                }
            });

            glue.agm.createStream(fullMethodOptions)
                .then((s) => {
                    s.close();
                    ready();
                })
                .catch(done);
        });
    });

    describe('Registering with only name', () => {
        const expectedProperties = [
            'accepts',
            'description',
            'displayName',
            'getServers',
            'name',
            'objectTypes',
            'returns',
            'supportsStreaming',
        ];

        let methodName;
        let stream;

        const checkMethodDefinition = (method, isStream) => {

            const shouldSupportStreaming = isStream ? isStream : false;

            for (let prop of expectedProperties) {

                if (method.hasOwnProperty(prop)) {
                    if (prop === 'supportsStreaming') {
                        expect(method[prop]).to.be.a('Boolean');
                        expect(method[prop]).to.eql(shouldSupportStreaming);
                        continue;
                    }
                    if (prop === 'getServers') {
                        expect(method[prop]).to.be.a('Function');
                        continue;
                    }
                    if (prop === 'name') {
                        expect(method[prop]).to.eql(methodName);
                        continue;
                    }
                    continue;
                }
                throw new Error(`${method.name} is missing property ${prop}`);
            }
        };

        beforeEach(() => {
            methodName = gtf.agm.getMethodName();
        });

        afterEach(() => {
            const method = glue.agm.methods().find(x => x.name === methodName);

            if (method && method.supportsStreaming) {
                return gtf.agm.clearStream(stream, glue.agm.instance);
            }

            if (method && !method.supportsStreaming) {
                return gtf.agm.clearMethod(methodName, glue.agm.instance);
            }

        });

        it('MethodRemoved should pass a valid methodDefinition object', (done) => {
            const un = glue.agm.methodAdded((method) => {
                if (method.name === methodName) {
                    glue.agm.unregister(method);
                }
            });

            const unTwo = glue.agm.methodRemoved((method) => {
                if (method.name === methodName) {
                    try {
                        checkMethodDefinition(method);
                        un();
                        unTwo();
                        done();
                    } catch (error) {
                        un();
                        unTwo();
                        done(error);
                    }
                }
            });

            glue.agm.register(methodName, () => { });
        });
    
        it('MethodRemoved should pass a valid methodDefinition object', (done) => {
            const ready = gtf.waitFor(2, done);

            const unTwo = glue.agm.methodRemoved((method) => {
                if (method.name === methodName) {
                    try {
                        checkMethodDefinition(method, true);
                        unTwo();
                        ready();
                    } catch (error) {
                        unTwo();
                        done(error);
                    }
                }
            });

            glue.agm.createStream(methodName)
                .then((s) => {
                    s.close();
                    ready();
                })
                .catch(done);
        });
    
        it('MethodRemoved should pass a valid methodDefinition object', (done) => {
            const un = glue.agm.methodAdded((method) => {
                if (method.name === methodName) {
                    glue.agm.unregister(method);
                }
            });

            const unTwo = glue.agm.methodRemoved((method) => {
                if (method.name === methodName) {
                    try {
                        checkMethodDefinition(method);
                        un();
                        unTwo();
                        done();
                    } catch (error) {
                        un();
                        unTwo();
                        done(error);
                    }
                }
            });

            glue.agm.registerAsync(methodName, () => { });
        });
    
    });
 
    describe('methodRemoved()', function () {

        before(() => {
            window.name = gtf.agm.getMethodName();
            window.methodDefinition = {
                name,
            };
            window.callbackNeverCalled = () => { };
        });


        before(() => gtf.createApp()
            .then((glueApplication) => {
                window.glueApplicationOne = glueApplication;
            }));

        after(() => {
            glueApplicationOne.stop();
        });

        afterEach(() => gtf.clearWindowActiveHooks());

        it('Should return a working unsubscribe function when triggered.', (done) => {
            const timeout = gtf.wait(3000, () => done());
            const un = glue.agm.methodRemoved(() => {
                timeout.cancel();
                done('Should not be called.');
            });
            if (un) {
                un();
            }
            glueApplicationOne.agm.register(methodDefinition, callbackNeverCalled).then(() => {
                glueApplicationOne.agm.unregister(methodDefinition);
            });
        });
    
        it('Should call the callback with the correct MethodDefinition.', (done) => {
            const un = glue.agm.methodRemoved((methodDef) => {
                try {
                    expect(methodDef.name).to.eql(methodDefinition.name);
                    done();
                } catch (err) {
                    done(err);
                }
            });
            gtf.addWindowHook(un);
            glueApplicationOne.agm.register(methodDefinition, callbackNeverCalled).then(() => {
                glueApplicationOne.agm.unregister(methodDefinition);
            });
        });
    
        it('Should not be triggered when the setup was there but the corresponding method wasn\'t called (3k ms).', (done) => {
            const timeout = gtf.wait(3000, () => done());
            const un = glue.agm.methodRemoved(() => {
                timeout.cancel();
                done('Should not be called.');
            });
            gtf.addWindowHook(un);
            glueApplicationOne.agm.register(methodDefinition, callbackNeverCalled);
        });

        it('Should not be triggered when the first application that registered a method unregisters it and there is another application that has registered the same method.', (done) => {
            const timeout = gtf.wait(3000, () => done());
            const un = glue.agm.methodRemoved(() => {
                timeout.cancel();
                done('Should not be called.');
            });
            gtf.addWindowHook(un);
            glueApplicationOne.agm.register(methodDefinition, callbackNeverCalled).then(() => {
                return glue.agm.register(methodDefinition, callbackNeverCalled);
            }).then(() => glueApplicationOne.agm.unregister(methodDefinition)).catch(done);
        });
    });
 
});