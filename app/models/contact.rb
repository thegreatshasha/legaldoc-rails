require 'google/api_client'

class Contact < ActiveRecord::Base
	self.inheritance_column = :foo

	after_save :write_to_google_drive

	private
    
    def write_to_google_drive
    	Thread.new do
			GOOGLE[:client].authorization.fetch_access_token!
    		session = GoogleDrive.login_with_oauth(GOOGLE[:client].authorization.access_token)
			sheet = GOOGLE[:session].spreadsheet_by_key('1Y-xXa1WXEnai-9nUvl1xRXEaQFzUMXe9r1tQVvZf3Zk').worksheets[0]
		
			max_rows = sheet.rows.length

			arr = self.attributes.slice("type", "name", "email", "tel", "address").map{|d|d[1]}

			arr.to_enum.with_index(1).each do |a, i|
				sheet[max_rows+1,i] = a
			end

			sheet.save()
		end
    end
end
