require 'sneakers'

Sneakers.configure( 
    connection: Bunny.new(
        host: ENV['RMQ_HOST'],
        port: ENV['RMQ_PORT'],
        user: ENV['RMQ_USER'],
        password: ENV['RMQ_PASS'],
        vhost: ENV["RMQ_VHOST"],
        heartbeat: 30
    ),
    prefetch: 1,
    threads: 1,
    # log: 'log/sneakers.log',
    workers: 2,
    # pid_path: '/tmp/sneakers.pid',
    ack: true,
    daemonize: false
)

Sneakers.logger.level = Logger::DEBUG