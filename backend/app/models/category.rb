class Category < ApplicationRecord
  has_many :expenses, dependent: :destroy

  before_validation :strip_name

  validates :name, presence: true,
                   uniqueness: { case_sensitive: false },
                   length: { maximum: 100 }

  private

  def strip_name
    self.name = name.strip if name.present?
  end
end
