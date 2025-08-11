return {
  "olimorris/codecompanion.nvim",
  opts = {
    strategies = {
      chat = {
        adapter = "ollama",
      },
      inline = {
        adapter = "ollama",
      },
      cmd = {
        adapter = "ollama",
      },
    },
    adapters = {
      ollama = function()
        return require("codecompanion.adapters").extend("ollama", {
          name = "ollama",
          schema = {
            model = {
              default = "deepseek-coder:6.7b", -- Using your installed DeepSeek Coder model
            },
            num_ctx = {
              default = 16384,
            },
            temperature = {
              default = 0.8,
            },
          },
        })
      end,
      -- Optional: Create specific adapters for different models
      deepseek_r1 = function()
        return require("codecompanion.adapters").extend("ollama", {
          name = "deepseek_r1",
          schema = {
            model = {
              default = "deepseek-r1:latest",
            },
            num_ctx = {
              default = 32768, -- R1 can handle larger context
            },
            temperature = {
              default = 0.7,
            },
          },
        })
      end,
      mistral = function()
        return require("codecompanion.adapters").extend("ollama", {
          name = "mistral",
          schema = {
            model = {
              default = "mistral:latest",
            },
            num_ctx = {
              default = 8192,
            },
            temperature = {
              default = 0.8,
            },
          },
        })
      end,
      llama32 = function()
        return require("codecompanion.adapters").extend("ollama", {
          name = "llama32",
          schema = {
            model = {
              default = "llama3.2:latest",
            },
            num_ctx = {
              default = 8192,
            },
            temperature = {
              default = 0.8,
            },
          },
        })
      end,
    },
  },
  dependencies = {
    "nvim-lua/plenary.nvim",
    "nvim-treesitter/nvim-treesitter",
  },
}
