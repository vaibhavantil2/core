GlueWeb({
    application: "supportApp",
    appManager: true
}).then((glue) => {
    window.glue = glue;

    const helloMethodName = "G42Core.Hello";
    const helloMethod = glue.interop.methods().find((m) => m.name === helloMethodName);

    if (helloMethod) {
        console.log(`FOUND METHOD`);
        return glue.interop.invoke(helloMethod);
    }

}).catch(console.log);