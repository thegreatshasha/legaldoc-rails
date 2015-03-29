class CreateContacts < ActiveRecord::Migration
  def change
    create_table :contacts do |t|
      t.string :name
      t.string :email
      t.string :tel
      t.text :address

      t.timestamps
    end
  end
end
