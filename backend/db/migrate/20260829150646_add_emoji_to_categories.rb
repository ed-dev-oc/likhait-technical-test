class AddEmojiToCategories < ActiveRecord::Migration[7.2]
  def change
    add_column :categories, :emoji, :string, null: false, default: "📦", limit: 10

    reversible do |dir|
      dir.up do
        Category::DEFAULT_CATEGORIES.each do |cat|
          execute("UPDATE categories SET emoji = #{connection.quote(cat[:emoji])} WHERE name = #{connection.quote(cat[:name])}")
        end
      end
    end
  end
end
