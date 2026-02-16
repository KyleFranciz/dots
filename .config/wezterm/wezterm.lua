-- config file for my wez config

-- Pull in the wezterm API
local wezterm = require("wezterm")
local commands = require("commands")

-- This will hold the configuration.
local config = wezterm.config_builder()

-- This is where you actually apply your config choices.
config.automatically_reload_config = true

-- For example, changing the initial geometry for new windows:
config.initial_cols = 120
config.initial_rows = 28

-- font settings and line_height
config.font_size = 20
config.line_height = 1.4
-- config.font = wezterm.font("Hack Nerd Font Mono")
-- config.font = wezterm.font("DankMono Nerd Font", { bold = true })
config.font = wezterm.font("JetBrainsMonoNL Nerd Font Mono", { italic = true, bold = false })
-- config.font = wezterm.font("FiraCode Nerd Font Mono")

-- color schemes that I like

-- config.color_scheme = "Spacedust"
-- config.color_scheme = "GruvboxDark"
-- config.color_scheme = "Monokai (dark) (terminal.sexy)"
-- config.color_scheme = "Espresso (base16)"
-- config.color_scheme = "Sandcastle (base16)"
-- config.color_scheme = "Seafoam Pastel"
-- config.color_scheme = "tokyonight_night"
-- config.color_scheme = "Medallion"
-- config.color_scheme = "catppuccine-mocha"
-- config.color_scheme = "EverforestDark"
-- config.color_scheme = "Atelier Seaside (base16)"
-- config.color_scheme = "darkmoss (base16)"
-- config.color_scheme = "Atelier Forest (base16)"
-- config.color_scheme = "Matrix (terminal.sexy)"
-- config.color_scheme = "ENCOM"
-- config.color_scheme = "Everforest Dark Hard (Gogh)"
-- config.color_scheme = "AdventureTime"
-- config.color_scheme = "evergarden"
-- config.color_scheme = "evergarden-spring"
-- config.color_scheme = "Black Metal (Dark Funeral) (base16)"
-- config.color_scheme = "Edge Dark (base16)"
-- config.color_scheme = "Materia (base16)"
-- config.color_scheme = "Andromeda"
config.color_scheme = "Afterglow"
-- config.color_scheme = "Argonaut"
-- config.color_scheme = "Arthur"

-- colors:
config.colors = {
	cursor_bg = "white",
	cursor_border = "white",
}

-- remove the window quiting pop up

-- Appearance
config.window_decorations = "RESIZE"
config.enable_tab_bar = false -- hide the tab bar so it doesn't show at all
config.tab_bar_at_bottom = true
config.window_padding = {
	left = 15,
	right = 15,
	top = 15,
	bottom = 9,
}

-- Tab Bar Appearance

-- Background Appearance
config.window_background_opacity = 0.85
-- config.macos_window_background_blur = 70
config.text_background_opacity = 6

-- not really needed but it might help
config.max_fps = 120

-- Key binds
config.keys = {
	-- NOTE: This section it for controlling panes
	-- Make A Horizontal Split
	{
		key = "d",
		mods = "CMD",
		action = wezterm.action.SplitHorizontal({ domain = "CurrentPaneDomain" }),
	},
	-- Make A Vertical Split
	{
		key = "d",
		mods = "CMD|SHIFT",
		action = wezterm.action.SplitVertical({ domain = "CurrentPaneDomain" }),
	},
	-- Close A Pane
	{
		key = "w",
		mods = "CMD|SHIFT",
		action = wezterm.action.CloseCurrentPane({ confirm = true }),
	},
	-- Switching Panes (might redo the binds)
	{ key = "h", mods = "CMD|SHIFT", action = wezterm.action.ActivatePaneDirection("Left") },
	{ key = "l", mods = "CMD|SHIFT", action = wezterm.action.ActivatePaneDirection("Right") },
	{ key = "k", mods = "CMD|SHIFT", action = wezterm.action.ActivatePaneDirection("Up") },
	{ key = "j", mods = "CMD|SHIFT", action = wezterm.action.ActivatePaneDirection("Down") },
}

-- custom commands to use in wezterm
wezterm.on("augment-command-palette", function()
	return commands
end)

-- Finally, return the configuration to wezterm:
return config
