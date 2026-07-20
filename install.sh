#!/usr/bin/env bash
set -euo pipefail

DOTFILES_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$HOME"

DOTFILES_PACKAGES=(git)
PACKAGES=(
  borders
  ghostty
  herdr
  kitty
  nvim
  opencode
  starship
  tmux
  vscode
  wezterm
  zsh
)

if ! command -v stow >/dev/null 2>&1; then
  echo "GNU Stow is required but not installed." >&2
  echo "macOS: brew install stow" >&2
  exit 1
fi

cd "$DOTFILES_DIR"

mkdir -p "$HOME/.config"

echo "Stowing dotfile packages into $TARGET_DIR"
for pkg in "${DOTFILES_PACKAGES[@]}"; do
  if [ -d "$pkg" ]; then
    echo "  stow --dotfiles -R $pkg"
    stow --dotfiles -R -t "$TARGET_DIR" "$pkg"
  fi
done

for pkg in "${PACKAGES[@]}"; do
  if [ -d "$pkg" ]; then
    echo "  stow -R $pkg"
    stow -R -t "$TARGET_DIR" "$pkg"
  fi
done

echo

echo "Done."
echo "Preview changes with: stow -n -v -R <package>"
echo "Remove a package with: stow -D <package>"
