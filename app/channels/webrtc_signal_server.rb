class WebrtcSignalServer < ApplicationCable::Channel

  def subscribed
    # $redis.hset()
    stream_from "channel-#{params[:channel_id]}"
  end

  def unsubscribed
    # $redis.hdel()
  end

  def signal(data)
    sym_data = data.deep_symbolize_keys
    if sym_data.present?
      desc = sym_data[:desc]
      if desc
        # ap "desc========================"
        # ap desc

        # type = desc[:type]
        # ap "type========================"
        # ap type

        #  sdp = desc[:sdp]
        # ap "sdp========================"
        # ap sdp

        # arr_sdp = sdp.split(/\r\n/)
        # ap arr_sdp.size
      end

      candidate = sym_data[:candidate]
      if candidate
        in_candidate = candidate[:candidate]
        de = in_candidate.split(' ')
                         .each_slice(2)
                         .to_a
                         .map{|a|a.join(' ')}
        ap de[0]
        # ap de[1]
        # ap de[2]
        sdpMid = candidate[:sdpMid]
        sdpMLineIndex = candidate[:sdpMLineIndex]

      end

      # binding.pry
      if desc.present? || candidate.present?
        ActionCable.server.broadcast("channel-#{params[:channel_id]}", data)
      end
    end
  end


end
