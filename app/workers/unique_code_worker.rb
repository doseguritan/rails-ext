require 'sneakers'
require 'json'
class UniqueCodeWorker
	include Sneakers::Worker
	from_queue "unique-codes"

	def work msg
		data = ActiveSupport::JSON.decode(msg)
		Rails.logger.info data
        ActiveRecord::Base.connection_pool.with_connection do
			machine_code_param = data["machine_code"]
            machine_code = MachineCode.find_by(code: machine_code_param)
            hash_machine_code = {machine_code: machine_code_param, success: machine_code.blank?}
            queue_name = "#{machine_code_param}-reply"
			
            if machine_code.blank?
                MachineCode.create!({code: machine_code_param})
				channel = RemoteQueueService.connection.create_channel
				queue_instance = channel.queue(machine_code_param, durable: true)
				machine_configs = MachineConfig.all
				queue_instance.publish(machine_code_param, { type: 'configs', content: machine_configs })
            end
            RemotePublisher.publish(queue_name, hash_machine_code, 'code')
		end
		ack!
	end
end
