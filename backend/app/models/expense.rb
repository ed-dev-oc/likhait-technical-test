class Expense < ApplicationRecord
  belongs_to :category

  validates :description, presence: true, length: { maximum: 255 }
  validates :amount, presence: true,
                     numericality: { greater_than: 0, less_than: 100_000_000 }
  validates :category, presence: true
  validates :date, presence: true
  validate :date_cannot_be_in_the_future, if: -> { new_record? || will_save_change_to_date? }

  scope :by_month, ->(year, month) {
    if year.present? && month.present?
      start_date = Date.new(year.to_i, month.to_i, 1)
      end_date = start_date.end_of_month
      where(date: start_date..end_date)
    end
  }

  scope :category_breakdown, -> {
    joins(:category)
      .group("categories.id", "categories.name", "categories.emoji")
      .select("categories.id AS category_id, categories.name AS category_name, categories.emoji AS category_emoji, SUM(expenses.amount) AS total_amount, COUNT(expenses.id) AS total_count")
      .order("total_amount DESC")
  }

  def self.summary_for(year: nil, month: nil)
    scoped_expenses = by_month(year, month)
    total_amount = scoped_expenses.sum(:amount) || 0
    total_count = scoped_expenses.count

    categories = scoped_expenses.category_breakdown.map do |item|
      {
        category_id: item.category_id,
        category: item.category_name,
        emoji: item.category_emoji,
        amount: item.total_amount.to_f,
        count: item.total_count.to_i
      }
    end

    {
      total_amount: total_amount.to_f,
      total_count: total_count,
      categories: categories
    }
  end

  def as_json(options = nil)
    {
      id: id,
      description: description,
      amount: amount.to_f,
      category: category&.name,
      category_id: category_id,
      date: date.to_s,
      created_at: created_at,
      updated_at: updated_at
    }
  end

  private

  def date_cannot_be_in_the_future
    if date.present? && date > Date.current
      errors.add(:date, "cannot be in the future")
    end
  end
end
