require 'rails_helper'

RSpec.describe "Api::Categories", type: :request do
  describe "GET /api/categories" do
    let!(:food) { create(:category, name: "Food") }
    let!(:transport) { create(:category, name: "Transport") }
    let!(:supplies) { create(:category, name: "Supplies") }

    it "returns all categories" do
      get "/api/categories"

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(3)
      expect(json.map { |c| c["name"] }).to include("Food", "Transport", "Supplies")
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
          post "/api/categories", params: { category: { name: "Gym & Fitness" } }, as: :json
        }.to change(Category, :count).by(1)

        expect(response).to have_http_status(:created)
      end

      it "returns the created category as JSON" do
        post "/api/categories", params: { category: { name: "Gym & Fitness" } }, as: :json

        json = JSON.parse(response.body)
        expect(json["name"]).to eq("Gym & Fitness")
        expect(json["id"]).to be_present
      end

      it "strips whitespace from name before saving" do
        post "/api/categories", params: { category: { name: "  Hobbies  " } }, as: :json

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json["name"]).to eq("Hobbies")
      end
    end

    context "with invalid parameters" do
      it "returns 422 Unprocessable Entity when name is blank" do
        post "/api/categories", params: { category: { name: "" } }, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to be_present
      end

      it "returns 422 Unprocessable Entity when name is missing or nil" do
        post "/api/categories", params: { category: { name: nil } }, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to be_present
      end

      it "returns 422 Unprocessable Entity when name is a duplicate" do
        create(:category, name: "Food")
        post "/api/categories", params: { category: { name: "Food" } }, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include(match(/has already been taken/))
      end

      it "returns 422 Unprocessable Entity for case-insensitive duplicate" do
        create(:category, name: "Food")
        post "/api/categories", params: { category: { name: "food" } }, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include(match(/has already been taken/))
      end

      it "returns 422 Unprocessable Entity when name exceeds 100 characters" do
        post "/api/categories", params: { category: { name: "A" * 101 } }, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include(match(/too long/))
      end
    end
  end
end
