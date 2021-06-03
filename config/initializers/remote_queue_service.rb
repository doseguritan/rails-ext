
class RemoteQueueService
	def self.logger
		Rails.logger.tagged('L_bunny') do
			@@_logger ||= Rails.logger
		end
	end

	def self.connection
		@@_connection ||= begin
			instance = Bunny.new(
                host: ENV["RMQ_HOST"],
                port: ENV["RMQ_PORT"],
                user: ENV["RMQ_USER"],
                password: ENV["RMQ_PASS"],
                vhost: ENV["RMQ_VHOST"],
				heartbeat: 30
			)
			instance.start
			instance
			rescue 
		end
	end
end