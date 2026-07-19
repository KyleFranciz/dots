#!/usr/bin/env bash
set -euo pipefail

DOTFILES_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$HOME/.dotfiles-backups/$(date +%Y%m%d-%H%M%S)"

link_path() {
  local source_path="$1"
  local target_path="$2"

  mkdir -p "$(dirname "$target_path")"

  if [ -L "$target_path" ]; then
    rm -f "$target_path"
  elif [ -e "$target_path" ]; then
    mkdir -p "$BACKUP_DIR/$(dirname "$target_path")"
    mv "$target_path" "$BACKUP_DIR/$target_path"
    echo "Backed up $target_path -> $BACKUP_DIR/$target_path"
  fi

  ln -s "$source_path" "$target_path"
  echo "Linked $target_path -> $source_path"
}

link_if_exists() {
  local source_path="$1"
  local target_path="$2"

  if [ -e "$source_path" ] || [ -L "$source_path" ]; then
    link_path "$source_path" "$target_path"
  fi
}

link_if_exists "$DOTFILES_DIR/.config/starship" "$HOME/.config/starship"
link_if_exists "$DOTFILES_DIR/.config/tmux" "$HOME/.config/tmux"
link_if_exists "$DOTFILES_DIR/.config/tmux/tmux.conf" "$HOME/.tmux.conf"
link_if_exists "$DOTFILES_DIR/.config/nvim" "$HOME/.config/nvim"
link_if_exists "$DOTFILES_DIR/.config/ghostty" "$HOME/.config/ghostty"
link_if_exists "$DOTFILES_DIR/.config/kitty" "$HOME/.config/kitty"
link_if_exists "$DOTFILES_DIR/.config/borders" "$HOME/.config/borders"
link_if_exists "$DOTFILES_DIR/.config/opencode" "$HOME/.config/opencode"
link_if_exists "$DOTFILES_DIR/.config/wezterm" "$HOME/.config/wezterm"

link_if_exists "$DOTFILES_DIR/.zshrc" "$HOME/.zshrc"
link_if_exists "$DOTFILES_DIR/.gitconfig" "$HOME/.gitconfig"

VSCODE_APP_SUPPORT="$HOME/Library/Application Support/Code"
VSCODE_USER_DIR="$VSCODE_APP_SUPPORT/User"
link_if_exists "$DOTFILES_DIR/.config/.vscode/argv.json" "$VSCODE_APP_SUPPORT/argv.json"

if [ -d "$DOTFILES_DIR/.config/.vscode/cli" ]; then
  link_path "$DOTFILES_DIR/.config/.vscode/cli" "$VSCODE_APP_SUPPORT/cli"
fi

link_if_exists "$DOTFILES_DIR/.config/.vscode/User/settings.json" "$VSCODE_USER_DIR/settings.json"
link_if_exists "$DOTFILES_DIR/.config/.vscode/User/keybindings.json" "$VSCODE_USER_DIR/keybindings.json"
link_if_exists "$DOTFILES_DIR/.config/.vscode/User/snippets" "$VSCODE_USER_DIR/snippets"

echo "Dotfiles installed from $DOTFILES_DIR"
echo "VS Code extensions are not linked; reinstall them separately if needed."
