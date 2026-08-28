FactoryBot.define do
  factory :category do
    name { Faker::Commerce.unique.department(max: 1) }
  end
end
