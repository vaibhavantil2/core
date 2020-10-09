const controlMethodName = "G42Core.E2E.Control";

const setContext = async (params, success, error) => {
    const contextName = params.name;
    const contextData = params.data;

    if (!contextName) {
        return error(`Context name is not provided to operation setContext`);
    }

    if (!contextData) {
        return error(`Context data is not provided to operation setContext`);
    }

    await glue.contexts.set(contextName, contextData);

    success();
}

const updateContext = async (params, success, error) => {
    const contextName = params.name;
    const contextData = params.data;

    if (!contextName) {
        return error(`Context name is not provided to operation updateContext`);
    }

    if (!contextData) {
        return error(`Context data is not provided to operation updateContext`);
    }

    await glue.contexts.update(contextName, contextData);

    success();
}

const getContext = async (params, success, error) => {
    const contextName = params.name;

    if (!contextName) {
        return error(`Context name is not provided to operation getContext`);
    }

    const context = await glue.contexts.get(contextName);

    success({ result: context });
}

const getAllContextNames = async (_, success, __) => {

    const contextNames = glue.contexts.all();

    success({ result: contextNames });
}

const register = async (params, success, _) => {
    await glue.interop.register(params.methodDefinition, (args) => {
        return args;
    });
    success();
}

const unregister = async (params, success, _) => {
    await glue.interop.unregister(params.methodDefinition, (args) => {
        return args;
    });
    success();
}

const registerAsync = async (params, success, _) => {
    await glue.interop.registerAsync(params.methodDefinition, (args) => {
        return args;
    });
    success();
}

const openStream = null;
const createStream = async (params, success, _) => {
    const newStream = await glue.interop.createStream(params.methodDefinition);
    openStream = newStream;
    success();
}

const pushStream = async (params, success, _) => {
    if (openStream) {
        openStream.push(params.data);
    } else {
        throw new Error("You need to open a GTF Support App stream before you use it!");
    }
    success();
}

const closeStream = async (params, success, _) => {
    if (openStream) {
        stream.close();
    } else {
        throw new Error("You are trying to close a stream that is not opened. Are you sure that you have called the createStream() method on a GTF Support App object before?");
    }
    success();
}

const operations = [
    { name: "setContext", execute: setContext },
    { name: "updateContext", execute: updateContext },
    { name: "getContext", execute: getContext },
    { name: "getAllContextNames", execute: getAllContextNames },
    { name: "register", execute: register },
    { name: "unregister", execute: unregister },
    { name: "registerAsync", execute: registerAsync },
    { name: "createStream", execute: createStream },
    { name: "pushStream", execute: pushStream },
    { name: "closeStream", execute: closeStream }
]

const handleControl = (args, _, success, error) => {
    const operation = args.operation;
    const params = args.params;

    const foundOperation = operations.find((op) => op.name === operation);

    if (!foundOperation) {
        error(`Unrecognized operation: ${operation}`);
        return;
    }

    foundOperation.execute(params, success, error);
};

GlueWeb({ appManager: true, application: "coreSupport" })
    .then((glue) => {
        window.glue = glue;

        return glue.interop.registerAsync(controlMethodName, handleControl);
    })
    .catch(console.warn);