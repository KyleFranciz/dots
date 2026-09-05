# dotfiles

Personal shell, terminal, tmux, editor, and Herdr config managed with GNU Stow.

## Packages
- `git/`
- `zsh/`
- `borders/`
- `ghostty/`
- `herdr/`
- `kitty/`
- `nvim/`
- `opencode/`
- `pi/`
- `starship/`
- `tmux/`
- `vscode/`
- `wezterm/`

## Install
Prerequisite:
```bash
brew install stow
```

Then:
```bash
git clone <your-repo-url> ~/dotfiles
cd ~/dotfiles
./install.sh
```

## Manual usage
Stow everything tracked here:
```bash
cd ~/dotfiles
stow --dotfiles -R git
stow -R zsh borders ghostty herdr kitty nvim opencode pi starship tmux vscode wezterm
```

Preview without changing anything:
```bash
stow -n -v -R nvim
```

Remove one package:
```bash
stow -D nvim
```

## Layout
Each package mirrors its destination under `$HOME`.

Examples:
- `tmux/.config/tmux/tmux.conf` -> `~/.config/tmux/tmux.conf`
- `tmux/.tmux.conf` -> `~/.tmux.conf`
- `herdr/.config/herdr/config.toml` -> `~/.config/herdr/config.toml`
- `herdr/.config/herdr/plugins/config/cloudmanic.herdr-plus/...` -> `~/.config/herdr/plugins/config/cloudmanic.herdr-plus/...`
- `pi/.pi/agent/settings.json` -> `~/.pi/agent/settings.json`
- `pi/.pi/agent/extensions/` -> `~/.pi/agent/extensions/`
- `pi/.pi/agent/skills/` -> `~/.pi/agent/skills/`
- `git/dot-gitconfig` -> `~/.gitconfig`
- `git/dot-gitignore` -> `~/.gitignore`

## Notes
- `git/` uses Stow's `--dotfiles` mode, so files are stored as `dot-*` in the repo.
- VS Code extensions are intentionally not tracked here.
- Herdr runtime state such as logs, sockets, sessions, and installed plugin code is intentionally not tracked.
- Pi auth, trust decisions, model cache, sessions, and todos are intentionally not tracked.
- If any config contains private tokens or API keys, keep them out of git or replace them with local secrets after install.
