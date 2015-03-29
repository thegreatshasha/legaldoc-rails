class Contact < ActiveRecord::Base
	self.inheritance_column = :foo
end
