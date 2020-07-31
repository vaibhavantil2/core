GlueWeb({
    application: "dummyApp",
    appManager: true
}).then((glue) => {
    window.glue = glue;
}).catch(console.log);