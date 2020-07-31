/* eslint-disable no-unused-vars */
const glueReady = GlueWeb({ libraries: [GlueWorkspaces] }).then((glue) => window.glue = glue);

const gtfReady = new Promise((resolve) => {
    let windowNameCounter = 0;
    const waitFor = (num, funcToCall) => {
        let left = num;
        return () => {
            left--;

            if (left === 0) {
                funcToCall();
            }
        };
    };

    const getWindowName = (prefix) => {
        windowNameCounter++;
        return `${prefix}.${Date.now()}.${windowNameCounter}`;
    }

    // wait for init;
    window.gtf = {
        waitFor,
        getWindowName
    };
    resolve();
});
