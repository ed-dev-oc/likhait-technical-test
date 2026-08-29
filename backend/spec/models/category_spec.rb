require 'rails_helper'

RSpec.describe Category, type: :model do
  describe 'associations' do
    it { should have_many(:expenses).dependent(:destroy) }
  end

  describe 'validations' do
    subject { build(:category, name: 'Food') }

    describe 'name presence' do
      it 'is invalid with a blank name' do
        category = build(:category, name: '')
        expect(category).not_to be_valid
        expect(category.errors[:name]).to include("can't be blank")
      end

      it 'is invalid with a nil name' do
        category = build(:category, name: nil)
        expect(category).not_to be_valid
        expect(category.errors[:name]).to include("can't be blank")
      end
    end

    describe 'name uniqueness' do
      it 'is invalid when name already exists' do
        create(:category, name: 'Food')
        duplicate = build(:category, name: 'Food')
        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:name]).to include('has already been taken')
      end

      it 'is invalid when name already exists regardless of case' do
        create(:category, name: 'Food')
        duplicate_lower = build(:category, name: 'food')
        expect(duplicate_lower).not_to be_valid
        expect(duplicate_lower.errors[:name]).to include('has already been taken')
      end

      it 'is invalid when name already exists in uppercase' do
        create(:category, name: 'Food')
        duplicate_upper = build(:category, name: 'FOOD')
        expect(duplicate_upper).not_to be_valid
        expect(duplicate_upper.errors[:name]).to include('has already been taken')
      end
    end

    describe 'name length' do
      it 'is valid with a name of exactly 100 characters' do
        category = build(:category, name: 'A' * 100)
        expect(category).to be_valid
      end

      it 'is invalid with a name exceeding 100 characters' do
        category = build(:category, name: 'A' * 101)
        expect(category).not_to be_valid
        expect(category.errors[:name]).to include('is too long (maximum is 100 characters)')
      end
    end

    describe 'name whitespace stripping' do
      it 'strips leading whitespace from name before validation' do
        category = build(:category, name: '  Groceries')
        category.valid?
        expect(category.name).to eq('Groceries')
      end

      it 'strips trailing whitespace from name before validation' do
        category = build(:category, name: 'Groceries  ')
        category.valid?
        expect(category.name).to eq('Groceries')
      end

      it 'is invalid when name is only whitespace after stripping' do
        category = build(:category, name: '   ')
        expect(category).not_to be_valid
        expect(category.errors[:name]).to include("can't be blank")
      end
    end

    describe 'emoji presence' do
      it 'is valid with an emoji' do
        category = build(:category, emoji: '🍔')
        expect(category).to be_valid
      end

      it 'is invalid with a blank emoji' do
        category = build(:category, emoji: '')
        expect(category).not_to be_valid
        expect(category.errors[:emoji]).to include("can't be blank")
      end

      it 'is invalid with a nil emoji' do
        category = build(:category, emoji: nil)
        expect(category).not_to be_valid
        expect(category.errors[:emoji]).to include("can't be blank")
      end
    end

    describe 'emoji format and single emoji validation' do
      it 'is valid with a single standard emoji' do
        category = build(:category, emoji: '🍔')
        expect(category).to be_valid
      end

      it 'is valid with a multi-byte composite emoji with modifier or ZWJ' do
        category = build(:category, emoji: '🛍️')
        expect(category).to be_valid
      end

      it 'is invalid with plain non-emoji text' do
        category = build(:category, emoji: 'abc')
        expect(category).not_to be_valid
        expect(category.errors[:emoji]).to include('must be a single valid emoji')
      end

      it 'is invalid with multiple emojis' do
        category = build(:category, emoji: '🍔🍕')
        expect(category).not_to be_valid
        expect(category.errors[:emoji]).to include('must be a single valid emoji')
      end
    end

    describe 'emoji whitespace stripping' do
      it 'strips leading and trailing whitespace from emoji before validation' do
        category = build(:category, emoji: '  🍔  ')
        category.valid?
        expect(category.emoji).to eq('🍔')
      end

      it 'is invalid when emoji is only whitespace after stripping' do
        category = build(:category, emoji: '   ')
        expect(category).not_to be_valid
        expect(category.errors[:emoji]).to include("can't be blank")
      end
    end
  end
end
