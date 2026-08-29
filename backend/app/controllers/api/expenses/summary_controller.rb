class Api::Expenses::SummaryController < ApplicationController
  def index
    summary = Expense.summary_for(year: params[:year], month: params[:month])
    render json: summary
  end
end
