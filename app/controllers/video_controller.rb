class VideoController < ApplicationController

  def index
    @files = dir.entries
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

  private

    def dir
      path = Rails.root + "public/videos"
      if Dir[path].present?
        Dir.open(path)
      else
        FileUtils.mkdir_p(path)
        Dir.open(path)
      end
    end

end
