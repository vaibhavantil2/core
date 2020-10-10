/* global glue describe it expect */

describe('properties', function () {

    before(() => coreReady);

    this.timeout(5000);

    
    describe('instance', () => {
        it('AGM should exist when glue is initialized', () => {
            expect(glue.agm).to.not.be.undefined;
        });

        it('AGM should should contain all properties defined in the API', () => {
            const {
                agm
            } = glue;
            expect(agm.instance).to.not.be.undefined;
            expect(typeof agm.createStream).to.eql('function');
            expect(typeof agm.invoke).to.eql('function');
            expect(typeof agm.methodAdded).to.eql('function');
            expect(typeof agm.methodRemoved).to.eql('function');
            expect(typeof agm.methods).to.eql('function');
            expect(typeof agm.methodsForInstance).to.eql('function');
            expect(typeof agm.register).to.eql('function');
            expect(typeof agm.registerAsync).to.eql('function');
            expect(typeof agm.serverAdded).to.eql('function');
            expect(typeof agm.serverMethodAdded).to.eql('function');
            expect(typeof agm.serverMethodRemoved).to.eql('function');
            expect(typeof agm.serverRemoved).to.eql('function');
            expect(typeof agm.servers).to.eql('function');
            expect(typeof agm.subscribe).to.eql('function');
            expect(typeof agm.unregister).to.eql('function');
        });

        
        // I think that this test detects a bug or at least inconsistencies between enterprise and core

        // it('AGM instance should contain all properties with default value defined in the API | Ticket: https://jira.tick42.com/browse/GLUE_D-1293', () => {
        //     const {
        //         instance
        //     } = glue.agm;

        //     expect(typeof instance.application).to.eql('string');
        //     expect(typeof instance.machine).to.eql('string');
        //     expect(typeof instance.pid).to.eql('number');
        //     expect(typeof instance.user).to.eql('string');
        //     expect(instance.windowId).to.not.be.undefined;
        //     expect(typeof instance.getMethods).to.eql('function');
        //     expect(typeof instance.getStreams).to.eql('function');
        //     expect(typeof instance.environment, "environment").to.eql("string");
        //     expect(typeof instance.region, "region").to.eql("string");
        //     //expect(typeof instance.service, "service").to.eql("string");
        //     expect(typeof instance.peerId, "peerId").to.eql("string");
        //     expect(typeof instance.isLocal, "isLocal").to.eql("boolean");
        //     expect(typeof instance.instance, "instance").to.eql("string");
        //     expect(typeof instance.api, "api").to.eql("string");
        // });

        
        // I think that this test detects a bug or at least inconsistencies between enterprise and core
        // it('AGM instance should contain all properties defined in the API | Ticket: https://jira.tick42.com/browse/GLUE_D-1293', () => {
        //     const {
        //         instance
        //     } = glue.agm;

        //     // Todo: write a gtf.agm.verifier<Instance>()

        //     expect(typeof instance.application).to.eql('string');
        //     expect(typeof instance.machine).to.eql('string');
        //     expect(typeof instance.pid).to.eql('number');
        //     expect(typeof instance.user).to.eql('string');
        //     expect(instance.windowId).to.not.be.undefined;
        //     expect(typeof instance.getMethods).to.eql('function');
        //     expect(typeof instance.getStreams).to.eql('function');
        // });


        it('Should contain an application property that includes \'GTF_Tests_Runner\'.', (done) => {
            expect(glue.agm.instance.application.includes('TestRunner')).to.be.true;
            done();
        });
    });
});
