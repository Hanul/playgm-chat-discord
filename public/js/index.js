RUN(() => {
	
	let chatStore = STORE('PlayGMChat');
	
	let params = {};
	let splits = location.search.substring(1).split('&');
	
	for (let i = 0; i < splits.length; i += 1) {

		let pair = splits[i].split('=');
		
		let name = decodeURIComponent(pair[0]);
		let value = decodeURIComponent(pair[1]);

		if (params[name] === undefined) {
			params[name] = value;
		} else if (typeof params[name] === 'string') {
			params[name] = [params[name], value];
		} else {
			params[name].push(value);
		}
	}
	
	if (params.code !== undefined) {
		chatStore.save({
			name : 'oauth2Code',
			value : params.code
		});
	}
	
	// 로그인 체크
	if (chatStore.get('oauth2Code') === undefined) {
		
		// 인증 처리
		if (CONFIG.isDevMode === true) {
			location.href = 'https://discordapp.com/api/oauth2/authorize?client_id=485064204144082948&redirect_uri=http%3A%2F%2Flocalhost%3A5000&response_type=code&scope=messages.read%20identify';
		} else {
			//TODO:
			location.href = '';
		}
	}
	
	else {
		
		GET({
			url : 'https://discordapp.com/api/oauth2/applications/@me',
			headers : {
				Authorization : 'Bearer ' + chatStore.get('oauth2Code')
			}
		}, (r) => {
			console.log(r);
		});
	}
});
