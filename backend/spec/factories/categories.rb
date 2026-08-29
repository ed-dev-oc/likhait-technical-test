FactoryBot.define do
  factory :category do
    name { Faker::Commerce.unique.department(max: 1) }
    emoji { "📦" }
  end
end
