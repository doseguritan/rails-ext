class CreateMenus < ActiveRecord::Migration[6.1]
  def change
    create_table :menus do |t|
      t.belongs_to  :menu, optional: true, default: 0
      t.string  :name
      t.string  :path, default: 'javascript:void(0)'
      t.string  :module_name
      t.string  :kontroler
      t.string  :icon
      t.integer :ordinal
      t.boolean :is_accessible_by_user, default: false
      t.boolean :is_active, default: true
      t.timestamps
    end
  end
end
