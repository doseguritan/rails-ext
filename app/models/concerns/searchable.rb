module Searchable 
    extend ActiveSupport::Concern
    class_methods do
      def search(search_str=nil, attrs=[:name], joins=nil)
        results  = self.all
        if search_str.present? and search_str.strip != ""
          klass = joins.blank? ? self : self.joins(joins)
          results = klass.where(attrs.map{|a| "#{a} like '%#{search_str}%'"}.join(" or "))
        end
        results
      end
  
      def search_with_child(joins, search_str=nil, attrs=[:name])
        results = self.all
        if search_str.present? and search_str.strip != ""
          results =self.joins(joins).where(attrs.map{|a| "#{a} like '%#{search_str}%'"}.join(" or "))
        end
        results
      end
      
    end
end