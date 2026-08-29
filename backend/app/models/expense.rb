class Expense < ApplicationRecord
  belongs_to :category

  validates :description, presence: true, length: { maximum: 255 }
  validates :amount, presence: true,
                     numericality: { greater_than: 0, less_than: 100_000_000 }
  validates :category, presence: true
  validates :date, presence: true
  validate :date_cannot_be_in_the_future, if: -> { new_record? || will_save_change_to_date? }

  private

  def date_cannot_be_in_the_future
    if date.present? && date > Date.current
      errors.add(:date, "cannot be in the future")
    end
  end
end
