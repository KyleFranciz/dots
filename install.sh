#!/usr/bin/env bash
set -euo pipefail

DOTFILES_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

mkdir -p "$HOME/.config/starship"
mkdir -p "$HOME/.config"

ln -sf "$DOTFILES_DIR/.config/starship/starship.toml" "$HOME/.config/starship/starship.toml"

if [ -f "$DOTFILES_DIR/.zshrc" ]; then
  ln -sf "$DOTFILES_DIR/.zshrc" "$HOME/.zshrc"
fi

if [ -f "$DOTFILES_DIR/.gitconfig" ]; then
  ln -sf "$DOTFILES_DIR/.gitconfig" "$HOME/.gitconfig"
fi

echo "Dotfiles installed from $DOTFILES_DIR"
