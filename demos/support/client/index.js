const clientCalling = async (clientName, email) => {
    const client = window.clients.find((client) => client.firstName.toLowerCase() === clientName.toLowerCase());

    const config = {
        notification: {
            title: `${client.firstName} ${client.lastName} Calling`,
            image: client.image,
            description: client.about,
            data: { client, type: "openClient" }
        },
        email
    };

    fetch('http://localhost:4224/api/client-call', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
    });
};

const clientTransaction = async (clientName) => {
    const client = window.clients.find((client) => client.firstName.toLowerCase() === clientName.toLowerCase());

    const config = {
        notification: {
            title: `New ${client.firstName} ${client.lastName} Transaction`,
            image: client.image,
            description: client.about,
            data: { client, type: "openTransaction" }
        }
    };

    fetch('http://localhost:4224/api/client-transaction', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
    });
};
