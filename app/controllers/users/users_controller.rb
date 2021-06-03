class Users::UsersController < CrudController
    def index
        respond_to do |format|
            format.html { set_menus }
            format.json {
                @records = resource_model.where.not(is_super_admin: true).search(params[:query], search_attributes, search_with_children).order(order_by)
                total_count = @records.length
                total_count = @records.total_count if @records.method_defined? :total_count
                @records = @records.page(page.to_i).per(page_size) unless page_size.blank?
                # Rails.logger.info "machines order count #{@@records.total_count} #{page_size}"
                records = @records.as_json(records_options)
                render json: { data: records, total: total_count, metaData: MetaData.create_from_array_record(records) }
            }
        end 
        
    end
    
    def create
        generate_password = Devise.friendly_token.first(8)
        res_params = resource_params
        res_params[:password] = generate_password
        record = resource_model.new(res_params)
        if record.save
            # record.detail.new(name: , user_id: record.id)
            # Devise::Mailer.reset_password_instructions(record, generate_password).deliver
            DeviseMailer.welcome(record, generate_password).deliver
            render json: {success: true, message: "User was successfully created.", password: generate_password }
        else
            render json: {success: false, errors: record.errors.full_messages.join("<br />")}, status: :unprocessable_entity
        end
    end

    def resource_model
        ::User
    end    
    
    def resource_params
        params.require(:user).permit(:email, :username, :name, :is_active, :password, :password_confirmation)
    end
    
end
