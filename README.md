# dotfiles

Personal shell, terminal, tmux, and editor config.

## Included
- `.config/starship/`
- `.config/tmux/`
- `.config/nvim/`
- `.config/ghostty/`
- `.config/kitty/`
- `.config/borders/`
- `.config/opencode/`
- `.config/wezterm/`
- `.config/.vscode/argv.json`
- `.config/.vscode/User/settings.json`
- `.config/.vscode/User/keybindings.json`
- `.config/.vscode/User/snippets/`
- `.zshrc`
- `.gitconfig`

## Install
```bash
git clone <your-repo-url> ~/dotfiles
cd ~/dotfiles
./install.sh
```

This will symlink the tracked config directories into their expected home-directory locations.

Notes:
- VS Code extensions are intentionally not symlinked; reinstall them separately.
- tmux plugins are expected to be installed by TPM rather than committed into this repo.
- If any config contains private tokens or API keys, keep them out of git or replace them with local secrets after install.
