class ApplicationController < ActionController::Base
    protect_from_forgery prepend: true
    before_action :authenticate_user!
    before_action :set_paper_trail_whodunnit
    before_action :configure_permitted_parameters, if: :devise_controller?
    include ActiveStorage::SetCurrent
    def user_for_paper_trail
        user_signed_in? ? current_user.id : 'Public user'  # or whatever
    end
    
    def layout_by_resource
        unless user_signed_in?
            'login'
        else
            'application'
        end
    end

    protected
  
    def configure_permitted_parameters
      added_attrs = [:username, :email, :password, :password_confirmation, :remember_me]
      devise_parameter_sanitizer.permit :sign_up, keys: added_attrs
      devise_parameter_sanitizer.permit :sign_in, keys: [:login, :password]
      devise_parameter_sanitizer.permit :account_update, keys: added_attrs
    end
end
