module Paginatable
  extend ActiveSupport::Concern

  private

  # Accepts an ActiveRecord scope and returns a paginated scope.
  # Also sets pagination headers on the response.
  def paginate(scope)
    page = [ params[:page].to_i, 1 ].max
    per_page = params[:per_page].present? ? [ [ params[:per_page].to_i, 1 ].max, 100 ].min : 10

    total_count = scope.count
    total_pages = (total_count.to_f / per_page).ceil

    response.set_header("X-Total-Count", total_count.to_s)
    response.set_header("X-Total-Pages", total_pages.to_s)
    response.set_header("X-Current-Page", page.to_s)
    response.set_header("X-Per-Page", per_page.to_s)

    scope.offset((page - 1) * per_page).limit(per_page)
  end
end
