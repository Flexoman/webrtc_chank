class DataChannel < ApplicationCable::Channel

  def subscribed
    # $redis.hset()
    stream_from "01010100101"
  end

  def unsubscribed
    # $redis.hdel()
  end

  def sending(data)
    ActionCable.server.broadcast("01010100101", data)
  end


end
