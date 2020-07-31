## Overview

A **Glue42 Client** is every application which initializes the [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) library and connects to the [**Glue42 Environment**](../../environment/overview/index.html). There could be one or more Glue42 Clients connected to the same Glue42 Environment on a single domain, which gives them full access to the [Shared Contexts](../../../../reference/core/latest/shared%20contexts/index.html), [Interop](../../../../reference/core/latest/interop/index.html), [Window Management](../../../../reference/core/latest/windows/index.html), [Channels](../../../../reference/core/latest/channels/index.html), [Application Management](../../../../reference/core/latest/appmanager/index.html) and [Workspaces](../../../../reference/core/latest/workspaces/index.html) functionalities offered by the **Glue42 Core** platform.

A Glue42 Client can be any web application using JavaScript, React, Angular or any other web framework.

## Initializing a Glue42 Client

Initializing a Glue42 Client means initializing the [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) library which connects the client application to the [**Glue42 Environment**](../../environment/overview/index.html). The library is initialized with several settings related to the location of the [**Glue42 Environment**](../../environment/overview/index.html) files, as well as application window layout and context save and restore options. The settings used for the initialization of the Glue42 Web library can be:

- the default built-in library settings;
- settings from the *optional* `glue.config.json` file that will override the default library settings;
- settings from the *optional* [`Config`](../../../../reference/core/latest/glue42%20web/index.html#!Config) object passed to the factory function during initialization that will override the built-in library settings and/or the settings in the `glue.config.json` file;

*More detailed information on how to initialize the Glue42 Web library depending on the framework you are using, you can find in the [**JavaScript**](../javascript/index.html) and [**React**](../react/index.html) guides on how to set up your application.*

### Default and Common Configuration

When no custom initialization options are passed to the factory function, the Glue42 Web library is initialized with the common settings from the `glue.config.json` file (if present) or with its own built-in defaults.

#### Default Settings

Below are the built-in default settings of the Glue42 Web library (which are also the default settings of the `glue.config.json` file):

```javascript
{
    glue: {
        assets: {
            location: "/glue",
            extendConfig: true
        },
        layouts: {
            autoRestore: false,
            autoSaveWindowContext: false
        },
        channels: false,
        appManager: false
    }
}
```

*For a detailed explanation of all settings in the optional `glue.config.json` file, see the [Environment: Configuration File](../../environment/overview/index.html#configuration_file) section.* 

#### Common Settings

You can use the `glue.config.json` file to set common configurations for you Glue42 Client applications. This is helpful when you want all or most of your apps to have the same settings when initializing the Glue42 Web library. This way, you avoid passing the same configuration object multiple times to the Glue42 Web library when initializing your Glue42 Client apps. For instance, if your [**Glue42 Environment**](../../environment/overview/index.html) files are at their default location (so no configuration is necessary for that), but you want the layout and context of your windows to be saved, you need to set the following in the `glue.config.json` file:

```json
{
    "glue": {
        "layouts": {
            "autoRestore": true,
            "autoSaveWindowContext": true
        }
    }
}
```

This configuration will now be used by all Glue42 Client applications that do not provide a [`Config`](../../../../reference/core/latest/glue42%20web/index.html#!Config) object during initialization and will override the built-in Glue42 Web library defaults.

### Custom Configuration

There are several scenarios where you may want to tweak the default configuration of the [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) library:

- You don't have a `glue.config.json` file and want your Glue42 Client applications to connect to the [**Glue42 Environment**](../../environment/overview/index.html) with different custom settings.

- You have a `glue.config.json` with default settings which work for most of your Glue42 Client apps, but you want some of them to use custom settings.

- Your Glue42 Environment files are not located at the default directory - e.g., you decide to keep them in a `"/lib"` folder, instead of in the default `"/glue"` folder. In this case, it is mandatory that you specify the custom path to the Environment files when initializing the Glue42 Web library in your client applications. 

The *optional* [`Config`](../../../../reference/core/latest/glue42%20web/index.html#!Config) object, which you can pass to the factory function when initializing the [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) library, has the following properties:

| Property | Type | Description | Required | Default |
|----------|------|-------------|----------|---------|
| `layouts` | `object` | Enable or disable auto restoring windows and/or auto saving window context. | No | `-` |
| `layouts.autoRestore` | `boolean` | If `true`, the set of windows opened by the application will be saved (in local storage) when the window is closed and restored when the application is started again. The saved data about each window includes URL, bounds and window context. | No | `false` |
| `layouts.autoSaveWindowContext` | `boolean` | If `true`, will automatically save the context of the window. | No | `false` |
| `channels` | `boolean` | Whether to enable the [Channels API](../../../../reference/core/latest/channels/index.html). | No | `false` |
| `appManager` | `boolean` | Whether to enable the [Application Management API](../../../../reference/core/latest/appmanager/index.html). | No | `false` |
| `assets` | `object` | Specifies the location of all Glue42 Environment files. It is recommended for a Glue42 Client app to use this property to define a custom location for the Glue42 Environment files, if the Glue42 Environment files are not hosted at the default location. | No | `-` |
| `assets.location` | `string` | Defines the location of the **Glue42 Core** assets bundle (configuration file, layouts file, Workspaces App, etc.) | No | `"/glue"` |
| `assets.extendConfig` | `boolean` | Whether to use the settings in the `glue` object of the `glue.config.json` file when initializing a Glue42 Client application. Set to `false` if your project does not have a `glue.config.json` file, or if you want to initialize the [**Glue42 Web**](../../../../reference/core/latest/glue42%20web/index.html) library in this specific app with custom settings. | No | `true` |
| `application` | `string` | The application name used by the platform to map it to the respective local/remote application definition when the Application Management API is enabled. | No | `-` |
| `libraries` | `array` | A list of Glue42 libraries which will be initiated internally to provide access to specific functionalities. | No | `-` |

*Note that if you set `assets.extendConfig` to `false`, then, by default, all clients will try to locate the Glue42 Environment files at `/glue`. You need to set the `assets.location` property if you want to override the default setting.*

## Configuration Example

Below is an example of a custom configuration for the Glue42 Web library:

```javascript
const initOptions = {
    assets: {
        // Specify a path to the Glue42 Environment files if they are not at their default location.
        location: "/lib",
        // Specify whether to use a common configuration from a `glue.config.json` file.
        // Set to `false` if no such file is available.
        extendConfig: false
    },

    // Specify whether to save the application windows layout and context.
    layouts: {
        autoRestore: true,
        autoSaveWindowContext: true
    }
};
```