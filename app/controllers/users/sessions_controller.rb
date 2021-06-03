# frozen_string_literal: true

class Users::SessionsController < Devise::SessionsController
  before_action :configure_sign_in_params, only: [:create]
  respond_to :json
  # GET /resource/sign_in
  # def new
  #   super
  # end

  # POST /resource/sign_in
  def create
    Rails.logger.info self.resource
    self.resource = warden.authenticate!(auth_options)
    set_flash_message(:notice, :signed_in) if is_flashing_format?
    sign_in(resource_name, resource)
    yield resource if block_given?
    respond_with resource, :location => after_sign_in_path_for(resource) do |format|
      format.json {render :json => { success: true }, status: 200 } # this code will get executed for json request
    end
  end

  # DELETE /resource/sign_out
  # def destroy
  #   # super

  #   # signed_out = (Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name))
  #   warden.logout
  #   render json: {:success => true, auth_token: nil }.to_json, status: 200
  # end

  # protected

  # If you have extra params to permit, append them to the sanitizer.
  def configure_sign_in_params
    devise_parameter_sanitizer.permit :sign_in, keys: [:login, :password]
  end
  private
    def handle_failed_login
      if failed_login?
        render json: { success: false, errors: ["Login Credentials Failed"] }, status: 401
      end
    end 

    def failed_login?
      (options = env["warden.options"]) && options[:action] == "unauthenticated"
    end 
end
