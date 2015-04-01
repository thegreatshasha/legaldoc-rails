GOOGLE = Hash.new
GOOGLE[:client] = Google::APIClient.new
GOOGLE[:key] = Google::APIClient::KeyUtils.load_from_pkcs12('legaldoc-898a708a6c15.p12', 'notasecret')
GOOGLE[:client].authorization = Signet::OAuth2::Client.new(
	 :token_credential_uri => 'https://accounts.google.com/o/oauth2/token',
	 :audience => 'https://accounts.google.com/o/oauth2/token',
	 :scope => 'https://spreadsheets.google.com/feeds/ https://docs.google.com/feeds/ https://www.googleapis.com/auth/drive https://docs.googleusercontent.com/',
	 #:issuer => APP_CONFIG[APP_CONFIG['HOST_TYPE']]['Google_Issuer'].to_s,
	 :issuer => "361235141518-7vottu75vgspoof9ujvimqkn5ttgshpv@developer.gserviceaccount.com",
	 :access_type => 'offline' ,
	 :approval_prompt=>'force',
	 :grant_type => 'authorization_code',
	 :signing_key => GOOGLE[:key]
)
GOOGLE[:client].authorization.fetch_access_token!

GOOGLE[:session] = GoogleDrive.login_with_oauth(GOOGLE[:client].authorization.access_token)
GOOGLE[:customers_sheet] = GOOGLE[:session].spreadsheet_by_key('1eKFpcf123B8FRq2bzo-_ik85WM73zuXgpF_dZRR2Quc').worksheets[0]