/**
 * semantic-release config for the SpecThis Claude Code marketplace.
 *
 * Today this repo ships ONE plugin (hello-specthis), so we run a single
 * semantic-release pipeline that bumps the plugin's plugin.json `version`
 * field and tags `hello-specthis@vX.Y.Z`. When a second plugin lands, switch
 * to per-plugin scoped releases (e.g. semantic-release-monorepo or scoped
 * commit analyzers) — see CONTRIBUTING.md.
 */

const PLUGIN_MANIFEST = "plugins/hello-specthis/.claude-plugin/plugin.json";

module.exports = {
  branches: ["main"],
  tagFormat: "hello-specthis@v${version}",
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/changelog", { changelogFile: "CHANGELOG.md" }],
    [
      "@semantic-release/exec",
      {
        // Bump the version field inside the plugin's manifest.
        prepareCmd: `node -e "const fs=require('fs'); const p='${PLUGIN_MANIFEST}'; const m=JSON.parse(fs.readFileSync(p,'utf8')); m.version='\${nextRelease.version}'; fs.writeFileSync(p, JSON.stringify(m,null,2)+'\\n');"`,
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: ["CHANGELOG.md", PLUGIN_MANIFEST],
        message:
          "chore(release): hello-specthis@v${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
    "@semantic-release/github",
  ],
};
