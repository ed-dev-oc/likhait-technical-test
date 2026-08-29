require 'rails_helper'

RSpec.describe "Api::Expenses", type: :request do
  let!(:food_category) { Category.create!(name: "Food") }
  let!(:transport_category) { Category.create!(name: "Transport") }

  describe "GET /api/expenses" do
    let!(:expense_today) { Expense.create!(description: "Lunch", amount: 100.00, category: food_category, date: Date.current) }
    let!(:expense_yesterday) { Expense.create!(description: "Taxi", amount: 50.00, category: transport_category, date: Date.yesterday) }
    let!(:expense_two_days_ago) { Expense.create!(description: "Dinner", amount: 120.00, category: food_category, date: 2.days.ago.to_date) }

    it "returns all expenses with category information" do
      get "/api/expenses"

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(3)
    end

    it "returns expenses in descending order by date" do
      get "/api/expenses"

      json = JSON.parse(response.body)
      expect(json.map { |e| e["id"] }).to eq([ expense_today.id, expense_yesterday.id, expense_two_days_ago.id ])
    end

    it "returns expenses with the same date in descending order by created_at" do
      same_day_first = Expense.create!(description: "Morning Coffee", amount: 20.00, category: food_category, date: Date.current, created_at: 2.hours.ago)
      same_day_second = Expense.create!(description: "Afternoon Snack", amount: 30.00, category: food_category, date: Date.current, created_at: 1.hour.ago)

      get "/api/expenses"

      json = JSON.parse(response.body)
      today_expense_ids = json.select { |e| e["date"] == Date.current.to_s }.map { |e| e["id"] }
      expect(today_expense_ids.index(same_day_second.id)).to be < today_expense_ids.index(same_day_first.id)
    end

    it "filters expenses by year and month based on expense date" do
      current_date = Date.current
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

    context "with pagination parameters" do
      it "paginates results and sets pagination headers" do
        get "/api/expenses", params: { page: 1, per_page: 2 }

        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json.length).to eq(2)
        expect(json.map { |e| e["id"] }).to eq([ expense_today.id, expense_yesterday.id ])

        expect(response.headers["X-Total-Count"]).to eq("3")
        expect(response.headers["X-Total-Pages"]).to eq("2")
        expect(response.headers["X-Current-Page"]).to eq("1")
        expect(response.headers["X-Per-Page"]).to eq("2")
      end

      it "returns the second page properly" do
        get "/api/expenses", params: { page: 2, per_page: 2 }

        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body)
        expect(json.length).to eq(1)
        expect(json.map { |e| e["id"] }).to eq([ expense_two_days_ago.id ])
      end
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
            date: Date.current
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
      it "with future date" do
        future_params = {
          expense: {
            description: "Future Dinner",
            amount: 100.00,
            category_id: food_category.id,
            date: Date.tomorrow
          }
        }

        expect {
          post "/api/expenses", params: future_params, as: :json
        }.not_to change(Expense, :count)

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include("Date cannot be in the future")
      end

      it "with missing date" do
        missing_date_params = {
          expense: {
            description: "No Date",
            amount: 50.00,
            category_id: food_category.id,
            date: nil
          }
        }

        expect {
          post "/api/expenses", params: missing_date_params, as: :json
        }.not_to change(Expense, :count)

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include("Date can't be blank")
      end

      it "with missing description" do
        missing_desc_params = {
          expense: {
            description: "",
            amount: 50.00,
            category_id: food_category.id,
            date: Date.current
          }
        }

        expect {
          post "/api/expenses", params: missing_desc_params, as: :json
        }.not_to change(Expense, :count)

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include("Description can't be blank")
      end

      it "with non-positive amount" do
        invalid_amount_params = {
          expense: {
            description: "Free lunch",
            amount: 0,
            category_id: food_category.id,
            date: Date.current
          }
        }

        expect {
          post "/api/expenses", params: invalid_amount_params, as: :json
        }.not_to change(Expense, :count)

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include("Amount must be greater than 0")
      end
    end
  end

  describe "PATCH /api/expenses/:id" do
    let!(:existing_expense) { Expense.create!(description: "Original Lunch", amount: 50.0, category: food_category, date: Date.yesterday) }

    context "with valid parameters" do
      it "updates the expense without modifying date" do
        patch "/api/expenses/#{existing_expense.id}", params: { expense: { description: "Updated Lunch" } }, as: :json
        expect(response).to have_http_status(:success)
        expect(existing_expense.reload.description).to eq("Updated Lunch")
      end
    end

    context "with future date" do
      it "does not update date and returns unprocessable entity" do
        patch "/api/expenses/#{existing_expense.id}", params: { expense: { date: Date.tomorrow } }, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include("Date cannot be in the future")
        expect(existing_expense.reload.date).to eq(Date.yesterday)
      end
    end

    context "with invalid amount" do
      it "returns unprocessable entity" do
        patch "/api/expenses/#{existing_expense.id}", params: { expense: { amount: -10 } }, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include("Amount must be greater than 0")
      end
    end
  end
end
