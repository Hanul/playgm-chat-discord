PlayGMChatDiscord.MAIN = METHOD({
	
	run : (addRequestHandler) => {
		
		const Discord = require('discord.js');
		const client = new Discord.Client();
		
		client.on('ready', () => {
			
			let channel = client.channels.get('484784718416576512');
			
			channel.send('하늘 : 안되면 만들어야지ㅜ.ㅜ');
			
			channel.fetchMessages({
				limit: 100
			}).then((_messages) => {
				let messages = [];
				_messages.forEach((message) => {
					messages.push({
						type : message.type,
						content : message.content,
						author : message.author
					});
				});
				
				REVERSE_EACH(messages, (message) => {
					console.log(message);
				});
				
			}).catch(console.error);
		});
		
		//client.on('message')
		
		READ_FILE('BOT_TOKEN', (botTokenBuffer) => {
			client.login(botTokenBuffer.toString());
		});
	}
});
