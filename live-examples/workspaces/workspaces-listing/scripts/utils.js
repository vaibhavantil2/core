/* eslint-disable no-undef */
(function (window) {
  const toggleGlueAvailable = () => {
    document.getElementById("glueImg").src = "/assets/connected.svg";
    document.getElementById("glueSpan").textContent = "Connected";
  };

  const clearWorkspace = (workspaceId) => {
    const item = document.getElementById(workspaceId);
    item.remove();
  }

  const logger = (function logger() {
    function log(type, options) {
      const message = typeof options === 'string' ? options : options.message;
      const workspaceId = options.workspaceId;
      const onCloseClicked = options.onWorkspaceClose;
      const logTime = options != null && options.logTime === false ? false : true;

      const item = document.createElement('li');
      item.id = workspaceId || "";
      const itemDot = document.createElement('span');
      const div = document.createElement('div');

      div.classList = "align-items-center d-flex flex-grow-1"
      itemDot.style.width = "10px";
      itemDot.style.height = "10px";
      itemDot.style.minWidth = "10px";
      itemDot.style.minHeight = "10px";
      itemDot.classList = "bg-success d-inline-block mr-2 rounded-circle";
      itemDot.classList.add(`bg-${type}`);

      div.append(itemDot);
      div.append(message);

      if (type !== "danger") {
        const closeButtonElement = document.createElement("button");
        closeButtonElement.classList =
          "btn btn-primary btn-sm text-nowrap ml-3";
        closeButtonElement.textContent = "Close";
        closeButtonElement.onclick = () => {
          closeButtonElement.disabled = true;
          onCloseClicked(workspaceId);
        };
        div.append(closeButtonElement);
      } else {
        const closeButtonElement = document.createElement("button");
        closeButtonElement.classList =
          "btn btn-primary btn-sm text-nowrap ml-3";
        closeButtonElement.textContent = "X";
        closeButtonElement.onclick = () => {
          closeButtonElement.disabled = true;
          item.remove();
        };
        div.append(closeButtonElement);
      }

      item.classList = 'd-flex justify-content-between align-items-center border-top py-1';

      item.append(div);

      if (logTime) {
        ``
        const timeSpan = document.createElement('span');
        timeSpan.textContent = `${formatTime(new Date())} `;
        timeSpan.classList = "badge badge-pill"
        item.append(timeSpan);
      }

      document.getElementById('logs-list').prepend(item);
    }

    return {
      info(options) {
        log('', options);
      },
      error(options) {
        log('danger', options);
      },
      clear() {
        const element = document.getElementById('logs-list');
        if (element) {
          element.innerHTML = '';
        }
      }
    }
  })();

  const displayAppName = (text) => {
    const el = document.getElementById('appNameHeading');
    if (el) {
      el.textContent = text;
    }
  }

  const formatTime = (date) => {
    if (date instanceof Date) {
      return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
    } else {
      return '';
    }
  }

  /*
    elementId - Default value "clearLogsBtn".
   */
  const clearLogsHandler = (elementId) => {
    elementId = typeof elementId === 'string' ? elementId : 'clearLogsBtn';
    const element = document.getElementById(elementId);
    if (element) {
      element.addEventListener('click', logger.clear)
    }
  }

  const renderWorkspaceInstance = (workspaceId, onWorkspaceClose) => {
    logger.info({ message: `Workspace with id: ${workspaceId} was opened`, workspaceId, onWorkspaceClose });
  }

  const renderWorkspacesLayoutsNames = async (
    workspacesNames,
    onStartClicked
  ) => {
    const appListElement = document.getElementById("wspList");
    appListElement.innerHTML = "";

    workspacesNames.forEach(wspName => {
      const appRowElement = document.createElement("div");
      appRowElement.classList = "row mt-2";

      const appNameElement = document.createElement("div");
      appNameElement.classList = "align-self-center pl-3 w-25";
      appNameElement.textContent = wspName;

      // start context
      const contextInputWrapperElement = document.createElement("div");
      const inputElement = document.createElement("input");
      inputElement.classList = "form-control form-control-sm";
      inputElement.placeholder = "Context";
      inputElement.id = wspName;
      inputElement.type = "text";

      contextInputWrapperElement.appendChild(inputElement);
      // end context

      const startButtonWrapperElement = document.createElement("div");
      startButtonWrapperElement.classList = "d-flex pl-sm-2";

      const startButtonElement = document.createElement("button");
      startButtonElement.classList =
        "btn btn-primary btn-sm text-nowrap w-100";
      startButtonElement.textContent = "Start";
      startButtonElement.onclick = () => onStartClicked(wspName);
      startButtonWrapperElement.appendChild(startButtonElement);

      appRowElement.appendChild(appNameElement);
      appRowElement.appendChild(contextInputWrapperElement);
      appRowElement.appendChild(startButtonWrapperElement);

      appListElement.appendChild(appRowElement);
    });
  };

  window.logger = logger;
  window.toggleGlueAvailable = toggleGlueAvailable;
  window.displayAppName = displayAppName;
  window.formatTime = formatTime;
  window.clearLogsHandler = clearLogsHandler;
  window.renderWorkspacesLayoutsNames = renderWorkspacesLayoutsNames;
  window.renderWorkspaceInstance = renderWorkspaceInstance;
  window.clearWorkspace = clearWorkspace;
  clearWorkspace
})(window || {});
