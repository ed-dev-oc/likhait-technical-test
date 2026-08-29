class Category < ApplicationRecord
  DEFAULT_CATEGORIES = [
    { name: "Food",           emoji: "🍔" },
    { name: "Transportation", emoji: "🚗" },
    { name: "Shopping",       emoji: "🛍️" },
    { name: "Entertainment",  emoji: "🎬" },
    { name: "Bills",          emoji: "📄" },
    { name: "Healthcare",     emoji: "🏥" },
    { name: "Education",      emoji: "📚" },
    { name: "Travel",         emoji: "✈️" },
    { name: "Personal",       emoji: "👤" },
    { name: "Other",          emoji: "📦" }
  ].freeze

  has_many :expenses, dependent: :destroy

  attribute :emoji, :string, default: "📦"

  before_validation :strip_name

  before_validation :strip_emoji

  validates :name, presence: true,
                   uniqueness: { case_sensitive: false },
                   length: { maximum: 100 }
  validates :emoji, presence: true,
                    length: { maximum: 10 }
  validate :must_be_single_emoji

  private

  def strip_name
    self.name = name.strip if name.present?
  end

  def strip_emoji
    self.emoji = emoji.strip if emoji.present?
  end

  def must_be_single_emoji
    return if emoji.blank?

    unless emoji.grapheme_clusters.size == 1 && emoji.match?(/\A[\p{Extended_Pictographic}\p{Emoji}\uFE0F\u200D]+\z/)
      errors.add(:emoji, "must be a single valid emoji")
    end
  end
end
