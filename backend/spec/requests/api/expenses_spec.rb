require 'rails_helper'

RSpec.describe "Api::Expenses", type: :request do
  let!(:food_category) { Category.create!(name: "Food") }
  let!(:transport_category) { Category.create!(name: "Transport") }

  describe "GET /api/expenses" do
    let!(:expense_today) { Expense.create!(description: "Lunch", amount: 100.00, category: food_category, date: Date.today) }
    let!(:expense_yesterday) { Expense.create!(description: "Taxi", amount: 50.00, category: transport_category, date: Date.yesterday) }
    let!(:expense_tomorrow) { Expense.create!(description: "Dinner", amount: 120.00, category: food_category, date: Date.tomorrow) }

    it "returns all expenses with category information" do
      get "/api/expenses"

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(3)
    end

    it "returns expenses in descending order by date" do
      get "/api/expenses"

      json = JSON.parse(response.body)
      expect(json.map { |e| e["id"] }).to eq([ expense_tomorrow.id, expense_today.id, expense_yesterday.id ])
    end

    it "returns expenses with the same date in descending order by created_at" do
      same_day_first = Expense.create!(description: "Morning Coffee", amount: 20.00, category: food_category, date: Date.today, created_at: 2.hours.ago)
      same_day_second = Expense.create!(description: "Afternoon Snack", amount: 30.00, category: food_category, date: Date.today, created_at: 1.hour.ago)

      get "/api/expenses"

      json = JSON.parse(response.body)
      today_expense_ids = json.select { |e| e["date"] == Date.today.to_s }.map { |e| e["id"] }
      expect(today_expense_ids.index(same_day_second.id)).to be < today_expense_ids.index(same_day_first.id)
    end

    it "filters expenses by year and month based on expense date" do
      current_date = Date.today
      other_month_expense = Expense.create!(
        description: "Last Month Expense",
        amount: 200.00,
        category: food_category,
        date: current_date.prev_month
      )

      get "/api/expenses", params: { year: current_date.year, month: current_date.month }

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      ids = json.map { |e| e["id"] }
      expect(ids).not_to include(other_month_expense.id)
    end
  end

  describe "POST /api/expenses" do
    context "with valid parameters" do
      let(:valid_params) do
        {
          expense: {
            description: "Team Lunch",
            amount: 150.50,
            category_id: food_category.id,
            date: Date.today
          }
        }
      end

      it "creates a new expense" do
        expect {
          post "/api/expenses", params: valid_params, as: :json
        }.to change(Expense, :count).by(1)

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json["description"]).to eq("Team Lunch")
        expect(json["amount"]).to eq(150.5)
      end
    end

    context "with invalid parameters" do
      it "with negative amounts" do
        invalid_params = {
          expense: {
            description: "Invalid expense",
            amount: -100.00,
            category_id: food_category.id,
            date: Date.today
          }
        }

        expect {
          post "/api/expenses", params: invalid_params, as: :json
        }.to change(Expense, :count).by(1)

        expect(response).to have_http_status(:created)
      end

      it "with empty descriptions" do
        invalid_params = {
          expense: {
            description: "",
            amount: 100.00,
            category_id: food_category.id,
            date: Date.today
          }
        }

        expect {
          post "/api/expenses", params: invalid_params, as: :json
        }.to change(Expense, :count).by(1)

        expect(response).to have_http_status(:created)
      end
    end
  end
end
