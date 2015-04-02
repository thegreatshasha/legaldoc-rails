GOOGLE = Hash.new
GOOGLE[:client] = Google::APIClient.new
GOOGLE[:key] = Google::APIClient::KeyUtils.load_from_pkcs12('legaldoc-api-ee4c10479dbd.p12', 'notasecret')
GOOGLE[:client].authorization = Signet::OAuth2::Client.new(
	 :token_credential_uri => 'https://accounts.google.com/o/oauth2/token',
	 :audience => 'https://accounts.google.com/o/oauth2/token',
	 :scope => 'https://spreadsheets.google.com/feeds/ https://docs.google.com/feeds/ https://www.googleapis.com/auth/drive https://docs.googleusercontent.com/',
	 #:issuer => APP_CONFIG[APP_CONFIG['HOST_TYPE']]['Google_Issuer'].to_s,
	 :issuer => "649681412180-nofjchtq3rla23scp7jf1nr1oev3vq8a@developer.gserviceaccount.com",
	 :access_type => 'offline' ,
	 :approval_prompt=>'force',
	 :grant_type => 'authorization_code',
	 :signing_key => GOOGLE[:key]
)