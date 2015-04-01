client = Google::APIClient.new
key = Google::APIClient::KeyUtils.load_from_pkcs12('/home/legaldoc-032311857272.p12', 'notasecret')
client.authorization = Signet::OAuth2::Client.new(
 :token_credential_uri => 'https://accounts.google.com/o/oauth2/token',
 :audience => 'https://accounts.google.com/o/oauth2/token',
 :scope => 'https://spreadsheets.google.com/feeds/ https://docs.google.com/feeds/ https://www.googleapis.com/auth/drive https://docs.googleusercontent.com/',
 #:issuer => APP_CONFIG[APP_CONFIG['HOST_TYPE']]['Google_Issuer'].to_s,
 :issuer => "361235141518-11imbdbh57d2clsi6egqc7f5ba4ekfod@developer.gserviceaccount.com",
 :access_type => 'offline' ,
 :approval_prompt=>'force',
 :grant_type => 'authorization_code',
 :signing_key => key)
client.authorization.fetch_access_token!

sessions = GoogleDrive.login_with_oauth(  client.authorization.access_token)

ws = sessions.spreadsheet_by_key('1eKFpcf123B8FRq2bzo-_ik85WM73zuXgpF_dZRR2Quc').worksheets[0]