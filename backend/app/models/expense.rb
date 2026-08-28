class Expense < ApplicationRecord
  belongs_to :category

  validates :date, presence: true
  validate :date_cannot_be_in_the_future, if: -> { new_record? || will_save_change_to_date? }

  private

  def date_cannot_be_in_the_future
    if date.present? && date > Date.current
      errors.add(:date, "cannot be in the future")
    end
  end
end
