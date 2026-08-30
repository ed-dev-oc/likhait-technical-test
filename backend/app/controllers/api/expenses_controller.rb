class Api::ExpensesController < ApplicationController
  include Paginatable
  before_action :set_expense, only: [ :update, :destroy ]

  def index
    expenses = Expense.includes(:category)
                      .by_month(params[:year], params[:month])
                      .order(date: :desc, created_at: :desc)

    expenses = paginate(expenses) if params[:page].present?
    render json: expenses
  end

  def create
    expense = Expense.new(expense_params)

    if expense.save
      render json: expense, status: :created
    else
      render json: { errors: expense.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @expense.update(expense_params)
      render json: @expense
    else
      render json: { errors: @expense.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @expense.destroy
    head :no_content
  end

  private

  def set_expense
    @expense = Expense.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Expense not found" }, status: :not_found
  end

  def expense_params
    params.require(:expense).permit(:description, :amount, :category_id, :date)
  end
end
