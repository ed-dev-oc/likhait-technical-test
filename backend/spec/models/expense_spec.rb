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
