json.array!(@contacts) do |contact|
  json.extract! contact, :id, :name, :email, :tel, :address, :type
  json.url contact_url(contact, format: :json)
end
