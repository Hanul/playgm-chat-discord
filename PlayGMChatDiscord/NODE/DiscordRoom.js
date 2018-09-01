PlayGMChatDiscord.DiscordRoom = OBJECT({

	init : (inner, self) => {
		
		const Discord = require('discord.js');
		const client = new Discord.Client();
		
		let channel;
		client.on('ready', () => {
			channel = client.channels.get('484784718416576512');
		});
		
		let createMessageData = (message) => {
			
			let mentions = {};
			if (message.mentions.users.size > 0) {
				message.mentions.users.forEach((userData) => {
					mentions[userData.id] = userData.name;
				});
			}
			
			let data = {
				userId : message.author.id,
				type : message.type,
				message : message.content,
				name : message.author.username,
				userIconURL : message.author.avatar === TO_DELETE ? undefined : 'https://cdn.discordapp.com/avatars/' + message.author.id + '/' + message.author.avatar + '.png',
				mentions : mentions
			};
			if (message.attachments !== undefined) {
				message.attachments.forEach((attachment) => {
					if (data.downloadURL === undefined) {
						data.fileName = attachment.filename;
						data.downloadURL = attachment.url;
					}
				});
			}
			return data;
		};
		
		client.on('message', (message) => {
			PlayGMChatDiscord.BROADCAST({
				roomName : 'Discord',
				methodName : 'message',
				data : createMessageData(message)
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
							messages.push(createMessageData(message));
						});
						ret(messages);
					}).catch(console.error);
				}
			});
			
			on('send', (data) => {
				if (channel !== undefined) {
					channel.send((data.name !== undefined ? data.name + ' : ' : '') + data.message);
				}
			});
			
			on('sendFile', (data) => {
				if (channel !== undefined) {
					channel.send(data.name + ' : ', {
						files : [{
							attachment : data.downloadURL,
							name : data.fileName
						}]
					});
				}
			});
			
			on('getEmojis', (data, ret) => {
				let emojiStr = '';
				client.emojis.forEach((emoji) => {
					if (emojiStr !== '') {
						emojiStr += ', ';
					}
					emojiStr += '<:' + emoji.name + ':' + emoji.id + '>';
				});
				ret(emojiStr);
			});
			
			on('getMembers', (data, ret) => {
				if (channel !== undefined) {
					let memberStr = '';
					channel.members.forEach((member) => {
						if (member.user.presence.status !== 'offline') {
							if (memberStr !== '') {
								memberStr += ', ';
							}
							memberStr += member.user.username;
						}
					});
					ret(memberStr);
				}
			});
		});
	}
});
