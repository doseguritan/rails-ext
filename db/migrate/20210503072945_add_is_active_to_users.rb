class AddIsActiveToUsers < ActiveRecord::Migration[6.1]
  def up
    add_column :users, :is_active, :boolean, default: true
  end
end
