
namespace :rabbitmq do
	desc "Connect consumer to producer"
	task :setup do
		require "bunny"

		conn = Bunny.new(
			host: ENV["RMQ_HOST"],
			port: ENV["RMQ_PORT"],
			user: ENV["RMQ_USER"],
			password: ENV["RMQ_PASS"],
            vhost: ENV["RMQ_VHOST"],
            heartbeat: 30
		)
		conn.start

		channel = conn.create_channel
		queue = channel.queue('testing', exclusive: false, durable: true)

		conn.close
	end
end
