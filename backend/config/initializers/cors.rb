# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin Ajax requests.

# Read more: https://github.com/cyu/rack-cors

# SECURITY: Never use origins "*" in production — it allows any website to call this API.
# Allowed origins are configured via the ALLOWED_ORIGINS environment variable (comma-separated).
# Example: ALLOWED_ORIGINS=https://app.example.com,https://www.example.com
# Falls back to the Vite dev server origin when running locally.
allowed_origins = ENV.fetch("ALLOWED_ORIGINS", "http://localhost:5173")
                     .split(",")
                     .map(&:strip)

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins allowed_origins

    resource "*",
      headers: :any,
      methods: [ :get, :post, :put, :patch, :delete, :options, :head ]
  end
end
