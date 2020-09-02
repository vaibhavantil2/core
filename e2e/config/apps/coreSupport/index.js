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

const operations = [
    { name: "setContext", execute: setContext },
    { name: "updateContext", execute: updateContext },
    { name: "getContext", execute: getContext },
    { name: "getAllContextNames", execute: getAllContextNames },
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