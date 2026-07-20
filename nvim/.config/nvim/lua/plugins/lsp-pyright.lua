return {
  -- Ensure the pyright and typescript servers are installed
  {
    "williamboman/mason.nvim",
    opts = function(_, opts)
      vim.list_extend(opts.ensure_installed, { "pyright", "typescript-language-server" })
    end,
  },

  -- Configure the pyright LSP
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        pyright = {
          -- optional custom settings go here
          settings = {
            python = {
              analysis = {
                typeCheckingMode = "off", -- or "off", "basic"
              },
            },
          },
        },
        tsserver = {
          -- TypeScript language server configuration
        },
      },
    },
  },
}
