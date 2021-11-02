5.5.0
feat: add support for passing custom identity
5.4.14
feat: add support for glue42/electron in core
5.4.13
chore: minor changes to package.json
5.4.12
fix: isLocal should be coming from the resolved identity
5.4.11
chore: resolved dependency vulnerabilities
5.4.10
docs: improved the d.ts for better reference documentation
5.4.9
fix: Glue performance events backwards compat fix
5.4.8
chore: resolved dependency vulnerabilities
5.4.7
chore: resolved dependency vulnerabilities
5.4.6
chore: resolved dependency vulnerabilities
5.4.5
fix: resolved dependency vulnerabilities
5.4.4
fix: metrics - use applicationName for service
5.4.3
fix: web platform transport - now correctly handles the client id of and unloaded client
5.4.2
fix: interop - replace promise.finally to support old Angular apps
5.4.1
fix: metrics - default service to application name
fix: metrics - use toJSON method of performance entries
5.4.0
feat: expose method's flags in interop (G4E-3780)
feat: added interop.waitForMethod method that allows waiting for a method to appear
fix: return unsubscribe functions from legacy interop methods (method_added, method_removed, etc) (
5.3.0
feat: official release with support for web transport
5.2.8-beta.0
feat: added web platform transport and beta core release
5.2.7
fix: fixed an issue which will cause the reconnection attempts after disconnect to fail because of a wrong this and also provided the correct reconnect interval
5.2.6
perf: metrics - optimize memory usage (do not wait for response on metrics publish requests)
5.2.5
fix: config - exposed glue.config.application (legacy)
5.2.4
fix: contexts - clone context object when passing to subscribers
5.2.3
fix: contexts - missing delta in update callback
5.2.2
fix: metrics - perf metrics handle promise rejections
5.2.1
fix: contexts - related to GW context protocol v2 support G4E-3353
fix: logger - change default log level to warn
5.2.0
feat: contexts - GW context protocol v2 support G4E-3353
fix: contexts - get was returning empty object G4E-3074
fix: interop - add detailed information when the invocation is timed out G4E-3153
fix: interop - legacy support - add missing missing method_added G4E-3152
5.1.2
chore: bumped version after unified file endings for repo-wide npm audit script
5.1.1
fix: logger can try to invoke before interop is ready
5.1.0
feat: extra performance metrics
feat: respect log level coming from Enterprise configuration
fix: better timeout error message
fix: try to fool webpack when requiring ws module
fix: add legacy methods to glue.agm
chore: upgraded callback-registry to 2.6.0
5.0.7
fix: extra check for running in browser or node
5.0.6
fix: removed module invalid glue42core module export from d.ts
fix: proper error when trying to invoke with circular objects
5.0.5
fix: change metrics service to Glue42
5.0.4
fix: metrics identity was missing service, system, instance
5.0.3
fix: methodDefinition's getServers() listed as property, not method [link](https://github.com/Glue42/core/issues/62)
fix: MethodDefinition.getServers() doesn't return expected array [link](https://github.com/Glue42/core/issues/60)
5.0.2
feat: added in lerna release pipeline
5.0.1
fix: breaks if server returns null object ("server returns null result" test)
5.0.0
BREAKING CHANGE: removed support for Glue42 v2
