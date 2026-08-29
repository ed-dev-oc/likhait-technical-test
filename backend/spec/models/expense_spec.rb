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
end
