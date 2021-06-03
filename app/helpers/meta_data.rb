class MetaData
    def self.create (data, map=[])
        return {fields:[], root:'data'} if data.empty?
    
        meta_data = {root:'data', fields: []}
        first_list = data[0];
        attributes = first_list.attributes.keys.sort
        attributes.each do |attrib|
            meta_data[:fields] << {name: attrib, mapping: "#{attrib}"}
        end
        map.each do |key|
            meta_data[:fields] << {name: "#{key}", mapping: "#{key}"}
        end
        meta_data
    end
  
    def self.create_from_array_record(record)
        return {fields:[], root:'data'} if record.empty?

        @meta_data = {root: 'data', fields:[]}
        first_list = record[0]

        # first_list.each_key do |key| 
        #     if first_list[key].is_a? Hash
        #         hash = first_list[key]
        #         hash.each_key do |hash_key|
        #             @meta_data[:fields] << {name: "#{key}.#{hash_key}", mapping: "#{key}.#{hash_key}" } 
        #         end
        #     else
        #         @meta_data[:fields] << {name: key.to_s}
        #     end
        # end
        self.tree_record first_list, ''
        return @meta_data
    end

    def self.tree_record record, key
        record.each_key do |hash_key|
            new_key = hash_key
            new_key = "#{key}.#{hash_key}" unless key.blank?
            hash = record[hash_key]
            if hash.is_a? Hash
                tree_record hash, new_key
            else
                @meta_data[:fields] << {name: new_key.to_s, mapping: new_key}
            end
        end
    end
  end