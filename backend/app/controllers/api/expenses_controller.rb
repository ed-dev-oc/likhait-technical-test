class Api::ExpensesController < ApplicationController
  def index
    expenses = Expense.includes(:category)
                      .by_month(params[:year], params[:month])
                      .order(date: :desc, created_at: :desc)

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
    expense = Expense.find(params[:id])

    if expense.update(expense_params)
      render json: expense
    else
      render json: { errors: expense.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    expense = Expense.find(params[:id])
    expense.destroy
    head :no_content
  end

  private

  def expense_params
    params.require(:expense).permit(:description, :amount, :category_id, :date)
  end
end
