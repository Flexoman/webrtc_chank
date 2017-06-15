class VideoController < ApplicationController

  def index
    @files = Dir.open(Rails.root+"public/videos")
                .entries
                .select{ |g| g.include?('.webm') }
  end

  def create
    blob = params[:blob]

    directory = "public/videos"
         name = "#{blob.original_filename}_#{Time.now.to_s}.webm"
         path = File.join(directory, name)

    File.open(path, "wb") { |f| f.write(blob.read) }

    render json: { file_url:  path }
  end

end
