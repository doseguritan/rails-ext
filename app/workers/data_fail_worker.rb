require 'sneakers'
require 'json'
class DataFailWorker
	include Sneakers::Worker
	from_queue "data-failed"

	def work msg
		data = ActiveSupport::JSON.decode(msg)
        ActiveRecord::Base.connection_pool.with_connection do
            machine_code = data["machine_code"]
            type = data["type"]
            message = {type: type}
            machine = MachineCode.find_by(code: machine_code).machine
            resource_model = type.singularize.constantize
            case type
            when "configs"
                configs = MachineConfig.all
                message[:content] = configs.as_json({
                    except: [:created_at, :updated_at]
                })
            when "layouts"
                templates = machine.active_templates
                layouts = Layout.where(id: templates.pluck(:layout_id))
                message[:content] = layouts.as_json({
                    include: {
                        layout_details: { except: [:created_at, :updated_at] }
                    }, 
                    except: [:created_at, :updated_at]
                })
            when "products"
                templates = machine.active_templates
                products = Product.where(id: TemplateDetail.where(template_id: templates).distinct(:product_id))
                message[:content] = products.as_json({
                    except: [:created_at, :updated_at],
                    methods: [:image_detail]
                })
            when "templates"
                templates = machine.active_templates
                message[:content] = templates.as_json({
                    include: {
                        template_details: { 
                            except: [:created_at, :updated_at] 
                        }
                    }, 
                    except: [:created_at, :updated_at] 
                }) 
            when "prices"
                prices = Price.where(id: machine.active_prices.pluck(:price_id))
                message[:content] = prices.as_json({except: [:created_at, :updated_at]})
            when "machines"
                templates = machine.active_templates
                message[:content] = templates.as_json({
                    include: {
                        template_details: { 
                            except: [:created_at, :updated_at] 
                        }
                    }, 
                    except: [:created_at, :updated_at] 
                }) 
            when "machine_templates"
                message[:content] = machine.active_templates.as_json({ except: [:created_at, :updated_at] })
            when "machine_prices"
                message[:content] = machine.active_prices.as_json({ except: [:created_at, :updated_at] })
            else
                message[:content] = { message: 'No type found.' }
            end
            RemotePublisher.publish(queue_name, message)
		end
		ack!
	end
end
