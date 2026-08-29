require 'rails_helper'

RSpec.describe Expense, type: :model do
  let(:category) { Category.create!(name: "Food") }

  describe "associations" do
    it "belongs to category" do
      expense = Expense.new(description: "Lunch", amount: 20.0, category: category, date: Date.current)
      expect(expense.category).to eq(category)
    end
  end

  describe "validations" do
    describe "description validations" do
      it "is invalid without a description" do
        expense = Expense.new(description: nil, amount: 20.0, category: category, date: Date.current)
        expect(expense).not_to be_valid
        expect(expense.errors[:description]).to include("can't be blank")
      end

      it "is invalid with a description longer than 255 characters" do
        expense = Expense.new(description: "a" * 256, amount: 20.0, category: category, date: Date.current)
        expect(expense).not_to be_valid
        expect(expense.errors[:description]).to include("is too long (maximum is 255 characters)")
      end

      it "is valid with a 255 character description" do
        expense = Expense.new(description: "a" * 255, amount: 20.0, category: category, date: Date.current)
        expect(expense).to be_valid
      end
    end

    describe "amount validations" do
      it "is invalid without an amount" do
        expense = Expense.new(description: "Lunch", amount: nil, category: category, date: Date.current)
        expect(expense).not_to be_valid
        expect(expense.errors[:amount]).to include("can't be blank")
      end

      it "is invalid with a negative amount" do
        expense = Expense.new(description: "Lunch", amount: -5.0, category: category, date: Date.current)
        expect(expense).not_to be_valid
        expect(expense.errors[:amount]).to include("must be greater than 0")
      end

      it "is invalid with zero amount" do
        expense = Expense.new(description: "Lunch", amount: 0, category: category, date: Date.current)
        expect(expense).not_to be_valid
        expect(expense.errors[:amount]).to include("must be greater than 0")
      end

      it "is valid with maximum allowed amount of 99,999,999.99" do
        expense = Expense.new(description: "Max expense", amount: 99_999_999.99, category: category, date: Date.current)
        expect(expense).to be_valid
      end

      it "is invalid with an amount of 100,000,000 or greater" do
        expense = Expense.new(description: "Huge expense", amount: 100_000_000, category: category, date: Date.current)
        expect(expense).not_to be_valid
        expect(expense.errors[:amount]).to include("must be less than 100000000")
      end
    end

    describe "category validations" do
      it "is invalid without a category" do
        expense = Expense.new(description: "Lunch", amount: 20.0, category: nil, date: Date.current)
        expect(expense).not_to be_valid
        expect(expense.errors[:category]).to be_present
      end
    end

    describe "date validations" do
      it "is valid with a valid date in the past" do
        expense = Expense.new(description: "Past Lunch", amount: 25.0, category: category, date: Date.yesterday)
        expect(expense).to be_valid
      end

      it "is valid with today's date" do
        expense = Expense.new(description: "Today Lunch", amount: 30.0, category: category, date: Date.current)
        expect(expense).to be_valid
      end

      it "is invalid without a date" do
        expense = Expense.new(description: "No date expense", amount: 15.0, category: category, date: nil)
        expect(expense).not_to be_valid
        expect(expense.errors[:date]).to include("can't be blank")
      end

      it "is invalid with a future date" do
        expense = Expense.new(description: "Future Lunch", amount: 50.0, category: category, date: Date.tomorrow)
        expect(expense).not_to be_valid
        expect(expense.errors[:date]).to include("cannot be in the future")
      end

      it "is invalid with a date several days in the future" do
        expense = Expense.new(description: "Future Expense", amount: 100.0, category: category, date: Date.current + 7.days)
        expect(expense).not_to be_valid
        expect(expense.errors[:date]).to include("cannot be in the future")
      end

      it "allows updating description or amount when date remains unchanged" do
        expense = Expense.create!(description: "Lunch", amount: 20.0, category: category, date: Date.yesterday)
        expense.amount = 25.0
        expect(expense).to be_valid
      end

      it "validates when date is updated to a future date" do
        expense = Expense.create!(description: "Lunch", amount: 20.0, category: category, date: Date.yesterday)
        expense.date = Date.tomorrow
        expect(expense).not_to be_valid
        expect(expense.errors[:date]).to include("cannot be in the future")
      end
    end
  end

  describe "scopes and summary methods" do
    let!(:food_cat) { Category.create!(name: "Food", emoji: "🍔") }
    let!(:transport_cat) { Category.create!(name: "Transport", emoji: "🚗") }

    let!(:expense1) { Expense.create!(description: "Burger", amount: 15.0, category: food_cat, date: Date.new(2026, 8, 10)) }
    let!(:expense2) { Expense.create!(description: "Pizza", amount: 25.0, category: food_cat, date: Date.new(2026, 8, 20)) }
    let!(:expense3) { Expense.create!(description: "Bus", amount: 10.0, category: transport_cat, date: Date.new(2026, 8, 15)) }
    let!(:other_month_expense) { Expense.create!(description: "Old Coffee", amount: 5.0, category: food_cat, date: Date.new(2026, 7, 1)) }

    describe ".by_month" do
      it "filters by year and month" do
        results = Expense.by_month(2026, 8)
        expect(results).to contain_exactly(expense1, expense2, expense3)
      end

      it "returns all expenses if year or month is blank" do
        expect(Expense.by_month(nil, nil).count).to eq(4)
      end
    end

    describe ".category_breakdown" do
      it "aggregates totals and counts per category ordered by total amount descending" do
        results = Expense.by_month(2026, 8).category_breakdown
        expect(results.length).to eq(2)
        expect(results.first.category_name).to eq("Food")
        expect(results.first.total_amount).to eq(40.0)
        expect(results.first.total_count).to eq(2)
        expect(results.first.category_emoji).to eq("🍔")
        expect(results.second.category_name).to eq("Transport")
        expect(results.second.total_amount).to eq(10.0)
        expect(results.second.total_count).to eq(1)
      end
    end

    describe ".summary_for" do
      it "returns formatted summary hash with total_amount, total_count, and category breakdown" do
        summary = Expense.summary_for(year: 2026, month: 8)
        expect(summary[:total_amount]).to eq(50.0)
        expect(summary[:total_count]).to eq(3)
        expect(summary[:categories]).to eq([
          {
            category_id: food_cat.id,
            category: "Food",
            emoji: "🍔",
            amount: 40.0,
            count: 2
          },
          {
            category_id: transport_cat.id,
            category: "Transport",
            emoji: "🚗",
            amount: 10.0,
            count: 1
          }
        ])
      end

      it "returns 0 values and empty categories when no expenses match" do
        summary = Expense.summary_for(year: 2025, month: 1)
        expect(summary[:total_amount]).to eq(0.0)
        expect(summary[:total_count]).to eq(0)
        expect(summary[:categories]).to eq([])
      end
    end
  end
end
