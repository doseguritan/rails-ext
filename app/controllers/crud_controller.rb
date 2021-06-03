class CrudController < ApplicationController
    before_action :page_size, :page, :order_by, only:[:index]
    before_action :set_resource_record, only: [ :update]
    before_action :set_options, only:[ :options ]
    # before_action :has_access, only: [:index, :create, :update, :destroy]
    def page_size
        params[:limit]
    end
    
    def page
        params[:page] || 1
    end

    def order_by
        @order_by = params[:order] || :id
        @order_by_value = "ASC"
        params_sort = ActiveSupport::JSON.decode(params[:sort]) unless params[:sort].blank?
        unless params_sort.blank?
          sort = params_sort[0]
          @order_by = sort["property"]
          @order_by_value = sort["direction"]
        end
        @order_by = { @order_by => @order_by_value }
        @order_by
    end

    def has_access
        return if controller_name == 'welcome' || current_user.is_super_admin
        has_permission = current_user.has_permission? controller_name, action_name
        if !has_permission
            respond_to do |format|
                format.html { render file: "#{Rails.root}/public/404.html", layout: false, status: :not_found  }
                format.json { render json:{ error: "Sorry you dont have access to this" }, status: :unauthorized }
            end
        end
    end

    def resource_model
        @resource_model ||= _controller_name.sub("Controller", "").singularize.constantize
    end

    def _controller_name
        @controller_name ||= self.class.name
    end

    def search_attributes
        [:name]
    end
 
    def search_with_children
        nil
    end

    def records_options
        { except: [:created_at, :updated_at] }
    end
    
 
    def resource_params
        raise "No defined resource_params for #{resource_model.name}"
    end
    
    def params_id
        @params_id || params[:id]
    end

    def set_resource_record
        @record = resource_model.find(params_id)
    end

    def get_namespace
        _controller_name.split("::").first.underscore.try(:downcase)
    end

    def component_name
        resource_model.model_name.name.sub('::','')
    end

    def set_menus
        # @menus = []
        # if current_user.is_super_admin
        #     @menus = Menu.navigation
        # else
        #     @current_assigned_menus = current_user.assigned_menus.uniq
        #     Rails.logger.info @current_assigned_menus
        #     @parent_menus = Menu.find(@current_assigned_menus).pluck(:menu_id)
        #     Rails.logger.info @parent_menus
        #     @menus = Menu.navigation.where(id: @parent_menus, is_link: true)
        # end
        @@navigation_menus = Menu.all
    end
    
    def index
        respond_to do |format|
            format.html { set_menus }
            format.json {
                @@records = resource_model.search(params[:query], search_attributes, search_with_children).order(order_by)
                total_count = @@records.size
                total_count = @@records.total_count if @@records.method_defined? :total_count
                @@records = @@records.page(page.to_i).per(page_size) unless page_size.blank?
                # Rails.logger.info "machines order count #{@@records.total_count} #{page_size}"
                records = @@records.as_json(records_options)
                render json: { data: records, total: total_count, metaData: MetaData.create_from_array_record(records) }
            }
        end 
    end
    
   
    def create
        @record = resource_model.new(resource_params)
        if @record.save
            send_to_queue
            render json: {success: true, message: "#{resource_model.model_name.human} was successfully created." }
        else
            render json: {success: false, errors: @record.errors.full_messages.join("<br />")}, status: :unprocessable_entity
        end
    end
    
 
    def update
        #  access_denied and return unless @@current_user_access.present? && @@current_user_access[:has_edit]
        if @record.update(resource_params)
            send_to_queue
            render json: {success: true, message: "#{resource_model.model_name.human} was successfully updated." }
        else
            render json: {success: false, errors: @record.errors.full_messages.join("<br />")}, status: :unprocessable_entity
        end
    end

    def send_to_queue
    end

    def machine_codes
        @machine_code_queues = MachineCode.where(machine_id: Machine.where(is_active: true)).pluck(:code)
    end
    
    
    def destroy
        #  access_denied and return unless @@current_user_access.present? && @@current_user_access.has_delete
        destroy_init = resource_model.destroy(params[:id])
        if destroy_init
            message = "#{resource_model.model_name.human}(s) was successfully deleted."
            destroy_init.each do |d|
                if d.errors[:base].present?
                    message = d.errors[:base].join("\n")
                end
            end
            render json: {success: message.include?("success"), message: message }
        else
            render json: {success: false, errors: "Unable to delete record."}
        end
    end

    def options
        @options = @options.order(name: :asc).as_json(only: select_options)
        render json: {success: true, data: @options, metaData: MetaData.create_from_array_record(@options), total: @options.count }
    end
    
    def set_options
        @options = resource_model.all
    end

    def select_options
        [:id, :name]
    end
end