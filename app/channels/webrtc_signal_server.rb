class WebrtcSignalServer < ApplicationCable::Channel

  def subscribed
    # $redis.hset()
    stream_from "channel-#{params[:channel_id]}"
  end

  def unsubscribed
    # $redis.hdel()
  end

  def signal(data)
    ActionCable.server.broadcast("channel-#{params[:channel_id]}", data)
  end


end
