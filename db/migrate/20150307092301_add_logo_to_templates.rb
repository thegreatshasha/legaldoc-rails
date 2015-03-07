class AddLogoToTemplates < ActiveRecord::Migration
  def change
    add_column :templates, :logo, :string
  end
end
