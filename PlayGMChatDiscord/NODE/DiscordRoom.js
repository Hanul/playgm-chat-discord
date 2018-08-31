PlayGMChatDiscord.DiscordRoom = OBJECT({

	init : (inner, self) => {
		
		const Discord = require('discord.js');
		const client = new Discord.Client();
		
		let channel;
		client.on('ready', () => {
			channel = client.channels.get('484784718416576512');
		});
		
		client.on('message', (message) => {
			PlayGMChatDiscord.BROADCAST({
				roomName : 'Discord',
				methodName : 'message',
				data : {
					userId : message.author.id,
					type : message.type,
					message : message.content,
					name : message.author.username,
					userIconURL : message.author.avatar === TO_DELETE ? undefined : 'https://cdn.discordapp.com/avatars/' + message.author.id + '/' + message.author.avatar + '.png'
				}
			});
		});
		
		READ_FILE('BOT_TOKEN', (botTokenBuffer) => {
			client.login(botTokenBuffer.toString());
		});
		
		PlayGMChatDiscord.ROOM('Discord', (clientInfo, on, off, send, broadcastExceptMe) => {
			
			on('messages', (notUsing, ret) => {
				if (channel !== undefined) {
					
					channel.fetchMessages({
						limit: 100
					}).then((_messages) => {
						let messages = [];
						_messages.forEach((message) => {
							messages.push({
								userId : message.author.id,
								type : message.type,
								message : message.content,
								name : message.author.username,
								userIconURL : message.author.avatar === TO_DELETE ? undefined : 'https://cdn.discordapp.com/avatars/' + message.author.id + '/' + message.author.avatar + '.png'
							});
						});
						ret(messages);
					}).catch(console.error);
				}
			});
			
			on('send', (data) => {
				if (channel !== undefined) {
					channel.send(data.name + ' : ' + data.message);
				}
			});
		});
	}
});
