require 'rails_helper'

RSpec.describe "Api::Expenses::Summary", type: :request do
  let!(:food_category) { Category.create!(name: "Food", emoji: "🍔") }
  let!(:transport_category) { Category.create!(name: "Transport", emoji: "🚗") }
  let!(:bills_category) { Category.create!(name: "Bills", emoji: "📄") }

  describe "GET /api/expenses/summary" do
    let!(:expense1) { Expense.create!(description: "Groceries", amount: 120.50, category: food_category, date: Date.new(2026, 8, 5)) }
    let!(:expense2) { Expense.create!(description: "Dining Out", amount: 80.00, category: food_category, date: Date.new(2026, 8, 12)) }
    let!(:expense3) { Expense.create!(description: "Gas", amount: 50.25, category: transport_category, date: Date.new(2026, 8, 18)) }
    let!(:other_month_expense) { Expense.create!(description: "Electricity", amount: 95.00, category: bills_category, date: Date.new(2026, 7, 20)) }

    it "returns monthly summary metrics filtered by year and month" do
      get "/api/expenses/summary", params: { year: 2026, month: 8 }

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)

      expect(json["total_amount"]).to eq(250.75)
      expect(json["total_count"]).to eq(3)
      expect(json["categories"]).to eq([
        {
          "category_id" => food_category.id,
          "category" => "Food",
          "emoji" => "🍔",
          "amount" => 200.5,
          "count" => 2
        },
        {
          "category_id" => transport_category.id,
          "category" => "Transport",
          "emoji" => "🚗",
          "amount" => 50.25,
          "count" => 1
        }
      ])
    end

    it "returns total summary for all expenses when no month/year params are provided" do
      get "/api/expenses/summary"

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)

      expect(json["total_amount"]).to eq(345.75)
      expect(json["total_count"]).to eq(4)
      expect(json["categories"].length).to eq(3)
    end

    it "returns 0 total and empty category list for a month without expenses" do
      get "/api/expenses/summary", params: { year: 2025, month: 1 }

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)

      expect(json["total_amount"]).to eq(0.0)
      expect(json["total_count"]).to eq(0)
      expect(json["categories"]).to eq([])
    end
  end
end
