/* eslint-disable no-undef */
const APP_NAME = 'Control Application';

const onWorkspaceClose = async (workspaceId) => {
  const workspace = await glue.workspaces.getWorkspace((wsp) => wsp.id === workspaceId);

  if (!workspace) {
    logger.error({ message: "This workspace was already closed" });
  } else {
    await workspace.close();
  }

  clearWorkspace(workspaceId);

};

const onWorkspaceStart = async (workspaceName) => {
  const contextValue = document.getElementById(workspaceName).value;
  const context = contextValue.length ? { data: contextValue } : null;
  const workspace = await glue.workspaces.restoreWorkspace(workspaceName, { context });
  renderWorkspaceInstance(workspace.id, onWorkspaceClose);
};

// Entry point. Initializes Glue42 Web. А Glue42 Web instance will be attached to the global window.
window.startApp({ appName: APP_NAME })
  .then(() => {
    return glue.workspaces.layouts.getSummaries();
  })
  .then((layoutsSummaries) => {
    const workspacesName = layoutsSummaries.map((summary) => summary.name);
    return renderWorkspacesLayoutsNames(workspacesName, onWorkspaceStart)
  })
  .catch(console.error);
