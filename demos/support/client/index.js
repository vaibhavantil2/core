const clientCalling = async (clientName) => {
    const client = window.clients.find((client) => client.firstName.toLowerCase() === clientName.toLowerCase())
    const args = {
        notification: {
            type: "openClient",
            title: `${client.firstName} ${client.lastName} Calling`,
            image: client.image,
            description: client.about,
            data: { client }
        }
    };
    await glue.interop.invoke("T42.GNS.Publish.RaiseNotification", args);
};

const clientTransaction = async (clientName) => {
    const client = window.clients.find((client) => client.firstName.toLowerCase() === clientName.toLowerCase())
    const args = {
        notification: {
            type: "openTransaction",
            title: `New ${client.firstName} ${client.lastName} Transaction`,
            image: client.image,
            description: client.about,
            data: { client }
        }
    };
    await glue.interop.invoke("T42.GNS.Publish.RaiseNotification", args);
};