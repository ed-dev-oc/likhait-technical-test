require 'rails_helper'

RSpec.describe "Api::Categories", type: :request do
  describe "GET /api/categories" do
    let!(:food) { create(:category, name: "Food", emoji: "🍔") }
    let!(:transport) { create(:category, name: "Transport", emoji: "🚗") }
    let!(:supplies) { create(:category, name: "Supplies", emoji: "📦") }

    it "returns all categories with emojis" do
      get "/api/categories"

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(3)
      expect(json.map { |c| c["name"] }).to include("Food", "Transport", "Supplies")
      expect(json.map { |c| c["emoji"] }).to include("🍔", "🚗", "📦")
    end

    it "returns categories in alphabetical order" do
      get "/api/categories"

      json = JSON.parse(response.body)
      expect(json.map { |c| c["name"] }).to eq([ "Food", "Supplies", "Transport" ])
    end
  end

  describe "POST /api/categories" do
    context "with valid parameters" do
      it "creates a new category and returns 201 Created" do
        expect {
          post "/api/categories", params: { category: { name: "Gym & Fitness", emoji: "🏋️" } }, as: :json
        }.to change(Category, :count).by(1)

        expect(response).to have_http_status(:created)
      end

      it "returns the created category as JSON including emoji" do
        post "/api/categories", params: { category: { name: "Gym & Fitness", emoji: "🏋️" } }, as: :json

        json = JSON.parse(response.body)
        expect(json["name"]).to eq("Gym & Fitness")
        expect(json["emoji"]).to eq("🏋️")
        expect(json["id"]).to be_present
      end

      it "strips whitespace from name and emoji before saving" do
        post "/api/categories", params: { category: { name: "  Hobbies  ", emoji: "  🎨  " } }, as: :json

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json["name"]).to eq("Hobbies")
        expect(json["emoji"]).to eq("🎨")
      end
    end

    context "with invalid parameters" do
      it "returns 422 Unprocessable Entity when name is blank" do
        post "/api/categories", params: { category: { name: "", emoji: "📦" } }, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to be_present
      end

      it "returns 422 Unprocessable Entity when name is missing or nil" do
        post "/api/categories", params: { category: { name: nil, emoji: "📦" } }, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to be_present
      end

      it "returns 422 Unprocessable Entity when name is a duplicate" do
        create(:category, name: "Food")
        post "/api/categories", params: { category: { name: "Food", emoji: "🍔" } }, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include(match(/has already been taken/))
      end

      it "returns 422 Unprocessable Entity for case-insensitive duplicate" do
        create(:category, name: "Food")
        post "/api/categories", params: { category: { name: "food", emoji: "🍔" } }, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include(match(/has already been taken/))
      end

      it "returns 422 Unprocessable Entity when name exceeds 100 characters" do
        post "/api/categories", params: { category: { name: "A" * 101, emoji: "📦" } }, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include(match(/too long/))
      end

      it "returns 422 Unprocessable Entity when emoji is not a single valid emoji" do
        post "/api/categories", params: { category: { name: "Music", emoji: "invalid" } }, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include(match(/must be a single valid emoji/))
      end
    end
  end
end
