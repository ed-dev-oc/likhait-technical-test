class Api::ExpensesController < ApplicationController
  before_action :set_expense, only: [ :update, :destroy ]

  def index
    expenses = Expense.includes(:category)
                      .by_month(params[:year], params[:month])
                      .order(date: :desc, created_at: :desc)

    if params[:page].present?
      page = [ params[:page].to_i, 1 ].max
      per_page = params[:per_page].present? ? [ [ params[:per_page].to_i, 1 ].max, 100 ].min : 10
      total_count = expenses.count
      total_pages = (total_count.to_f / per_page).ceil

      response.set_header("X-Total-Count", total_count.to_s)
      response.set_header("X-Total-Pages", total_pages.to_s)
      response.set_header("X-Current-Page", page.to_s)
      response.set_header("X-Per-Page", per_page.to_s)

      expenses = expenses.offset((page - 1) * per_page).limit(per_page)
    end

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
