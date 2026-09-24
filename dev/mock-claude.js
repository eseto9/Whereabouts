// Local stand-in for the artifact runtime's `claude.use(name)`. The mock-*.js
// files that load after this register what they provide in window.__mocks;
// anything missing resolves null, as it does in a view that can't run it.
window.__mocks = {};
window.claude = Object.freeze({ use: async name => window.__mocks[name] ?? null });
