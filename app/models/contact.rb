require 'google/api_client'

class Contact < ActiveRecord::Base
	self.inheritance_column = :foo

	after_save :write_to_google_drive

	private
    
    def write_to_google_drive
		Thread.new do
			sheet = GOOGLE[:customers_sheet]
			max_rows = sheet.rows.length

			arr = self.attributes.slice("type", "name", "email", "tel", "address").map{|d|d[1]}

			arr.to_enum.with_index(1).each do |a, i|
				sheet[max_rows+1,i] = a
			end

			sheet.save()
		end
    end
end
